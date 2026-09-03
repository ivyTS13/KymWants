import { useState, useEffect } from 'react';
import useCollectionStore from '../store/useCollectionStore';

export default function DishModal({ isOpen, onClose, mode, collectionId, initialDish }) {
  const { createDish, updateDish, isCreatingDishLoading, isUpdatingDishLoading } = useCollectionStore();
  const [dish, setDish] = useState({
    name: '',
    description: '',
    categoryId: 1,
    profileImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState('');

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
  }, [initialDish, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDish((prev) => ({ ...prev, profileImage: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dish.name.trim()) return;

    if (mode === 'create' && collectionId) {
      createDish(collectionId, dish);
    } else if (mode === 'edit' && initialDish) {
      updateDish(initialDish.id, dish);
    }
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = mode === 'create' ? isCreatingDishLoading : isUpdatingDishLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm my-8 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-earth-green/20">
          <h3 className="text-lg font-bold text-earth-maroon">
            {mode === 'create' ? 'Add New Dish' : 'Edit Dish'}
          </h3>
          <button
            onClick={onClose}
            className="text-earth-maroon/50 hover:text-earth-rust text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {/* Image upload and preview */}
          <div className="flex flex-col items-center gap-2">
            <label className="cursor-pointer w-24 h-24 rounded-lg overflow-hidden border-2 border-dashed border-earth-green/30 flex items-center justify-center bg-earth-beige/20 hover:border-earth-rust transition-colors">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-earth-green text-2xl">📷</span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <span className="text-xs text-earth-maroon/60">Tap to add photo</span>
          </div>

          {/* Name */}
          <div>
            <label className="block text-base sm:text-base sm:text-base sm:text-sm font-medium text-earth-maroon mb-1">
              Dish Name *
            </label>
            <input
              type="text"
              value={dish.name}
              onChange={(e) => setDish((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-earth-beige/30 border border-earth-green/30 rounded-lg px-3 py-2 text-base sm:text-base sm:text-base sm:text-sm text-earth-maroon focus:outline-none focus:border-earth-rust"
              placeholder="e.g., Spaghetti Carbonara"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-base sm:text-base sm:text-base sm:text-sm font-medium text-earth-maroon mb-1">
              Description
            </label>
            <textarea
              value={dish.description}
              onChange={(e) => setDish((prev) => ({ ...prev, description: e.target.value }))}
              rows="2"
              className="w-full bg-earth-beige/30 border border-earth-green/30 rounded-lg px-3 py-2 text-base sm:text-base sm:text-base sm:text-sm text-earth-maroon focus:outline-none focus:border-earth-rust resize-none"
              placeholder="Optional description..."
            />
          </div>

          {/* Category ID 
          <div>
            <label className="block text-base sm:text-base sm:text-base sm:text-sm font-medium text-earth-maroon mb-1">
              Category ID
            </label>
            <input
              type="number"
              min="1"
              value={dish.categoryId}
              onChange={(e) => setDish((prev) => ({ ...prev, categoryId: e.target.value }))}
              className="w-full bg-earth-beige/30 border border-earth-green/30 rounded-lg px-3 py-2 text-base sm:text-base sm:text-base sm:text-sm text-earth-maroon focus:outline-none focus:border-earth-rust"
              placeholder="e.g., 1"
            />
          </div>
*/}
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-300 transition-colors text-base sm:text-base sm:text-base sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-earth-rust text-white font-bold py-2 rounded-lg hover:bg-earth-maroon transition-colors text-base sm:text-base sm:text-base sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : mode === 'create' ? 'Add Dish' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}