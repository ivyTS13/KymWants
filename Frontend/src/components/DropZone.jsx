import { useDroppable } from "@dnd-kit/core";

export default function DropZone({ id, type, children, className = "" }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label={type === "delete" ? "Drop here to delete" : "Drop here to edit"}
      className={`flex flex-1 items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-200 ease-out text-xs font-bold ${className} ${
        isOver
          ? type === "delete"
            ? "bg-red-50 border-red-400 text-red-700 shadow-md scale-[1.02]"
            : "bg-earth-rust/15 border-earth-rust text-earth-rust shadow-md scale-[1.02]"
          : type === "delete"
            ? "bg-white/80 border-dashed border-red-200 text-red-600/80 hover:border-red-300"
            : "bg-white/80 border-dashed border-earth-rust/30 text-earth-maroon/70 hover:border-earth-rust/60"
      }`}
    >
      {children}
    </div>
  );
}
