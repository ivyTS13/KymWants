import FortuneWheel from "../FortuneWheel";
import { UtensilsIcon } from "../icons/UiIcons";

export default function WheelStage({
  wheelDishes,
  onWinnerSelected,
  mobileView,
}) {
  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-y-auto bg-gradient-to-b from-white/40 to-earth-beige/20 ${
        mobileView === "wheel" ? "flex" : "hidden lg:flex"
      }`}
    >
      {wheelDishes.length > 0 ? (
        <div className="z-10 flex flex-col items-center w-full max-w-lg">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-earth-maroon tracking-tight font-display">
              What should we eat?
            </h2>
            <p className="text-earth-maroon/70 text-xs mt-1">
              {wheelDishes.length}{" "}
              {wheelDishes.length === 1 ? "dish" : "dishes"} on the wheel right
              now
            </p>
          </div>

          <FortuneWheel
            dishes={wheelDishes}
            onWinnerSelected={onWinnerSelected}
          />
        </div>
      ) : (
        <div className="z-10 flex flex-col items-center justify-center text-center max-w-sm p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-earth-rust/15 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-earth-rust/10 text-earth-rust flex items-center justify-center mb-3.5 border border-earth-rust/15">
            <UtensilsIcon className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-earth-maroon text-base mb-1 tracking-tight">
            No dishes on the tray
          </h3>
          <p className="text-earth-maroon/65 text-xs leading-relaxed">
            Select dishes from your saved collections or write a quick menu on
            the left to spin the wheel!
          </p>
        </div>
      )}
    </div>
  );
}
