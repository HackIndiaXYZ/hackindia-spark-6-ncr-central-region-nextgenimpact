"use client";
import { useEffect, useRef, useState } from "react";

interface VantaEffect {
  destroy: () => void;
}

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<VantaEffect | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadVanta = async () => {
      // Dynamically import to avoid SSR issues
      const THREE = await import("three");
      const VANTA = await import("vanta/dist/vanta.net.min");

      if (cancelled || !vantaRef.current) return;

      vantaEffect.current = (VANTA as unknown as { default: (opts: Record<string, unknown>) => VantaEffect }).default({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        // AWS Pulse colors
        color: 0xFF9900,        // orange nodes
        backgroundColor: 0x07051A, // dark navy
        points: 12.0,
        maxDistance: 22.0,
        spacing: 18.0,
        showDots: true,
      });

      setLoaded(true);
    };

    loadVanta().catch(() => {
      // Vanta failed — fallback to CSS gradient (silent)
    });

    return () => {
      cancelled = true;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="absolute inset-0 z-0"
      style={{
        background: loaded ? undefined : "linear-gradient(135deg, #07051A 0%, #0d0a2e 50%, #07051A 100%)",
      }}
    />
  );
}
