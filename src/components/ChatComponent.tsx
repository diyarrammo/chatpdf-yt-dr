"use client";

import React from "react";
import { Input } from "./ui/input";
import { useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessagesList from "./MessagesList";
type Props = {};

const ChatComponent = (props: Props) => {
  const { input, handleInputChange, handleSubmit, messages } = useChat();
  return (
    <div className="relative max-h-screen overflow-scroll">
      {/*chat header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">ChatComponent</h3>
      </div>
      {/*message list */}
      <MessagesList messages={messages} />
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
            className="w-full"
          />

          <Button className="bg-blue-600 ml-2">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
