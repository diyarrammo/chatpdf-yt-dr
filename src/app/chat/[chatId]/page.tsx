import { redirect } from "next/navigation";
import React from "react";
import { auth } from "@clerk/nextjs/server";

type Props = { params: { chatId: string } };

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return <div>{chatId}</div>;
};

export default ChatPage;
