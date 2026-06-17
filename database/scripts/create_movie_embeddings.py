import json
import math
import os
import time
from pathlib import Path
from typing import Any

import pandas as pd
import requests


CSV_PATH = Path("data/top_20000_movies_final.csv")
CHECKPOINT_PATH = Path("data/movie_embedding_completed_ids.txt")
FAILED_LOG_PATH = Path("data/movie_embedding_failed_ids.csv")

SUPABASE_TABLE = os.getenv("SUPABASE_TABLE", "movies")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
MAX_MOVIES_TO_EMBED = int(os.getenv("MAX_MOVIES_TO_EMBED", "0"))
REQUEST_TIMEOUT_SECONDS = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "60"))
REQUEST_DELAY_SECONDS = float(os.getenv("REQUEST_DELAY_SECONDS", "0.1"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "5"))


def load_env_file(path: str = ".env") -> None:
    """Load simple KEY=VALUE pairs from a .env file into environment variables."""
    env_path = Path(path)

    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def require_env(name: str) -> str:
    """Return a required environment variable or raise a clear error."""
    value = os.getenv(name)

    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")

    return value


def normalize_openai_embeddings_url(openai_url: str) -> str:
    """Return a usable OpenAI embeddings endpoint from either a base URL or endpoint URL."""
    cleaned_url = openai_url.rstrip("/")

    if cleaned_url.endswith("/embeddings"):
        return cleaned_url

    return f"{cleaned_url}/embeddings"


def is_missing(value: Any) -> bool:
    """Return True when a dataframe value should be treated as missing."""
    if value is None:
        return True

    if isinstance(value, float) and math.isnan(value):
        return True

    return pd.isna(value)


def clean_value(value: Any, fallback: str = "Unknown") -> str:
    """Convert a dataframe value into a clean string for the embedding input."""
    if is_missing(value):
        return fallback

    return str(value).strip() or fallback


def parse_json_list_string(value: Any) -> str:
    """Convert JSON-like list strings from CSV into a readable comma-separated string."""
    if is_missing(value):
        return "Unknown"

    try:
        parsed = json.loads(str(value))
    except json.JSONDecodeError:
        return clean_value(value)

    if not isinstance(parsed, list):
        return clean_value(value)

    cleaned_items = [str(item).strip() for item in parsed if str(item).strip()]
    return ", ".join(cleaned_items) if cleaned_items else "Unknown"


def build_embedding_string(row: pd.Series) -> str:
    """Build a descriptive movie text string that will be converted into an embedding."""
    title = clean_value(row.get("title"))
    release_date = clean_value(row.get("release_date"))
    genres = parse_json_list_string(row.get("genres"))
    vote_average = clean_value(row.get("vote_average"))
    runtime = clean_value(row.get("runtime"))
    director = clean_value(row.get("director"))
    main_cast = parse_json_list_string(row.get("main_cast"))
    overview = clean_value(row.get("overview"))

    return "\n".join(
        [
            f"Movie title: {title}",
            f"Release date: {release_date}",
            f"Genres: {genres}",
            f"Average user rating: {vote_average} out of 10",
            f"Runtime: {runtime} minutes",
            f"Director: {director}",
            f"Main cast: {main_cast}",
            f"Overview: {overview}",
        ]
    )


def request_with_retries(
    session: requests.Session,
    method: str,
    url: str,
    **kwargs: Any,
) -> requests.Response:
    """Send an HTTP request with retry handling for rate limits and transient failures."""
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = session.request(
                method,
                url,
                timeout=REQUEST_TIMEOUT_SECONDS,
                **kwargs,
            )

            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", "0") or "0")
                wait_seconds = retry_after if retry_after > 0 else min(2 ** attempt, 60)
                print(f"Rate limited. Waiting {wait_seconds} seconds...")
                time.sleep(wait_seconds)
                continue

            if 500 <= response.status_code < 600:
                wait_seconds = min(2 ** attempt, 60)
                print(
                    f"Server error {response.status_code}. "
                    f"Retrying in {wait_seconds} seconds..."
                )
                time.sleep(wait_seconds)
                continue

            response.raise_for_status()
            return response
        except requests.RequestException as error:
            last_error = error
            wait_seconds = min(2 ** attempt, 60)
            print(f"Request failed: {error}. Retrying in {wait_seconds} seconds...")
            time.sleep(wait_seconds)

    if last_error:
        raise last_error

    raise RuntimeError(f"Request failed after {MAX_RETRIES} retries: {method} {url}")


def create_embedding(
    session: requests.Session,
    openai_embeddings_url: str,
    openai_api_key: str,
    embedding_string: str,
) -> list[float]:
    """Create one OpenAI embedding vector from a movie embedding string."""
    headers = {
        "Authorization": f"Bearer {openai_api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": EMBEDDING_MODEL,
        "input": embedding_string,
        "encoding_format": "float",
    }

    response = request_with_retries(
        session,
        "POST",
        openai_embeddings_url,
        headers=headers,
        json=payload,
    )

    data = response.json()
    return data["data"][0]["embedding"]


def format_pgvector(embedding: list[float]) -> str:
    """Format a Python list of floats as a pgvector-compatible text value."""
    return json.dumps(embedding, separators=(",", ":"))


def update_movie_embedding(
    session: requests.Session,
    supabase_url: str,
    supabase_api_key: str,
    movie_id: int,
    embedding: list[float],
) -> bool:
    """Update one movie row in Supabase with the generated embedding vector."""
    url = f"{supabase_url.rstrip('/')}/rest/v1/{SUPABASE_TABLE}"
    params = {
        "id": f"eq.{movie_id}",
        "select": "id",
    }
    headers = {
        "apikey": supabase_api_key,
        "Authorization": f"Bearer {supabase_api_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    payload = {
        "embedding": format_pgvector(embedding),
    }

    response = request_with_retries(
        session,
        "PATCH",
        url,
        params=params,
        headers=headers,
        json=payload,
    )

    updated_rows = response.json()
    return bool(updated_rows)


def load_completed_ids(path: Path) -> set[int]:
    """Load movie IDs that were already embedded and updated successfully."""
    if not path.exists():
        return set()

    completed_ids = set()

    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()

        if line:
            completed_ids.add(int(line))

    return completed_ids


def append_completed_id(path: Path, movie_id: int) -> None:
    """Append one successfully processed movie ID to the checkpoint file."""
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("a", encoding="utf-8") as file:
        file.write(f"{movie_id}\n")


def append_failed_id(path: Path, movie_id: int, error_message: str) -> None:
    """Append one failed movie ID and error message to the failure log."""
    path.parent.mkdir(parents=True, exist_ok=True)
    file_exists = path.exists()

    with path.open("a", encoding="utf-8") as file:
        if not file_exists:
            file.write("id,error\n")

        safe_error = error_message.replace('"', "'").replace("\n", " ")
        file.write(f'{movie_id},"{safe_error}"\n')


def main() -> None:
    """Generate embeddings from the CSV and update matching rows in Supabase."""
    load_env_file()

    supabase_url = require_env("SUPABASE_URL")
    supabase_api_key = require_env("SUPABASE_API_KEY")
    openai_api_key = require_env("OPENAI_API_KEY")
    openai_url = require_env("OPENAI_URL")
    openai_embeddings_url = normalize_openai_embeddings_url(openai_url)

    df = pd.read_csv(CSV_PATH)
    completed_ids = load_completed_ids(CHECKPOINT_PATH)

    rows_to_process = df[~df["id"].isin(completed_ids)]

    if MAX_MOVIES_TO_EMBED > 0:
        rows_to_process = rows_to_process.head(MAX_MOVIES_TO_EMBED)

    print(f"Loaded rows from CSV: {len(df)}")
    print(f"Already completed from checkpoint: {len(completed_ids)}")
    print(f"Rows to process in this run: {len(rows_to_process)}")
    print(f"Embedding model: {EMBEDDING_MODEL}")

    with requests.Session() as session:
        for processed_count, (_, row) in enumerate(rows_to_process.iterrows(), start=1):
            movie_id = int(row["id"])

            try:
                embedding_string = build_embedding_string(row)
                embedding = create_embedding(
                    session,
                    openai_embeddings_url,
                    openai_api_key,
                    embedding_string,
                )
                was_updated = update_movie_embedding(
                    session,
                    supabase_url,
                    supabase_api_key,
                    movie_id,
                    embedding,
                )

                if not was_updated:
                    raise RuntimeError("Supabase update returned zero matching rows.")

                append_completed_id(CHECKPOINT_PATH, movie_id)
            except Exception as error:
                append_failed_id(FAILED_LOG_PATH, movie_id, str(error))
                print(f"Failed movie_id={movie_id}: {error}")
                continue

            if processed_count % 25 == 0:
                print(f"Processed {processed_count} movies in this run...")

            time.sleep(REQUEST_DELAY_SECONDS)

    print("Embedding update run finished.")


if __name__ == "__main__":
    main()
