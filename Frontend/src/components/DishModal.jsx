import { useState, useEffect } from "react";
import useCollectionStore from "../store/useCollectionStore";
import Modal from "./ui/Modal";
import { UtensilsIcon } from "./icons/UiIcons";

export default function DishModal({
  isOpen,
  onClose,
  mode,
  collectionId,
  initialDish,
}) {
  const createDish = useCollectionStore((state) => state.createDish);
  const updateDish = useCollectionStore((state) => state.updateDish);
  const isCreatingDishLoading = useCollectionStore(
    (state) => state.isCreatingDishLoading
  );
  const isUpdatingDishLoading = useCollectionStore(
    (state) => state.isUpdatingDishLoading
  );

  const [dish, setDish] = useState({
    name: "",
    description: "",
    categoryId: 1,
    profileImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialDish) {
        setDish({
          name: initialDish.name || "",
          description: initialDish.description || "",
          categoryId: initialDish.categoryId || 1,
          profileImage: null,
        });
        setPreviewUrl(initialDish.profileImageUrl || "");
      } else {
        setDish({
          name: "",
          description: "",
          categoryId: 1,
          profileImage: null,
        });
        setPreviewUrl("");
      }
      setSubmitError("");
    }
  }, [initialDish, isOpen]);

  // Revoke blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDish((prev) => ({ ...prev, profileImage: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dish.name.trim()) return;

    setSubmitError("");
    let result;
    if (mode === "create" && collectionId) {
      result = await createDish(collectionId, dish);
    } else if (mode === "edit" && initialDish) {
      result = await updateDish(initialDish.id, dish);
    }

    if (result && result.success === false) {
      setSubmitError(result.error || "Something went wrong. Please try again.");
      return;
    }
    onClose();
  };

  const isLoading =
    mode === "create" ? isCreatingDishLoading : isUpdatingDishLoading;

  const modalTitle = mode === "create" ? "Add New Dish" : "Edit Dish Details";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      icon={<UtensilsIcon className="w-3.5 h-3.5" />}
      maxWidth="max-w-sm"
      ariaLabelledBy="dish-modal-title"
    >
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        {/* Image upload and preview */}
        <div className="flex flex-col items-center gap-2">
          <label
            htmlFor="dish-image-file"
            className="cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-earth-rust/30 flex items-center justify-center bg-earth-beige/30 hover:border-earth-rust hover:bg-earth-beige/50 transition-all group shadow-xs"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={dish.name || "Dish preview"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-earth-rust/60 group-hover:text-earth-rust transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
            )}
            <input
              id="dish-image-file"
              type="file"
              accept="image/*"
              aria-label="Upload dish photo"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <span className="text-[11px] font-medium text-earth-maroon/70">
            Upload photo (optional)
          </span>
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="dish-name"
            className="block text-xs font-bold text-earth-maroon mb-1"
          >
            Dish Name *
          </label>
          <input
            id="dish-name"
            type="text"
            value={dish.name}
            onChange={(e) =>
              setDish((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-xl px-3.5 py-2.5 text-xs text-earth-maroon placeholder:text-earth-maroon/40 focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20"
            placeholder="e.g., Strawberry Souffle Pancake"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="dish-description"
            className="block text-xs font-bold text-earth-maroon mb-1"
          >
            Description
          </label>
          <textarea
            id="dish-description"
            value={dish.description}
            onChange={(e) =>
              setDish((prev) => ({ ...prev, description: e.target.value }))
            }
            rows="2"
            className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-xl px-3.5 py-2.5 text-xs text-earth-maroon placeholder:text-earth-maroon/40 focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20 resize-none leading-relaxed"
            placeholder="Flavor notes, where to buy, cravings..."
          />
        </div>

        {/* Inline error */}
        {submitError && (
          <p className="text-red-600 text-xs bg-red-50 p-2.5 rounded-xl border border-red-200">
            {submitError}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-earth-beige/60 text-earth-maroon font-bold py-2.5 rounded-full hover:bg-earth-beige transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-earth-rust text-white font-bold py-2.5 rounded-full hover:bg-earth-maroon transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {isLoading
              ? "Saving..."
              : mode === "create"
                ? "Add Dish"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
