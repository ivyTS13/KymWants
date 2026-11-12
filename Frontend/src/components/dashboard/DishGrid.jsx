import DraggableDishCard from "../DraggableDishCard";
import { ArrowLeftIcon, PlusIcon } from "../icons/UiIcons";

export default function DishGrid({
  selectedCollection,
  onBack,
  onSelectAll,
  onClearAll,
  isCreatingDishLoading,
  onOpenCreateDish,
  selectedDishIds,
  onToggleDish,
  onEditDish,
  onDeleteDish,
}) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <button
        onClick={onBack}
        className="text-earth-rust font-bold text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white border border-earth-rust/20 rounded-full shadow-xs w-fit hover:bg-earth-beige/60 transition-all"
      >
        <ArrowLeftIcon className="w-3 h-3" />
        <span>All Collections</span>
      </button>

      <div className="bg-white p-3.5 rounded-2xl border border-earth-rust/15 shadow-xs flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-earth-maroon text-sm tracking-tight">
            {selectedCollection.name}
          </h3>
          <p className="text-[11px] text-earth-maroon/60 mt-0.5">
            Created by {selectedCollection.userName}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onSelectAll}
            className="px-2.5 py-1 text-xs font-bold text-earth-rust bg-earth-rust/10 hover:bg-earth-rust hover:text-white rounded-full transition-all shadow-xs flex items-center gap-1"
            title="Select All Dishes"
            aria-label="Select all dishes for the wheel"
          >
            <span className="text-[11px]">Select All</span>
          </button>

          <button
            onClick={onClearAll}
            className="px-2.5 py-1 text-xs font-medium text-earth-maroon/60 bg-earth-beige/60 hover:bg-earth-beige hover:text-earth-maroon rounded-full transition-all shadow-xs border border-earth-rust/15"
            title="Unselect All Dishes"
            aria-label="Unselect all dishes"
          >
            <span className="text-[11px]">Clear</span>
          </button>
        </div>
      </div>

      {/* Scrollable Grid Container for dishes */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pb-3">
          {isCreatingDishLoading ? (
            <div className="aspect-square rounded-2xl bg-earth-beige/40 animate-pulse border border-earth-rust/20" />
          ) : (
            <button
              onClick={onOpenCreateDish}
              className="aspect-square rounded-2xl border-2 border-dashed border-earth-rust/30 hover:border-earth-rust text-earth-maroon/70 hover:text-earth-rust font-bold transition-all flex flex-col items-center justify-center gap-1.5 bg-white/70 shadow-xs hover:bg-white"
            >
              <div className="w-7 h-7 rounded-full bg-earth-rust/10 text-earth-rust flex items-center justify-center">
                <PlusIcon className="w-4 h-4" />
              </div>
              <span className="text-[10px] tracking-tight">Add Dish</span>
            </button>
          )}

          {selectedCollection.dishes?.map((dish) => (
            <DraggableDishCard
              key={dish.id}
              dish={dish}
              isSelected={selectedDishIds.has(dish.id)}
              onToggle={onToggleDish}
              onEdit={onEditDish}
              onDelete={onDeleteDish}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
