import { useState } from "react";
import { SPIN_DURATION_MS, calculateWinnerIndex } from "../utils/wheelMath";
import { SparklesIcon, UtensilsIcon } from "./icons/UiIcons";

const AESTHETIC_PALETTE = [
  "#D67051", // warm terracotta
  "#7F9471", // sweet matcha
  "#DF9B56", // salted honey
  "#D68290", // strawberry cream
  "#6E8465", // calm olive
  "#C8785E", // cinnamon peach
  "#9C887E", // earl grey
  "#E08E73", // apricot
];

function getContrastColor(hexColor) {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.42 ? "#241816" : "#FFFFFF";
}

export default function FortuneWheel({ dishes, onWinnerSelected }) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const numSlices = dishes?.length || 0;
  const sliceAngle = numSlices ? 360 / numSlices : 0;
  const isAdaptiveMode = numSlices > 10;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const conicGradient = dishes
    ?.map((_, i) => {
      const color = AESTHETIC_PALETTE[i % AESTHETIC_PALETTE.length];
      const startAngle = i * sliceAngle;
      const endAngle = (i + 1) * sliceAngle;
      return `${color} ${startAngle}deg ${endAngle}deg`;
    })
    .join(", ");

  const handleSpin = () => {
    if (isSpinning || numSlices === 0) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setIsSpinning(true);
      const randomIndex = Math.floor(Math.random() * numSlices);
      const targetRotation =
        (360 - (randomIndex * sliceAngle + sliceAngle / 2)) % 360;
      setRotation(targetRotation);

      setTimeout(() => {
        setIsSpinning(false);
        if (onWinnerSelected && dishes[randomIndex]) {
          onWinnerSelected(dishes[randomIndex]);
        }
      }, 150);
      return;
    }

    setIsSpinning(true);

    const spinMultiplier = Math.floor(Math.random() * 5) + 5;
    const randomExtraDegrees = Math.floor(Math.random() * 360);
    const newRotation = rotation + spinMultiplier * 360 + randomExtraDegrees;

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const winningIndex = calculateWinnerIndex(newRotation, numSlices);

      if (onWinnerSelected && dishes[winningIndex]) {
        onWinnerSelected(dishes[winningIndex]);
      }
    }, SPIN_DURATION_MS);
  };

  if (numSlices === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white/70 backdrop-blur-xs rounded-3xl border border-earth-rust/15 text-center shadow-xs max-w-sm">
        <div className="w-12 h-12 rounded-full bg-earth-rust/10 text-earth-rust flex items-center justify-center mb-3">
          <UtensilsIcon className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-earth-maroon mb-1 font-display">
          The wheel is currently empty
        </h4>
        <p className="text-xs text-earth-maroon/70 leading-relaxed">
          Tap items from your collection or generate a custom menu to queue
          them for a spin!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 drop-shadow-md">
        {/* Needle pointer */}
        <div
          aria-hidden="true"
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center filter drop-shadow-sm"
        >
          <div className="w-3.5 h-3.5 bg-earth-maroon rounded-full border-2 border-white" />
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[18px] border-t-earth-maroon -mt-1" />
        </div>

        {/* Wheel container */}
        <div
          role="region"
          aria-live="polite"
          aria-busy={isSpinning}
          aria-label="Fortune wheel"
          className="w-full h-full rounded-full border-8 border-white shadow-xl overflow-hidden relative bg-earth-beige ring-1 ring-earth-rust/20"
          style={{
            background:
              numSlices === 1
                ? AESTHETIC_PALETTE[0]
                : `conic-gradient(${conicGradient})`,
            transform: `rotate(${rotation}deg)`,
            transition:
              isSpinning && prefersReducedMotion
                ? "transform 0.15s ease-out"
                : `transform ${SPIN_DURATION_MS / 1000}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`,
          }}
        >
          {/* Inner hub badge */}
          <div
            aria-hidden="true"
            className="absolute inset-0 m-auto w-12 h-12 bg-white/95 rounded-full z-10 shadow-md border-2 border-earth-rust/30 flex items-center justify-center text-earth-rust"
          >
            <SparklesIcon className="w-4 h-4 text-earth-rust motion-safe:animate-pulse" />
          </div>

          {dishes.map((dish, i) => {
            const textRotation = i * sliceAngle + sliceAngle / 2;
            const sliceColor = AESTHETIC_PALETTE[i % AESTHETIC_PALETTE.length];
            const textColor = getContrastColor(sliceColor);
            const badgeBg =
              textColor === "#FFFFFF"
                ? "rgba(0, 0, 0, 0.28)"
                : "rgba(255, 255, 255, 0.85)";

            return (
              <div
                key={dish.id}
                className="absolute top-0 left-1/2 -translate-x-1/2 h-[50%] flex items-center justify-center origin-bottom font-bold text-xs text-center px-1"
                style={{
                  transform: `rotate(${textRotation}deg)`,
                }}
              >
                {isAdaptiveMode ? (
                  /* Numbered slice marker when dish count > 10 prevents overcrowding */
                  <span
                    className="transform -rotate-90 origin-center block text-xs font-black tracking-tight drop-shadow-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: textColor,
                      backgroundColor: badgeBg,
                    }}
                  >
                    {i + 1}
                  </span>
                ) : (
                  /* Standard radial label for <= 10 dishes */
                  <span
                    className="transform -rotate-90 origin-center block truncate w-20 md:w-24 text-[11px] font-bold tracking-tight drop-shadow-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: textColor,
                      backgroundColor: badgeBg,
                    }}
                  >
                    {dish.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Adaptive Dish Guide when wheel has > 10 dishes */}
      {isAdaptiveMode && (
        <div className="w-full max-w-sm bg-white/70 backdrop-blur-xs rounded-2xl border border-earth-rust/15 p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-earth-rust/10">
            <h4 className="text-xs font-bold text-earth-maroon font-display">
              Dish Guide
            </h4>
            <span className="text-[10px] text-earth-maroon/60">
              {numSlices} dishes on wheel
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {dishes.map((dish, i) => {
              const sliceColor =
                AESTHETIC_PALETTE[i % AESTHETIC_PALETTE.length];
              const badgeText = getContrastColor(sliceColor);
              return (
                <div
                  key={dish.id}
                  className="flex items-center gap-1.5 text-xs text-earth-maroon bg-white/80 rounded-xl px-2 py-1 border border-earth-rust/10 min-w-0"
                >
                  <span
                    className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs"
                    style={{
                      backgroundColor: sliceColor,
                      color: badgeText,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="truncate text-[11px] font-medium"
                    title={dish.name}
                  >
                    {dish.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Aesthetic Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || numSlices === 0}
        aria-label={isSpinning ? "Wheel is spinning" : "Spin the wheel"}
        className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-earth-rust hover:bg-earth-maroon text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-3 focus:ring-earth-rust/30 text-sm tracking-wide"
      >
        <SparklesIcon
          className={`w-4 h-4 ${
            isSpinning
              ? "motion-safe:animate-spin"
              : "group-hover:rotate-12 transition-transform"
          }`}
        />
        <span>{isSpinning ? "Spinning..." : "Spin the Wheel"}</span>
      </button>
    </div>
  );
}
