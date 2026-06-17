
""" Test DB connection and SUPABASE_URL, SUPABASE_API_KEY """


from supabase import create_client
from dotenv import load_dotenv, find_dotenv
import os

env_path = find_dotenv()
print("Loaded .env from:", env_path)

load_dotenv(env_path, override=True)

print("SUPABASE_URL =", repr(os.getenv("SUPABASE_URL")))
print("SUPABASE_API_KEY loaded =", os.getenv("SUPABASE_API_KEY") is not None)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")


supabase = create_client(
    SUPABASE_URL,
    SUPABASE_API_KEY
)

response = (
    supabase
    .table("movies")
    .select("*")
    .limit(5)
    .execute()
)

print(response.data)