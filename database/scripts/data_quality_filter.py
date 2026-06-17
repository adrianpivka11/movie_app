from pathlib import Path

import pandas as pd


CSV_PATH = Path("data/top_20000_movies_final.csv")
BACKUP_PATH = Path("data/top_20000_movies_final_before_quality_filter.csv")
DROP_COLUMNS = ["original_title", "genre_ids"]
MIN_VOTE_AVERAGE = 5.0


df = pd.read_csv(CSV_PATH)
original_row_count = len(df)

if not BACKUP_PATH.exists():
    df.to_csv(BACKUP_PATH, index=False, encoding="utf-8-sig")
    print(f"Backup saved to {BACKUP_PATH}")

df["vote_average"] = pd.to_numeric(df["vote_average"], errors="coerce")

df = df[df["vote_average"].notna()]
df = df[df["vote_average"] >= MIN_VOTE_AVERAGE]

columns_to_drop = [
    column for column in DROP_COLUMNS if column in df.columns
]

df = df.drop(columns=columns_to_drop)
df = df.reset_index(drop=True)

df.to_csv(CSV_PATH, index=False, encoding="utf-8-sig")

removed_row_count = original_row_count - len(df)

print(f"Original rows: {original_row_count}")
print(f"Removed rows: {removed_row_count}")
print(f"Remaining rows: {len(df)}")
print(f"Removed columns: {columns_to_drop}")
print(df.head().to_string(index=False))
print(df.info())
print(f"Cleaned CSV saved to {CSV_PATH}")
