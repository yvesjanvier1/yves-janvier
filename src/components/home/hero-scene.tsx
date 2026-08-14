import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Icosahedron, Points, PointMaterial, Torus } from "@react-three/drei";
import * as THREE from "three";

/** Reads an HSL design token from CSS and returns a THREE.Color. */
const tokenColor = (token: string, fallback: string) => {
  if (typeof window === "undefined") return new THREE.Color(fallback);
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return raw ? new THREE.Color(`hsl(${raw.split(" ").join(", ")})`) : new THREE.Color(fallback);
};

/** Neural-network style node cloud with connecting synapses. */
const NeuralCore = ({ primary, secondary }: { primary: THREE.Color; secondary: THREE.Color }) => {
  const group = useRef<THREE.Group>(null);

  const { nodes, lineGeometry } = useMemo(() => {
    const count = 90;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      // Fibonacci sphere with slight radial jitter for an organic cluster.
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      const r = 1.75 + Math.random() * 0.5;
      pts.push(new THREE.Vector3(Math.cos(theta) * radius * r, y * r, Math.sin(theta) * radius * r));
    }

    const positions = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => p.toArray(positions, i * 3));

    const segs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < 0.95) {
          segs.push(...pts[i].toArray(), ...pts[j].toArray());
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));

    return { nodes: positions, lineGeometry: geo };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.16;
  });

  return (
    <group ref={group}>
      <Points positions={nodes} stride={3}>
        <PointMaterial
          transparent
          color={primary}
          size={0.07}
          sizeAttenuation
          depthWrite={false}
          opacity={0.95}
        />
      </Points>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color={secondary} transparent opacity={0.22} />
      </lineSegments>
    </group>
  );
};

/** Orbiting geometry representing data pipelines & models. */
const OrbitingShapes = ({ primary, secondary }: { primary: THREE.Color; secondary: THREE.Color }) => {
  const ring = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.z += delta * 0.08;
  });

  return (
    <group>
      <group ref={ring} rotation={[Math.PI / 2.6, 0, 0]}>
        <Torus args={[3.1, 0.012, 12, 160]}>
          <meshBasicMaterial color={primary} transparent opacity={0.5} />
        </Torus>
        <Torus args={[3.9, 0.008, 12, 160]} rotation={[0.5, 0.3, 0]}>
          <meshBasicMaterial color={secondary} transparent opacity={0.35} />
        </Torus>
      </group>

      {[
        { pos: [2.9, 1.2, -0.6], scale: 0.34, color: primary },
        { pos: [-3.1, -0.9, 0.8], scale: 0.26, color: secondary },
        { pos: [1.9, -2.1, 1.2], scale: 0.2, color: secondary },
        { pos: [-2.4, 1.9, -1.1], scale: 0.24, color: primary },
      ].map((s, i) => (
        <Float key={i} speed={1.4} rotationIntensity={1.2} floatIntensity={1.6}>
          <Icosahedron args={[s.scale, 0]} position={s.pos as [number, number, number]}>
            <meshStandardMaterial
              color={s.color}
              wireframe
              emissive={s.color}
              emissiveIntensity={0.6}
            />
          </Icosahedron>
        </Float>
      ))}
    </group>
  );
};

const Scene = () => {
  const primary = useMemo(() => tokenColor("--primary", "#6C4DFF"), []);
  const secondary = useMemo(() => tokenColor("--secondary", "#4A90E2"), []);

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[6, 6, 6]} intensity={40} color={primary} />
      <pointLight position={[-6, -4, 2]} intensity={25} color={secondary} />
      <NeuralCore primary={primary} secondary={secondary} />
      <OrbitingShapes primary={primary} secondary={secondary} />
    </>
  );
};

/** Ambient 3D backdrop for the hero: data nodes, AI synapses and orbiting tech shards. */
const HeroScene = () => {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) return null;

  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
};

export default HeroScene;
