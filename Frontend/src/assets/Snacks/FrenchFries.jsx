export default function FriesIcon({ width = 40, height = 40 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Container */}
      <path d="M25 50 L35 95 L65 95 L75 50 Z" fill="#BA6A4C" />
      <path d="M25 50 L35 95 L65 95 L75 50 Z" fill="none" stroke="#7B2525" strokeWidth="2" />
      {/* Container band */}
      <rect x="23" y="60" width="54" height="6" rx="2" fill="#7B2525" />
      {/* Fries sticking out */}
      <rect x="35" y="20" width="6" height="32" fill="#F5C99B" stroke="#D29A6B" strokeWidth="1" />
      <rect x="47" y="15" width="6" height="37" fill="#F5C99B" stroke="#D29A6B" strokeWidth="1" />
      <rect x="59" y="22" width="6" height="30" fill="#F5C99B" stroke="#D29A6B" strokeWidth="1" />
      <rect x="41" y="25" width="6" height="27" fill="#F5C99B" stroke="#D29A6B" strokeWidth="1" transform="rotate(-10 44 38)" />
    </svg>
  );
}