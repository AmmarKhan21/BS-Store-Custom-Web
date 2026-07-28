import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { Float, MeshReflectorMaterial, RoundedBox, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Product } from '../types';

type Item = { id: string; name: string; color: string; image: string };

const COLORS = ['#1f6b55', '#c9a66b', '#2a9d7c', '#8b6914', '#0e3d34', '#e2c08a', '#145a4a', '#d4a574'];

const DEMO: Item[] = [
  { id: 'd1', name: 'Cotton', color: '#1f6b55', image: '' },
  { id: 'd2', name: 'Sports', color: '#c9a66b', image: '' },
  { id: 'd3', name: 'Fabric', color: '#2a9d7c', image: '' },
  { id: 'd4', name: 'Gear', color: '#8b6914', image: '' },
  { id: 'd5', name: 'Style', color: '#0e3d34', image: '' },
  { id: 'd6', name: 'Wear', color: '#d4a574', image: '' },
];

// Fits a loaded texture to a target plane aspect ratio the way CSS `object-fit: cover` would,
// so portrait/landscape source photos don't stretch or skew inside the picture-frame plane.
function fitTextureToCover(tex: THREE.Texture, planeAspect: number) {
  const img = tex.image as { width: number; height: number } | undefined;
  if (!img?.width || !img?.height) return;
  const imageAspect = img.width / img.height;
  if (imageAspect > planeAspect) {
    const scale = planeAspect / imageAspect;
    tex.repeat.set(scale, 1);
    tex.offset.set((1 - scale) / 2, 0);
  } else {
    const scale = imageAspect / planeAspect;
    tex.repeat.set(1, scale);
    tex.offset.set(0, (1 - scale) / 2);
  }
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
}

function ProductBox({
  item,
  index,
  total,
  onSelect,
}: {
  item: Item;
  index: number;
  total: number;
  onSelect: (id: string) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const angle = (index / total) * Math.PI * 2;
  const radius = 3.1;

  useFrame((state, dt) => {
    if (!mesh.current) return;
    mesh.current.position.y = Math.sin(state.clock.elapsedTime * 1.4 + index) * 0.2;
    mesh.current.rotation.y = angle + state.clock.elapsedTime * 0.15;
    const targetScale = hovered ? 1.12 : 1;
    mesh.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.pow(0.001, dt));
  });

  return (
    <mesh
      ref={mesh}
      position={[Math.sin(angle) * radius, 0.2, Math.cos(angle) * radius]}
      castShadow
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(item.id);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <boxGeometry args={[1.2, 1.6, 0.25]} />
      <meshStandardMaterial
        color={item.color}
        metalness={0.45}
        roughness={0.3}
        emissive={item.color}
        emissiveIntensity={hovered ? 0.55 : 0.25}
      />
    </mesh>
  );
}

function PhotoCard({
  item,
  index,
  total,
  textures,
  onSelect,
}: {
  item: Item;
  index: number;
  total: number;
  textures: Record<string, THREE.Texture>;
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const angle = (index / total) * Math.PI * 2;
  const radius = 3.1;
  const tex = textures[item.id];

  useFrame((state, dt) => {
    if (!group.current) return;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 1.3 + index) * 0.18;
    const targetScale = hovered ? 1.1 : 1;
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.pow(0.001, dt));
  });

  return (
    <group
      ref={group}
      position={[Math.sin(angle) * radius, 0.15, Math.cos(angle) * radius]}
      rotation={[0, angle, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(item.id);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Frame */}
      <RoundedBox args={[1.56, 2.01, 0.14]} radius={0.05} smoothness={4}>
        <meshStandardMaterial
          color="#c9a66b"
          metalness={0.9}
          roughness={0.2}
          emissive="#c9a66b"
          emissiveIntensity={hovered ? 0.6 : 0.3}
        />
      </RoundedBox>
      {/* Photo or color face */}
      <mesh position={[0, 0.05, 0.09]}>
        <planeGeometry args={[1.4, 1.75]} />
        {tex ? (
          <meshBasicMaterial map={tex} toneMapped={false} />
        ) : (
          <meshStandardMaterial
            color={item.color}
            emissive={item.color}
            emissiveIntensity={0.55}
          />
        )}
      </mesh>
      {/* Subtle glass sheen overlay */}
      <mesh position={[0, 0.05, 0.095]}>
        <planeGeometry args={[1.4, 1.75]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={hovered ? 0.14 : 0.06}
          metalness={0.1}
          roughness={0.05}
        />
      </mesh>
    </group>
  );
}

function Carousel({
  items,
  textures,
  onSelect,
}: {
  items: Item[];
  textures: Record<string, THREE.Texture>;
  onSelect: (id: string) => void;
}) {
  const root = useRef<THREE.Group>(null);
  const drag = useRef({ active: false, x: 0, v: 0 });

  useFrame((_, dt) => {
    if (!root.current) return;
    if (!drag.current.active) {
      root.current.rotation.y += dt * 0.35 + drag.current.v;
      drag.current.v *= 0.93;
    }
  });

  return (
    <group
      onPointerDown={(e) => {
        drag.current.active = true;
        drag.current.x = e.clientX;
      }}
      onPointerUp={() => {
        drag.current.active = false;
      }}
      onPointerLeave={() => {
        drag.current.active = false;
      }}
      onPointerMove={(e) => {
        if (!drag.current.active || !root.current) return;
        const dx = e.clientX - drag.current.x;
        drag.current.x = e.clientX;
        const d = dx * 0.012;
        root.current.rotation.y += d;
        drag.current.v = d * 0.55;
      }}
    >
      {/* Bright gold ring so 3D is obvious */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.35, 0]}>
        <torusGeometry args={[3.1, 0.09, 16, 80]} />
        <meshStandardMaterial
          color="#c9a66b"
          emissive="#c9a66b"
          emissiveIntensity={1}
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Reflective floor for depth and shine */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
        <circleGeometry args={[5.5, 64]} />
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={512}
          mixBlur={1}
          mixStrength={35}
          roughness={1}
          depthScale={1}
          minDepthThreshold={0.85}
          color="#04120f"
          metalness={0.7}
          mirror={0.35}
        />
      </mesh>

      {/* Ambient gold dust */}
      <Sparkles count={90} scale={[8, 4, 8]} size={2.4} speed={0.25} opacity={0.55} color="#e2c08a" />

      {/* Center gem */}
      <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh position={[0, 0.35, 0]} rotation={[0.4, 0.6, 0.2]}>
          <octahedronGeometry args={[0.65, 0]} />
          <meshStandardMaterial
            color="#e2c08a"
            emissive="#c9a66b"
            emissiveIntensity={1.1}
            metalness={1}
            roughness={0.08}
          />
        </mesh>
      </Float>

      <group ref={root}>
        {items.map((item, i) =>
          item.image ? (
            <PhotoCard
              key={item.id}
              item={item}
              index={i}
              total={items.length}
              textures={textures}
              onSelect={onSelect}
            />
          ) : (
            <ProductBox
              key={item.id}
              item={item}
              index={i}
              total={items.length}
              onSelect={onSelect}
            />
          )
        )}
      </group>
    </group>
  );
}

function useProductTextures(items: Item[]) {
  const [textures, setTextures] = React.useState<Record<string, THREE.Texture>>({});

  React.useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const next: Record<string, THREE.Texture> = {};
    let remaining = items.filter((i) => i.image).length;
    if (remaining === 0) {
      setTextures({});
      return;
    }

    const planeAspect = 1.4 / 1.75;

    items.forEach((item) => {
      if (!item.image) return;
      loader.load(
        item.image,
        (tex) => {
          if (cancelled) return;
          tex.colorSpace = THREE.SRGBColorSpace;
          fitTextureToCover(tex, planeAspect);
          next[item.id] = tex;
          remaining -= 1;
          if (remaining <= 0) setTextures({ ...next });
        },
        undefined,
        () => {
          remaining -= 1;
          if (remaining <= 0 && !cancelled) setTextures({ ...next });
        }
      );
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  return textures;
}

export default function ProductGallery3D({
  products,
  onSelectProduct,
  className = '',
}: {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  className?: string;
}) {
  const items = useMemo<Item[]>(() => {
    const list = products.slice(0, 8);
    if (list.length === 0) return DEMO;
    return list.map((p, i) => {
      const raw = p.images?.[0] || '';
      const bad =
        !raw || raw.includes('trophee-sportif.com') || raw.includes('example.com');
      return {
        id: p.id,
        name: p.name,
        color: COLORS[i % COLORS.length],
        image: bad ? '' : raw,
      };
    });
  }, [products]);

  const textures = useProductTextures(items);

  const handleSelect = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) onSelectProduct(product);
  };

  return (
    <div
      className={`relative h-full min-h-[280px] w-full touch-none select-none overflow-hidden rounded-3xl ${className}`}
      style={{
        background:
          'radial-gradient(circle at 50% 40%, #134a3e 0%, #0a2a24 45%, #061614 100%)',
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        shadows
        camera={{ position: [0, 2.1, 9.5], fov: 36 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <color attach="background" args={['#0a2a24']} />
        <fog attach="fog" args={['#0a2a24', 9, 18]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 7, 5]} intensity={3.2} color="#fff6e5" castShadow />
        <pointLight position={[-4, 3, 3]} intensity={2.5} color="#5fd4a8" />
        <pointLight position={[4, 2, 4]} intensity={2} color="#ffd89a" />
        <spotLight position={[0, 8, 2]} angle={0.45} penumbra={0.5} intensity={2.5} color="#ffe8b8" />
        <Carousel items={items} textures={textures} onSelect={handleSelect} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
        <span className="rounded-full border border-[#c9a66b]/40 bg-black/40 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-[#e2c08a]/90 backdrop-blur">
          Live 3D
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
        <span className="rounded-full border border-[#c9a66b]/50 bg-black/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e2c08a] backdrop-blur">
          Drag to spin · Click a product
        </span>
      </div>
    </div>
  );
}
