import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`} style={style}>
      <svg
        viewBox="0 0 46 46"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="BlindSpot Logo"
      >
        <defs>
          {/* Glass body */}
          <linearGradient
            id="bsGlass"
            x1="8"
            y1="5"
            x2="38"
            y2="42"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="0.22" stopColor="#E4007C" stopOpacity="0.14" />
            <stop offset="0.65" stopColor="#E4007C" stopOpacity="0.04" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.45" />
          </linearGradient>

          {/* Premium pink edge */}
          <linearGradient
            id="bsEdge"
            x1="5"
            y1="5"
            x2="39"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="0.25" stopColor="#FF4BA8" />
            <stop offset="0.65" stopColor="#E4007C" />
            <stop offset="1" stopColor="#8A004D" />
          </linearGradient>

          {/* Inner light */}
          <linearGradient
            id="bsReflection"
            x1="10"
            y1="8"
            x2="28"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Glow */}
          <filter
            id="bsGlow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shadow */}
          <filter
            id="bsShadow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="#E4007C"
              floodOpacity="0.35"
            />
          </filter>
        </defs>

        {/* Ambient glow behind the lens */}
        <circle
          cx="19"
          cy="19"
          r="15"
          fill="#E4007C"
          opacity="0.08"
          filter="url(#bsGlow)"
        />

        {/* Outer glass ring */}
        <circle
          cx="19"
          cy="19"
          r="14"
          fill="url(#bsGlass)"
          stroke="url(#bsEdge)"
          strokeWidth="1.8"
          filter="url(#bsShadow)"
        />

        {/* Inner glass ring */}
        <circle
          cx="19"
          cy="19"
          r="10.5"
          stroke="#FFFFFF"
          strokeOpacity="0.12"
          strokeWidth="0.8"
        />

        {/* Glass reflection */}
        <path
          d="M10.5 15.5C12.2 10.8 15.2 8.2 19.7 7.7"
          stroke="url(#bsReflection)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* THE BLIND SPOT */}
        <circle
          cx="23"
          cy="15"
          r="2.7"
          fill="#FFFFFF"
          fillOpacity="0.92"
        />

        <circle
          cx="23"
          cy="15"
          r="4.5"
          stroke="#FFFFFF"
          strokeOpacity="0.12"
          strokeWidth="0.7"
        />

        {/* Lens depth accent */}
        <path
          d="M11.5 24.5C14.2 27.2 18.1 28.5 22 27.7"
          stroke="#E4007C"
          strokeOpacity="0.35"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Handle — integrated into the mark */}
        <path
          d="M29.5 29.5L38 38"
          stroke="url(#bsEdge)"
          strokeWidth="4.2"
          strokeLinecap="round"
          filter="url(#bsShadow)"
        />

        {/* Handle glass highlight */}
        <path
          d="M30.7 30.7L36.7 36.7"
          stroke="#FFFFFF"
          strokeOpacity="0.28"
          strokeWidth="0.9"
          strokeLinecap="round"
        />

        {/* Tiny endpoint */}
        <circle
          cx="38"
          cy="38"
          r="1"
          fill="#FFFFFF"
          fillOpacity="0.35"
        />
      </svg>
    </div>
  );
};
