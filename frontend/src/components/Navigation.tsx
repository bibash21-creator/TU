"use client";

import { motion } from "framer-motion";
import { Search, Bell, Info, Shield, Github } from "lucide-react";

interface NavigationProps {
  onAdminClick: () => void;
  activeTab: string;
}

export default function Navigation({ onAdminClick, activeTab }: NavigationProps) {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass rounded-full px-6 py-3 border border-white/10 shadow-3xl flex items-center gap-6 md:gap-8"
      >
        <NavButton icon={<Search className="w-4 h-4" />} label="Probe" active={activeTab === "probe"} />
        
        <div className="w-px h-4 bg-white/20" />

        <NavButton icon={<Shield className="w-4 h-4" />} label="System" onClick={onAdminClick} />
        <a href="https://github.com/bibash21-creator/Result-Query-Tool" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/50 hover:text-white transition-all">
           <Github className="w-4 h-4" />
           <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Git</span>
        </a>
      </motion.div>
    </nav>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-2 transition-all ${active ? "text-rose" : "text-white/50 hover:text-white"}`}
    >
      <div className={`${active ? "drop-shadow-[0_0_8px_#f43f8a]" : ""}`}>
        {icon}
      </div>
      <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
        {label}
      </span>
      {active && (
        <motion.div layoutId="nav-dot" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose" />
      )}
    </button>
  );
}
