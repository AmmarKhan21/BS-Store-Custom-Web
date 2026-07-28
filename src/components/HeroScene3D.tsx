import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Slowly rotating gold form that answers mouse movement — the emblem behind the hero title.
function GoldEmblem() {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.12;
    const targetX = pointer.current.y * 0.18;
    const targetZ = -pointer.current.x * 0.18;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 1 - Math.pow(0.001, dt));
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetZ, 1 - Math.pow(0.001, dt));
  });

  return (
    <group ref={group} position={[0, 0, -4.5]} scale={0.62}>
      <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh>
          <torusKnotGeometry args={[1.5, 0.38, 220, 32, 2, 3]} />
          <MeshDistortMaterial
            color="#c9a66b"
            emissive="#5c4a12"
            emissiveIntensity={0.2}
            metalness={0.85}
            roughness={0.4}
            distort={0.18}
            speed={0.8}
            transparent
            opacity={0.35}
          />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroScene3D() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff6e5" />
        <pointLight position={[-4, -2, 3]} intensity={1.8} color="#2a9d7c" />
        <Sparkles count={140} scale={[12, 7, 6]} size={2} speed={0.2} opacity={0.5} color="#e2c08a" />
        <GoldEmblem />
      </Canvas>
    </div>
  );
}
