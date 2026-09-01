export default function CoffeeIcon({ width = 40, height = 40 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Cup body */}
      <path d="M25 40 L35 85 L65 85 L75 40 Z" fill="#FFF8F0" stroke="#7B2525" strokeWidth="3" />
      {/* Handle */}
      <path d="M75 50 Q90 50 90 65 Q90 80 75 80" fill="none" stroke="#7B2525" strokeWidth="4" />
      {/* Coffee surface */}
      <ellipse cx="50" cy="40" rx="25" ry="8" fill="#A67C52" />
      {/* Steam */}
      <path d="M40 30 Q35 20 40 10" fill="none" stroke="#D29A6B" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 30 Q45 15 50 5" fill="none" stroke="#D29A6B" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 30 Q55 20 60 10" fill="none" stroke="#D29A6B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}