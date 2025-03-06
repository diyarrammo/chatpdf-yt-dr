import { redirect } from "next/navigation";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { Dumbbell } from "lucide-react";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import ChatComponent from "@/components/ChatComponent";

type Props = {
  params: { chatId: string };
};

const ChatPage = async ({ params }: Props) => {
  // Await the params to fix the error
  const chatId = params.chatId;

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Get all chats for this user
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  if (!_chats) {
    return redirect("/");
  }

  // This checks if the requested chat (chatId from URL) belongs to the current user
  // It searches through the user's chats array to find a chat with matching ID
  // If no matching chat is found, redirect to home page for security
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        {/*chat sidebar */}
        <div className="fle-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
        </div>
        {/*pdf viewer */}
        <div className="max-h-screen p-4 overflow-scroll flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
        </div>
        {/*chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
