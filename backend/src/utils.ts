
export function getRagPrompt(
  contextString: string,
  query: string,
) {
  return `You are a movie expert. Answer the user's query based ONLY on the provided context. Context will contain array of movies, that were retrieved from vector database by similarity search based on user query.  If the context doesn't contain the answer, state politely "I'm sorry, I don't have specific information about that in the knowledge base.". Do not make up answers.

    Context:
    ---
    ${contextString}
    ---

    Query: ${query}
    Answer:`;
    }
