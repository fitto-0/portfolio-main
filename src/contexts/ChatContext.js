"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create and export the context
export const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Load messages from localStorage when chat opens
  useEffect(() => {
    if (isChatOpen && !isInitialized) {
      try {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      } catch (error) {
        console.error('Failed to load chat messages:', error);
      }
      setIsInitialized(true);
    }
  }, [isChatOpen, isInitialized]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  const updateMessages = useCallback((newMessages) => {
    setMessages(newMessages);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
    setIsInitialized(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  return (
    <ChatContext.Provider value={{ 
      isChatOpen, 
      toggleChat, 
      clearChat,
      isMobile, 
      messages,
      setMessages: updateMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
}

// Export the hook with a default export
const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default useChat;