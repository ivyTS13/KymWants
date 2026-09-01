export default function IceCreamIcon({ width = 40, height = 40 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Cone */}
      <path d="M40 65 L60 65 L50 95 Z" fill="#D29A6B" />
      <path d="M40 65 L60 65 L50 95 Z" fill="none" stroke="#A67C52" strokeWidth="2" />
      {/* Scoop */}
      <circle cx="50" cy="45" r="25" fill="#FFD1DC" />
      <path d="M25 45 Q30 30 50 30 Q70 30 75 45 Q60 50 50 50 Q40 50 25 45Z" fill="#FFE0BD" />
      {/* Drip */}
      <path d="M50 70 Q55 75 50 80 Q45 75 50 70Z" fill="#FFD1DC" />
      {/* Cherry on top */}
      <circle cx="55" cy="25" r="6" fill="#E05A5A" />
      <path d="M55 19 Q60 14 65 18" fill="none" stroke="#607456" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}