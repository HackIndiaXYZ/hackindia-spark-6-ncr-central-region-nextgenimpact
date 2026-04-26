"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

// ── Mouse-tracking camera rig ─────────────────────────────────────────────────
function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (mouse.y * 0.8 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── Central glowing orb ───────────────────────────────────────────────────────
function CoreOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.elapsedTime * 0.15;
      ref.current.rotation.z = s.clock.elapsedTime * 0.08;
    }
  });
  return (
    <group>
      {/* Inner glow sphere */}
      <Sphere ref={ref} args={[1.1, 64, 64]}>
        <MeshDistortMaterial
          color="#FF9900"
          emissive="#FF6600"
          emissiveIntensity={0.4}
          distort={0.35}
          speed={2}
          roughness={0.1}
          metalness={0.6}
          transparent
          opacity={0.85}
        />
      </Sphere>
      {/* Outer halo */}
      <Sphere args={[1.35, 32, 32]}>
        <meshBasicMaterial color="#FF9900" transparent opacity={0.06} side={THREE.BackSide} />
      </Sphere>
      {/* Second halo */}
      <Sphere args={[1.6, 32, 32]}>
        <meshBasicMaterial color="#FF9900" transparent opacity={0.03} side={THREE.BackSide} />
      </Sphere>
    </group>
  );
}

// ── Orbiting ring ─────────────────────────────────────────────────────────────
function OrbitRing({ radius, speed, tilt, color, opacity }: {
  radius: number; speed: number; tilt: number; color: string; opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = s.clock.elapsedTime * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.012, 16, 120]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

// ── Orbiting dot on a ring ────────────────────────────────────────────────────
function OrbitDot({ radius, speed, tilt, color, offset = 0 }: {
  radius: number; speed: number; tilt: number; color: string; offset?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime * speed + offset;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = Math.sin(t) * radius * Math.sin(tilt);
    ref.current.position.set(x, y, z);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
    </mesh>
  );
}

// ── Floating AWS service label cubes ─────────────────────────────────────────
const SERVICES = [
  { label: "EC2", pos: [-3.8, 1.8, -2] as [number,number,number], color: "#FF9900" },
  { label: "S3",  pos: [3.5, 2.2, -3] as [number,number,number],  color: "#FF9900" },
  { label: "λ",   pos: [-2.8, -2, -1.5] as [number,number,number], color: "#569AFF" },
  { label: "EKS", pos: [4, -1.5, -4] as [number,number,number],   color: "#569AFF" },
  { label: "RDS", pos: [-4.5, 0.2, -3] as [number,number,number], color: "#FF9900" },
  { label: "IAM", pos: [2.8, 1.2, -5] as [number,number,number],  color: "#569AFF" },
  { label: "ECS", pos: [1.5, -2.8, -2] as [number,number,number], color: "#FF9900" },
  { label: "CDK", pos: [-1.5, 3, -4] as [number,number,number],   color: "#569AFF" },
];

function ServiceTag({ pos, color }: { label: string; pos: [number,number,number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.2 + Math.random() * 0.3, []);

  useFrame((s) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = s.clock.elapsedTime * speed;
      meshRef.current.rotation.x = s.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.6} rotationIntensity={0.2}>
      <group position={pos}>
        {/* Cube */}
        <mesh ref={meshRef}>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          <meshStandardMaterial color={color} transparent opacity={0.12} roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Wireframe */}
        <mesh>
          <boxGeometry args={[0.57, 0.57, 0.57]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
        </mesh>
        {/* Label */}
        <mesh position={[0, 0, 0.32]}>
          <planeGeometry args={[0.5, 0.2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>
    </Float>
  );
}

// ── Particle field ────────────────────────────────────────────────────────────
function Particles({ count = 300 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 22;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 22;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12 - 4;
    }
    return arr;
  }, [count]);

  const ref = useRef<THREE.Points>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#FF9900" transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

// ── Grid plane ────────────────────────────────────────────────────────────────
function GridPlane() {
  return (
    <gridHelper
      args={[30, 30, "#FF9900", "#1a2035"]}
      position={[0, -4, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// ── Main exported canvas ──────────────────────────────────────────────────────
export default function AWSOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 55 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 3]} intensity={3} color="#FF9900" distance={8} decay={2} />
      <pointLight position={[-4, 3, 2]} intensity={1.5} color="#569AFF" distance={10} decay={2} />
      <pointLight position={[4, -3, 2]} intensity={1} color="#FF6600" distance={8} decay={2} />

      {/* Background */}
      <Stars radius={100} depth={60} count={2000} factor={3} saturation={0} fade speed={0.3} />
      <Particles />
      <GridPlane />

      {/* Core 3D elements */}
      <CoreOrb />

      {/* Orbit rings */}
      <OrbitRing radius={2.0} speed={0.4}  tilt={0.3}  color="#FF9900" opacity={0.6} />
      <OrbitRing radius={2.5} speed={-0.25} tilt={1.1} color="#569AFF" opacity={0.4} />
      <OrbitRing radius={3.0} speed={0.15} tilt={0.7}  color="#FF9900" opacity={0.25} />

      {/* Orbiting dots */}
      <OrbitDot radius={2.0} speed={0.8}  tilt={0.3}  color="#FF9900" offset={0} />
      <OrbitDot radius={2.0} speed={0.8}  tilt={0.3}  color="#FF9900" offset={Math.PI} />
      <OrbitDot radius={2.5} speed={-0.6} tilt={1.1}  color="#569AFF" offset={0} />
      <OrbitDot radius={2.5} speed={-0.6} tilt={1.1}  color="#569AFF" offset={Math.PI * 2/3} />
      <OrbitDot radius={2.5} speed={-0.6} tilt={1.1}  color="#569AFF" offset={Math.PI * 4/3} />

      {/* Floating service tags */}
      {SERVICES.map((s) => <ServiceTag key={s.label} {...s} />)}

      {/* Mouse parallax */}
      <CameraRig />
    </Canvas>
  );
}
