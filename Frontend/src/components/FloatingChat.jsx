import React, { useState, lazy, Suspense } from "react";
import BobaLogo from "./BobaLogo";
import { SparklesIcon } from "./icons/UiIcons";

// Lazy-load chat dialog to split react-markdown and remark-gfm out of main bundle
const ChatDialog = lazy(() => import("./chat/ChatDialog"));

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Lazy Chat Dialog (loaded on demand) */}
      {isOpen && (
        <Suspense fallback={null}>
          <ChatDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </Suspense>
      )}

      {/* Floating Toggle Button */}
      <div
        className={`fixed bottom-5 right-5 z-50 ${
          isOpen ? "hidden sm:flex" : "flex"
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-13 h-13 sm:w-14 sm:h-14 bg-earth-rust hover:bg-earth-maroon text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-3 focus:ring-earth-rust/40 border-2 border-white"
          aria-label={isOpen ? "Close AI Chat" : "Open AI Chat"}
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
    </>
  );
}
