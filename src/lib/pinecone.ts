import { Pinecone } from "@pinecone-database/pinecone";
import downloadFromS3 from "@/lib/s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: {
      pageNumber: number;
    };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf --> download and read from PDF
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("Failed to download from S3");
  }
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf
  const documments = await Promise.all(pages.map(prepareDocument));

  // 3. vectorize and embed the individual documents
  const vectors = await Promise.all(documments.flat().map(embedDocuments));

  // 4. upload to pinecone
  const client = await getPineconeClient();
  if (!client) throw new Error("Failed to initialize Pinecone client");

  const pineconeIndex = client.Index("chatpdf-yt");
  const namespace = convertToAscii(fileKey);

  // Batch upsert vectors
  const batchSize = 10;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    const upsertPayload = batch.map(
      (vector: { id: string; values: number[]; metadata: any }) => {
        const payload = {
          id: vector.id,
          values: vector.values,
          metadata: {
            text: vector.metadata.text,
            pageNumber: vector.metadata.pageNumber,
            namespace: namespace,
          },
        };
        return payload;
      }
    );
    // Add namespace to each vector's metadata
    const vectorsWithNamespace = upsertPayload.map((vector) => ({
      ...vector,
      metadata: {
        ...vector.metadata,
        namespace: namespace,
      },
    }));
    try {
      await pineconeIndex.upsert(vectorsWithNamespace);
    } catch (error) {
      console.error("Error upserting to Pinecone:", error);
      throw error;
    }
  }

  return documments[0];
}

async function embedDocuments(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);
    const metadata = {
      text: doc.metadata.text,
      pageNumber: doc.metadata.pageNumber,
    };

    return {
      id: hash,
      values: embeddings,
      metadata,
    };
  } catch (error) {
    console.error("error embedding documents", error);
    throw error;
  }
}
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  // Remove newlines but keep spaces for better readability
  pageContent = pageContent.replace(/\n/g, " ");

  // split the docs
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);

  return docs;
}
