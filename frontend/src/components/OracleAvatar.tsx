"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useGraph } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

interface OracleAvatarProps {
  isSpeaking: boolean;
}

// Using a high-quality Ready Player Me realistic female avatar as a placeholder.
// To use a specific "Ana de Armas" hyper-realistic model, you would buy/download a .glb or .gltf
// file from Sketchfab or DAZ3D and place it in your frontend/public folder as '/ana.glb'
// and change this URL to "/ana.glb".
const MODEL_URL = "https://models.readyplayer.me/64b5536e37ec689694e82d1c.glb"; 

function AvatarModel({ isSpeaking }: { isSpeaking: boolean }) {
  const group = useRef<THREE.Group>(null);
  
  // Load the GLTF model
  const { scene, animations } = useGLTF(MODEL_URL);
  const { nodes, materials } = useGraph(scene);
  const { actions } = useAnimations(animations, group);

  // Blink and Speech state
  const [blink, setBlink] = useState(false);

  // Natural Blinking
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const blinkLoop = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
      timeout = setTimeout(blinkLoop, 3000 + Math.random() * 4000);
    };
    timeout = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Animate the Skeleton and Morphs (Head Tracking, Blinking, Speaking)
  useFrame((state) => {
    if (!scene) return;

    // 1. Mouse Tracking for the Head/Neck
    // The cursor position maps from -1 to 1 
    const targetX = (state.pointer.x * Math.PI) / 6; 
    const targetY = (state.pointer.y * Math.PI) / 6;

    const head = scene.getObjectByName("Head") || scene.getObjectByName("mixamorigHead");
    const neck = scene.getObjectByName("Neck") || scene.getObjectByName("mixamorigNeck");

    if (head) {
      // Lerp (smooth move) the head rotation toward mouse
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, -targetX, 0.1);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetY, 0.1);
    }
    if (neck) {
      // Add slight neck rotation for realism
      neck.rotation.y = THREE.MathUtils.lerp(neck.rotation.y, -targetX * 0.5, 0.1);
    }

    // 2. Facial Expressions (Morph Targets)
    scene.traverse((child: any) => {
      if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
        
        // --- BLINKING ---
        const eyeLeftIndex = child.morphTargetDictionary['eyeBlinkLeft'] || child.morphTargetDictionary['blinkLeft'];
        const eyeRightIndex = child.morphTargetDictionary['eyeBlinkRight'] || child.morphTargetDictionary['blinkRight'];
        
        if (eyeLeftIndex !== undefined) {
          child.morphTargetInfluences[eyeLeftIndex] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[eyeLeftIndex], 
            blink ? 1 : 0, 
            0.5
          );
        }
        if (eyeRightIndex !== undefined) {
          child.morphTargetInfluences[eyeRightIndex] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[eyeRightIndex], 
            blink ? 1 : 0, 
            0.5
          );
        }

        // --- LIP SYNC / TALKING ---
        const jawOpenIndex = child.morphTargetDictionary['jawOpen'] || child.morphTargetDictionary['mouthOpen'];
        const mouthSmileIndex = child.morphTargetDictionary['mouthSmile'];

        if (jawOpenIndex !== undefined) {
          // If speaking, bounce the jaw using sine wave; else close it
          const targetJaw = isSpeaking ? Math.abs(Math.sin(state.clock.elapsedTime * 15)) * 0.4 + 0.1 : 0;
          child.morphTargetInfluences[jawOpenIndex] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[jawOpenIndex],
            targetJaw,
            0.2
          );
        }

        if (mouthSmileIndex !== undefined) {
          // Friendly neutral smile
          child.morphTargetInfluences[mouthSmileIndex] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[mouthSmileIndex],
            0.2,
            0.05
          );
        }
      }
    });
  });

  return (
    <primitive 
      ref={group}
      object={scene} 
      // Adjust position to frame torso/head
      position={[0, -1.6, 2]} 
      scale={2.2} 
    />
  );
}

// Preload the GLTF file to avoid pop-in
useGLTF.preload(MODEL_URL);

export default function OracleAvatar({ isSpeaking }: OracleAvatarProps) {
  return (
    <div className="relative flex flex-col items-center justify-center select-none w-[400px] h-[500px]">
      
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-10 rounded-[40px] overflow-hidden drop-shadow-2xl">
        {/* We use React Three Fiber Canvas to render WebGL */}
        <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }}>
          {/* Cinematic Lighting Setup */}
          <ambientLight intensity={0.4} />
          <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={1.5} castShadow />
          
          {/* Edge lighting (Pink and Purple) matching Nova branding */}
          <directionalLight position={[-5, 2, -2]} intensity={2.5} color="#f43f8a" />
          <directionalLight position={[5, 2, -2]} intensity={2.5} color="#7c3aed" />

          {/* HDR Environment Map for realistic skin/eye reflections */}
          <Environment preset="city" />

          {/* The Actual Digital Human Model */}
          <AvatarModel isSpeaking={isSpeaking} />

          {/* Adds realistic shadow underneath the character */}
          <ContactShadows position={[0, -1.6, 0]} opacity={0.5} scale={5} blur={2.5} far={4} color="#1a0a2e" />
        </Canvas>
      </div>

      {/* Background Aura Glow Layer */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 bottom-10 top-10 bg-gradient-to-t from-violet via-rose to-transparent blur-[80px] -z-10 rounded-full"
      />

      {/* UI Name Tag Overlay */}
      <div className="absolute -bottom-16 text-center z-20 w-full">
        <h2 className="text-3xl font-display font-medium tracking-[0.2em] text-white">NOVA</h2>
        <p className="text-[11px] font-mono text-rose/80 tracking-widest uppercase mt-2">The Digital Oracle</p>
      </div>
    </div>
  );
}
