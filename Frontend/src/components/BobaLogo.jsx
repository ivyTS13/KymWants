import React from "react";

export default function CuteGirlAvatar({ width = 120, height = 120 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cute girl with glasses avatar"
    >
      {/* Hair behind */}
      <path
        d="M34 40C34 24 45 14 60 14C76 14 86 24 86 40V58C86 69 79 79 70 83H50C41 79 34 69 34 58V40Z"
        fill="#4B2E2A"
      />
      <path
        d="M26 52C18 57 15 68 18 79C21 90 31 94 37 89C42 85 42 75 39 68C36 61 33 55 26 52Z"
        fill="#4B2E2A"
      />
      <path
        d="M94 52C102 57 105 68 102 79C99 90 89 94 83 89C78 85 78 75 81 68C84 61 87 55 94 52Z"
        fill="#4B2E2A"
      />

      {/* Face */}
      <ellipse cx="60" cy="50" rx="20" ry="24" fill="#FFDDBB" />

      {/* Bangs */}
      <path
        d="M41 36C45 24 53 19 60 19C68 19 76 24 79 36C74 33 69 31 60 31C52 31 46 33 41 36Z"
        fill="#4B2E2A"
      />
      <path
        d="M42 37C46 40 49 45 50 50C46 48 42 45 40 40C40 39 41 38 42 37Z"
        fill="#4B2E2A"
      />
      <path
        d="M78 37C77 38 78 39 78 40C76 45 72 48 68 50C69 45 72 40 76 37C77 37 77 37 78 37Z"
        fill="#4B2E2A"
      />

      {/* Glasses */}
      <circle
        cx="51"
        cy="52"
        r="8"
        fill="none"
        stroke="#2C1B18"
        strokeWidth="2.5"
      />
      <circle
        cx="69"
        cy="52"
        r="8"
        fill="none"
        stroke="#2C1B18"
        strokeWidth="2.5"
      />
      <path
        d="M59 52H61"
        stroke="#2C1B18"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M43 49C39 48 37 48 35 50"
        stroke="#2C1B18"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M77 49C81 48 83 48 85 50"
        stroke="#2C1B18"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Eyes */}
      <circle cx="51" cy="53" r="2.2" fill="#2C1B18" />
      <circle cx="69" cy="53" r="2.2" fill="#2C1B18" />
      <circle cx="50.2" cy="52.2" r="0.7" fill="#FFFFFF" />
      <circle cx="68.2" cy="52.2" r="0.7" fill="#FFFFFF" />

      {/* Blush */}
      <ellipse
        cx="42.5"
        cy="60"
        rx="4"
        ry="2.5"
        fill="#FF9E9E"
        opacity="0.55"
      />
      <ellipse
        cx="77.5"
        cy="60"
        rx="4"
        ry="2.5"
        fill="#FF9E9E"
        opacity="0.55"
      />

      {/* Smile */}
      <path
        d="M52 64C55 68 65 68 68 64"
        fill="none"
        stroke="#2C1B18"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Neck */}
      <path d="M55 73H65V80H55Z" fill="#FFD2B0" />

      {/* Shirt / apron */}
      <path
        d="M34 98C36 86 45 78 55 78H65C75 78 84 86 86 98V110H34V98Z"
        fill="#F5E7D7"
      />
      <path
        d="M46 79L60 98L74 79"
        fill="none"
        stroke="#E8B08E"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M43 83C39 87 36 92 35 98"
        fill="none"
        stroke="#D9C0AE"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M77 83C81 87 84 92 85 98"
        fill="none"
        stroke="#D9C0AE"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Tiny food-site friendly accent: spoon */}
      <path
        d="M89 84C92 82 95 82 97 84C98 86 98 89 96 90C94 92 91 92 89 90C87 88 87 85 89 84Z"
        fill="#D8D8D8"
      />
      <path
        d="M88 90L80 101"
        stroke="#D8D8D8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
