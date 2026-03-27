"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface OracleAvatarProps {
  isSpeaking: boolean;
}

export default function OracleAvatar({ isSpeaking }: OracleAvatarProps) {
  const [sparkles, setSparkles] = useState<{ id: number; left: string; top: string; delay: string }[]>([]);

  useEffect(() => {
    const newSparkles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100 + "%",
      top: Math.random() * 100 + "%",
      delay: Math.random() * 4 + "s",
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center p-10 select-none">
      {/* Queen Aura */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[350px] h-[350px] rounded-full bg-rose blur-[40px] z-10"
        style={{ top: "50%", left: "50%", x: "-50%", y: "-50%" }}
      />

      {/* Voice Rings (Only around mouth area) */}
      <motion.div
        animate={{ opacity: isSpeaking ? 1 : 0 }}
        className="absolute w-[280px] h-[280px] z-30 pointer-events-none"
        style={{ top: "42%", left: "50%", x: "-50%", y: "-50%" }}
      >
        <div className="relative w-full h-full">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={isSpeaking ? { scale: [1, 1.06], opacity: [0.4, 1] } : {}}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "mirror",
                delay: i * 0.12,
              }}
              className="absolute inset-0 rounded-full border border-lavender/15"
              style={{ inset: `-${i * 25}px` }}
            />
          ))}
        </div>
      </motion.div>

      {/* 3D Model Iframe */}
      <div className="relative w-[400px] h-[500px] z-20 overflow-hidden bg-transparent pointer-events-none">
        <motion.iframe
          animate={isSpeaking ? { scale: [1, 1.02, 0.98, 1.01, 1] } : {}}
          transition={{ duration: 0.2, repeat: Infinity }}
          title="Ana De Armas"
          src="https://sketchfab.com/models/7086614b1f3d4ec780f561849e0cc167/embed?autostart=1&preload=1&transparent=1&ui_hint=0&ui_infos=0&ui_stop=0&ui_watermark=0"
          className="w-full h-full border-none drop-shadow-[0_0_30px_rgba(244,63,138,0.4)]"
          allow="autoplay; fullscreen; xr-spatial-tracking"
        />
      </div>

      {/* Celestial Dust / Sparkles */}
      <div className="absolute inset-[-50px] pointer-events-none z-40">
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            initial={{ y: 0, scale: 0, opacity: 0 }}
            animate={{
              y: -100,
              scale: [0, 1.5],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: parseFloat(s.delay),
              ease: "linear",
            }}
            className="absolute w-1 h-1 bg-gold rounded-full blur-[1px]"
            style={{ left: s.left, top: s.top }}
          />
        ))}
      </div>

      {/* Credits Tag */}
      <div className="absolute bottom-[-20px] text-[9px] font-mono text-white/20 hover:text-white/40 transition-colors pointer-events-auto">
        Model: <a href="https://sketchfab.com/3d-models/ana-de-armas-7086614b1f3d4ec780f561849e0cc167" target="_blank" rel="noopener noreferrer">Ana De Armas</a> by 23501a4227
      </div>

      {/* Name Tag */}
      <div className="mt-8 text-center animate-fade-up">
        <h2 className="font-display text-2xl font-bold tracking-widest text-white">NOVA</h2>
        <p className="font-body italic text-sm text-lavender tracking-wider mt-1">Your Result Guide & Oracle</p>
      </div>
    </div>
  );
}
