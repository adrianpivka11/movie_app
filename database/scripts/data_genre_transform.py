import ast
import json
from pathlib import Path

import pandas as pd


INPUT_CSV = Path("data/top_20000_movies_enriched_with_titles.csv")
OUTPUT_CSV = Path("data/top_20000_movies_final.csv")

GENRE_ID_TO_NAME = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary film",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "Historical",
    27: "Horror",
    10402: "Musical",
    9648: "Mystery",
    10749: "Romance film",
    878: "Sci-fi",
    10770: "TV-Film",
    53: "Thriller",
    10752: "War movie",
    37: "Western",
}


def parse_genre_ids(value):
    if pd.isna(value):
        return []

    if isinstance(value, list):
        return value

    try:
        parsed_value = ast.literal_eval(str(value))
    except (SyntaxError, ValueError):
        return []

    if not isinstance(parsed_value, list):
        return []

    return parsed_value


def convert_genre_ids_to_names(value):
    genre_ids = parse_genre_ids(value)

    genre_names = [
        GENRE_ID_TO_NAME[genre_id]
        for genre_id in genre_ids
        if genre_id in GENRE_ID_TO_NAME
    ]

    return json.dumps(genre_names, ensure_ascii=False)


df = pd.read_csv(INPUT_CSV)

df["genres"] = df["genre_ids"].apply(convert_genre_ids_to_names)

ordered_columns = [
    "id",
    "title",
    "original_title",
    "original_language",
    "release_date",
    "genre_ids",
    "genres",
]

remaining_columns = [
    column for column in df.columns if column not in ordered_columns
]

df = df[ordered_columns + remaining_columns]

df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")

print(df[[
    "id",
    "title",
    "genre_ids",
    "genres",
]].head(20).to_string(index=False))

print(df.info())
print(f"Saved CSV with transformed genres to {OUTPUT_CSV}")
