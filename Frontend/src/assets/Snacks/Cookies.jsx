export default function CookieIcon({ width = 40, height = 40 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Cookie base */}
      <circle cx="50" cy="50" r="35" fill="#F5C99B" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="#D29A6B" strokeWidth="2" />
      {/* Chocolate chips */}
      <circle cx="40" cy="40" r="5" fill="#7B2525" />
      <circle cx="60" cy="35" r="5" fill="#7B2525" />
      <circle cx="65" cy="55" r="5" fill="#7B2525" />
      <circle cx="35" cy="60" r="5" fill="#7B2525" />
      <circle cx="50" cy="65" r="5" fill="#7B2525" />
      <circle cx="45" cy="45" r="4" fill="#7B2525" />
      <circle cx="55" cy="50" r="4" fill="#7B2525" />
    </svg>
  );
}