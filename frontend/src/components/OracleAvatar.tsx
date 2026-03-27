"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Sparkles, Activity, ShieldCheck, Zap, Bell, Monitor } from "lucide-react";

interface OracleAvatarProps {
  isSpeaking: boolean;
}

export default function OracleAvatar({ isSpeaking }: OracleAvatarProps) {
  const [blink, setBlink] = useState(false);
  
  // Parallax controllers
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Ultra-smooth spring physics
  const springX = useSpring(mouseX, { damping: 40, stiffness: 120 });
  const springY = useSpring(mouseY, { damping: 40, stiffness: 120 });

  // Parallax transformations - Creating true depth
  const portraitX = useTransform(springX, [-500, 500], [-10, 10]);
  const portraitY = useTransform(springY, [-500, 500], [-8, 8]);
  const eyeX = useTransform(springX, [-500, 500], [-2, 2]); // Eyes move less than head
  const eyeY = useTransform(springY, [-500, 500], [-1, 1]);
  const hudX = useTransform(springX, [-500, 500], [20, -20]); // HUD moves in opposite direction
  const hudY = useTransform(springY, [-500, 500], [15, -15]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  // Natural Blinking
  useEffect(() => {
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
      setTimeout(triggerBlink, 2500 + Math.random() * 4000);
    };
    const t = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center select-none perspective-1000">
      
      {/* 🔮 THE ORACLE PORTAL (Living Digital Human) */}
      <motion.div 
        style={{ x: portraitX, y: portraitY, rotateX: useTransform(springY, [-500, 500], [2, -2]), rotateY: useTransform(springX, [-500, 500], [-3, 3]) }}
        className="relative w-[340px] h-[460px] rounded-[64px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10 group"
      >
        {/* Main AI Human Portrait */}
        <Image 
          src="/oracle.png" 
          alt="Nova Oracle"
          fill
          className="object-cover scale-105 group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] contrast-[1.1]"
        />

        {/* Dynamic Eye Interaction (Follows Cursor) */}
        <motion.div 
          style={{ x: eyeX, y: eyeY }}
          className="absolute inset-x-[35%] top-[28%] bottom-[58%] pointer-events-none z-10 opacity-30"
        >
           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-rose/40 rounded-full blur-md" />
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-rose/40 rounded-full blur-md" />
        </motion.div>

        {/* Natural Blinking Mask */}
        <motion.div 
          animate={{ opacity: blink ? 1 : 0 }}
          className="absolute inset-0 bg-black pointer-events-none z-20"
          style={{ clipPath: 'inset(33% 30% 64% 30%)', filter: 'blur(3px)' }}
        />

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02020a] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tr from-violet/20 via-transparent to-rose/10" />

        {/* Breathing Animation */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-white"
        />
      </motion.div>

      {/* 💠 FLOATING HUD ELEMENTS (Opposing Parallax) */}
      <motion.div style={{ x: hudX, y: hudY }} className="absolute inset-0 z-20 pointer-events-none">
        
        {/* Neural Activity Console */}
        <div className="absolute top-10 left-0 glass p-5 rounded-3xl border border-white/5 space-y-4 shadow-2xl backdrop-blur-2xl">
           <div className="flex items-center gap-3">
              <Activity className="w-3 h-3 text-rose animate-pulse" />
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.2em]">Neural Nexus</span>
           </div>
           <div className="space-y-1.5 pt-1">
              {[0.7, 0.4, 0.9].map((w, i) => (
                <div key={i} className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     animate={{ x: ['-100%', '100%'] }}
                     transition={{ duration: 2 + i, repeat: Infinity, ease: "linear" }}
                     className="h-full w-full bg-gradient-to-r from-transparent via-rose to-transparent opacity-60"
                   />
                </div>
              ))}
           </div>
        </div>

        {/* Security Certificate */}
        <div className="absolute bottom-10 right-0 glass px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4 shadow-2xl">
           <ShieldCheck className="w-5 h-5 text-emerald-400" />
           <div className="text-left">
              <p className="text-[10px] text-white font-bold leading-none">SECURE ORACLE</p>
              <p className="text-[8px] text-white/20 font-mono mt-1">VERIFIED NEXUS COMPLIANT</p>
           </div>
        </div>

        {/* Floating Data Nodes */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-10 glass p-3 rounded-2xl border border-white/10"
        >
           <Zap className="w-3 h-3 text-violet" />
        </motion.div>
      </motion.div>

      {/* 🚀 SPEAKING TRANSMISSION */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
           <motion.div 
             animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
             transition={{ duration: 1, repeat: Infinity }}
             className="w-[400px] h-[400px] border border-rose/10 rounded-[100px] rotate-45"
           />
           <motion.div 
             animate={{ scale: [1, 2.2], opacity: [0.2, 0] }}
             transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
             className="absolute w-[400px] h-[400px] border border-violet/10 rounded-[100px] -rotate-45"
           />
        </div>
      )}

      {/* Name Label */}
      <div className="absolute -bottom-10 text-center w-full">
        <h2 className="text-3xl font-display font-medium tracking-[0.2em] text-white">NOVA</h2>
        <p className="text-[10px] font-mono text-rose/60 tracking-widest uppercase mt-2">Core Witness Engine</p>
      </div>

    </div>
  );
}
