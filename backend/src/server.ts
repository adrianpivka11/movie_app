import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT ?? 3001);

validateRuntimeEnv();

app.listen(port, () => {
  console.log(`Movie app backend listening on http://localhost:${port}`);
});

function validateRuntimeEnv() {
  const requiredEnvVars = [
    "SUPABASE_URL",
    "SUPABASE_API_KEY",
    "OPENAI_API_KEY",
  ];

  const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}.`
    );
  }
}
