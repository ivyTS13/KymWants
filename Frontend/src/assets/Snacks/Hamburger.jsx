export default function BurgerIcon({ width = 40, height = 40 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Top bun */}
      <path d="M20 40 Q20 25 50 25 Q80 25 80 40 Z" fill="#F5C99B" />
      <path d="M20 40 Q20 45 50 45 Q80 45 80 40" fill="none" stroke="#D29A6B" strokeWidth="2" />
      {/* Lettuce */}
      <path d="M20 45 Q30 40 40 45 Q50 50 60 45 Q70 40 80 45 L80 50 L20 50 Z" fill="#607456" />
      {/* Tomato */}
      <rect x="25" y="50" width="50" height="6" rx="3" fill="#E05A5A" />
      {/* Patty */}
      <rect x="25" y="56" width="50" height="8" rx="4" fill="#7B2525" />
      {/* Bottom bun */}
      <path d="M20 64 Q20 75 50 75 Q80 75 80 64 Z" fill="#F5C99B" />
      <path d="M20 64 Q20 69 50 69 Q80 69 80 64" fill="none" stroke="#D29A6B" strokeWidth="2" />
      {/* Sesame seeds */}
      <ellipse cx="40" cy="30" rx="2" ry="1" fill="#FFF" />
      <ellipse cx="55" cy="28" rx="2" ry="1" fill="#FFF" />
      <ellipse cx="65" cy="35" rx="2" ry="1" fill="#FFF" />
    </svg>
  );
}