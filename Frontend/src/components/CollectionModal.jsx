import { useState, useEffect } from "react";
import useCollectionStore from "../store/useCollectionStore";
import Modal from "./ui/Modal";
import { BookMenuIcon } from "./icons/UiIcons";

export default function CollectionModal({
  isOpen,
  onClose,
  initialCollection,
}) {
  const updateCollection = useCollectionStore((state) => state.updateCollection);
  const [name, setName] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(initialCollection?.name || "");
      setSubmitError("");
    }
  }, [initialCollection, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !initialCollection) return;

    setSubmitError("");
    const result = await updateCollection(initialCollection.id, name.trim());
    if (result && result.success === false) {
      setSubmitError(result.error || "Something went wrong. Please try again.");
      return;
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rename Collection"
      icon={<BookMenuIcon className="w-3.5 h-3.5" />}
      maxWidth="max-w-sm"
      ariaLabelledBy="collection-modal-title"
    >
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
    </Modal>
  );
}
