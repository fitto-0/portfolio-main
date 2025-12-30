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
  const [editingMessageId, setEditingMessageId] = useState(null);
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

  const handleSend = (customMessage = null) => {
    const messageContent = customMessage || input.trim();
    if (!messageContent || isPending) return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      content: messageContent,
      state: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setEditingMessageId(null);

    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleEditMessage = (messageId) => {
    setEditingMessageId(messageId);
  };

  const handleSaveEdit = (messageId, newContent) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent } 
          : msg
      )
    );
    setEditingMessageId(null);
    
    // If this was the last user message, we should regenerate the AI response
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    const isLastUserMessage = messages.slice(messageIndex + 1).every(msg => msg.sender !== 'user');
    
    if (isLastUserMessage) {
      // Remove all messages after the edited one and regenerate AI response
      setMessages(prev => {
        const updatedMessages = prev.filter((_, idx) => idx <= messageIndex);
        return [
          ...updatedMessages,
          {
            id: Date.now() + 1,
            sender: "bot",
            content: "",
            state: true,
            isTyping: true
          }
        ];
      });
      
      // Trigger AI response
      startTransition(() => {
        AiResponse(newContent).then((res) => {
          setMessages(prev => {
            const filtered = prev.filter(msg => !msg.isTyping);
            return [
              ...filtered,
              {
                id: Date.now() + 2,
                sender: "bot",
                content: res.result,
                state: res.state,
              },
            ];
          });
        });
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
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
                    <UserMessage 
                      key={msg.id}
                      id={msg.id}
                      message={msg.content} 
                      isEditing={editingMessageId === msg.id}
                      onEdit={() => handleEditMessage(msg.id)}
                      onSaveEdit={(newContent) => handleSaveEdit(msg.id, newContent)}
                      onCancelEdit={handleCancelEdit}
                    />
                  ) : (
                    <AssistantMessage message={msg.content} error={!msg.state} />
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

      <div className="px-4 py-3 sm:px-5 sm:py-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border-t border-neutral-100 dark:border-neutral-800">
        <div className="relative flex items-center">
          <input
            disabled={isPending}
            type="text"
            className="w-full py-2.5 sm:py-3 pl-5 pr-14 bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-300 dark:focus:ring-rose-600/50 dark:focus:border-rose-500 transition-all duration-200 placeholder-neutral-400 dark:placeholder-neutral-500"
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
          <button
            disabled={!input.trim() || isPending}
            className="absolute right-1.5 p-2 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
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

const UserMessage = ({ message, onEdit, isEditing, onSaveEdit, onCancelEdit, id }) => {
  const [editedMessage, setEditedMessage] = useState(message);

  if (isEditing) {
    return (
      <div className="flex flex-col items-end gap-2 w-full max-w-[90%] sm:max-w-[85%]">
        <div className="flex w-full gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <input
              type="text"
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={onCancelEdit}
                className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onSaveEdit(editedMessage)}
                className="px-3 py-1 text-xs bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] group">
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 dark:from-neutral-200 dark:to-neutral-50 flex items-center justify-center flex-shrink-0 shadow-sm">
        <UserIcon className="w-3.5 h-3.5 text-white dark:text-neutral-800" />
      </div>
      <div className="relative group">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 px-4 py-2.5 sm:px-4 sm:py-3 rounded-2xl rounded-tl-none shadow-sm transition-all duration-200 hover:shadow-md">
          <p className="text-sm font-normal leading-relaxed break-words">{message}</p>
        </div>
        <button
          onClick={onEdit}
          className="absolute -top-2 -right-2 bg-white dark:bg-neutral-700 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:scale-105 hover:bg-neutral-50 dark:hover:bg-neutral-600"
          aria-label="Edit message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500 dark:text-neutral-300">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m13 3 4 4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const AssistantMessage = ({ message, error }) => {
  if (error) {
    return (
      <div className="flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] group">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-200 px-4 py-2.5 sm:px-4 sm:py-3 rounded-2xl rounded-tl-none shadow-sm transition-all duration-200">
          <p className="text-sm break-words">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] group">
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-gradient-to-br from-rose-500/90 to-pink-600/90 text-white px-4 py-2.5 sm:px-4 sm:py-3 rounded-2xl rounded-tl-none shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="prose-sm sm:prose dark:prose-invert max-w-none">
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
          >
            {message}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
