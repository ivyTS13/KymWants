import { useDroppable } from '@dnd-kit/core';

export default function DropZone({ id, type, children, className = '' }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-300 ease-out shadow-sm ${className} ${
        isOver
          ? type === 'delete'
            ? 'bg-red-100 border-red-500 text-red-800 shadow-md scale-[1.02]'
            : 'bg-earth-rust/20 border-earth-rust text-earth-maroon shadow-md scale-[1.02]'
          : 'bg-white border-dashed border-earth-rust/40 text-earth-maroon/70 hover:border-earth-rust hover:bg-earth-beige/50'
      }`}
    >
      {children}
    </div>
  );
}