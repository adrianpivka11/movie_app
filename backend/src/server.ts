import cors from "cors";
import "dotenv/config";
import express from "express";
import { createClient } from "@supabase/supabase-js";
import { retrieveSimilarMoviesByRAG } from "./rag.js"
import { movieChoiceAgent  } from "./agent.js";




const port = Number(process.env.PORT ?? 3001);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseApiKey = process.env.SUPABASE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseApiKey || !openaiApiKey) {
  throw new Error("Missing SUPABASE_URL, SUPABASE_API_KEY, or OPENAI_API_KEY.");
}

const app = express();
const supabase = createClient(supabaseUrl, supabaseApiKey);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/recommend", async (req, res, next) => {
  try {

    // retrieve clear data from incoming request
    const userQuery = req.body.movieOrSerieUserRequest;
    console.log(`[NORMAL] Server received Client request with film recommendation:`, userQuery)
    
    // Agent here!
    // const recommendedMovies = await retrieveSimilarMoviesByRAG(userQuery)
    const recommendedMovies = await movieChoiceAgent(userQuery)

    res.json({ movies: recommendedMovies ?? [] });
    console.log(`[FINAL!] These are recommended movies...`,)
  } 
  
  catch (error) {
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


function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return "Something went wrong.";
}
