from pathlib import Path

import pandas as pd


INPUT_CSV = Path("data/top_20000_movies_final.csv")
OUTPUT_DIR = Path("data/DB_batches")
BATCH_SIZE = 3000


df = pd.read_csv(INPUT_CSV)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

total_rows = len(df)
batch_count = 0

for start_index in range(0, total_rows, BATCH_SIZE):
    batch_count += 1
    end_index = start_index + BATCH_SIZE
    batch_df = df.iloc[start_index:end_index]
    output_path = OUTPUT_DIR / f"movies_batch_{batch_count:02d}.csv"

    batch_df.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"Saved {len(batch_df)} rows to {output_path}")


print(f"Total rows: {total_rows}")
print(f"Batch size: {BATCH_SIZE}")
print(f"Created batches: {batch_count}")
