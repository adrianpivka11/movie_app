import cors from "cors";
import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

type RecommendRequest = {
  favoriteMovie: string;
  mood: string;
  tone: string;
};

const port = Number(process.env.PORT ?? 3001);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseApiKey = process.env.SUPABASE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseApiKey || !openaiApiKey) {
  throw new Error("Missing SUPABASE_URL, SUPABASE_API_KEY, or OPENAI_API_KEY.");
}

const app = express();
const openai = new OpenAI({ apiKey: openaiApiKey });
const supabase = createClient(supabaseUrl, supabaseApiKey);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/recommend", async (req, res, next) => {
  try {
    const body = req.body as RecommendRequest;
    console.log(`I received client request with film recommendation:`, body)
    const input = buildRecommendationPrompt(body);

    // Create a vector embedding representing the input text
    console.log(`I am sending create a vectro embedding request to openai`)
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;


    console.log(`I am sending request to supabase to use similarity search by special rpc function and match_movies function`)
    const { data, error } = await supabase.rpc("match_movies", {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5
    });

    if (error) {
      throw error;
    }

    res.json({ movies: data ?? [] });
    console.log(`These are recommended movies...`,)
  } catch (error) {
    next(error);
  }
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const message = getErrorMessage(error);
    console.error(error);
    res.status(500).json({ error: message });
  }
);

app.listen(port, () => {
  console.log(`Movie app backend listening on http://localhost:${port}`);
});

function buildRecommendationPrompt({ favoriteMovie, mood, tone }: RecommendRequest) {
  
  
  return [
    `Favorite movie and reason: ${favoriteMovie}`,
    `Mood or era preference: ${mood}`,
    `Desired tone: ${tone}`
  ].join("\n");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Something went wrong.";
}
