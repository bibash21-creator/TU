"use client";

import Spline from "@splinetool/react-spline";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, Suspense } from "react";
import { Sparkles, Activity, ShieldCheck, Zap } from "lucide-react";

interface OracleAvatarProps {
  isSpeaking: boolean;
}

export default function OracleAvatar({ isSpeaking }: OracleAvatarProps) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center select-none perspective-1000">
      
      {/* 🔮 THE SPLINE 3D ORACLE (Interactive Cinematic Goddess) */}
      <Suspense fallback={<div className="text-white/20 font-mono text-xs animate-pulse">Establishing Nexus Link...</div>}>
         <div className="relative w-full h-full transform-gpu transition-all duration-1000 scale-110 md:scale-125">
            <Spline 
              scene="https://prod.spline.design/T-A6r96gE09EIkJm/scene.splinecode" 
              onLoad={() => setLoading(false)}
              className="w-full h-full drop-shadow-[0_0_50px_rgba(244,63,138,0.3)]"
            />
         </div>
      </Suspense>

      {/* 💠 FLOATING HUD ELEMENTS (Glassmorphic) */}
      <AnimatePresence>
        {!loading && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            
            {/* Status Radar */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-20 left-10 glass p-5 rounded-3xl border border-white/5 space-y-3 shadow-2xl"
            >
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-rose animate-pulse" />
                 <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Oracle Core</span>
              </div>
              <div className="space-y-1">
                 <div className="h-0.5 w-24 bg-white/5 overflow-hidden">
                    <motion.div 
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-full w-20 bg-rose shadow-[0_0_10px_#f43f8a]"
                    />
                 </div>
                 <div className="h-0.5 w-16 bg-white/5 overflow-hidden">
                    <motion.div 
                      animate={{ x: [100, -100] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                      className="h-full w-12 bg-violet shadow-[0_0_10px_#7c3aed]"
                    />
                 </div>
              </div>
            </motion.div>

            {/* Neural Activity Log */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-20 right-10 glass p-6 rounded-3xl border border-white/5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                 <Zap className="w-3 h-3 text-rose" />
                 <span className="text-[10px] font-mono text-white/60 tracking-widest uppercase">Nexus Sync: 99.4%</span>
              </div>
              <div className="flex gap-1.5 h-6 items-end">
                 {[0.4, 0.8, 0.5, 1, 0.6, 0.3, 0.9, 0.7].map((h, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: [`${h * 100}%`, `${(1-h) * 100}%`, `${h * 100}%`] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1.5 bg-gradient-to-t from-violet to-rose rounded-t-sm opacity-40"
                    />
                 ))}
              </div>
            </motion.div>

            {/* Speaking Aura Ring */}
            {isSpeaking && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <motion.div 
                   animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                   transition={{ duration: 1, repeat: Infinity }}
                   className="w-[300px] h-[300px] rounded-full border border-rose/30 shadow-[0_0_100px_rgba(244,63,138,0.2)]"
                 />
                 <motion.div 
                   animate={{ scale: [1.2, 1.8], opacity: [0.3, 0] }}
                   transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                   className="absolute w-[300px] h-[300px] rounded-full border border-violet/20"
                 />
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* 🌠 BACKGROUND AMBIENCE */}
      <div className="absolute inset-0 -z-10 bg-gradient-radial from-rose/5 via-transparent to-transparent opacity-20" />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute w-[800px] h-[800px] bg-violet/10 blur-[150px] rounded-full -z-20"
      />

    </div>
  );
}
