"use client";

import { AiResponse } from "@/components/ui/button";
import { ArrowUp, Loader2, Bot, User as UserIcon } from "lucide-react";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { IoClose } from "react-icons/io5";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BorderBeam } from "../magicui/border-beam";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import useChat from '@/contexts/ChatContext';

const Chat = () => {
  const { isChatOpen, toggleChat } = useChat();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const listRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const chatTitle = "AI Assistant";

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleSend = () => {
    if (!input.trim() || isPending) return;

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

  // Don't render anything if chat is closed
  if (!isChatOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={cn(
        "fixed bottom-20 right-4 md:bottom-8 md:right-8 w-[calc(100%-2rem)] md:w-96 z-50",
        "rounded-2xl",
        "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-xl overflow-hidden"
      )}
    >
      <div className="flex items-center justify-between p-3 bg-white/80 dark:bg-neutral-900/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {chatTitle}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleChat}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close chat"
        >
          <IoClose className="w-4 h-4 text-neutral-500" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col h-[60vh] max-h-[80vh]">
        <div
          className="flex-1 flex flex-col p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent"
          ref={listRef}
        >
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-6"
            >
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-1">
                How can I help you today?
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
                Ask me anything about my work, experience, or just say hi!
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "w-full",
                    msg.sender === "user" ? "flex justify-end" : "flex justify-start"
                  )}
                >
                  {msg.sender === "user" ? (
                    <UserMessage message={msg.content} />
                  ) : (
                    <AssistantMessage message={msg.content} error={msg.state} />
                  )}
                </motion.div>
              ))}
              {isPending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 w-fit max-w-[85%]"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex space-x-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-neutral-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="px-3 py-2 sm:px-4 sm:py-3 bg-white/80 dark:bg-neutral-900/80">
        <div className="relative flex items-center">
          <input
            disabled={isPending}
            type="text"
            className="w-full py-2.5 sm:py-3 pl-4 pr-14 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-blue-500 transition-all duration-200"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me something..."
          />
          <motion.button
            disabled={!input.trim() || isPending}
            onClick={handleSend}
            whileHover={!isPending ? { scale: 1.1 } : {}}
            whileTap={!isPending ? { scale: 0.95 } : {}}
            className={cn(
              "absolute right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500/50",
              "border border-transparent",
              input.trim() && !isPending
                ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg hover:shadow-rose-500/30"
                : "bg-transparent text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <motion.span
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                <ArrowUp className="w-4 h-4" />
              </motion.span>
            )}
          </motion.button>
        </div>
        <p className="text-xs text-center text-neutral-400 mt-2">
          Ask about my experience, projects, or anything else!
        </p>
      </div>

      <BorderBeam colorFrom="#3b82f6" colorTo="#8b5cf6" duration={15} size={300} className="z-0" />
    </motion.div>
  );
};

// Using named export for better tree-shaking and explicit imports
export { Chat as default };

// ======================= User & Assistant Message Components =======================

const UserMessage = ({ message }) => {
  return (
    <div className="flex items-start gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[85%] group">
      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
        <UserIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
      </div>
      <div className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-tl-none shadow-sm">
        <p className="text-sm font-medium break-words">{message}</p>
      </div>
    </div>
  );
};

const AssistantMessage = ({ message, error }) => {
  if (error) {
    return (
      <div className="flex items-start gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[85%] group">
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-tl-none shadow-sm">
          <p className="text-sm break-words">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 sm:gap-2.5 max-w-[90%] sm:max-w-[85%] group">
      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
      </div>
      <div className="bg-gradient-to-br from-indigo-500 to-purple-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-tl-none shadow-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => (
              <p className="mb-2 sm:mb-3 last:mb-0 text-sm leading-relaxed break-words" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a className="text-blue-500 hover:underline break-words" target="_blank" rel="noopener noreferrer" {...props} />
            ),
            strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
            em: ({ node, ...props }) => <em className="italic" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-4 sm:pl-5 space-y-1 my-1 sm:my-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 sm:pl-5 space-y-1 my-1 sm:my-2" {...props} />,
            code: ({ node, inline, ...props }) => {
              if (inline) {
                return <code className="bg-neutral-100 dark:bg-neutral-700 text-xs sm:text-sm px-1 py-0.5 rounded break-words" {...props} />;
              }
              return (
                <pre className="bg-neutral-100 dark:bg-neutral-800 p-2 sm:p-3 rounded-lg overflow-x-auto my-2 sm:my-3">
                  <code className="text-xs sm:text-sm break-words" {...props} />
                </pre>
              );
            },
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-3 sm:pl-4 py-1 my-1 sm:my-2 text-neutral-600 dark:text-neutral-300 italic text-xs sm:text-sm" {...props} />
            ),
          }}
          className="prose-sm sm:prose dark:prose-invert max-w-none"
        >
          {message}
        </ReactMarkdown>
      </div>
    </div>
  );
};
