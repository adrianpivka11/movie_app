# Database Pipeline

This folder contains the Python scripts and data artifacts used to build and enrich the Supabase movie database.

## Setup

Create and activate the virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Contents

- `scripts` - Python scripts for TMDB retrieval, CSV cleaning, batching, and embedding updates.
- `data` - CSV and JSON data files generated during database preparation.
- `.env` - local secrets for TMDB, Supabase, and OpenAI. Do not commit this file.
