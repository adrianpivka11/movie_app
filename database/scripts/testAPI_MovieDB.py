import os

import requests


TMDB_BEARER_TOKEN = os.getenv("TMDB_BEARER_TOKEN")

if not TMDB_BEARER_TOKEN:
    raise RuntimeError("Missing TMDB_BEARER_TOKEN environment variable.")


list_of_movies = [18785, 1523145, 1311031, 848116, 1215106, 1321179, 562545]

for movie_id in list_of_movies:   
    print(f'Movie id:', movie_id)
    url = f"https://api.themoviedb.org/3/movie/{movie_id}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_BEARER_TOKEN}",
    }

    response = requests.get(url, headers=headers)

    print(response.text)
