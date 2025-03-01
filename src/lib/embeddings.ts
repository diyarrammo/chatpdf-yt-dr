import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });
    const result = await response.json();

    if (!result.data || !result.data[0] || !result.data[0].embedding) {
      throw new Error(
        "Failed to get embedding from OpenAI API: " + JSON.stringify(result)
      );
    }

    return result.data[0].embedding as number[];
  } catch (error) {
    console.error("error calling openai embeddings api", error);
    throw error;
  }
}
