import { useState, useEffect } from 'react';
import useCollectionStore from '../store/useCollectionStore';
import useFocusTrap from '../hooks/useFocusTrap';

export default function DishModal({ isOpen, onClose, mode, collectionId, initialDish }) {
  const { createDish, updateDish, isCreatingDishLoading, isUpdatingDishLoading } = useCollectionStore();
  const focusTrapRef = useFocusTrap(isOpen);
  const [dish, setDish] = useState({
    name: '',
    description: '',
    categoryId: 1,
    profileImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (initialDish) {
      setDish({
        name: initialDish.name || '',
        description: initialDish.description || '',
        categoryId: initialDish.categoryId || 1,
        profileImage: null,
      });
      setPreviewUrl(initialDish.profileImageUrl || '');
    } else {
      setDish({ name: '', description: '', categoryId: 1, profileImage: null });
      setPreviewUrl('');
    }
    setSubmitError('');
  }, [initialDish, isOpen]);

  // Revoke blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

    setSubmitError('');
    let result;
    if (mode === 'create' && collectionId) {
      result = await createDish(collectionId, dish);
    } else if (mode === 'edit' && initialDish) {
      result = await updateDish(initialDish.id, dish);
    }

    if (result && result.success === false) {
      setSubmitError(result.error || 'Something went wrong. Please try again.');
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = mode === 'create' ? isCreatingDishLoading : isUpdatingDishLoading;

  return (
    <div
      ref={focusTrapRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-maroon/40 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl border border-earth-rust/15 shadow-2xl w-full max-w-sm my-8 overflow-hidden transform animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-earth-rust/10 bg-earth-beige/30">
          <h3 id="dish-modal-title" className="text-base font-extrabold text-earth-maroon tracking-tight font-display">
            {mode === 'create' ? 'Add New Dish' : 'Edit Dish Details'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-earth-maroon/50 hover:text-earth-maroon transition-colors text-lg leading-none shadow-xs"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Image upload and preview */}
          <div className="flex flex-col items-center gap-2">
            <label htmlFor="dish-image-file" className="cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-earth-rust/30 flex items-center justify-center bg-earth-beige/30 hover:border-earth-rust hover:bg-earth-beige/50 transition-all group shadow-xs">
              {previewUrl ? (
                <img src={previewUrl} alt={dish.name || 'Dish preview'} className="w-full h-full object-cover" />
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
            <span className="text-[11px] font-medium text-earth-maroon/70">Upload photo (optional)</span>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="dish-name" className="block text-xs font-bold text-earth-maroon mb-1">
              Dish Name *
            </label>
            <input
              id="dish-name"
              type="text"
              value={dish.name}
              onChange={(e) => setDish((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-xl px-3.5 py-2.5 text-xs text-earth-maroon placeholder:text-earth-maroon/40 focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20"
              placeholder="e.g., Strawberry Souffle Pancake"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="dish-description" className="block text-xs font-bold text-earth-maroon mb-1">
              Description
            </label>
            <textarea
              id="dish-description"
              value={dish.description}
              onChange={(e) => setDish((prev) => ({ ...prev, description: e.target.value }))}
              rows="2"
              className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-xl px-3.5 py-2.5 text-xs text-earth-maroon placeholder:text-earth-maroon/40 focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20 resize-none leading-relaxed"
              placeholder="Flavor notes, where to buy, cravings..."
            />
          </div>

          {/* Inline error */}
          {submitError && (
            <p className="text-red-600 text-xs bg-red-50 p-2.5 rounded-xl border border-red-200">{submitError}</p>
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
              {isLoading ? 'Saving...' : mode === 'create' ? 'Add Dish' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
