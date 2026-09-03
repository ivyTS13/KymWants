import React, { memo } from "react";
import { useDraggable } from "@dnd-kit/core";

function DraggableDishCard({ dish, isSelected, onToggle }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dish.id,
    data: {type: 'dish', dish },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (!isDragging) onToggle(dish);
      }}
      // Added 'touch-none' to prevent mobile browser scrolling from canceling the drag
      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer select-none touch-none transition-all duration-200 border ${
        isDragging
          ? "opacity-40 scale-95 border-dashed border-earth-rust bg-earth-beige z-50"
          : isSelected
            ? "ring-2 ring-earth-rust shadow-md scale-[0.98] border-earth-rust"
            : "bg-white border-earth-rust/20 shadow-sm hover:shadow-md hover:border-earth-rust/50"
      }`}
    >
      {dish.profileImageUrl ? (
        <img
          src={dish.profileImageUrl}
          alt={dish.name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-earth-rust/10 flex items-center justify-center">
          <span className="text-2xl">🍽️</span>
        </div>
      )}

      {/* Subtle overlay gradient for name clarity */}
      <div className="absolute inset-0 bg-gradient-to-t from-earth-maroon/80 via-transparent to-transparent pointer-events-none" />

      {/* Selected Indicator Badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 bg-earth-rust text-earth-beige text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
          On Wheel
        </div>
      )}

      {/* Item info */}
      <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-none flex flex-col gap-0.5">
        {dish.name && (
          <span className="self-start text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-earth-beige/80 text-earth-maroon">
            {dish.name}
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(DraggableDishCard);