import { useEffect } from "react";
import { TrashIcon } from "./icons/UiIcons";
import useFocusTrap from "../hooks/useFocusTrap";

export default function DeleteConfirmModal({
  isOpen,
  dishToDelete,
  collectionToDelete,
  isDeletingDishLoading: isDeleting,
  onCancel,
  onConfirm,
}) {
  const focusTrapRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || (!dishToDelete && !collectionToDelete)) return null;

  const targetName = collectionToDelete
    ? collectionToDelete.name
    : dishToDelete.name;

  return (
    <div
      ref={focusTrapRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-maroon/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="bg-white rounded-3xl border border-earth-rust/20 shadow-xl w-full max-w-xs p-6 text-center transform animate-in zoom-in-95 duration-150"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 border border-red-100">
          <TrashIcon className="w-5 h-5" />
        </div>

        <h3
          id="delete-modal-title"
          className="text-base font-bold text-earth-maroon mb-1 font-display"
        >
          {collectionToDelete ? "Delete Collection?" : "Delete Dish?"}
        </h3>
        <p className="text-xs text-earth-maroon/70 mb-5 leading-relaxed">
          Are you sure you want to remove{" "}
          <span className="font-semibold text-earth-maroon">"{targetName}"</span>?
          This cannot be undone.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 bg-earth-beige/60 text-earth-maroon font-bold text-xs py-2.5 rounded-full hover:bg-earth-beige transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-full transition-colors disabled:opacity-50 shadow-xs"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
