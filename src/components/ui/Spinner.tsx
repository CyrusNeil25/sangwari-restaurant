"use client";

import { cn } from "@/lib/utils";

/**
 * Dhokra-inspired spinner.
 * Outer: 8 elongated diamonds arranged radially (Dhokra bell-metal style).
 * Inner: 4-pointed star that counter-rotates.
 * Both spin in the terracotta / bronze palette.
 */
export function Spinner({ size = 36, className }: { size?: number; className?: string }) {
  const c = size / 2;
  const R = size * 0.38;   // diamond ring radius
  const hl = size * 0.115; // diamond half-length
  const hw = size * 0.044; // diamond half-width

  // 8 elongated diamonds arranged radially
  const outerDiamonds = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const cx = c + R * cos;
    const cy = c + R * sin;
    const tx = -sin; // tangential
    const ty = cos;
    const pts = [
      [cx + hl * cos, cy + hl * sin],
      [cx + hw * tx,  cy + hw * ty],
      [cx - hl * cos, cy - hl * sin],
      [cx - hw * tx,  cy - hw * ty],
    ];
    return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  });

  // 8 small triangular spurs between the diamonds
  const spurs = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 8 - Math.PI / 2 + Math.PI / 8; // offset 22.5°
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rOut = size * 0.48;
    const rIn  = size * 0.36;
    const hw2  = size * 0.03;
    const tx = -sin;
    const ty = cos;
    const pts = [
      [c + rOut * cos, c + rOut * sin],
      [c + rIn  * cos + hw2 * tx, c + rIn * sin + hw2 * ty],
      [c + rIn  * cos - hw2 * tx, c + rIn * sin - hw2 * ty],
    ];
    return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  });

  // Inner 4-pointed Dhokra star
  const starR = size * 0.15;
  const starW = size * 0.05;
  const starPts = Array.from({ length: 4 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 4 - Math.PI / 4;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const tx = -sin;
    const ty = cos;
    const pts = [
      [c + starR * cos, c + starR * sin],
      [c + starW * tx,  c + starW * ty],
      [c - starR * cos, c - starR * sin],
      [c - starW * tx,  c - starW * ty],
    ];
    return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0", className)}
      aria-label="Loading"
      role="img"
    >
      <style>{`
        @keyframes spin-cw  { to { transform: rotate(360deg); } }
        @keyframes spin-ccw { to { transform: rotate(-360deg); } }
        @keyframes dot-pulse { 0%,100% { opacity:.35; } 50% { opacity:1; } }

        .sg-outer { animation: spin-cw  2.4s linear infinite; transform-origin: ${c}px ${c}px; }
        .sg-inner { animation: spin-ccw 1.8s linear infinite; transform-origin: ${c}px ${c}px; }
        .sg-dot   { animation: dot-pulse 1.6s ease-in-out infinite; }
      `}</style>

      {/* Outer spinning ring — 8 diamonds + 8 triangle spurs */}
      <g className="sg-outer">
        {outerDiamonds.map((pts, i) => (
          <polygon key={i} points={pts} fill="var(--color-terracotta)" opacity={0.9} />
        ))}
        {spurs.map((pts, i) => (
          <polygon key={i} points={pts} fill="var(--color-bronze)" opacity={0.7} />
        ))}
      </g>

      {/* Inner counter-rotating 4-pointed star */}
      <g className="sg-inner">
        {starPts.map((pts, i) => (
          <polygon key={i} points={pts} fill="var(--color-terracotta)" />
        ))}
      </g>

      {/* Static centre dot */}
      <circle className="sg-dot" cx={c} cy={c} r={size * 0.07} fill="var(--color-bronze)" />
    </svg>
  );
}
