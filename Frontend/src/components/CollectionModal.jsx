import { useState, useEffect } from "react";
import useCollectionStore from "../store/useCollectionStore";
import { BookMenuIcon } from "./icons/UiIcons";
import useFocusTrap from "../hooks/useFocusTrap";

export default function CollectionModal({
  isOpen,
  onClose,
  initialCollection,
}) {
  const { updateCollection } = useCollectionStore();
  const focusTrapRef = useFocusTrap(isOpen);
  const [name, setName] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (initialCollection) {
      setName(initialCollection.name || "");
    }
    setSubmitError("");
  }, [initialCollection, isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !initialCollection) return;

    setSubmitError("");
    const result = await updateCollection(initialCollection.id, name);
    if (result && result.success === false) {
      setSubmitError(result.error || "Something went wrong. Please try again.");
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={focusTrapRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-maroon/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collection-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl border border-earth-rust/15 shadow-2xl w-full max-w-sm overflow-hidden transform animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-earth-rust/10 bg-earth-beige/30">
          <div className="flex items-center gap-2 text-earth-maroon">
            <div className="w-7 h-7 rounded-lg bg-earth-rust/10 text-earth-rust flex items-center justify-center">
              <BookMenuIcon className="w-3.5 h-3.5" />
            </div>
            <h3
              id="collection-modal-title"
              className="text-base font-extrabold text-earth-maroon tracking-tight font-display"
            >
              Rename Collection
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-earth-maroon/50 hover:text-earth-maroon transition-colors text-lg leading-none shadow-xs"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label
              htmlFor="collection-name"
              className="block text-xs font-bold text-earth-maroon mb-1.5"
            >
              Collection Title
            </label>
            <input
              id="collection-name"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-xl px-3.5 py-2.5 text-xs text-earth-maroon placeholder:text-earth-maroon/40 focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20"
              placeholder="e.g. Late Night Cravings"
              required
            />
            {/* Inline error */}
            {submitError && (
              <p className="text-red-600 text-xs bg-red-50 p-2.5 rounded-xl border border-red-200 mt-2">
                {submitError}
              </p>
            )}
          </div>
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-earth-beige/60 text-earth-maroon font-bold py-2.5 rounded-full hover:bg-earth-beige transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-earth-rust text-white font-bold py-2.5 rounded-full hover:bg-earth-maroon transition-all text-xs shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
