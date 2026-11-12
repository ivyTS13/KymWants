import React from "react";
import AppRoutes from "./router/AppRoutes";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-earth-beige via-[#F8F2EB] to-[#F1E5D8] p-4 text-center font-sans text-earth-maroon">
          <div className="max-w-md w-full bg-white/90 backdrop-blur-md border border-earth-rust/15 rounded-3xl p-8 shadow-xl flex flex-col items-center">
            <h1 className="text-2xl font-extrabold text-earth-maroon mb-2 tracking-tight font-display">
              Something went wrong
            </h1>
            <p className="text-earth-maroon/70 mb-6 text-xs leading-relaxed">
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-earth-rust text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-earth-maroon transition-all shadow-xs"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
