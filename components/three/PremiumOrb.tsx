"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

// ── Mouse parallax ────────────────────────────────────────────────────────────
function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.025;
    camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.025;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── AWS orb texture ───────────────────────────────────────────────────────────
function useOrbTexture() {
  return useMemo(() => {
    const size = 1024;
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const ctx = c.getContext("2d")!;

    // Deep dark purple-black base
    const bg = ctx.createRadialGradient(512, 480, 0, 512, 512, 520);
    bg.addColorStop(0,   "#1c0a3a");
    bg.addColorStop(0.4, "#0e0520");
    bg.addColorStop(1,   "#040210");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // Orange particle dots scattered on surface
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      // Make them denser in center
      const dx = (x - 512) / 512;
      const dy = (y - 512) / 512;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) continue;
      const alpha = (Math.random() * 0.8 + 0.1) * (1 - dist * 0.5);
      const r = Math.random() * 2.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,${100 + Math.random() * 80},0,${alpha})`;
      ctx.fill();
    }

    // Blue-white star dots
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 1.5 + 0.3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,200,255,${Math.random() * 0.5 + 0.1})`;
      ctx.fill();
    }

    // "aws" text — large, centered, bright orange glow
    ctx.save();
    ctx.font = "bold 195px 'Arial Black', Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    // Multi-layer glow
    for (let g = 6; g >= 1; g--) {
      ctx.shadowColor = "#FF9900";
      ctx.shadowBlur = g * 22;
      ctx.fillStyle = `rgba(255,153,0,${0.12 * g})`;
      ctx.fillText("aws", 512, 460);
    }
    ctx.shadowColor = "#FF9900";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#FF9900";
    ctx.fillText("aws", 512, 460);
    ctx.restore();

    // Amazon smile arc
    ctx.save();
    ctx.beginPath();
    ctx.arc(512, 490, 155, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.strokeStyle = "#FF9900";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.shadowColor = "#FF9900";
    ctx.shadowBlur = 30;
    ctx.stroke();
    // Arrow tip at end of smile
    const endAngle = 0.9 * Math.PI;
    const ex = 512 + 155 * Math.cos(endAngle);
    const ey = 490 + 155 * Math.sin(endAngle);
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 22, ey - 16);
    ctx.strokeStyle = "#FF9900";
    ctx.lineWidth = 16;
    ctx.stroke();
    ctx.restore();

    return new THREE.CanvasTexture(c);
  }, []);
}

// ── Core orb ──────────────────────────────────────────────────────────────────
function CoreOrb() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const equatorRef = useRef<THREE.Mesh>(null);
  const texture = useOrbTexture();

  useFrame((s) => {
    if (sphereRef.current) sphereRef.current.rotation.y = s.clock.elapsedTime * 0.06;
    if (equatorRef.current) {
      const p = 0.7 + Math.sin(s.clock.elapsedTime * 2) * 0.2;
      (equatorRef.current.material as THREE.MeshBasicMaterial).opacity = p * 0.9;
    }
  });

  return (
    <group>
      {/* Main sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1.3, 128, 128]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.1}
          metalness={0.7}
          emissiveMap={texture}
          emissive="#220800"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Bright orange equator ring — the key visual element */}
      <mesh ref={equatorRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.31, 0.055, 32, 300]} />
        <meshBasicMaterial color="#FF9900" transparent opacity={0.95} />
      </mesh>
      {/* Equator glow outer */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.31, 0.12, 16, 200]} />
        <meshBasicMaterial color="#FF6600" transparent opacity={0.25} />
      </mesh>

      {/* Purple atmospheric rim */}
      <mesh>
        <sphereGeometry args={[1.38, 64, 64]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshBasicMaterial color="#5B21B6" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// ── Elliptical orbit path (like atom electron orbit) ──────────────────────────
// Creates a curved ellipse path that crosses through/around the orb
function OrbitPath({ rx, ry, tiltX, tiltY, tiltZ, color, opacity }: {
  rx: number; ry: number; tiltX: number; tiltY: number; tiltZ: number;
  color: string; opacity: number;
}) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * rx, Math.sin(t) * ry, 0));
    }
    return pts;
  }, [rx, ry]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <group rotation={[tiltX, tiltY, tiltZ]}>
      <line geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={1} />
      </line>
    </group>
  );
}

// ── Orbiting dot along ellipse ────────────────────────────────────────────────
function EllipseDot({ rx, ry, tiltX, tiltY, tiltZ, speed, offset, color, size }: {
  rx: number; ry: number; tiltX: number; tiltY: number; tiltZ: number;
  speed: number; offset: number; color: string; size: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime * speed + offset;
    // Local position on ellipse
    const lx = Math.cos(t) * rx;
    const ly = Math.sin(t) * ry;
    const lz = 0;
    // Apply rotation
    const euler = new THREE.Euler(tiltX, tiltY, tiltZ);
    const v = new THREE.Vector3(lx, ly, lz).applyEuler(euler);
    ref.current.position.copy(v);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
    </mesh>
  );
}

// ── Service icon hex card ─────────────────────────────────────────────────────
function useIconTexture(label: string, color: string, bgColor: string) {
  return useMemo(() => {
    const s = 300;
    const c = document.createElement("canvas");
    c.width = s; c.height = s + 50;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, s, s + 50);

    // Hexagon
    const cx = s / 2, cy = s / 2, r = 130;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      if (i === 0) {
        ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      } else {
        ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
      }
    }
    ctx.closePath();

    // Background fill
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, bgColor + "dd");
    grad.addColorStop(1, bgColor + "88");
    ctx.fillStyle = grad;
    ctx.fill();

    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.stroke();

    // Draw icon based on label
    ctx.shadowBlur = 15;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (label === "EC2") {
      // 3D cube icon
      const ox = cx, oy = cy - 10, cs = 55;
      // Top face
      ctx.beginPath();
      ctx.moveTo(ox, oy - cs * 0.5);
      ctx.lineTo(ox + cs, oy);
      ctx.lineTo(ox, oy + cs * 0.5);
      ctx.lineTo(ox - cs, oy);
      ctx.closePath();
      ctx.fillStyle = color + "33";
      ctx.fill();
      ctx.stroke();
      // Right face
      ctx.beginPath();
      ctx.moveTo(ox + cs, oy);
      ctx.lineTo(ox + cs, oy + cs * 0.8);
      ctx.lineTo(ox, oy + cs * 1.3);
      ctx.lineTo(ox, oy + cs * 0.5);
      ctx.closePath();
      ctx.fillStyle = color + "22";
      ctx.fill();
      ctx.stroke();
      // Left face
      ctx.beginPath();
      ctx.moveTo(ox - cs, oy);
      ctx.lineTo(ox - cs, oy + cs * 0.8);
      ctx.lineTo(ox, oy + cs * 1.3);
      ctx.lineTo(ox, oy + cs * 0.5);
      ctx.closePath();
      ctx.fillStyle = color + "44";
      ctx.fill();
      ctx.stroke();
    } else if (label === "S3") {
      // Bucket icon
      const bx = cx, by = cy - 5;
      // Bucket body (trapezoid)
      ctx.beginPath();
      ctx.moveTo(bx - 50, by - 35);
      ctx.lineTo(bx + 50, by - 35);
      ctx.lineTo(bx + 38, by + 50);
      ctx.lineTo(bx - 38, by + 50);
      ctx.closePath();
      ctx.fillStyle = color + "22";
      ctx.fill();
      ctx.stroke();
      // Bucket top ellipse
      ctx.beginPath();
      ctx.ellipse(bx, by - 35, 50, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = color + "44";
      ctx.fill();
      ctx.stroke();
      // Handle
      ctx.beginPath();
      ctx.arc(bx, by - 60, 28, Math.PI, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = 7;
      ctx.stroke();
    } else if (label === "Lambda") {
      // λ symbol
      ctx.font = "bold 110px 'Arial Black', Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 25;
      ctx.fillText("λ", cx, cy - 5);
    } else if (label === "ECS") {
      // Grid of small cubes
      const gc = 3, gs = 22, gp = 8;
      const startX = cx - (gc * (gs + gp)) / 2 + gs / 2;
      const startY = cy - (gc * (gs + gp)) / 2 + gs / 2 - 5;
      for (let row = 0; row < gc; row++) {
        for (let col = 0; col < gc; col++) {
          const bx2 = startX + col * (gs + gp);
          const by2 = startY + row * (gs + gp);
          ctx.beginPath();
          ctx.roundRect(bx2 - gs / 2, by2 - gs / 2, gs, gs, 4);
          ctx.fillStyle = color + (row === 1 && col === 1 ? "88" : "33");
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    }

    // Label text below hex
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.fillText(label, s / 2, s + 5);

    return new THREE.CanvasTexture(c);
  }, [label, color, bgColor]);
}

function ServiceCard({ label, pos, color, bgColor, floatOffset = 0 }: {
  label: string; pos: [number, number, number];
  color: string; bgColor: string; floatOffset?: number;
}) {
  const texture = useIconTexture(label, color, bgColor);
  const ref = useRef<THREE.Group>(null);
  const baseY = pos[1];

  useFrame((s) => {
    if (ref.current) {
      ref.current.position.y = baseY + Math.sin(s.clock.elapsedTime * 0.7 + floatOffset) * 0.08;
    }
  });
  return (
    <group ref={ref} position={pos}>
      <mesh>
        <planeGeometry args={[1.0, 1.17]} />
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── Glowing platform ──────────────────────────────────────────────────────────
function Platform() {
  const beamRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (beamRef.current) {
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(s.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  const hexShape = useMemo(() => {
    const shape = new THREE.Shape();
    const r = 2.2;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      if (i === 0) {
        shape.moveTo(r * Math.cos(a), r * Math.sin(a));
      } else {
        shape.lineTo(r * Math.cos(a), r * Math.sin(a));
      }
    }
    shape.closePath();
    return shape;
  }, []);

  return (
    <group position={[0, -2.1, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[hexShape]} />
        <meshStandardMaterial color="#080318" emissive="#3B0764" emissiveIntensity={0.6} metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Hex border */}
      <mesh rotation={[-Math.PI / 2, Math.PI / 6, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.15, 2.25, 6]} />
        <meshBasicMaterial color="#FF9900" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, Math.PI / 6, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.3, 1.38, 6]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* Light beam */}
      <mesh ref={beamRef} position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.01, 1.3, 4.2, 32, 1, true]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Background particles ──────────────────────────────────────────────────────
function BgParticles() {
  const count = 500;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16 - 6;
    }
    return arr;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.007; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#A78BFA" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// ── Main canvas ───────────────────────────────────────────────────────────────
export default function PremiumOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 9.5], fov: 50 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0.5, 3]}  intensity={7}   color="#FF9900" distance={14} decay={2} />
      <pointLight position={[-3, 3, 2]}   intensity={3}   color="#7C3AED" distance={16} decay={2} />
      <pointLight position={[3, -1, 2]}   intensity={2}   color="#3B82F6" distance={12} decay={2} />
      <pointLight position={[0, -1.5, 1]} intensity={4}   color="#7C3AED" distance={10} decay={2} />

      <Stars radius={120} depth={80} count={2000} factor={2.5} saturation={0.2} fade speed={0.15} />
      <BgParticles />

      <CoreOrb />
      <Platform />

      {/* Orbit paths — ellipses at different tilts like atom model */}
      {/* Main orange orbit — nearly vertical ellipse */}
      <OrbitPath rx={2.8} ry={2.0} tiltX={Math.PI/2 * 0.15} tiltY={0.3} tiltZ={0.1}
        color="#FF9900" opacity={0.75} />
      {/* Blue orbit — tilted differently */}
      <OrbitPath rx={3.0} ry={2.2} tiltX={Math.PI/2 * 0.8} tiltY={0.5} tiltZ={-0.2}
        color="#3B82F6" opacity={0.55} />
      {/* Purple orbit */}
      <OrbitPath rx={2.6} ry={1.9} tiltX={Math.PI/2 * 0.5} tiltY={-0.4} tiltZ={0.3}
        color="#A78BFA" opacity={0.4} />

      {/* Orbiting dots on paths */}
      <EllipseDot rx={2.8} ry={2.0} tiltX={Math.PI/2*0.15} tiltY={0.3} tiltZ={0.1}
        speed={0.5} offset={0} color="#FF9900" size={0.08} />
      <EllipseDot rx={2.8} ry={2.0} tiltX={Math.PI/2*0.15} tiltY={0.3} tiltZ={0.1}
        speed={0.5} offset={Math.PI} color="#FFFFFF" size={0.055} />
      <EllipseDot rx={3.0} ry={2.2} tiltX={Math.PI/2*0.8} tiltY={0.5} tiltZ={-0.2}
        speed={-0.4} offset={0} color="#60A5FA" size={0.07} />
      <EllipseDot rx={3.0} ry={2.2} tiltX={Math.PI/2*0.8} tiltY={0.5} tiltZ={-0.2}
        speed={-0.4} offset={Math.PI} color="#A78BFA" size={0.065} />

      {/* Service icon cards */}
      <ServiceCard label="EC2"    pos={[-2.2, 2.6, 1.2]}  color="#FF9900" bgColor="#1a0d00" floatOffset={0} />
      <ServiceCard label="S3"     pos={[2.6,  2.2, 1.0]}  color="#22C55E" bgColor="#001a08" floatOffset={1.5} />
      <ServiceCard label="Lambda" pos={[-3.2, 0.0, 1.2]}  color="#C084FC" bgColor="#0d0a20" floatOffset={3} />
      <ServiceCard label="ECS"    pos={[3.2,  -0.8, 1.0]} color="#60A5FA" bgColor="#000d1a" floatOffset={4.5} />

      <CameraRig />
    </Canvas>
  );
}
