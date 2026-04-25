"use client";
import { useEffect, useRef, useState } from "react";

// ── Service icon SVGs ─────────────────────────────────────────────────────────
function EC2Icon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="rgba(255,153,0,0.15)" stroke="#FF9900" strokeWidth="1.5"/>
      <polygon points="14,6 22,10 22,18 14,22 6,18 6,10" fill="rgba(255,153,0,0.08)" stroke="#FF9900" strokeWidth="1"/>
      <line x1="14" y1="2" x2="14" y2="6" stroke="#FF9900" strokeWidth="1.5"/>
      <line x1="26" y1="8" x2="22" y2="10" stroke="#FF9900" strokeWidth="1.5"/>
      <line x1="26" y1="20" x2="22" y2="18" stroke="#FF9900" strokeWidth="1.5"/>
    </svg>
  );
}

function S3Icon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <ellipse cx="14" cy="9" rx="10" ry="4" fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="1.5"/>
      <path d="M4 9 L4 20 Q4 24 14 24 Q24 24 24 20 L24 9" fill="rgba(34,197,94,0.08)" stroke="#22C55E" strokeWidth="1.5"/>
      <ellipse cx="14" cy="9" rx="10" ry="4" fill="rgba(34,197,94,0.2)" stroke="#22C55E" strokeWidth="1.5"/>
    </svg>
  );
}

function LambdaIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="rgba(192,132,252,0.15)" stroke="#C084FC" strokeWidth="1.5"/>
      <text x="14" y="19" textAnchor="middle" fill="#C084FC" fontSize="14" fontWeight="bold" fontFamily="Arial">λ</text>
    </svg>
  );
}

function ECSIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="rgba(96,165,250,0.15)" stroke="#60A5FA" strokeWidth="1.5"/>
      {[0,1,2].map(r => [0,1,2].map(c => (
        <rect key={`${r}${c}`} x={7+c*5} y={9+r*5} width="4" height="4" rx="0.5"
          fill={r===1&&c===1?"rgba(96,165,250,0.6)":"rgba(96,165,250,0.25)"}
          stroke="#60A5FA" strokeWidth="0.5"/>
      )))}
    </svg>
  );
}

// ── Floating icon with glow ───────────────────────────────────────────────────
function FloatingIcon({ icon, label, color, style, delay }: {
  icon: React.ReactNode; label: string; color: string;
  style: React.CSSProperties; delay: number;
}) {
  return (
    <div className="absolute flex flex-col items-center gap-1.5 pointer-events-none"
      style={{ ...style, animation: `floatIcon 3s ease-in-out ${delay}s infinite` }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: `rgba(${color},0.12)`,
          border: `1px solid rgba(${color},0.4)`,
          boxShadow: `0 0 16px rgba(${color},0.25), 0 0 32px rgba(${color},0.1)`,
        }}>
        {icon}
      </div>
      <span className="text-[10px] font-semibold tracking-wider"
        style={{ color: `rgba(${color},0.9)` }}>{label}</span>
    </div>
  );
}

// ── Main orb scene ────────────────────────────────────────────────────────────
export default function OrbScene() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setMouse({
        x: (e.clientX - cx) / rect.width,
        y: (e.clientY - cy) / rect.height,
      });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const px = mouse.x * 12;
  const py = mouse.y * 8;

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center select-none">

      {/* Parallax wrapper */}
      <div className="relative" style={{
        transform: `translate(${px}px, ${py}px)`,
        transition: "transform 0.15s ease-out",
        width: 420, height: 420,
      }}>

        {/* ── Orbit ellipses (SVG) ── */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 420 420" style={{ overflow: "visible" }}>
          <defs>
            {/* Orbit 1 — orange, tilted */}
            <ellipse id="orbit1" cx="210" cy="210" rx="185" ry="75" />
            {/* Glow filters */}
            <filter id="glow-orange">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-blue">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-purple">
              <feGaussianBlur stdDeviation="1.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Orbit 1 — orange, tilted ~20deg */}
          <ellipse cx="210" cy="210" rx="185" ry="72"
            fill="none" stroke="#FF9900" strokeWidth="1.2" opacity="0.65"
            transform="rotate(-20 210 210)" filter="url(#glow-orange)" />

          {/* Orbit 2 — blue, tilted ~50deg */}
          <ellipse cx="210" cy="210" rx="175" ry="65"
            fill="none" stroke="#3B82F6" strokeWidth="1.0" opacity="0.5"
            transform="rotate(50 210 210)" filter="url(#glow-blue)" />

          {/* Orbit 3 — purple, tilted ~-40deg */}
          <ellipse cx="210" cy="210" rx="165" ry="60"
            fill="none" stroke="#A78BFA" strokeWidth="0.8" opacity="0.4"
            transform="rotate(-40 210 210)" filter="url(#glow-purple)" />

          {/* Saturn-style horizontal ring */}
          <ellipse cx="210" cy="210" rx="155" ry="28"
            fill="none" stroke="#FF9900" strokeWidth="2.5" opacity="0.85"
            filter="url(#glow-orange)" />
          {/* Ring glow */}
          <ellipse cx="210" cy="210" rx="155" ry="28"
            fill="none" stroke="#FF6600" strokeWidth="6" opacity="0.15" />

          {/* Animated dots on orbit 1 */}
          <circle r="5" fill="#FF9900" filter="url(#glow-orange)" opacity="0.95">
            <animateMotion dur="8s" repeatCount="indefinite">
              <mpath href="#orbit1-path"/>
            </animateMotion>
          </circle>
          <circle r="3.5" fill="white" opacity="0.8">
            <animateMotion dur="8s" begin="-4s" repeatCount="indefinite">
              <mpath href="#orbit1-path"/>
            </animateMotion>
          </circle>

          {/* Orbit paths for animateMotion */}
          <path id="orbit1-path" d="M 25,210 A 185,72 0 1,1 395,210 A 185,72 0 1,1 25,210"
            transform="rotate(-20 210 210)" fill="none" />
          <path id="orbit2-path" d="M 35,210 A 175,65 0 1,1 385,210 A 175,65 0 1,1 35,210"
            transform="rotate(50 210 210)" fill="none" />
          <path id="orbit3-path" d="M 45,210 A 165,60 0 1,1 375,210 A 165,60 0 1,1 45,210"
            transform="rotate(-40 210 210)" fill="none" />

          {/* Dots on orbit 2 */}
          <circle r="4.5" fill="#60A5FA" filter="url(#glow-blue)" opacity="0.9">
            <animateMotion dur="11s" repeatCount="indefinite">
              <mpath href="#orbit2-path"/>
            </animateMotion>
          </circle>
          <circle r="3" fill="#A78BFA" opacity="0.75">
            <animateMotion dur="11s" begin="-5.5s" repeatCount="indefinite">
              <mpath href="#orbit2-path"/>
            </animateMotion>
          </circle>

          {/* Dots on orbit 3 */}
          <circle r="4" fill="#C084FC" filter="url(#glow-purple)" opacity="0.85">
            <animateMotion dur="14s" repeatCount="indefinite">
              <mpath href="#orbit3-path"/>
            </animateMotion>
          </circle>
        </svg>

        {/* ── Central sphere ── */}
        <div className="absolute" style={{
          left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          width: 180, height: 180,
        }}>
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full" style={{
            background: "radial-gradient(circle, rgba(255,153,0,0.15) 0%, rgba(124,58,237,0.1) 50%, transparent 70%)",
            transform: "scale(1.6)",
          }} />
          {/* Sphere */}
          <div className="absolute inset-0 rounded-full overflow-hidden" style={{
            background: "radial-gradient(circle at 38% 35%, #2a1060 0%, #0e0520 40%, #050210 100%)",
            boxShadow: "0 0 40px rgba(255,153,0,0.3), 0 0 80px rgba(124,58,237,0.2), inset 0 0 30px rgba(255,153,0,0.08)",
            border: "1px solid rgba(255,153,0,0.2)",
          }}>
            {/* Particle dots on sphere */}
            <div className="absolute inset-0" style={{
              backgroundImage: "radial-gradient(circle, rgba(255,153,0,0.7) 1px, transparent 1px)",
              backgroundSize: "12px 12px",
              opacity: 0.35,
              animation: "sphereRotate 20s linear infinite",
            }} />
            {/* "aws" text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-black tracking-tight leading-none" style={{
                fontSize: 38,
                color: "#FF9900",
                textShadow: "0 0 20px rgba(255,153,0,0.9), 0 0 40px rgba(255,153,0,0.5)",
                fontFamily: "'Arial Black', Arial",
              }}>aws</span>
              {/* Smile arc */}
              <svg width="72" height="22" viewBox="0 0 72 22" style={{ marginTop: -2 }}>
                <path d="M 4 4 Q 36 20 68 4" fill="none" stroke="#FF9900" strokeWidth="3.5"
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 6px rgba(255,153,0,0.8))" }} />
                {/* Arrow tip */}
                <path d="M 62 2 L 68 4 L 64 9" fill="none" stroke="#FF9900" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0 0 4px rgba(255,153,0,0.8))" }} />
              </svg>
            </div>
            {/* Highlight */}
            <div className="absolute top-4 left-6 w-12 h-8 rounded-full" style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
            }} />
          </div>
        </div>

        {/* ── Service icons — positioned relative to orb ── */}
        {/* EC2 — top left */}
        <FloatingIcon icon={<EC2Icon />} label="EC2" color="255,153,0"
          style={{ top: 30, left: 20 }} delay={0} />
        {/* S3 — top right */}
        <FloatingIcon icon={<S3Icon />} label="S3" color="34,197,94"
          style={{ top: 40, right: 15 }} delay={0.8} />
        {/* Lambda — bottom left */}
        <FloatingIcon icon={<LambdaIcon />} label="Lambda" color="192,132,252"
          style={{ bottom: 55, left: 10 }} delay={1.6} />
        {/* ECS — bottom right */}
        <FloatingIcon icon={<ECSIcon />} label="ECS" color="96,165,250"
          style={{ bottom: 45, right: 10 }} delay={2.4} />

        {/* ── Base platform ── */}
        <div className="absolute" style={{
          bottom: -20, left: "50%", transform: "translateX(-50%)",
          width: 220, height: 24,
        }}>
          {/* Hex platform */}
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(180deg, rgba(124,58,237,0.25) 0%, transparent 100%)",
            clipPath: "polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)",
            boxShadow: "0 0 30px rgba(124,58,237,0.3)",
          }} />
          {/* Glow line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{
            width: "80%", height: 1,
            background: "linear-gradient(90deg, transparent, #FF9900, #7C3AED, transparent)",
            opacity: 0.7,
          }} />
          {/* Light beam */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{
            width: 2, height: 60,
            background: "linear-gradient(180deg, transparent, rgba(124,58,237,0.4))",
            transform: "translateX(-50%) scaleY(-1)",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes sphereRotate {
          from { background-position: 0 0; }
          to { background-position: 120px 0; }
        }
      `}</style>
    </div>
  );
}
