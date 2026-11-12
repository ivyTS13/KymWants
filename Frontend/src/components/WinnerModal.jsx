import { useEffect } from "react";
import { SparklesIcon, UtensilsIcon } from "./icons/UiIcons";
import useFocusTrap from "../hooks/useFocusTrap";

export default function WinnerModal({ dish, onClose }) {
  const focusTrapRef = useFocusTrap(!!dish);

  useEffect(() => {
    if (!dish) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dish, onClose]);

  if (!dish) return null;

  return (
    <div
      ref={focusTrapRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-maroon/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="winner-modal-title"
        className="bg-white rounded-3xl border border-earth-rust/20 shadow-2xl w-full max-w-sm p-6 text-center transform animate-in zoom-in-95 duration-200 relative overflow-hidden"
      >
        {/* Soft decorative background glow */}
        <div
          aria-hidden="true"
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-earth-rust/10 blur-2xl pointer-events-none"
        />

        <div className="flex justify-end mb-1">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-earth-beige/60 hover:bg-earth-beige flex items-center justify-center text-earth-maroon/60 hover:text-earth-maroon transition-colors text-base leading-none"
          >
            ×
          </button>
        </div>

        {/* Celebratory Badge */}
        <div
          aria-hidden="true"
          className="w-14 h-14 rounded-2xl bg-earth-rust/10 text-earth-rust mx-auto flex items-center justify-center mb-3 shadow-xs border border-earth-rust/20"
        >
          <SparklesIcon className="w-7 h-7 motion-safe:animate-bounce" />
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-earth-rust bg-earth-rust/10 px-3 py-1 rounded-full border border-earth-rust/20 mb-2">
          Today's Pick
        </span>

        {/* Dish image preview if available */}
        {dish.profileImageUrl && (
          <div className="w-24 h-24 mx-auto my-3 rounded-2xl overflow-hidden border border-earth-rust/20 shadow-sm">
            <img
              src={dish.profileImageUrl}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h2
          id="winner-modal-title"
          className="text-2xl font-extrabold text-earth-maroon mt-1 mb-1 tracking-tight font-display"
        >
          {dish.name}
        </h2>

        {dish.categoryName && (
          <p className="text-xs text-earth-maroon/60 mb-5">
            Category:{" "}
            <span className="font-semibold text-earth-maroon/80">
              {dish.categoryName}
            </span>
          </p>
        )}

        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 bg-earth-rust hover:bg-earth-maroon text-white font-bold text-sm py-3 rounded-full transition-all duration-150 shadow-sm hover:shadow-md transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-earth-rust"
          >
            <UtensilsIcon className="w-4 h-4" />
            <span>Sounds Great, Let's Eat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
