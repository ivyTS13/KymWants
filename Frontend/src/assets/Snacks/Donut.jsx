export default function DonutIcon({ width = 40, height = 40 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Donut base */}
      <circle cx="50" cy="50" r="40" fill="#F5C99B" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#D29A6B" strokeWidth="2" />
      {/* Hole */}
      <circle cx="50" cy="50" r="14" fill="#FFF8F0" />
      {/* Icing */}
      <path d="M25 40 Q35 25 50 30 Q65 35 75 45 Q70 55 60 50 Q50 45 40 50 Q30 55 25 40Z" fill="#FF9E9E" />
      {/* Sprinkles */}
      <rect x="38" y="35" width="6" height="2" rx="1" fill="#7B2525" transform="rotate(30 41 36)" />
      <rect x="55" y="32" width="6" height="2" rx="1" fill="#607456" transform="rotate(-20 58 33)" />
      <rect x="48" y="42" width="6" height="2" rx="1" fill="#BA6A4C" transform="rotate(70 51 43)" />
      <rect x="62" y="40" width="6" height="2" rx="1" fill="#FFD166" transform="rotate(10 65 41)" />
    </svg>
  );
}