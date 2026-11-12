import DraggableDishCard from "../DraggableDishCard";
import { MagicWandIcon } from "../icons/UiIcons";

export default function QuickListForm({
  customText,
  setCustomText,
  onGenerate,
  customDishes,
  selectedDishIds,
  onToggleDish,
}) {
  return (
    <div
      role="tabpanel"
      id="panel-custom"
      aria-labelledby="tab-custom"
      className="flex flex-col gap-3 h-full"
    >
      <div className="bg-white p-4 rounded-3xl border border-earth-rust/15 shadow-xs flex flex-col gap-2.5 shrink-0">
        <label
          htmlFor="custom-menu-input"
          className="text-xs font-bold text-earth-maroon flex items-center justify-between"
        >
          <span>Enter dishes (one per line):</span>
          <span className="text-[10px] text-earth-maroon/50 font-normal">
            e.g. Matcha latte, Udon
          </span>
        </label>
        <textarea
          id="custom-menu-input"
          className="w-full bg-earth-beige/30 border border-earth-rust/25 rounded-2xl p-3 text-xs text-earth-maroon focus:outline-none focus:border-earth-rust focus:ring-2 focus:ring-earth-rust/20 resize-none h-28 leading-relaxed placeholder:text-earth-maroon/40"
          placeholder="Strawberry boba&#10;Matcha waffle&#10;Tonkatsu ramen&#10;Seafood boil"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
        />
        <button
          onClick={onGenerate}
          className="inline-flex items-center justify-center gap-2 bg-earth-rust text-white text-xs font-bold py-2.5 rounded-full hover:bg-earth-maroon transition-all shadow-xs active:scale-98"
        >
          <MagicWandIcon className="w-3.5 h-3.5" />
          <span>Generate Dishes</span>
        </button>
      </div>

      {customDishes.length > 0 && (
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pb-3">
            {customDishes.map((dish) => (
              <DraggableDishCard
                key={dish.id}
                dish={dish}
                isSelected={selectedDishIds.has(dish.id)}
                onToggle={onToggleDish}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
