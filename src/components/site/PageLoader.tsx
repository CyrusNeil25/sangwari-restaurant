"use client";

import { AnimatePresence, motion } from "framer-motion";

/**
 * Full-screen Godna / Dhokra-inspired page loader.
 *
 * Layers (outer → inner):
 *  1. 16 Godna dots — staggered fade-in wave, then slow orbit
 *  2. 8 elongated Dhokra diamonds — draw themselves via stroke-dashoffset
 *  3. 8 small triangular spurs — fade in after diamonds
 *  4. Inner geometric ring — strokes itself around
 *  5. Centre terracotta circle with Devanagari स mark
 */

const C = 88;          // SVG centre (176×176 viewBox)
const V = 176;

/* ── Geometry helpers ─────────────────────────────────── */
function polar(r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
}

function diamond(r: number, angleDeg: number, hl: number, hw: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const tx = -sin; const ty = cos;
  const cx = C + r * cos; const cy = C + r * sin;
  return [
    [cx + hl * cos, cy + hl * sin],
    [cx + hw * tx,  cy + hw * ty],
    [cx - hl * cos, cy - hl * sin],
    [cx - hw * tx,  cy - hw * ty],
  ].map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

function triangle(rOut: number, rIn: number, angleDeg: number, hw: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  const cos = Math.cos(rad); const sin = Math.sin(rad);
  const tx = -sin; const ty = cos;
  return [
    [C + rOut * cos, C + rOut * sin],
    [C + rIn  * cos + hw * tx, C + rIn * sin + hw * ty],
    [C + rIn  * cos - hw * tx, C + rIn * sin - hw * ty],
  ].map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

/* ── Pre-computed geometry ────────────────────────────── */
const DOT_R   = 78; const N_DOTS = 16;
const DIAM_R  = 62; const N_DIAM = 8;
const SPUR_R  = 51; const INNER_R = 36;

const dots = Array.from({ length: N_DOTS }, (_, i) => polar(DOT_R, i * (360 / N_DOTS)));
const diamonds8 = Array.from({ length: N_DIAM }, (_, i) =>
  diamond(DIAM_R, i * (360 / N_DIAM), 12, 4.5));
const spurs = Array.from({ length: N_DIAM }, (_, i) =>
  triangle(SPUR_R, 42, i * (360 / N_DIAM) + 22.5, 3.5));
const innerDiamonds = Array.from({ length: N_DIAM }, (_, i) =>
  diamond(INNER_R, i * (360 / N_DIAM) + 22.5, 7, 2.8));

// Approx circumference of stroke ring at r=28
const RING_CIRC = 2 * Math.PI * 28;

export function PageLoader({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[99] flex flex-col items-center justify-center bg-cream"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
          aria-label="Loading"
          role="progressbar"
        >
          <style>{`
            /* ── Outer dot ring: staggered wave fade, then orbit ── */
            @keyframes dot-wave {
              0%,100% { opacity: 0.25; r: 2.5px; }
              50%      { opacity: 1;    r: 3.8px; }
            }
            @keyframes orbit-cw  { to { transform: rotate(360deg);  } }
            @keyframes orbit-ccw { to { transform: rotate(-360deg); } }

            /* ── Diamond draw-in ── */
            @keyframes draw-diamond {
              from { stroke-dashoffset: 60; opacity: 0; }
              to   { stroke-dashoffset: 0;  opacity: 1; }
            }

            /* ── Inner ring stroke draw ── */
            @keyframes draw-ring {
              from { stroke-dashoffset: ${RING_CIRC.toFixed(1)}; }
              to   { stroke-dashoffset: 0; }
            }

            /* ── Spur fade ── */
            @keyframes spur-in {
              from { opacity: 0; transform: scale(0.6); }
              to   { opacity: 0.8; transform: scale(1); }
            }

            /* ── Gentle breathe ── */
            @keyframes breathe {
              0%,100% { transform: scale(1); }
              50%      { transform: scale(1.035); }
            }

            /* ── Logo pulse ── */
            @keyframes logo-in {
              from { opacity: 0; transform: scale(0.7); }
              to   { opacity: 1; transform: scale(1); }
            }

            /* ── Text slide up ── */
            @keyframes text-up {
              from { opacity: 0; transform: translateY(10px); }
              to   { opacity: 1; transform: translateY(0); }
            }

            .gl-orbit      { animation: orbit-cw  12s linear infinite; transform-origin: ${C}px ${C}px; }
            .gl-orbit-inner{ animation: orbit-ccw  8s linear infinite; transform-origin: ${C}px ${C}px; }
            .gl-breathe    { animation: breathe 3s ease-in-out 1.8s infinite; transform-origin: ${C}px ${C}px; }

            .gl-dot { animation: dot-wave 2s ease-in-out infinite; }
            .gl-diamond {
              stroke-dasharray: 60;
              animation: draw-diamond 0.6s ease-out forwards;
              opacity: 0;
            }
            .gl-spur {
              animation: spur-in 0.4s ease-out forwards;
              opacity: 0;
              transform-origin: ${C}px ${C}px;
            }
            .gl-ring {
              stroke-dasharray: ${RING_CIRC.toFixed(1)};
              animation: draw-ring 1.1s cubic-bezier(.4,0,.2,1) 0.4s forwards;
            }
            .gl-logo { animation: logo-in 0.5s ease-out 0.2s both; }
            .gl-text { animation: text-up 0.6s ease-out 1.5s both; }
            .gl-sub  { animation: text-up 0.6s ease-out 1.75s both; }
          `}</style>

          {/* ── Mandala SVG ──────────────────────────────────── */}
          <svg width={V} height={V} viewBox={`0 0 ${V} ${V}`}>

            {/* Layer 1 — Outer orbit of 16 Godna dots */}
            <g className="gl-orbit">
              {dots.map(({ x, y }, i) => (
                <circle
                  key={i}
                  className="gl-dot"
                  cx={x.toFixed(2)} cy={y.toFixed(2)}
                  r="2.8"
                  fill="var(--color-bronze)"
                  style={{ animationDelay: `${(i / N_DOTS) * 2}s` }}
                />
              ))}
            </g>

            {/* Decorative small tick marks between dots */}
            <g className="gl-orbit" style={{ opacity: 0.4 }}>
              {Array.from({ length: N_DOTS }, (_, i) => {
                const a = i * (360 / N_DOTS) + 11.25;
                const p1 = polar(75, a); const p2 = polar(72, a);
                return <line key={i} x1={p1.x.toFixed(1)} y1={p1.y.toFixed(1)}
                  x2={p2.x.toFixed(1)} y2={p2.y.toFixed(1)}
                  stroke="var(--color-bronze)" strokeWidth="1.2" />;
              })}
            </g>

            {/* Layer 2 — 8 Dhokra diamonds that draw in */}
            <g className="gl-breathe">
              {diamonds8.map((pts, i) => (
                <polygon
                  key={i}
                  className="gl-diamond"
                  points={pts}
                  fill="var(--color-terracotta)"
                  stroke="var(--color-terracotta)"
                  strokeWidth="0.5"
                  style={{ animationDelay: `${0.3 + i * 0.07}s` }}
                />
              ))}

              {/* Layer 3 — 8 triangle spurs between diamonds */}
              {spurs.map((pts, i) => (
                <polygon
                  key={i}
                  className="gl-spur"
                  points={pts}
                  fill="var(--color-bronze)"
                  style={{ animationDelay: `${0.85 + i * 0.04}s` }}
                />
              ))}

              {/* Layer 4 — Inner small diamonds (counter-orbit + breathe) */}
              <g className="gl-orbit-inner">
                {innerDiamonds.map((pts, i) => (
                  <polygon
                    key={i}
                    className="gl-spur"
                    points={pts}
                    fill="var(--color-terracotta)"
                    opacity={0.75}
                    style={{ animationDelay: `${1.1 + i * 0.03}s` }}
                  />
                ))}
              </g>

              {/* Layer 5 — Circular stroke ring that draws itself */}
              <circle
                className="gl-ring"
                cx={C} cy={C} r="28"
                fill="none"
                stroke="var(--color-terracotta)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={0.45}
              />
              {/* Segmented inner decoration */}
              {Array.from({ length: 12 }, (_, i) => {
                const a1 = i * 30 - 90; const a2 = a1 + 18;
                const p1 = polar(28, a1); const p2 = polar(28, a2);
                return (
                  <path
                    key={i}
                    className="gl-spur"
                    d={`M${p1.x.toFixed(2)},${p1.y.toFixed(2)} A28,28 0 0,1 ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`}
                    fill="none"
                    stroke="var(--color-bronze)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ animationDelay: `${1.2 + i * 0.04}s` }}
                  />
                );
              })}
            </g>

          </svg>

          {/* ── Centre logo — rendered as DOM over the SVG ─── */}
          <div
            className="gl-logo pointer-events-none absolute"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -58%)" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta shadow-pop">
              <span className="font-display text-2xl leading-none text-white">स</span>
            </div>
          </div>

          {/* ── Text ───────────────────────────────────────── */}
          <div className="mt-6 flex flex-col items-center gap-1">
            <p className="gl-text font-display text-2xl font-semibold text-ink">
              Sangwari
            </p>
            <p className="gl-sub text-sm text-muted">Jay Johar! 🙏</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
