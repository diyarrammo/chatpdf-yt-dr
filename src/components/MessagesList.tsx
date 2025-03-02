import React from "react";
import { Message } from "@ai-sdk/react";
import { cn } from "@/lib/utils";

type Props = { messages: Message[] };

const MessagesList = ({ messages }: Props) => {
  if (!messages) return <></>;
  return (
    <div className="flex flex-col gap-2 p-4">
      {messages.map((message) => (
        <div key={message.id} className={cn("flex", message.role === "user")}>
          {message.content}
        </div>
      ))}
    </div>
  );
};

export default MessagesList;
