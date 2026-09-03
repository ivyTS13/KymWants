import { useState, useEffect } from 'react';
import useCollectionStore from '../store/useCollectionStore';

export default function CollectionModal({ isOpen, onClose, initialCollection }) {
  const { updateCollection } = useCollectionStore();
  const [name, setName] = useState('');

  useEffect(() => {
    if (initialCollection) {
      setName(initialCollection.name || '');
    }
  }, [initialCollection, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !initialCollection) return;
    
    await updateCollection(initialCollection.id, name);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-earth-green/20">
          <h3 className="text-lg font-bold text-earth-maroon">Rename Menu</h3>
          <button onClick={onClose} className="text-earth-maroon/50 hover:text-earth-rust text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-earth-maroon mb-1">Menu Name</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-earth-beige/30 border border-earth-green/30 rounded-lg px-3 py-2 text-sm text-earth-maroon focus:outline-none focus:border-earth-rust"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="flex-1 bg-earth-rust text-white font-bold py-2 rounded-lg hover:bg-earth-maroon">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}