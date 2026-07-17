import { createClient } from "@supabase/supabase-js";

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

const supabaseUrl = getEnv("SUPABASE_URL");
const supabaseApiKey = getEnv("SUPABASE_API_KEY");

export const supabase = createClient(supabaseUrl, supabaseApiKey);