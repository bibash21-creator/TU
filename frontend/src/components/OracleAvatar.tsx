"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

interface OracleAvatarProps {
  isSpeaking: boolean;
}

export default function OracleAvatar({ isSpeaking }: OracleAvatarProps) {
  const [blink, setBlink] = useState(false);
  
  // Animation controllers for parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for natural feeling
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  // Transform mouse movement to parallax shifts
  const portraitX = useTransform(mouseX, [-500, 500], [-15, 15]);
  const portraitY = useTransform(mouseY, [-500, 500], [-10, 10]);
  const bgX = useTransform(mouseX, [-500, 500], [10, -10]);
  const bgY = useTransform(mouseY, [-500, 500], [5, -5]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      x.set(clientX - innerWidth / 2);
      y.set(clientY - innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  // Natural Blinking
  useEffect(() => {
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
      setTimeout(triggerBlink, 3000 + Math.random() * 4000);
    };
    const timer = setTimeout(triggerBlink, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-[360px] h-[480px] rounded-[48px] overflow-hidden group select-none shadow-2xl">
      {/* Background Layer with Parallax */}
      <motion.div 
        style={{ x: bgX, y: bgY, scale: 1.1 }}
        className="absolute inset-0 bg-[#02020a]"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-violet/20 via-rose/10 to-transparent" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-rose/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-violet/10 blur-[120px] rounded-full" />
      </motion.div>

      {/* Main Portrait with Parallax and Breathing */}
      <motion.div
        style={{ x: portraitX, y: portraitY }}
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full"
      >
        <Image 
          src="/oracle.png" 
          alt="Nova Oracle"
          fill
          className="object-cover object-center"
          priority
        />
        
        {/* Blinking Overlay (Fake) */}
        <motion.div 
          animate={{ opacity: blink ? 1 : 0 }}
          className="absolute inset-0 bg-black pointer-events-none z-20"
          style={{ 
            clipPath: 'inset(33% 30% 64% 30%)', // Rough position of eyes
            filter: 'blur(2px)'
          }}
        />

        {/* Ethereal Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#02020a] via-transparent to-transparent opacity-60" />
      </motion.div>

      {/* Voice Ripple (Active only when speaking) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        {isSpeaking && (
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-32 h-32 rounded-full border border-rose/50"
            />
            <motion.div 
              animate={{ scale: [1, 2], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="absolute inset-0 w-32 h-32 rounded-full border border-violet/30"
            />
          </div>
        )}
      </div>

      {/* UI Elements Overlay */}
      <div className="absolute bottom-10 left-0 right-0 text-center z-40 bg-gradient-to-t from-black/80 to-transparent pt-10 pb-4">
        <motion.h2 
          animate={{ opacity: isSpeaking ? [0.6, 1, 0.6] : 1 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-display text-2xl font-bold tracking-[0.3em] text-white"
        >
          NOVA
        </motion.h2>
        <p className="font-mono text-[10px] text-rose/60 uppercase tracking-[0.4em] mt-1">Oracle Aspect</p>
      </div>

      {/* Speaking Status Pulse */}
      {isSpeaking && (
        <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1 bg-rose/20 backdrop-blur-md rounded-full border border-rose/30 z-50">
          <div className="w-1.5 h-1.5 rounded-full bg-rose animate-pulse" />
          <span className="font-mono text-[9px] text-rose uppercase tracking-widest font-bold">Transmitting</span>
        </div>
      )}
    </div>
  );
}
