"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import React from "react";
import clsx from "clsx";

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

export default function ChatToggle({ isOpen, onClick }) {
  const linkLightLayoutId = React.useId();
  const environment = process.env.NODE_ENV;

  return (
    <div className="flex items-center justify-between rounded-full w-full sm:w-fit">
      <button
        onClick={onClick}
        className={clsx(
          "relative py-[calc(.5rem+1px)] px-4 hover:text-neutral-950 dark:hover:text-neutral-50 focus-visible:text-neutral-950 dark:focus-visible:text-neutral-50 duration-150 transition-colors rounded-full group outline-none",
          isOpen 
            ? "text-neutral-950 dark:text-neutral-50" 
            : "text-neutral-500 dark:text-neutral-400"
        )}
      >
        <span
          className={clsx(
            "text-sm sm:text-sm z-30 flex items-center gap-2 relative",
            "[text-shadow:_0_0_1.25rem_rgba(10,10,10,0)] dark:[text-shadow:0_0_0.75rem_rgba(250,250,250,0)]",
            "group-hover:[text-shadow:_0_0_1.25rem_rgba(10,10,10,1)] dark:group-hover:[text-shadow:0_0_0.75rem_rgba(250,250,250,1)]",
            "group-active:scale-95",
            "transition-[text-shadow, transform] duration-300"
          )}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat</span>
        </span>

        <motion.div
          layout
          layoutRoot
          className="flex justify-center items-center absolute top-0 left-1/2 -translate-x-1/2 h-full z-20 pointer-events-none"
        >
          {isOpen && (
            <>
              <LinkLight layoutId={linkLightLayoutId + "link_light"} />
              {environment === 'development' && (
                <div className="absolute h-32 w-32 -top-1/4">
                  {/* ConsumingStarsOffscreenCanvas would go here if needed */}
                </div>
              )}
            </>
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
      </button>
      
      {/* Add the same glare effect as in the navigation */}
      <motion.div
        className="absolute left-0 top-1/2 h-16 w-16 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent blur-sm -z-10 opacity-0 group-hover:opacity-100"
        initial={false}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 13.5,
        }}
      />
    </div>
  );
}