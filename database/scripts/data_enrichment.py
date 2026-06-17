import json
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


INPUT_CSV = Path("data/top_20000_movies.csv")
OUTPUT_CSV = Path("data/top_20000_movies_enriched.csv")
CHECKPOINT_EVERY = 100
REQUEST_DELAY_SECONDS = 0.05
MAIN_CAST_LIMIT = 8
MAX_MOVIES_TO_ENRICH = int(os.getenv("MAX_MOVIES_TO_ENRICH", "0"))

headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_BEARER_TOKEN}",
}


def get_movie_enrichment(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"
    params = {
        "language": "en-US",
        "append_to_response": "credits",
    }

    response = requests.get(url, headers=headers, params=params, timeout=30)

    if response.status_code == 429:
        retry_after = int(response.headers.get("Retry-After", 10))
        print(f"Rate limited. Waiting {retry_after} seconds...")
        time.sleep(retry_after)
        response = requests.get(url, headers=headers, params=params, timeout=30)

    response.raise_for_status()
    data = response.json()
    credits = data.get("credits", {})

    directors = [
        crew_member.get("name")
        for crew_member in credits.get("crew", [])
        if crew_member.get("job") == "Director" and crew_member.get("name")
    ]

    main_cast = [
        cast_member.get("name")
        for cast_member in credits.get("cast", [])[:MAIN_CAST_LIMIT]
        if cast_member.get("name")
    ]

    return {
        "runtime": data.get("runtime"),
        "director": ", ".join(directors),
        "main_cast": json.dumps(main_cast, ensure_ascii=False),
    }


source_csv = OUTPUT_CSV if OUTPUT_CSV.exists() else INPUT_CSV
df = pd.read_csv(source_csv)

for column in ["runtime", "director", "main_cast"]:
    if column not in df.columns:
        df[column] = pd.NA


rows_to_enrich = df[
    df["runtime"].isna() |
    df["director"].isna() |
    (df["director"].astype(str).str.len() == 0) |
    df["main_cast"].isna() |
    (df["main_cast"].astype(str).str.len() == 0)
]

print(f"Loaded {len(df)} movies from {source_csv}.")
print(f"Rows still needing enrichment: {len(rows_to_enrich)}")

if MAX_MOVIES_TO_ENRICH > 0:
    rows_to_enrich = rows_to_enrich.head(MAX_MOVIES_TO_ENRICH)
    print(f"Test mode: enriching only {len(rows_to_enrich)} movies.")


for processed_count, index in enumerate(rows_to_enrich.index, start=1):
    movie_id = int(df.at[index, "id"])

    try:
        enrichment = get_movie_enrichment(movie_id)
    except requests.HTTPError as error:
        print(f"Skipping movie_id={movie_id}. HTTP error: {error}")
        continue
    except requests.RequestException as error:
        print(f"Skipping movie_id={movie_id}. Request error: {error}")
        continue

    for column, value in enrichment.items():
        df.at[index, column] = value

    if processed_count % CHECKPOINT_EVERY == 0:
        df.to_csv(OUTPUT_CSV, index=False)
        print(f"Saved checkpoint after {processed_count} enriched movies...")

    time.sleep(REQUEST_DELAY_SECONDS)


df.to_csv(OUTPUT_CSV, index=False)

print(df[[
    "id",
    "original_title",
    "runtime",
    "director",
    "main_cast",
]].head())

print(df.info())
print(f"Saved enriched CSV to {OUTPUT_CSV}")
