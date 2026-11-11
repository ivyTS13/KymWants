import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import apiClient from "../api/axios";
import BobaLogo from "./BobaLogo";
import { SparklesIcon } from "./icons/UiIcons";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hello! Craving something sweet, savory, or need ideas for your next food collection? Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLimitReached) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiClient.post("/Chat/ask", {
        question: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: response.data.answer },
      ]);
    } catch (error) {
      if (error.response?.status === 429) {
        setIsLimitReached(true);
        const errorMessage =
          error.response?.data?.message ||
          "Daily query limit reached for your session. Come back tomorrow!";
        setMessages((prev) => [
          ...prev,
          { role: "error", content: errorMessage },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "error",
            content: "Couldn't reach the foodie assistant right now. Please try again in a moment.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[90vw] sm:w-96 bg-white border border-earth-rust/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-3 transition-all duration-300 h-[500px] max-h-[75vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-earth-beige via-white to-earth-rust/10 border-b border-earth-rust/15 px-4 py-3.5 flex justify-between items-center shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-earth-rust/10 border border-earth-rust/20 flex items-center justify-center p-0.5">
                <BobaLogo width={22} height={22} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-earth-maroon tracking-tight">
                    Foodie Companion
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-earth-maroon/60">
                  Ready to help with food ideas
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="w-7 h-7 rounded-full bg-earth-beige/50 hover:bg-earth-beige text-earth-maroon/60 hover:text-earth-maroon flex items-center justify-center transition-colors text-sm"
            >
              ×
            </button>
          </div>

          {/* Messages Area */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-earth-beige/20 text-xs"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-earth-rust text-white rounded-br-none font-medium"
                      : msg.role === "error"
                        ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-none font-medium"
                        : "bg-white text-earth-maroon border border-earth-rust/15 rounded-bl-none shadow-xs"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h3: ({ node: _node, ...props }) => (
                          <h3
                            className="font-bold text-xs mt-2 mb-1 text-earth-maroon"
                            {...props}
                          />
                        ),
                        p: ({ node: _node, ...props }) => (
                          <p className="mb-1.5 last:mb-0 leading-relaxed" {...props} />
                        ),
                        ul: ({ node: _node, ...props }) => (
                          <ul
                            className="list-disc list-inside space-y-0.5 mb-1.5"
                            {...props}
                          />
                        ),
                        ol: ({ node: _node, ...props }) => (
                          <ol
                            className="list-decimal list-inside space-y-0.5 mb-1.5"
                            {...props}
                          />
                        ),
                        li: ({ node: _node, ...props }) => (
                          <li className="text-xs" {...props} />
                        ),
                        strong: ({ node: _node, ...props }) => (
                          <strong
                            className="font-semibold text-earth-maroon"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-earth-rust/15 text-earth-maroon/60 rounded-2xl rounded-bl-none px-3.5 py-2 text-xs flex gap-1.5 items-center shadow-xs">
                  <span className="text-[10px] text-earth-rust font-bold">Thinking</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-earth-rust animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-earth-rust animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-earth-rust animate-bounce delay-200" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-earth-rust/15"
          >
            <div className="flex gap-2 items-center">
              <label htmlFor="chat-input" className="sr-only">
                Message
              </label>
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || isLimitReached}
                placeholder={
                  isLimitReached ? "Daily limit reached..." : "Ask for dinner or snack ideas..."
                }
                className="flex-1 bg-earth-beige/40 border border-earth-rust/20 rounded-full px-3.5 py-2 text-xs text-earth-maroon placeholder:text-earth-maroon/55 focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20 disabled:opacity-50"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || isLoading || isLimitReached}
                className="w-8 h-8 bg-earth-rust hover:bg-earth-maroon text-white rounded-full transition-all disabled:opacity-40 flex items-center justify-center shrink-0 shadow-xs active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Toggle Button with cute boutique styling */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 sm:w-14 sm:h-14 bg-earth-rust hover:bg-earth-maroon text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-3 focus:ring-earth-rust/40 border-2 border-white"
        aria-label="Toggle AI Chat"
      >
        {isOpen ? (
          <span className="text-xl leading-none">×</span>
        ) : (
          <div className="relative">
            <BobaLogo width={30} height={30} />
            <span className="absolute -top-1 -right-1 text-yellow-200">
              <SparklesIcon className="w-3 h-3 text-yellow-300" />
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
