import React, { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CheckIcon, UtensilsIcon, EditPencilIcon, TrashIcon } from "./icons/UiIcons";

function DraggableDishCard({ dish, isSelected, onToggle, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dish.id,
    data: { type: "dish", dish },
  });

  const handleKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!isDragging) onToggle(dish);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      tabIndex={0}
      role="checkbox"
      aria-checked={isSelected}
      aria-label={dish.name}
      onKeyDown={handleKeyDown}
      onClick={() => {
        if (!isDragging) onToggle(dish);
      }}
      className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer select-none touch-pan-y transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-earth-rust/50 ${
        isDragging
          ? "opacity-40 scale-95 border-dashed border-earth-rust bg-earth-beige z-50"
          : isSelected
            ? "ring-2 ring-earth-rust shadow-md scale-[0.98] border-earth-rust bg-white"
            : "bg-white border-earth-rust/15 shadow-xs hover:shadow-md hover:border-earth-rust/40 hover:-translate-y-0.5"
      }`}
    >
      {/* Action buttons (Edit / Delete) */}
      {(onEdit || onDelete) && (
        <div className="absolute top-1.5 left-1.5 z-20 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150">
          {onEdit && (
            <button
              type="button"
              aria-label="Edit dish"
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-xs text-earth-maroon hover:bg-white hover:text-earth-rust shadow-xs transition-colors"
              onClick={(e) => { e.stopPropagation(); onEdit(dish); }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <EditPencilIcon className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label="Delete dish"
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-xs text-earth-maroon hover:bg-red-50 hover:text-red-600 shadow-xs transition-colors"
              onClick={(e) => { e.stopPropagation(); onDelete(dish); }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <TrashIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {dish.profileImageUrl ? (
        <img
          src={dish.profileImageUrl}
          alt={dish.name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-earth-beige/80 to-earth-rust/10 flex flex-col items-center justify-center text-earth-rust/70 group-hover:text-earth-rust transition-colors">
          <div className="w-9 h-9 rounded-full bg-white/70 shadow-xs flex items-center justify-center border border-earth-rust/15">
            <UtensilsIcon className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Delicate gradient for clear text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-earth-maroon/80 via-earth-maroon/20 to-transparent pointer-events-none" />

      {/* Selected Indicator Pill */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 bg-earth-rust text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-white/50 backdrop-blur-xs animate-in zoom-in-75 duration-150">
          <CheckIcon className="w-3 h-3" />
          <span>Active</span>
        </div>
      )}

      {/* Dish Name */}
      <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-none flex flex-col gap-0.5">
        {dish.name && (
          <span className="self-start text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-full bg-white/90 text-earth-maroon truncate max-w-full shadow-xs backdrop-blur-xs">
            {dish.name}
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(DraggableDishCard);
