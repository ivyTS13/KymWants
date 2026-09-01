export default function CupcakeIcon({ width = 40, height = 40 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Cupcake wrapper */}
      <path d="M30 70 L35 95 L65 95 L70 70 Z" fill="#BA6A4C" />
      <path d="M30 70 L35 95 L65 95 L70 70 Z" fill="none" stroke="#7B2525" strokeWidth="2" />
      {/* Wrapper ridges */}
      <line x1="40" y1="70" x2="42" y2="95" stroke="#7B2525" strokeWidth="2" />
      <line x1="50" y1="70" x2="50" y2="95" stroke="#7B2525" strokeWidth="2" />
      <line x1="60" y1="70" x2="58" y2="95" stroke="#7B2525" strokeWidth="2" />
      {/* Cake top */}
      <ellipse cx="50" cy="70" rx="20" ry="8" fill="#F5C99B" />
      {/* Frosting */}
      <path d="M30 70 C30 55 40 50 50 50 C60 50 70 55 70 70 C65 62 55 58 50 58 C45 58 35 62 30 70Z" fill="#FFD1DC" />
      {/* Cherry */}
      <circle cx="50" cy="46" r="5" fill="#E05A5A" />
      <path d="M50 41 Q55 36 58 40" fill="none" stroke="#607456" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}