"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

function CameraRig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// AWS orb texture with "aws" + smile
function useOrbTexture() {
  return useMemo(() => {
    const size = 1024;
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const ctx = c.getContext("2d")!;

    // Dark base
    const bg = ctx.createRadialGradient(512, 480, 0, 512, 512, 520);
    bg.addColorStop(0, "#1c0a3a");
    bg.addColorStop(0.45, "#0e0520");
    bg.addColorStop(1, "#040210");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // Orange particle dots
    for (let i = 0; i < 1400; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const dx = (x - 512) / 512, dy = (y - 512) / 512;
      if (Math.sqrt(dx*dx + dy*dy) > 1) continue;
      const alpha = (Math.random() * 0.75 + 0.1);
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 2.5 + 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,${80 + Math.random()*100},0,${alpha})`;
      ctx.fill();
    }
    // Blue-white stars
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * size, y = Math.random() * size;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,210,255,${Math.random()*0.4+0.1})`;
      ctx.fill();
    }

    // "aws" glow text — bigger and brighter
    ctx.save();
    ctx.font = "bold 220px 'Arial Black',Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    for (let g = 8; g >= 1; g--) {
      ctx.shadowColor = "#FF9900"; ctx.shadowBlur = g * 28;
      ctx.fillStyle = `rgba(255,153,0,${0.13*g})`;
      ctx.fillText("aws", 512, 470);
    }
    ctx.shadowColor = "#FF9900"; ctx.shadowBlur = 20;
    ctx.fillStyle = "#FFAA00";
    ctx.fillText("aws", 512, 470);
    ctx.restore();

    // Smile arc — bigger
    ctx.save();
    ctx.beginPath();
    ctx.arc(512, 505, 170, 0.1*Math.PI, 0.9*Math.PI);
    ctx.strokeStyle = "#FF9900"; ctx.lineWidth = 22; ctx.lineCap = "round";
    ctx.shadowColor = "#FF9900"; ctx.shadowBlur = 32;
    ctx.stroke();
    const ea = 0.9*Math.PI;
    const ex = 512 + 170*Math.cos(ea), ey = 505 + 170*Math.sin(ea);
    ctx.beginPath(); ctx.moveTo(ex, ey);
    ctx.lineTo(ex-22, ey-16);
    ctx.lineWidth = 18; ctx.stroke();
    ctx.restore();

    return new THREE.CanvasTexture(c);
  }, []);
}

function CoreOrb() {
  const ref = useRef<THREE.Mesh>(null);
  const equatorRef = useRef<THREE.Mesh>(null);
  const texture = useOrbTexture();

  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.22; // faster rotation
    if (equatorRef.current) {
      (equatorRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.85 + Math.sin(s.clock.elapsedTime * 2.2) * 0.12;
    }
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[1.6, 128, 128]} />
        <meshStandardMaterial map={texture} roughness={0.08} metalness={0.75}
          emissiveMap={texture} emissive="#1a0500" emissiveIntensity={0.3} />
      </mesh>
      {/* Orange equator ring */}
      <mesh ref={equatorRef} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1.61, 0.07, 32, 300]} />
        <meshBasicMaterial color="#FF9900" transparent opacity={0.9} />
      </mesh>
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1.61, 0.16, 16, 200]} />
        <meshBasicMaterial color="#FF6600" transparent opacity={0.2} />
      </mesh>
      {/* Purple rim */}
      <mesh><sphereGeometry args={[1.68, 64, 64]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>
      <mesh><sphereGeometry args={[1.85, 32, 32]} />
        <meshBasicMaterial color="#5B21B6" transparent opacity={0.035} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// Elliptical orbit line
function OrbitLine({ rx, ry, tiltX, tiltY, tiltZ, color, opacity }: {
  rx: number; ry: number; tiltX: number; tiltY: number; tiltZ: number;
  color: string; opacity: number;
}) {
  const pts = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i <= 256; i++) {
      const t = (i/256)*Math.PI*2;
      arr.push(new THREE.Vector3(Math.cos(t)*rx, Math.sin(t)*ry, 0));
    }
    return arr;
  }, [rx, ry]);
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(pts), [pts]);
  return (
    <group rotation={[tiltX, tiltY, tiltZ]}>
      <line geometry={geo}>
        <lineBasicMaterial color={color} transparent opacity={opacity} />
      </line>
    </group>
  );
}

// Dot orbiting along ellipse
function OrbitDot({ rx, ry, tiltX, tiltY, tiltZ, speed, offset, color, size }: {
  rx: number; ry: number; tiltX: number; tiltY: number; tiltZ: number;
  speed: number; offset: number; color: string; size: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime * speed + offset;
    const lx = Math.cos(t)*rx, ly = Math.sin(t)*ry;
    const v = new THREE.Vector3(lx, ly, 0).applyEuler(new THREE.Euler(tiltX, tiltY, tiltZ));
    ref.current.position.copy(v);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
    </mesh>
  );
}

// Hex icon card
function useHexTex(label: string, color: string, bg: string) {
  return useMemo(() => {
    const s = 280;
    const c = document.createElement("canvas");
    c.width = s; c.height = s + 44;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, s, s+44);
    const cx = s/2, cy = s/2, r = 120;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI/3)*i - Math.PI/6;
      i===0 ? ctx.moveTo(cx+r*Math.cos(a), cy+r*Math.sin(a))
             : ctx.lineTo(cx+r*Math.cos(a), cy+r*Math.sin(a));
    }
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    grad.addColorStop(0, bg+"ee"); grad.addColorStop(1, bg+"77");
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 5;
    ctx.shadowColor = color; ctx.shadowBlur = 18; ctx.stroke();

    // Icon
    ctx.shadowBlur = 16; ctx.fillStyle = color; ctx.strokeStyle = color;
    ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.lineJoin = "round";

    if (label === "EC2") {
      const ox=cx, oy=cy-8, cs=48;
      ctx.beginPath(); ctx.moveTo(ox,oy-cs*.5); ctx.lineTo(ox+cs,oy);
      ctx.lineTo(ox,oy+cs*.5); ctx.lineTo(ox-cs,oy); ctx.closePath();
      ctx.fillStyle=color+"33"; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox+cs,oy); ctx.lineTo(ox+cs,oy+cs*.8);
      ctx.lineTo(ox,oy+cs*1.3); ctx.lineTo(ox,oy+cs*.5); ctx.closePath();
      ctx.fillStyle=color+"22"; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox-cs,oy); ctx.lineTo(ox-cs,oy+cs*.8);
      ctx.lineTo(ox,oy+cs*1.3); ctx.lineTo(ox,oy+cs*.5); ctx.closePath();
      ctx.fillStyle=color+"44"; ctx.fill(); ctx.stroke();
    } else if (label === "S3") {
      const bx=cx, by=cy-5;
      ctx.beginPath(); ctx.moveTo(bx-46,by-32); ctx.lineTo(bx+46,by-32);
      ctx.lineTo(bx+35,by+48); ctx.lineTo(bx-35,by+48); ctx.closePath();
      ctx.fillStyle=color+"22"; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(bx,by-32,46,13,0,0,Math.PI*2);
      ctx.fillStyle=color+"44"; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(bx,by-56,26,Math.PI,0);
      ctx.lineWidth=7; ctx.stroke();
    } else if (label === "Lambda") {
      ctx.font="bold 105px 'Arial Black',Arial";
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillStyle=color; ctx.shadowColor=color; ctx.shadowBlur=22;
      ctx.fillText("λ", cx, cy-5);
    } else if (label === "ECS") {
      const gc=3, gs=20, gp=8;
      const sx=cx-(gc*(gs+gp))/2+gs/2, sy=cy-(gc*(gs+gp))/2+gs/2-5;
      for (let row=0;row<gc;row++) for (let col=0;col<gc;col++) {
        const bx2=sx+col*(gs+gp), by2=sy+row*(gs+gp);
        ctx.beginPath(); ctx.roundRect(bx2-gs/2,by2-gs/2,gs,gs,3);
        ctx.fillStyle=color+(row===1&&col===1?"88":"33"); ctx.fill();
        ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.stroke();
      }
    }

    ctx.font="bold 30px Arial"; ctx.textAlign="center"; ctx.textBaseline="top";
    ctx.fillStyle="rgba(255,255,255,0.92)"; ctx.shadowColor="transparent"; ctx.shadowBlur=0;
    ctx.fillText(label, s/2, s+6);
    return new THREE.CanvasTexture(c);
  }, [label, color, bg]);
}

function ServiceCard({ label, pos, color, bg, fo=0 }: {
  label: string; pos: [number,number,number]; color: string; bg: string; fo?: number;
}) {
  const tex = useHexTex(label, color, bg);
  const ref = useRef<THREE.Group>(null);
  const baseY = pos[1];
  useFrame((s) => {
    if (ref.current) ref.current.position.y = baseY + Math.sin(s.clock.elapsedTime*0.65+fo)*0.09;
  });
  return (
    <group ref={ref} position={pos}>
      <mesh>
        <planeGeometry args={[0.75, 0.87]} />
        <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Glowing hex platform
function Platform() {
  const beamRef = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (beamRef.current)
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.07 + Math.sin(s.clock.elapsedTime*1.6)*0.05;
  });
  const hex = useMemo(() => {
    const sh = new THREE.Shape();
    const r = 2.3;
    for (let i=0;i<6;i++) {
      const a=(Math.PI/3)*i;
      i===0?sh.moveTo(r*Math.cos(a),r*Math.sin(a)):sh.lineTo(r*Math.cos(a),r*Math.sin(a));
    }
    sh.closePath(); return sh;
  }, []);
  return (
    <group position={[0,-2.2,0]}>
      <mesh rotation={[-Math.PI/2,0,0]}>
        <shapeGeometry args={[hex]} />
        <meshStandardMaterial color="#080318" emissive="#3B0764" emissiveIntensity={0.55} metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI/2,Math.PI/6,0]} position={[0,0.02,0]}>
        <ringGeometry args={[2.25,2.35,6]} />
        <meshBasicMaterial color="#FF9900" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI/2,Math.PI/6,0]} position={[0,0.03,0]}>
        <ringGeometry args={[1.35,1.43,6]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={beamRef} position={[0,2.2,0]}>
        <cylinderGeometry args={[0.01,1.35,4.4,32,1,true]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function BgParticles() {
  const count = 450;
  const pos = useMemo(() => {
    const a = new Float32Array(count*3);
    for (let i=0;i<count;i++) {
      a[i*3]=(Math.random()-.5)*32; a[i*3+1]=(Math.random()-.5)*32; a[i*3+2]=(Math.random()-.5)*18-6;
    }
    return a;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime*0.006; });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos,3]} /></bufferGeometry>
      <pointsMaterial size={0.02} color="#A78BFA" transparent opacity={0.28} sizeAttenuation />
    </points>
  );
}

export default function CenterOrb() {
  return (
    <Canvas camera={{ position:[-0.8, 0.2, 10], fov:52 }}
      style={{ position:"absolute", inset:0 }}
      gl={{ antialias:true, alpha:true }} dpr={[1,2]}>
      <ambientLight intensity={0.1} />
      <pointLight position={[0,0.5,3]}  intensity={7}   color="#FF9900" distance={14} decay={2} />
      <pointLight position={[-3,3,2]}   intensity={3}   color="#7C3AED" distance={16} decay={2} />
      <pointLight position={[3,-1,2]}   intensity={2}   color="#3B82F6" distance={12} decay={2} />
      <pointLight position={[0,-1.5,1]} intensity={4}   color="#7C3AED" distance={10} decay={2} />

      <Stars radius={120} depth={80} count={2000} factor={2.5} saturation={0.2} fade speed={0.15} />
      <BgParticles />
      <CoreOrb />
      <Platform />

      {/* Orbit lines */}
      <OrbitLine rx={2.4} ry={1.8} tiltX={0.18} tiltY={0.35} tiltZ={0.08}  color="#FF9900" opacity={0.7} />
      <OrbitLine rx={2.6} ry={1.9} tiltX={1.35} tiltY={0.5}  tiltZ={-0.15} color="#3B82F6" opacity={0.55} />
      <OrbitLine rx={2.2} ry={1.7} tiltX={0.75} tiltY={-0.4} tiltZ={0.25}  color="#A78BFA" opacity={0.4} />

      {/* Orbiting dots */}
      <OrbitDot rx={2.4} ry={1.8} tiltX={0.18} tiltY={0.35} tiltZ={0.08}  speed={0.45} offset={0}        color="#FF9900" size={0.07} />
      <OrbitDot rx={2.4} ry={1.8} tiltX={0.18} tiltY={0.35} tiltZ={0.08}  speed={0.45} offset={Math.PI}  color="#FFFFFF" size={0.05} />
      <OrbitDot rx={2.6} ry={1.9} tiltX={1.35} tiltY={0.5}  tiltZ={-0.15} speed={-0.38} offset={0}       color="#60A5FA" size={0.065} />
      <OrbitDot rx={2.6} ry={1.9} tiltX={1.35} tiltY={0.5}  tiltZ={-0.15} speed={-0.38} offset={Math.PI} color="#A78BFA" size={0.055} />
      <OrbitDot rx={2.2} ry={1.7} tiltX={0.75} tiltY={-0.4} tiltZ={0.25}  speed={0.3}  offset={Math.PI/2} color="#C084FC" size={0.05} />

      {/* Service icon cards — smaller (0.75) and closer to orb */}
      <ServiceCard label="EC2"    pos={[-1.7, 2.1,  0.8]} color="#FF9900" bg="#1a0d00" fo={0}   />
      <ServiceCard label="S3"     pos={[2.0,  1.8,  0.7]} color="#22C55E" bg="#001a08" fo={1.5} />
      <ServiceCard label="Lambda" pos={[-2.4, 0.0,  0.9]} color="#C084FC" bg="#0d0a20" fo={3}   />
      <ServiceCard label="ECS"    pos={[2.4, -0.8,  0.7]} color="#60A5FA" bg="#000d1a" fo={4.5} />

      <CameraRig />
    </Canvas>
  );
}
