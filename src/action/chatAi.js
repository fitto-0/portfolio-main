"use client";

import { useState, useRef, useEffect } from "react";
import { AiResponse } from "@/components/ui/button"; // your server action

export default function AIChat() {
  const [messages, setMessages] = useState([]); // chat history
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await AiResponse(input);

      const aiMessage = {
        role: "ai",
        content: res?.result || "AI service error. Try again later.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "AI service error. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border rounded-md shadow-md bg-white">
      <div className="h-64 overflow-y-auto border-b mb-2 p-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${m.role === "ai" ? "text-blue-600" : "text-gray-800"}`}
          >
            <b>{m.role === "ai" ? "AI" : "You"}:</b> {m.content}
          </div>
        ))}
        {loading && <div className="text-blue-600">AI is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-blue-600 text-white px-4 rounded"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
