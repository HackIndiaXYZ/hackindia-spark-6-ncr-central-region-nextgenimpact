"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Text, Stars } from "@react-three/drei";
import * as THREE from "three";

// ── AWS service labels floating in 3D space ───────────────────────────────────
const AWS_SERVICES = [
  { label: "EC2", x: -4.5, y: 2.5, z: -3, color: "#FF9900" },
  { label: "S3", x: 4, y: 3, z: -4, color: "#FF9900" },
  { label: "λ", x: -3, y: -2, z: -2, color: "#FF9900" },
  { label: "EKS", x: 5, y: -1.5, z: -5, color: "#569AFF" },
  { label: "RDS", x: -5.5, y: 0.5, z: -4, color: "#569AFF" },
  { label: "IAM", x: 3.5, y: 1.5, z: -6, color: "#FF9900" },
  { label: "VPC", x: -2, y: 3.5, z: -5, color: "#569AFF" },
  { label: "ECS", x: 2, y: -3, z: -3, color: "#FF9900" },
  { label: "SNS", x: -4, y: -3, z: -6, color: "#569AFF" },
  { label: "SQS", x: 5.5, y: 2, z: -7, color: "#FF9900" },
  { label: "CF", x: 0.5, y: 4, z: -6, color: "#569AFF" },
  { label: "CDK", x: -1, y: -3.5, z: -5, color: "#FF9900" },
];

// ── Floating cube with AWS label ──────────────────────────────────────────────
function ServiceCube({ label, x, y, z, color }: { label: string; x: number; y: number; z: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.3 + Math.random() * 0.4, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.5;
    meshRef.current.rotation.y = state.clock.elapsedTime * speed;
  });

  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.8} floatingRange={[-0.3, 0.3]}>
      <group position={[x, y, z]}>
        <mesh ref={meshRef}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.15}
            wireframe={false}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
        {/* Wireframe overlay */}
        <mesh>
          <boxGeometry args={[0.72, 0.72, 0.72]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.4} />
        </mesh>
        <Text
          position={[0, 0, 0.4]}
          fontSize={0.22}
          color={color}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

// ── Particle field ────────────────────────────────────────────────────────────
function Particles() {
  const count = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#FF9900" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// ── Mouse parallax camera ─────────────────────────────────────────────────────
function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── Central glowing ring ──────────────────────────────────────────────────────
function GlowRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.15;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, -3]}>
      <torusGeometry args={[3.5, 0.02, 16, 100]} />
      <meshBasicMaterial color="#FF9900" transparent opacity={0.3} />
    </mesh>
  );
}

// ── Main exported scene ───────────────────────────────────────────────────────
export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#FF9900" />
      <pointLight position={[-5, -5, 3]} intensity={0.5} color="#569AFF" />

      <Stars radius={80} depth={50} count={1500} factor={3} saturation={0} fade speed={0.5} />
      <Particles />
      <GlowRing />
      <CameraRig />

      {AWS_SERVICES.map((s) => (
        <ServiceCube key={s.label} {...s} />
      ))}
    </Canvas>
  );
}
