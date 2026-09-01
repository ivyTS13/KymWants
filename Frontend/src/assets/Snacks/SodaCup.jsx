export default function SodaIcon({ width = 40, height = 40 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Cup body */}
      <path d="M30 30 L35 90 L65 90 L70 30 Z" fill="#BA6A4C" />
      <path d="M30 30 L35 90 L65 90 L70 30 Z" fill="none" stroke="#7B2525" strokeWidth="2" />
      {/* Lid */}
      <rect x="28" y="22" width="44" height="8" rx="3" fill="#7B2525" />
      {/* Straw */}
      <path d="M50 25 L60 5 L65 7 L55 25 Z" fill="#607456" />
      {/* Condensation bubbles */}
      <circle cx="45" cy="50" r="3" fill="#FFF" opacity="0.5" />
      <circle cx="55" cy="60" r="2" fill="#FFF" opacity="0.5" />
      <circle cx="40" cy="70" r="2.5" fill="#FFF" opacity="0.5" />
    </svg>
  );
}