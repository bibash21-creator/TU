"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface OracleAvatarProps {
  isSpeaking: boolean;
}

/**
 * Phoneme-based mouth shapes for realistic speech animation.
 */
const MOUTH_SHAPES = {
  idle: "M 148 212 Q 168 218 188 212",
  speaking_a: "M 144 210 Q 168 238 192 210", // Open Wide
  speaking_o: "M 152 210 Q 168 232 184 210", // Round
  speaking_e: "M 144 212 Q 168 225 192 212", // Wide Smile
  speaking_u: "M 158 210 Q 168 222 178 210", // Pucker
  speaking_m: "M 150 213 Q 168 215 186 213", // Closed
};

type MouthShape = keyof typeof MOUTH_SHAPES;

export default function OracleAvatar({ isSpeaking }: OracleAvatarProps) {
  // --- Animation Controllers ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for natural lag-behind movement (3D effect)
  const springConfig = { damping: 30, stiffness: 200, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Head Rotations
  const rotateX = useTransform(smoothY, [-300, 300], [10, -10]);
  const rotateY = useTransform(smoothX, [-300, 300], [-15, 15]);

  // Feature Shifts (Eyes/Nose/Mouth shift for parallax)
  const eyeShiftX = useTransform(smoothX, [-500, 500], [-4, 4]);
  const eyeShiftY = useTransform(smoothY, [-500, 500], [-2, 2]);

  // --- Local States ---
  const [blink, setBlink] = useState(false);
  const [mouthShape, setMouthShape] = useState<MouthShape>("idle");
  const [hairPulse, setHairPulse] = useState(0);
  const mouthCycleRef = useRef<NodeJS.Timeout | null>(null);

  // Track Mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Natural Blinking Logic
  useEffect(() => {
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
      setTimeout(triggerBlink, 3000 + Math.random() * 4000);
    };
    const timeout = setTimeout(triggerBlink, 2000);
    return () => clearTimeout(timeout);
  }, []);

  // Hair Animation Loop
  useEffect(() => {
    const interval = setInterval(() => setHairPulse((p) => p + 0.05), 50);
    return () => clearInterval(interval);
  }, []);

  // Speech Lip-Sync Logic
  useEffect(() => {
    const speechShapes: MouthShape[] = ["speaking_a", "speaking_o", "speaking_e", "speaking_u", "speaking_m"];
    if (isSpeaking) {
      let i = 0;
      mouthCycleRef.current = setInterval(() => {
        setMouthShape(speechShapes[i % speechShapes.length]);
        i++;
      }, 100);
    } else {
      if (mouthCycleRef.current) clearInterval(mouthCycleRef.current);
      setMouthShape("idle");
    }
  }, [isSpeaking]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ perspective: "1000px" }}>

      {/* 3D Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          width: 380,
          height: 500,
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {/* Background Aura */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-radial from-rose/30 to-transparent blur-[80px] -z-10"
        />

        <svg viewBox="0 0 336 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-2xl">
          <defs>
            {/* Premium Skin Textures */}
            <radialGradient id="skinBase" cx="50%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#F8D4B4" />
              <stop offset="70%" stopColor="#E59E7A" />
              <stop offset="100%" stopColor="#C67C52" />
            </radialGradient>

            {/* Luscious Ana-Inspired Brunette Hair */}
            <linearGradient id="hairFlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2D1B14" />
              <stop offset="50%" stopColor="#3E261B" />
              <stop offset="100%" stopColor="#1A0F0A" />
            </linearGradient>

            <linearGradient id="lipTint" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D96E8A" />
              <stop offset="100%" stopColor="#B03E5C" />
            </linearGradient>

            {/* Hazel Eye Depth */}
            <radialGradient id="hazelEye" cx="45%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#8EAD67" />
              <stop offset="60%" stopColor="#5F7D3E" />
              <stop offset="100%" stopColor="#2D3B1C" />
            </radialGradient>
          </defs>

          {/* ── BACK HAIR (Depth) ── */}
          <motion.path
            d="M 60 180 Q 40 300 80 440"
            stroke="url(#hairFlow)" strokeWidth="45" strokeLinecap="round"
            style={{ x: useTransform(smoothX, [-500, 500], [5, -5]) }}
          />
          <motion.path
            d="M 276 180 Q 296 300 256 440"
            stroke="url(#hairFlow)" strokeWidth="45" strokeLinecap="round"
            style={{ x: useTransform(smoothX, [-500, 500], [-5, 5]) }}
          />

          {/* ── FACE BASE ── */}
          <ellipse cx="168" cy="185" rx="88" ry="105" fill="url(#skinBase)" />

          {/* ── EYES (Follow Cursor) ── */}
          <motion.g style={{ x: eyeShiftX, y: eyeShiftY }}>
            {/* Eyes White */}
            <ellipse cx="135" cy="165" rx="20" ry={blink ? 1 : 12} fill="white" />
            <ellipse cx="201" cy="165" rx="20" ry={blink ? 1 : 12} fill="white" />

            {!blink && (
              <>
                {/* Irises */}
                <circle cx="135" cy="165" r="11" fill="url(#hazelEye)" />
                <circle cx="201" cy="165" r="11" fill="url(#hazelEye)" />
                {/* Pupils */}
                <circle cx="135" cy="165" r="5" fill="#1A1A1A" />
                <circle cx="201" cy="165" r="5" fill="#1A1A1A" />
                {/* High-End Reflections */}
                <circle cx="131" cy="162" r="3" fill="white" fillOpacity="0.8" />
                <circle cx="197" cy="162" r="3" fill="white" fillOpacity="0.8" />
              </>
            )}
          </motion.g>

          {/* ── EYEBROWS (Expressive) ── */}
          <motion.path
            d="M 115 145 Q 135 138 153 145"
            stroke="#3E261B" strokeWidth="4" strokeLinecap="round"
            animate={{ y: isSpeaking ? -2 : 0 }}
          />
          <motion.path
            d="M 183 145 Q 201 138 221 145"
            stroke="#3E261B" strokeWidth="4" strokeLinecap="round"
            animate={{ y: isSpeaking ? -2 : 0 }}
          />

          {/* ── NOSE ── */}
          <path d="M 168 180 Q 163 205 158 208 Q 168 212 178 208 Q 173 205 168 180" fill="#B07A54" fillOpacity="0.3" />

          {/* ── MOUTH (Talking) ── */}
          <motion.path
            d="M 148 225 Q 168 228 188 225" // Shadow under mouth
            stroke="#8C4D33" strokeOpacity="0.1" strokeWidth="3" fill="none"
          />
          <motion.path
            d={MOUTH_SHAPES[mouthShape]}
            stroke="url(#lipTint)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            animate={{ d: MOUTH_SHAPES[mouthShape] }}
            transition={{ type: "spring", damping: 10, stiffness: 200 }}
          />

          {/* ── FRONT HAIR (Framing) ── */}
          <motion.g style={{ y: Math.sin(hairPulse) * 2 }}>
            <path d="M 82 140 Q 90 90 168 85 Q 246 90 254 140" fill="url(#hairFlow)" />
            <path d="M 82 140 Q 55 200 65 280" stroke="url(#hairFlow)" strokeWidth="35" strokeLinecap="round" fill="none" />
            <path d="M 254 140 Q 281 200 271 280" stroke="url(#hairFlow)" strokeWidth="35" strokeLinecap="round" fill="none" />
          </motion.g>
        </svg>
      </motion.div>

      {/* Identity Label */}
      <div className="mt-8 text-center">
        <h2 className="text-3xl font-display font-medium tracking-[0.2em] text-white">NOVA</h2>
        <p className="text-sm font-mono text-rose/60 tracking-widest uppercase mt-2">The Oracle Aspect</p>
      </div>
    </div>
  );
}
