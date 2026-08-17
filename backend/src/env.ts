/**
 * Reads a required environment variable.
 *
 * Keeping this helper independent from feature modules prevents accidental
 * imports between services, for example the series MCP server importing RAG
 * code just to read an OpenAI model name.
 */
export function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`[ERROR] Missing environment variable: ${name}`);
  }

  return value;
}
