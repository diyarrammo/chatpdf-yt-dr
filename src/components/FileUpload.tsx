"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Inbox, Loader2 } from "lucide-react";
import { uploadToS3 } from "@/lib/s3";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const { mutate } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      console.log("API Response:", response.data);
      return response.data;
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb
        toast.error("please upload a file smaller than 10mb");
        return;
      }
      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data?.file_name) {
          toast("something went wrong");
          return;
        }
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            console.log("Chat ID:", chat_id);
            if (chat_id) {
              toast.success("chat created successfully");
              router.push(`/chat/${chat_id}`);
            } else {
              console.error("Chat ID is undefined");
              toast.error("Failed to create chat, no ID returned.");
            }
          },
          onError: (error) => {
            toast.error("error creating chat");
            console.error("Error details:", error);
          },
        });
      } catch (error) {
        toast.error("error creating chat");
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || uploading ? (
          <>
            {/* loading state */}
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Spilling Tea to GPT...
            </p>
          </>
        ) : (
          <Inbox className="w-10 h-10 text-blue-500" />
        )}
        <p className="mt-2 text-sm text-slate-400">
          Drop PDF here or click to upload
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
