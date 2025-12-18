"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import React from "react";
import clsx from "clsx";
import useChat from '@/contexts/ChatContext';

function LinkLight({ layoutId }) {
  return (
    <motion.div
      key={layoutId}
      layoutId={layoutId}
      layout
      className={clsx(
        "absolute h-36 w-36 -top-8 pointer-events-none blur-lg",
        "bg-[radial-gradient(circle,rgba(0,0,0,0.33)_0%,transparent_50%)]",
        "dark:bg-[radial-gradient(circle,rgba(255,255,255,0.5)_0%,transparent_50%)]"
      )}
      transition={{
        type: "spring",
        stiffness: 50,
        damping: 12.5,
      }}
      style={{
        originY: "top",
      }}
    />
  );
}

export default function ChatToggle() {
  const { isChatOpen: isOpen, toggleChat: onClick } = useChat();
  const linkLightLayoutId = React.useId();
  const environment = process.env.NODE_ENV;

  return (
    <motion.button
      onClick={onClick}
      className={clsx(
        "group p-2 rounded-full relative z-20 outline-none",
        "bg-gradient-to-tl from-neutral-50 dark:from-neutral-925 via-neutral-200 dark:via-neutral-900 to-neutral-50 dark:to-neutral-925",
        "focus-visible:ring-1 ring-neutral-950 dark:ring-neutral-50",
        isOpen 
          ? "text-neutral-950 dark:text-neutral-50" 
          : "text-neutral-500 dark:text-neutral-400"
      )}
      aria-label="Toggle chat"
    >
      <div className="relative z-10 flex items-center gap-1 justify-center">
        <MessageCircle className="w-4 h-4 text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white hidden sm:inline">Chat with me</span>
      </div>
      
      {/* Hover effect */}
      <motion.div 
        className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={false}
      />
      
      <motion.div
        layout
        layoutRoot
        className="flex justify-center items-center absolute top-0 left-1/2 -translate-x-1/2 h-full z-20 pointer-events-none"
      >
        {isOpen && (
          <LinkLight layoutId={linkLightLayoutId + "link_light"} />
        )}
      </motion.div>

      {isOpen && (
        <motion.div
          key={linkLightLayoutId + "link_background"}
          layoutId={linkLightLayoutId + "link_background"}
          layout
          className={clsx(
            "absolute top-0 left-0 w-full h-[calc(100%-.5rem)] my-1",
            "bg-[rgba(0,0,0,0.025)] dark:bg-[rgba(255,255,255,0.025)]",
            "border border-neutral-200 dark:border-neutral-800 rounded-full"
          )}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 11.5,
          }}
          style={{
            originY: "top",
          }}
        />
      )}
    </motion.button>
  );
}