type Mood = "happy" | "wink" | "sleepy";

interface SweetPotatoMascotProps {
  size?: number;
  mood?: Mood;
  animated?: boolean;
  className?: string;
}

export default function SweetPotatoMascot({
  size = 120,
  mood = "happy",
  animated = true,
  className = "",
}: SweetPotatoMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      className={`guma-mascot ${animated ? "guma-animated" : ""} ${className}`}
      role="img"
      aria-label="고구마 캐릭터"
    >
      <g className="guma-body">
        {/* leaf sprout */}
        <g className="guma-leaf guma-leaf-left">
          <path
            d="M100 48 C92 28 70 18 54 22 C62 40 80 50 100 48 Z"
            fill="#7bc67e"
          />
        </g>
        <g className="guma-leaf guma-leaf-right">
          <path
            d="M100 48 C108 26 132 14 150 18 C144 38 124 50 100 48 Z"
            fill="#9adf9c"
          />
        </g>
        <rect x="96" y="40" width="8" height="20" rx="4" fill="#5fa463" />

        {/* body */}
        <ellipse cx="100" cy="135" rx="72" ry="78" fill="#9b6cf6" />
        <ellipse cx="78" cy="105" rx="34" ry="30" fill="#c4a6ff" opacity="0.35" />

        {/* small root bumps */}
        <ellipse cx="48" cy="178" rx="12" ry="9" fill="#8a5cf6" />
        <ellipse cx="152" cy="178" rx="12" ry="9" fill="#8a5cf6" />

        {/* cheeks */}
        <ellipse className="guma-cheek" cx="62" cy="150" rx="11" ry="7" fill="#ffb8c6" opacity="0.8" />
        <ellipse className="guma-cheek" cx="138" cy="150" rx="11" ry="7" fill="#ffb8c6" opacity="0.8" />

        {/* face */}
        {mood === "wink" ? (
          <>
            <circle className="guma-eye" cx="76" cy="128" r="6" fill="#3b2350" />
            <path
              d="M114 122 Q124 116 134 122"
              stroke="#3b2350"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : mood === "sleepy" ? (
          <>
            <path
              d="M66 128 Q76 134 86 128"
              stroke="#3b2350"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M114 128 Q124 134 134 128"
              stroke="#3b2350"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            <circle className="guma-eye" cx="76" cy="128" r="6" fill="#3b2350" />
            <circle className="guma-eye" cx="124" cy="128" r="6" fill="#3b2350" />
          </>
        )}

        {/* mouth */}
        <path
          d="M88 152 Q100 164 112 152"
          stroke="#3b2350"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
