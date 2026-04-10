"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function OracleParticles({ isSpeaking }: { isSpeaking: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  
  // Create a cloud of particles in a sphere-like shape
  const particlesCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 0.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.1;
      pointsRef.current.rotation.z = time * 0.05;
      
      // Animate particles based on speaking state
      const intensity = isSpeaking ? 1.5 : 1.0;
      pointsRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05 * intensity);
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#fb7185"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function CentralCore({ isSpeaking }: { isSpeaking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      const scale = isSpeaking ? 1.2 + Math.sin(time * 10) * 0.1 : 1.0;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#8b5cf6"
          envMapIntensity={0.5}
          clearcoat={0.5}
          clearcoatRoughness={0}
          metalness={0.1}
          distort={0.4}
          speed={isSpeaking ? 5 : 2}
        />
      </Sphere>
    </Float>
  );
}

export default function ThreeAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#fb7185" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />
        <spotLight position={[0, 5, 10]} angle={0.15} penumbra={1} intensity={2} />
        
        <OracleParticles isSpeaking={isSpeaking} />
        <CentralCore isSpeaking={isSpeaking} />
        
        <gridHelper args={[20, 20, 0x1d1d1d, 0x1d1d1d]} position={[0, -3, 0]} />
      </Canvas>
    </div>
  );
}
