import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import apiClient from "../../api/axios";
import BobaLogo from "../BobaLogo";

export default function ChatDialog({ isOpen, onClose }) {
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

  // Lock body scroll on mobile and handle Escape key when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    if (window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

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
            content:
              "Couldn't reach the foodie assistant right now. Please try again in a moment.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-earth-maroon/30 backdrop-blur-sm z-40 sm:hidden transition-opacity"
      />

      {/* Chat Window / Mobile Drawer */}
      <div
        role="dialog"
        aria-label="Foodie Companion Chat"
        className="fixed inset-x-0 bottom-0 z-50 h-[85vh] sm:h-[500px] sm:max-h-[75vh] sm:w-96 sm:inset-auto sm:bottom-22 sm:right-5 bg-white border border-earth-rust/20 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom"
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-10 h-1 bg-earth-maroon/20 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="bg-gradient-to-r from-earth-beige via-white to-earth-rust/10 border-b border-earth-rust/15 px-4 py-3 flex justify-between items-center shadow-xs shrink-0">
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
            onClick={onClose}
            aria-label="Close chat"
            className="w-7 h-7 rounded-full bg-earth-beige/50 hover:bg-earth-beige text-earth-maroon/60 hover:text-earth-maroon flex items-center justify-center transition-colors text-sm font-bold"
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
                        <p
                          className="mb-1.5 last:mb-0 leading-relaxed"
                          {...props}
                        />
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
              <div className="bg-white border border-earth-rust/15 rounded-2xl rounded-bl-none px-4 py-3 shadow-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-earth-rust/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-earth-rust/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-earth-rust/60 rounded-full animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-earth-rust/15 shrink-0"
        >
          <div className="flex items-center gap-2">
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
                isLimitReached
                  ? "Daily limit reached..."
                  : "Ask for dinner or snack ideas..."
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
    </>
  );
}
