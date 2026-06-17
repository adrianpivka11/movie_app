import os
import time
from pathlib import Path

import pandas as pd
import requests


def load_env_file(path=".env"):
    env_path = Path(path)

    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file()

TMDB_BEARER_TOKEN = os.getenv("TMDB_BEARER_TOKEN")

if not TMDB_BEARER_TOKEN:
    raise RuntimeError(
        "Missing TMDB_BEARER_TOKEN. In PowerShell run: "
        '$env:TMDB_BEARER_TOKEN = "your_tmdb_bearer_token"'
    )


INPUT_CSV = Path("data/top_20000_movies_enriched.csv")
OUTPUT_CSV = Path("data/top_20000_movies_enriched_with_titles.csv")
CHECKPOINT_EVERY = 100
REQUEST_DELAY_SECONDS = 0.05
MAX_MOVIES_TO_UPDATE = int(os.getenv("MAX_MOVIES_TO_UPDATE", "0"))

headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_BEARER_TOKEN}",
}


def get_movie_title(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"
    params = {"language": "en-US"}

    response = requests.get(url, headers=headers, params=params, timeout=30)

    if response.status_code == 429:
        retry_after = int(response.headers.get("Retry-After", 10))
        print(f"Rate limited. Waiting {retry_after} seconds...")
        time.sleep(retry_after)
        response = requests.get(url, headers=headers, params=params, timeout=30)

    response.raise_for_status()
    data = response.json()

    return {
        "title": data.get("title"),
        "original_language": data.get("original_language"),
    }


source_csv = OUTPUT_CSV if OUTPUT_CSV.exists() else INPUT_CSV
df = pd.read_csv(source_csv)

for column in ["title", "original_language"]:
    if column not in df.columns:
        df[column] = pd.NA

rows_to_update = df[
    df["title"].isna() |
    (df["title"].astype(str).str.len() == 0) |
    df["original_language"].isna() |
    (df["original_language"].astype(str).str.len() == 0)
]

print(f"Loaded {len(df)} movies from {source_csv}.")
print(f"Rows still needing title update: {len(rows_to_update)}")

if MAX_MOVIES_TO_UPDATE > 0:
    rows_to_update = rows_to_update.head(MAX_MOVIES_TO_UPDATE)
    print(f"Test mode: updating only {len(rows_to_update)} movies.")


for processed_count, index in enumerate(rows_to_update.index, start=1):
    movie_id = int(df.at[index, "id"])

    try:
        title_data = get_movie_title(movie_id)
    except requests.HTTPError as error:
        print(f"Skipping movie_id={movie_id}. HTTP error: {error}")
        continue
    except requests.RequestException as error:
        print(f"Skipping movie_id={movie_id}. Request error: {error}")
        continue

    for column, value in title_data.items():
        df.at[index, column] = value

    if processed_count % CHECKPOINT_EVERY == 0:
        df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
        print(f"Saved checkpoint after {processed_count} updated movies...")

    time.sleep(REQUEST_DELAY_SECONDS)


ordered_columns = [
    "id",
    "title",
    "original_title",
    "original_language",
]

remaining_columns = [
    column for column in df.columns if column not in ordered_columns
]

df = df[ordered_columns + remaining_columns]
df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")

print(df[[
    "id",
    "title",
    "original_title",
    "original_language",
]].head())

print(df.info())
print(f"Saved updated CSV to {OUTPUT_CSV}")
