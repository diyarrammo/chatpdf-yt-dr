"use client";

import React from "react";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import { Button } from "./ui/button";
import { PlusCircle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({ chats, chatId }: Props) => {
  return (
    <div className="w-full h-screen p-4 text-gray-200 bg-gray-900 flex flex-col">
      <div>
        <Link href="/">
          <div className="p-4 border-dashed border border-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
            <PlusCircle className="mr-2 w-4 h-4" />
            <span>New Chat</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-auto mt-4 mb-16">
        <div className="flex flex-col gap-2">
          {chats.map((chat) => (
            <Link key={chat.id} href={`/chat/${chat.id}`}>
              <div
                className={cn(
                  "rounded-lg p-3 text-slate-300 flex items-center",
                  {
                    "bg-blue-600 text-white": chat.id === chatId,
                    "hover:text-white": chat.id !== chatId,
                  }
                )}
              >
                <MessageCircle className="mr-2" />
                <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                  {chat.pdfName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-700 pt-3 pb-1 absolute bottom-0 left-0 right-0 bg-gray-900 px-4">
        <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/" className="hover:text-white transition-colors">
            Source
          </Link>
          {/* Stripe Button*/}
        </div>
      </div>
    </div>
  );
};
export default ChatSideBar;
