"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const PatternNetworkIllustration: React.FC = () => {
  const [scanStep, setScanStep] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [activeHoverNode, setActiveHoverNode] = useState<string | null>(null);

  // Scan trajectory points across the isometric platform
  const scanWaypoints = [
    { x: 190, y: 170, label: "Scanning Arrays...", isTarget: false },
    { x: 280, y: 120, label: "Scanning Binary Search...", isTarget: false },
    { x: 230, y: 245, label: "Scanning Recursion...", isTarget: false },
    { x: 365, y: 230, label: "Scanning Dynamic Programming...", isTarget: false },
    { x: 410, y: 140, label: "Blind Spot Detected!", isTarget: true },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setScanStep((prev) => {
        const next = (prev + 1) % scanWaypoints.length;
        if (next === 4) {
          setIsRevealed(true);
        } else {
          setIsRevealed(false);
        }
        return next;
      });
    }, 2400);

    return () => clearInterval(timer);
  }, [scanWaypoints.length]);

  const currentWaypoint = scanWaypoints[scanStep];

  return (
    <div className="w-full relative rounded-2xl border border-white/10 bg-[#0A0A0A] p-5 sm:p-7 overflow-hidden shadow-2xl select-none group">
      
      {/* Top Editorial Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#E4007C] animate-pulse" />
          <span className="text-white/80 font-bold uppercase tracking-wider text-[11px]">
            Invariant Scanner
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase font-mono tracking-wider">
            STATUS:
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentWaypoint.label}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                currentWaypoint.isTarget || isRevealed
                  ? "text-[#E4007C] bg-[#E4007C]/15 border-[#E4007C]/30 shadow-[0_0_12px_rgba(228,0,124,0.2)]"
                  : "text-white/70 bg-white/5 border-white/10"
              }`}
            >
              {currentWaypoint.label}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* SVG Isometric Canvas */}
      <div className="relative w-full aspect-[600/400] flex items-center justify-center">
        <svg
          viewBox="0 0 600 400"
          className="w-full h-full block"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft ambient ground shadow */}
            <filter id="platform-shadow" x="0" y="0" width="600" height="400" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="28" stdDeviation="32" floodColor="#000000" floodOpacity="0.7" />
            </filter>

            {/* Neon pink lens glow */}
            <filter id="pink-lens-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.894  0 0 0 0 0  0 0 0 0 0.486  0 0 0 0.85 0"
              />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Magnifying Glass Refractive Sheen */}
            <linearGradient id="lens-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
              <stop offset="45%" stopColor="#E4007C" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
            </linearGradient>

            <linearGradient id="glass-rim-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3A3A3A" />
              <stop offset="100%" stopColor="#1A1A1A" />
            </linearGradient>

            <linearGradient id="pink-revealed-face" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF0F7" />
              <stop offset="100%" stopColor="#FFD1E7" />
            </linearGradient>
          </defs>

          {/* ================= GEOMETRIC GRID PLATFORM ================= */}
          <g filter="url(#platform-shadow)">
            {/* Left 3D Extruded Wall */}
            <path
              d="M 90 195 L 300 318 L 300 338 L 90 215 Z"
              fill="#D4CEC2"
              stroke="#262626"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Right 3D Extruded Wall */}
            <path
              d="M 300 318 L 510 195 L 510 215 L 300 338 Z"
              fill="#BFB8AB"
              stroke="#262626"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Main Platform Surface (Warm Cream / Elegant Editorial Beige) */}
            <polygon
              points="300,72 510,195 300,318 90,195"
              fill="#F5F2EB"
              stroke="#262626"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Subtle Geometric Grid Matrix */}
            <g stroke="#E3DDD1" strokeWidth="1" strokeDasharray="3 3">
              <line x1="142" y1="165" x2="352" y2="288" />
              <line x1="195" y1="134" x2="405" y2="257" />
              <line x1="247" y1="103" x2="457" y2="226" />
              <line x1="457" y1="165" x2="247" y2="288" />
              <line x1="405" y1="134" x2="195" y2="257" />
              <line x1="352" y1="103" x2="142" y2="226" />
            </g>
          </g>

          {/* ================= CONNECTING TRACE PATHWAYS ================= */}
          <g stroke="#8E8B82" strokeWidth="1.2" strokeDasharray="4 3" strokeLinecap="round">
            <line x1="190" y1="185" x2="280" y2="132" />
            <line x1="190" y1="185" x2="230" y2="252" />
            <line x1="230" y1="252" x2="365" y2="238" />
            <line x1="365" y1="238" x2="410" y2="148" />
            <line x1="280" y1="132" x2="410" y2="148" stroke={isRevealed ? "#E4007C" : "#8E8B82"} strokeWidth={isRevealed ? 2 : 1.2} />
          </g>

          {/* ================= FLOATING AMBIENT PARTICLES ================= */}
          <g>
            <circle cx="210" cy="150" r="1.5" fill="#E4007C" opacity="0.6">
              <animate attributeName="cy" values="150;142;150" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="340" cy="180" r="2" fill="#E4007C" opacity="0.7">
              <animate attributeName="cy" values="180;170;180" dur="3.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;1;0.4" dur="3.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="440" cy="200" r="1.8" fill="#E4007C" opacity="0.5">
              <animate attributeName="cy" values="200;192;200" dur="2.8s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* ================= ISOMETRIC CONCEPT BLOCKS ================= */}

          {/* 1. ARRAYS (cx: 190, cy: 185) */}
          <g
            className="cursor-pointer transition-transform hover:-translate-y-1"
            onMouseEnter={() => setActiveHoverNode("arrays")}
            onMouseLeave={() => setActiveHoverNode(null)}
          >
            <polygon points="190,197 208,187 190,177 172,187" fill="#00000018" />
            <polygon points="172,187 190,197 190,183 172,173" fill="#DCD6CA" stroke="#2A2A2A" strokeWidth="1.2" />
            <polygon points="190,197 208,187 208,173 190,183" fill="#C9C2B4" stroke="#2A2A2A" strokeWidth="1.2" />
            <polygon points="190,169 208,179 190,189 172,179" fill="#FAF8F5" stroke="#2A2A2A" strokeWidth="1.2" />
            <text x="190" y="158" textAnchor="middle" fill="#2A2A2A" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
              Arrays
            </text>
          </g>

          {/* 2. BINARY SEARCH (cx: 280, cy: 132) */}
          <g
            className="cursor-pointer transition-transform hover:-translate-y-1"
            onMouseEnter={() => setActiveHoverNode("binary-search")}
            onMouseLeave={() => setActiveHoverNode(null)}
          >
            <polygon points="280,144 300,133 280,122 260,133" fill="#00000018" />
            <polygon points="260,133 280,144 280,127 260,116" fill="#DCD6CA" stroke="#2A2A2A" strokeWidth="1.2" />
            <polygon points="280,144 300,133 300,116 280,127" fill="#C9C2B4" stroke="#2A2A2A" strokeWidth="1.2" />
            <polygon points="280,110 300,121 280,131 260,121" fill="#FAF8F5" stroke="#2A2A2A" strokeWidth="1.2" />
            <text x="280" y="99" textAnchor="middle" fill="#2A2A2A" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
              Binary Search
            </text>
          </g>

          {/* 3. RECURSION (cx: 230, cy: 252) */}
          <g
            className="cursor-pointer transition-transform hover:-translate-y-1"
            onMouseEnter={() => setActiveHoverNode("recursion")}
            onMouseLeave={() => setActiveHoverNode(null)}
          >
            <polygon points="230,264 248,254 230,244 212,254" fill="#00000018" />
            <polygon points="212,254 230,264 230,250 212,240" fill="#DCD6CA" stroke="#2A2A2A" strokeWidth="1.2" />
            <polygon points="230,264 248,254 248,240 230,250" fill="#C9C2B4" stroke="#2A2A2A" strokeWidth="1.2" />
            <polygon points="230,235 248,245 230,255 212,245" fill="#FAF8F5" stroke="#2A2A2A" strokeWidth="1.2" />
            <text x="230" y="280" textAnchor="middle" fill="#2A2A2A" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
              Recursion
            </text>
          </g>

          {/* 4. DYNAMIC PROGRAMMING (cx: 365, cy: 238) */}
          <g
            className="cursor-pointer transition-transform hover:-translate-y-1"
            onMouseEnter={() => setActiveHoverNode("dp")}
            onMouseLeave={() => setActiveHoverNode(null)}
          >
            <polygon points="365,250 385,239 365,228 345,239" fill="#00000018" />
            <polygon points="345,239 365,250 365,234 345,223" fill="#DCD6CA" stroke="#2A2A2A" strokeWidth="1.2" />
            <polygon points="365,250 385,239 385,223 365,234" fill="#C9C2B4" stroke="#2A2A2A" strokeWidth="1.2" />
            <polygon points="365,217 385,228 365,238 345,228" fill="#FAF8F5" stroke="#2A2A2A" strokeWidth="1.2" />
            <text x="365" y="266" textAnchor="middle" fill="#2A2A2A" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
              Dynamic Programming
            </text>
          </g>

          {/* 5. HIDDEN CODING BLIND SPOT BLOCK (cx: 410, cy: 148) */}
          <g
            className="cursor-pointer transition-all"
            onMouseEnter={() => setActiveHoverNode("boundary")}
            onMouseLeave={() => setActiveHoverNode(null)}
          >
            {/* Pulsing Aura if Revealed */}
            {isRevealed && (
              <ellipse
                cx="410"
                cy="158"
                rx="36"
                ry="20"
                fill="#E4007C"
                opacity="0.35"
                filter="url(#pink-lens-glow)"
              >
                <animate attributeName="opacity" values="0.2;0.45;0.2" dur="2s" repeatCount="indefinite" />
              </ellipse>
            )}

            {/* Block Shadow */}
            <polygon points="410,160 432,148 410,136 388,148" fill="#00000028" />

            {/* Left 3D Face */}
            <polygon
              points="388,148 410,160 410,139 388,127"
              fill={isRevealed ? "#E4007C" : "#DCD6CA"}
              stroke={isRevealed ? "#E4007C" : "#2A2A2A"}
              strokeWidth="1.2"
              className="transition-colors duration-500"
            />

            {/* Right 3D Face */}
            <polygon
              points="410,160 432,148 432,127 410,139"
              fill={isRevealed ? "#B80065" : "#C9C2B4"}
              stroke={isRevealed ? "#B80065" : "#2A2A2A"}
              strokeWidth="1.2"
              className="transition-colors duration-500"
            />

            {/* Top 3D Face */}
            <polygon
              points="410,117 432,129 410,140 388,129"
              fill={isRevealed ? "url(#pink-revealed-face)" : "#FAF8F5"}
              stroke={isRevealed ? "#E4007C" : "#2A2A2A"}
              strokeWidth={isRevealed ? 1.6 : 1.2}
              className="transition-all duration-500"
            />

            {/* Revealed Core Glyph on Top Face */}
            {isRevealed && (
              <polygon points="410,123 421,129 410,135 399,129" fill="#E4007C">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
              </polygon>
            )}

            {/* Blind Spot Monospace Label / Callout */}
            <g className="transition-opacity duration-300">
              <rect
                x="330"
                y="88"
                width="160"
                height="22"
                rx="4"
                fill="#0A0A0A"
                stroke={isRevealed ? "#E4007C" : "#444444"}
                strokeWidth={isRevealed ? 1.2 : 1}
                opacity="0.95"
              />
              <text
                x="410"
                y="103"
                textAnchor="middle"
                fill={isRevealed ? "#E4007C" : "#888888"}
                fontSize="9.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {isRevealed ? "✦ Blind Spot: Boundary Loss" : "Hidden Invariant Node"}
              </text>
            </g>
          </g>

          {/* ================= SCANNING MAGNIFYING GLASS (ANIMATED) ================= */}
          <motion.g
            animate={{
              x: currentWaypoint.x - 300,
              y: currentWaypoint.y - 200,
            }}
            transition={{
              type: "spring",
              stiffness: 45,
              damping: 18,
              mass: 0.9,
            }}
            className="pointer-events-none z-30"
          >
            {/* Projected Shadow under Magnifying Glass */}
            <ellipse cx="300" cy="225" rx="26" ry="14" fill="#000000" opacity="0.28" />

            {/* Magnifying Glass Outer Ring Rim */}
            <circle
              cx="300"
              cy="195"
              r="28"
              fill="none"
              stroke="url(#glass-rim-grad)"
              strokeWidth="4"
              filter="drop-shadow(0 6px 12px rgba(0,0,0,0.5))"
            />
            {/* Inner Accent Ring (Glows Pink when over Target) */}
            <circle
              cx="300"
              cy="195"
              r="26"
              fill="url(#lens-sheen)"
              stroke={isRevealed ? "#E4007C" : "#71717A"}
              strokeWidth={isRevealed ? 2 : 1}
              filter={isRevealed ? "url(#pink-lens-glow)" : "none"}
              className="transition-colors duration-300"
            />

            {/* Crosshair Scanner inside Lens */}
            <line x1="288" y1="195" x2="312" y2="195" stroke={isRevealed ? "#E4007C" : "#A1A1AA"} strokeWidth="1" strokeDasharray="2 2" />
            <line x1="300" y1="183" x2="300" y2="207" stroke={isRevealed ? "#E4007C" : "#A1A1AA"} strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="300" cy="195" r="3" fill={isRevealed ? "#E4007C" : "#FFFFFF"} />

            {/* 3D Isometric Handle */}
            <path
              d="M 320 215 L 348 245"
              stroke="#1F1F1F"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 321 216 L 347 244"
              stroke="#E4007C"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={isRevealed ? 0.9 : 0.2}
              className="transition-opacity duration-300"
            />
          </motion.g>
        </svg>
      </div>
    </div>
  );
};

export default PatternNetworkIllustration;
