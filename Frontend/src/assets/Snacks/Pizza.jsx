export default function PizzaIcon({ width = 40, height = 40 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Crust */}
      <path d="M25 85 L75 85 L50 20 Z" fill="#F5C99B" />
      <path d="M25 85 L75 85 L50 20 Z" fill="none" stroke="#D29A6B" strokeWidth="3" strokeLinejoin="round" />
      {/* Pepperoni */}
      <circle cx="50" cy="65" r="7" fill="#E05A5A" />
      <circle cx="42" cy="75" r="6" fill="#E05A5A" />
      <circle cx="58" cy="75" r="6" fill="#E05A5A" />
      {/* Green pepper bits */}
      <rect x="48" y="50" width="4" height="4" fill="#607456" transform="rotate(45 50 52)" />
      <rect x="55" y="55" width="4" height="4" fill="#607456" transform="rotate(20 57 57)" />
      <rect x="40" y="60" width="4" height="4" fill="#607456" transform="rotate(-30 42 62)" />
    </svg>
  );
}