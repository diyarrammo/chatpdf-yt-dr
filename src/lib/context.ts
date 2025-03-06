import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings({
  embeddings,
  file_key,
}: {
  embeddings: number[];
  file_key: string;
}) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const index = pinecone.Index("chatpdf-yt");

  try {
    const namespace = convertToAscii(file_key);
    const queryResult = await index.query({
      topK: 5,
      vector: embeddings,
      includeValues: true,
      includeMetadata: true,
      filter: { namespace: namespace },
    });
    return queryResult.matches || [];
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    throw error;
  }
}
export async function getContext({
  query,
  file_key,
}: {
  query: string;
  file_key: string;
}) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings({
    embeddings: queryEmbeddings,
    file_key,
  });

  const namespace = convertToAscii(file_key);
  const qualifyingDocs = matches.filter(
    (match) =>
      match.score &&
      match.score >= 0.7 &&
      match.metadata?.namespace === namespace
  );
  type Metadata = {
    text: string;
    pageNumber: number;
  };
  let docs = qualifyingDocs
    .filter((match) => match.metadata && match.metadata.text)
    .map((match) => (match.metadata as Metadata).text);
  if (docs.length === 0) {
    return "I'm sorry, but I couldn't find any relevant information to answer your question.";
  }
  // 5 vectors
  return docs.join("\n").substring(0, 3000);
}
