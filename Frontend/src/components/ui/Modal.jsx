import { useEffect, useId } from "react";
import useFocusTrap from "../../hooks/useFocusTrap";

/**
 * Accessible, boutique-styled Base Modal primitive.
 * Handles focus trapping, Escape key listener, backdrop click, and entry motion.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  icon = null,
  children,
  maxWidth = "max-w-sm",
  showCloseButton = true,
  ariaLabelledBy,
  className = "",
}) {
  const generatedId = useId();
  const titleId = ariaLabelledBy || `modal-title-${generatedId}`;
  const focusTrapRef = useFocusTrap(isOpen);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={focusTrapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-maroon/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        className={`bg-white rounded-3xl border border-earth-rust/15 shadow-2xl w-full ${maxWidth} my-8 overflow-hidden transform animate-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Header if title or close button is provided */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-earth-rust/10 bg-earth-beige/30">
            <div className="flex items-center gap-2.5 text-earth-maroon min-w-0">
              {icon && (
                <div className="w-7 h-7 rounded-lg bg-earth-rust/10 text-earth-rust flex items-center justify-center shrink-0">
                  {icon}
                </div>
              )}
              {title && (
                <h3
                  id={titleId}
                  className="text-base font-extrabold text-earth-maroon tracking-tight font-display truncate"
                >
                  {title}
                </h3>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full bg-white hover:bg-earth-beige/60 flex items-center justify-center text-earth-maroon/50 hover:text-earth-maroon transition-colors text-lg leading-none shadow-xs ml-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-earth-rust/30"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        {children}
      </div>
    </div>
  );
}
