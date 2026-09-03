import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function DraggableCollectionItem({ collection, onClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `col-${collection.id}`, // prefix to ensure unique IDs across dishes and collections
    data: { type: 'collection', collection },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (!isDragging) onClick(collection);
      }}
      className={`p-3.5 text-left rounded-xl transition-all border w-full flex justify-between items-center group touch-none ${
        isDragging
          ? "opacity-40 scale-95 border-dashed border-earth-rust bg-earth-beige z-50"
          : "border-earth-rust/20 bg-white shadow-sm hover:border-earth-rust/60"
      }`}
    >
      <div>
        <h3 className="font-bold text-earth-maroon text-sm">{collection.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-semibold text-earth-rust bg-earth-rust/10 px-1.5 py-0.5 rounded">
            {collection.dishes?.length || 0} items
          </span>
        </div>
      </div>
      <span className="text-sm text-earth-rust transform group-hover:translate-x-1 transition-transform">
        →
      </span>
    </button>
  );
}