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


MOVIE_IDS_JSON = "data/movie_ids_05_06_2026.json"
OUTPUT_CSV = "data/top_20000_movies.csv"
TARGET_MOVIE_COUNT = 20_000
CHUNK_SIZE = 100_000

DATABASE_COLUMNS = [
    "id",
    "original_title",
    "release_date",
    "genre_ids",
    "overview",
    "vote_average",
    "vote_count",
    "poster_path",
]

headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_BEARER_TOKEN}",
}


def get_top_movie_ids():
    top_movies = pd.DataFrame()

    for chunk in pd.read_json(MOVIE_IDS_JSON, lines=True, chunksize=CHUNK_SIZE):
        chunk = chunk[chunk["video"] == False]

        top_movies = (
            pd.concat([top_movies, chunk])
            .nlargest(TARGET_MOVIE_COUNT, "popularity")
        )

    return top_movies[["id", "original_title", "popularity"]].reset_index(drop=True)


def get_movie_details(movie_id):
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

    genre_ids = [genre["id"] for genre in data.get("genres", [])]

    return {
        "id": data.get("id"),
        "original_title": data.get("original_title"),
        "release_date": data.get("release_date"),
        "genre_ids": json.dumps(genre_ids),
        "overview": data.get("overview"),
        "vote_average": data.get("vote_average"),
        "vote_count": data.get("vote_count"),
        "poster_path": data.get("poster_path"),
    }


top_movie_ids = get_top_movie_ids()
print(top_movie_ids.head())
print(f"Selected top {len(top_movie_ids)} movie IDs by popularity.")

movies_for_database = []

for index, row in top_movie_ids.iterrows():
    movie_id = row["id"]

    try:
        movie_details = get_movie_details(movie_id)
        movies_for_database.append(movie_details)
    except requests.HTTPError as error:
        print(f"Skipping movie_id={movie_id}. HTTP error: {error}")
    except requests.RequestException as error:
        print(f"Skipping movie_id={movie_id}. Request error: {error}")

    if (index + 1) % 100 == 0:
        print(f"Downloaded details for {index + 1} movies...")

    time.sleep(0.05)


df = pd.DataFrame(movies_for_database, columns=DATABASE_COLUMNS)

print(df.head())
print(df.info())

df.to_csv(OUTPUT_CSV, index=False)

print(f"Saved {len(df)} movies to {OUTPUT_CSV}")
