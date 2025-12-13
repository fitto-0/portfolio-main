"use client";

import { AiResponse } from "@/components/ui/button";
import { ArrowUp, Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState, useTransition } from "react";
// Removed incorrect Button import
import { IoClose } from "react-icons/io5";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BorderBeam } from "../magicui/border-beam";

const Chat = ({ close }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const listRef = useRef(null);

  const handleSend = () => {
  if (!input.trim() || isPending) return; // prevent spam fast clicks

  const newMessage = {
    id: Date.now(),
    sender: "user",
    content: input.trim(),
    state: true,
  };

  setMessages((prev) => [...prev, newMessage]);
  setInput("");

  setTimeout(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, 50);
};

  useEffect(() => {
  if (messages.length === 0) return;

  const lastMessage = messages[messages.length - 1];

  // Only call AI API if last message is from USER
  if (lastMessage.sender !== "user") return;

  startTransition(() => {
    AiResponse(lastMessage.content).then((res) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          content: res.result,
          state: res.state,
        },
      ]);

      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  });
}, [messages]);


  return (
    <div className="w-full relative mx-auto border rounded-lg flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <IoClose 
        className="absolute top-1 dark:bg-neutral-800 dark:hover:bg-neutral-700 border rounded-md left-1 bg-neutral-100 hover:bg-neutral-200 cursor-pointer size-6" 
        onClick={() => close(false)}  
      />
      <div className="flex-1 flex flex-col h-[300px]">
        <div
          className="flex-1 flex flex-col min-h-[213px] max-h-[213px] overflow-y-auto m-4 space-y-2 scrollbar-hide"
          ref={listRef}
        >
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              {msg.sender === "user" ? (
                <UserMessage message={msg.content} />
              ) : (
                <AssistantMessage
                  message={msg.content}
                  error={msg.state}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="flex p-2 gap-2 border-t">
        <input
          disabled={isPending}
          type="text"
          className="border bg-white dark:bg-neutral-900 flex-1 outline-none px-3 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter"){
              handleSend();
            } 
          }}
          placeholder="Ask something about me... "
        />
        <button
          disabled={isPending}
          onClick={handleSend}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="size-5 animate-spin" /> : <ArrowUp className="size-5" />}
        </button>
      </div>
      <BorderBeam colorFrom={"#000000"} colorTo="#ffffff" duration={10} size={200} />
    </div>
  );
};

export default Chat;

const UserMessage = ({ message }) => {
  return (
    <div className="flex justify-end">
      <span className="bg-gray-200 px-4 py-1 rounded-md dark:text-white dark:bg-zinc-800">
        {message}
      </span>
    </div>
  );
};

const AssistantMessage = ({ message, error }) => {
  return !error ? (
    <div className="text-red-500 bg-red-100 rounded-md px-4 py-1">
      {message}
    </div>
  ) : (
    <div className="dark:text-white text-black bg-transparent rounded-md px-4 py-1">
       <ReactMarkdown remarkPlugins={[remarkGfm]}>{message}</ReactMarkdown>
    </div>
  );
};