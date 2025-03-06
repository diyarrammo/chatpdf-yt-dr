import { OpenAIApi, Configuration } from "openai-edge";
import { NextRequest, NextResponse } from "next/server";
import { openai as openaiClient } from "@ai-sdk/openai";
import { Message, streamText } from "ai";
import { getContext } from "@/lib/context";
import { chats, messages as _messages } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));

    if (_chats.length != 1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Get the latest user message
    const lastMessage = messages[messages.length - 1];

    // Save user message ONCE before streaming starts
    if (lastMessage.role === "user") {
      try {
        await db.insert(_messages).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        });
        console.log("User message saved to database");
      } catch (dbError) {
        console.error("Error saving user message:", dbError);
        // Continue even if save fails
      }
    }

    const fileKey = _chats[0].fileKey;
    // const lastMessage = messages[messages.length - 1];
    const context = await getContext({
      query: lastMessage.content,
      file_key: fileKey,
    });

    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };

    const response = await streamText({
      model: openaiClient("gpt-4-turbo"),
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      onChunk: async () => {
        // This will be called for each chunk of the stream
        // You can save user messages to the database here
        await db.insert(_messages).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        });
      },
      onFinish: async (completion) => {
        // save ai message into db
        await db.insert(_messages).values({
          chatId,
          content: completion.toString(),
          role: "system",
        });
      },
    });

    return response.toDataStreamResponse();
  } catch (error) {
    console.log("[CHAT_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
