import { useState } from 'react';

const EARTHY_COLORS = [
  '#C26D50', // rust accent
  '#A3523B', // darker rust
  '#E6D5C3', // soft beige
  '#7A8450', // olive green
  '#D4A373', // warm sand
  '#586540', // deep earth green
];

export default function FortuneWheel({ dishes, onWinnerSelected }) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const numSlices = dishes?.length || 0;
  const sliceAngle = numSlices ? 360 / numSlices : 0;

  const conicGradient = dishes?.map((_, i) => {
    const color = EARTHY_COLORS[i % EARTHY_COLORS.length];
    const startAngle = i * sliceAngle;
    const endAngle = (i + 1) * sliceAngle;
    return `${color} ${startAngle}deg ${endAngle}deg`;
  }).join(', ');

  const handleSpin = () => {
    if (isSpinning || numSlices === 0) return;
    
    setIsSpinning(true);

    const spinMultiplier = Math.floor(Math.random() * 5) + 5;
    const randomExtraDegrees = Math.floor(Math.random() * 360);
    const newRotation = rotation + spinMultiplier * 360 + randomExtraDegrees;
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const normalizedRotation = newRotation % 360;
      const winningAngle = (360 - normalizedRotation) % 360;
      const winningIndex = Math.floor(winningAngle / sliceAngle);
      
      // Trigger the popup modal in the parent dashboard
      if (onWinnerSelected) {
        onWinnerSelected(dishes[winningIndex]);
      }
    }, 5000);
  };

  if (numSlices === 0) {
    return (
      <div className="text-earth-maroon font-medium bg-earth-beige/80 p-6 rounded-xl border border-earth-rust/20 text-center shadow-md">
        🎒 Your tray is empty! Tap some food items from your inventory to place them on the wheel.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        {/* Pointer */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[30px] border-t-earth-rust z-10 drop-shadow" />

        {/* Wheel */}
        <div
          className="w-full h-full rounded-full border-4 border-earth-rust/40 shadow-xl overflow-hidden relative bg-earth-beige"
          style={{
            background: numSlices === 1 ? EARTHY_COLORS[0] : `conic-gradient(${conicGradient})`,
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
          }}
        >
          {/* Inner ring hub */}
          <div className="absolute inset-0 m-auto w-10 h-10 bg-earth-beige border-4 border-earth-rust/40 rounded-full z-10 shadow-inner" />

          {dishes.map((dish, i) => {
            const textRotation = i * sliceAngle + sliceAngle / 2;
            return (
              <div
                key={dish.id}
                className="absolute top-0 left-1/2 -translate-x-1/2 h-[50%] flex items-center justify-center origin-bottom font-bold text-xs md:text-sm text-center px-2"
                style={{
                  transform: `rotate(${textRotation}deg)`,
                  color: '#2d1b18',
                }}
              >
                <span className="transform -rotate-90 origin-center block truncate w-20 md:w-24 drop-shadow-sm bg-earth-beige/50 px-1 rounded">
                  {dish.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning || numSlices === 0}
        className="px-10 py-3.5 bg-earth-rust disabled:bg-gray-300 text-earth-beige font-bold rounded-xl shadow-lg hover:bg-earth-maroon transition-all transform active:scale-95 text-lg uppercase tracking-wider"
      >
        {isSpinning ? '🎲 Spinning...' : 'Spin the Wheel!'}
      </button>
    </div>
  );
}