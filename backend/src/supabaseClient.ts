import { createClient } from "@supabase/supabase-js";
import { getEnv } from "./env.js";

const supabaseUrl = getEnv("SUPABASE_URL");
const supabaseApiKey = getEnv("SUPABASE_API_KEY");

export const supabase = createClient(supabaseUrl, supabaseApiKey);
