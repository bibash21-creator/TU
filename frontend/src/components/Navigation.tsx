"use client";

import { motion } from "framer-motion";
import { Search, Bell, Info, Shield, Github } from "lucide-react";

interface NavigationProps {
  onAdminClick: () => void;
  activeTab: string;
}

export default function Navigation({ onAdminClick, activeTab }: NavigationProps) {
  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass rounded-[32px] px-8 py-4 border border-white/5 shadow-3xl flex items-center gap-12"
      >
        <NavButton icon={<Search className="w-5 h-5" />} label="Probe" active={activeTab === "probe"} />
        <NavButton icon={<Bell className="w-5 h-5" />} label="Alerts" active={activeTab === "alerts"} />
        
        <div className="w-px h-6 bg-white/10" />

        <NavButton icon={<Shield className="w-5 h-5" />} label="System" onClick={onAdminClick} />
        <a href="https://github.com/bibash21-creator/Result-Query-Tool" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white transition-all">
           <Github className="w-5 h-5" />
           <span className="text-[8px] font-mono uppercase tracking-widest">Git</span>
        </a>
      </motion.div>
    </nav>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all group ${active ? "text-rose scale-110" : "text-white/40 hover:text-white"}`}
    >
      <div className={`${active ? "shadow-[0_0_15px_#f43f8a]" : ""}`}>
        {icon}
      </div>
      <span className="text-[8px] font-mono uppercase tracking-widest font-black opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
      {active && (
        <motion.div layoutId="nav-dot" className="w-1 h-1 rounded-full bg-rose mt-1" />
      )}
    </button>
  );
}
