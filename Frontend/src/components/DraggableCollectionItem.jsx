import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { BookMenuIcon, EditPencilIcon, TrashIcon } from './icons/UiIcons';

export default function DraggableCollectionItem({ collection, onClick, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `col-${collection.id}`,
    data: { type: 'collection', collection },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      aria-label={`Open menu ${collection.name}, ${collection.dishes?.length || 0} items`}
      onClick={() => {
        if (!isDragging) onClick(collection);
      }}
      className={`p-3.5 text-left rounded-2xl transition-all duration-200 border w-full flex justify-between items-center group touch-pan-y focus:outline-none focus:ring-2 focus:ring-earth-rust/40 ${
        isDragging
          ? "opacity-40 scale-95 border-dashed border-earth-rust bg-earth-beige z-50"
          : "border-earth-rust/15 bg-white shadow-xs hover:border-earth-rust/40 hover:shadow-sm hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-earth-rust/10 text-earth-rust flex items-center justify-center shrink-0 border border-earth-rust/15 group-hover:bg-earth-rust/20 transition-colors">
          <BookMenuIcon className="w-4 h-4" />
        </div>
        <div>
          <span className="block font-bold text-earth-maroon text-sm tracking-tight group-hover:text-earth-rust transition-colors">
            {collection.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-semibold text-earth-rust bg-earth-rust/10 px-2 py-0.5 rounded-full border border-earth-rust/15">
              {collection.dishes?.length || 0} dishes
            </span>
          </div>
        </div>
      </div>
      {/* Action buttons (Edit / Delete) */}
      {(onEdit || onDelete) && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 mr-1">
          {onEdit && (
            <button
              type="button"
              aria-label="Edit collection"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-earth-beige/60 text-earth-maroon hover:bg-earth-rust/15 hover:text-earth-rust shadow-xs transition-colors"
              onClick={(e) => { e.stopPropagation(); onEdit(collection); }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <EditPencilIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label="Delete collection"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-earth-beige/60 text-earth-maroon hover:bg-red-50 hover:text-red-600 shadow-xs transition-colors"
              onClick={(e) => { e.stopPropagation(); onDelete(collection); }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="w-7 h-7 rounded-full bg-earth-beige/50 group-hover:bg-earth-rust group-hover:text-white text-earth-rust flex items-center justify-center transition-all duration-200 shadow-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </button>
  );
}
