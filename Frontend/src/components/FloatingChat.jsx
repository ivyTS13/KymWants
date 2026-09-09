import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import apiClient from "../api/axios";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! How can I help you today?" },
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
          "Daily AI query limit reached for your session.";
        setMessages((prev) => [
          ...prev,
          { role: "error", content: `🚨 ${errorMessage}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "error",
            content: "❌ Something went wrong connecting to the AI.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[90vw] sm:w-96 bg-earth-beige border border-earth-rust/30 rounded-xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 h-[500px] max-h-[75vh]">
          {/* Header */}
          <div className="bg-earth-green text-earth-beige px-4 py-3 flex justify-between items-center shadow-sm">
            <span className="font-bold">AI Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-earth-beige/80 hover:text-earth-beige focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-base shadow-sm ${
                    msg.role === "user"
                      ? "bg-earth-rust text-white rounded-br-none"
                      : msg.role === "error"
                        ? "bg-red-100 text-red-700 border border-red-200 rounded-bl-none font-medium"
                        : "bg-white text-earth-maroon border border-earth-rust/20 rounded-bl-none"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom style overrides for Markdown elements inside the bubble
                        h3: ({ node, ...props }) => (
                          <h3
                            className="font-bold text-base mt-2 mb-1 text-earth-maroon"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            className="mb-2 last:mb-0 leading-relaxed"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc list-inside space-y-1 mb-2"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="list-decimal list-inside space-y-1 mb-2"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="text-base" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
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
                <div className="bg-white border border-earth-rust/20 text-earth-maroon/70 rounded-2xl rounded-bl-none px-4 py-2 text-base flex gap-1 items-center shadow-sm">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-earth-rust/20"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || isLimitReached}
                placeholder={
                  isLimitReached ? "Daily limit reached..." : "Ask something..."
                }
                className="flex-1 bg-earth-beige/50 border border-earth-rust/30 rounded-lg px-3 py-2 text-base text-earth-maroon focus:outline-none focus:ring-1 focus:ring-earth-rust disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isLimitReached}
                className="bg-earth-green hover:bg-earth-rust text-white rounded-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:hover:bg-earth-green flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transform rotate-90"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-earth-rust hover:bg-earth-maroon text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earth-maroon"
        aria-label="Toggle AI Chat"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
