import os

import requests


TMDB_BEARER_TOKEN = os.getenv("TMDB_BEARER_TOKEN")

if not TMDB_BEARER_TOKEN:
    raise RuntimeError("Missing TMDB_BEARER_TOKEN environment variable.")

url = "https://api.themoviedb.org/3/discover/movie?include_adult=false&vote_average.gte=8&vote_average.lte=10&sort_by=vote_average.desc&language=en-US&page=1"

headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {TMDB_BEARER_TOKEN}",
}

response = requests.get(url, headers=headers)

print(response.text)
