"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Sparkles, Sun, Moon, ArrowRight, Activity, Terminal, ShieldCheck } from "lucide-react";
import OracleAvatar from "@/components/OracleAvatar";
import AdminOverlay from "@/components/AdminOverlay";
import { api } from "@/lib/api";

export default function Home() {
  const [roll, setRoll] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [status, setStatus] = useState("Status: Nexus Synchronized");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lastResult, setLastResult] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const speakNova = async (text: string, lang = "en") => {
    if (audioRef.current) audioRef.current.pause();
    const url = api.getVoiceUrl(text, lang);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onplay = () => setIsSpeaking(true);
    audio.onended = () => setIsSpeaking(false);
    audio.play();
  };

  const askNova = async () => {
    if (!roll) return;
    setIsTyping(true);
    setStatus("Scanning Digital Akashic...");
    setLastResult(null); 
    try {
      const data = await api.get(`/query/${encodeURIComponent(roll)}`);
      setIsTyping(false);
      if (data.status === "error") {
        setLastResult(null);
        setStatus("Query Expired");
        speakNova(data.message, currentLang);
      } else {
        setLastResult(data);
        const msgText = currentLang === "np" ? data.message_np : data.message_en;
        speakNova(msgText, currentLang);
        setStatus(data.status === "Not Found" ? "Memory Pointer Null" : "Access Granted ✦");
      }
    } catch (e: any) {
      setIsTyping(false);
      setStatus("Nexus Link Failed");
    }
  };

  return (
    <main className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] transition-all duration-700 font-body flex flex-col items-center justify-center p-6 md:p-12 overflow-x-hidden">
      {/* Background Blobs (Premium Design) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="blob w-[500px] h-[500px] bg-rose -top-40 -left-40 animate-[blob-drift_12s_infinite]" />
        <div className="blob w-[600px] h-[600px] bg-violet bottom-0 right-0 opacity-10 animate-[blob-drift_18s_-3s_infinite]" />
      </div>

      {/* High-Concept Header */}
      <header className="fixed top-0 left-0 right-0 p-8 flex items-center justify-between z-50 max-w-[1500px] mx-auto w-full">
        <div className="font-display text-sm md:text-base tracking-[0.4em] text-[var(--accent)] uppercase flex items-center gap-3">
          <Sparkles className="w-5 h-5" /> Nova <span className="opacity-40">Oracle</span>
        </div>
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
            className="p-3 glass rounded-full hover:scale-110 active:rotate-12 transition-all shadow-xl text-[var(--text)] border-[var(--border)]"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsAdminOpen(true)} className="font-mono text-[11px] tracking-[0.4em] uppercase text-[var(--sub)] hover:text-[var(--text)] flex items-center gap-2 transition-all">
            <LogIn className="w-4 h-4" /> System Control
          </button>
        </div>
      </header>

      <AdminOverlay isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      {/* Main Grid: Side-by-Side Model and Interface */}
      <div className="relative z-10 w-full max-w-[1300px] grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
        
        {/* Left Aspect: The Oracle Avatar */}
        <section className="flex flex-col items-center justify-center space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <div className="relative">
              <div className={`absolute -inset-16 rounded-full blur-[80px] transition-all duration-2000 ${isSpeaking ? "bg-rose opacity-20 scale-110" : "bg-violet opacity-5 shadow-inner"}`} />
              <OracleAvatar isSpeaking={isSpeaking} />
           </div>
           <div className="glass rounded-full px-5 py-2 flex items-center gap-3 border-[var(--border)] transition-all">
              <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? "bg-rose animate-pulse" : "bg-[var(--sub)] opacity-20"}`} />
              <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-[var(--sub)]">{status}</span>
           </div>
        </section>

        {/* Right Aspect: Result Search & Discovery */}
        <section className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="space-y-4">
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
               Witness your <br/>
               <em className="italic bg-gradient-to-r from-rose via-violet to-lavender bg-clip-text text-transparent not-italic font-medium">Academic Destiny.</em>
             </h1>
          </div>

          {/* Search Engine Hub */}
          <div className="space-y-10">
            <div className="relative group w-full">
              <div className="absolute -inset-2 bg-gradient-to-r from-rose via-violet to-lavender rounded-[34px] opacity-10 group-focus-within:opacity-40 transition-opacity blur-3xl" />
              <div className="relative flex glass rounded-[32px] p-2.5 focus-within:ring-2 focus-within:ring-rose/30 transition-all shadow-2xl border-[var(--border)]">
                <input 
                  type="text"
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askNova()}
                  placeholder="PROBE SYMBOL ID..."
                  className="flex-1 bg-transparent px-8 py-5 font-mono text-xl md:text-2xl tracking-[0.4em] outline-none text-[var(--text)] placeholder:text-[var(--sub)]/10 uppercase"
                />
                <button 
                  onClick={askNova}
                  disabled={isTyping}
                  className="bg-gradient-to-r from-rose to-violet px-10 md:px-14 py-5 rounded-[22px] font-display text-[12px] font-black tracking-widest uppercase hover:shadow-2xl active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(244,63,138,0.2)]"
                >
                  {isTyping ? "..." : "Reveal"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-6">
               <div className="flex gap-2.5">
                  {["en", "np"].map(l => (
                    <button
                      key={l}
                      onClick={() => setCurrentLang(l)}
                      className={`text-[11px] font-mono px-6 py-2 rounded-xl border transition-all uppercase tracking-widest ${
                        currentLang === l ? "border-[var(--accent)]/50 text-[var(--accent)] bg-[var(--accent)]/5 shadow-inner" : "border-[var(--border)] text-[var(--sub)] hover:text-[var(--text)]"
                      }`}
                    >
                      {l === "np" ? "नेपाली" : "English"}
                    </button>
                  ))}
               </div>
               <div className="flex items-center gap-4 opacity-70">
                 <span className="text-[10px] font-mono text-[var(--sub)] uppercase tracking-widest">Pointer:</span>
                 <button onClick={() => setRoll("80020003")} className="text-[11px] font-mono text-[var(--accent)] hover:text-[var(--text)] transition-all font-bold underline underline-offset-8 decoration-white/5">80020003</button>
               </div>
            </div>
          </div>

          {/* Dynamic Result Revelation */}
          <AnimatePresence mode="wait">
            {lastResult && (
              <motion.div 
                key={lastResult.roll_number}
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`w-full glass rounded-[54px] p-10 md:p-14 border-t-[3.5px] shadow-[0_45px_100px_rgba(0,0,0,0.3)] ${lastResult.status === "Passed" ? "border-t-emerald-400/50" : "border-t-rose/50"}`}
              >
                <div className="flex flex-col gap-10">
                   <div className="flex items-center justify-between">
                     <div className={`px-10 py-3 rounded-full text-[11px] font-black tracking-[0.5em] uppercase shadow-lg ${lastResult.status === "Passed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose/10 text-rose border border-rose/20"}`}>
                       Result {lastResult.status}
                     </div>
                     <ShieldCheck className={`w-6 h-6 ${lastResult.status === "Passed" ? "text-emerald-400" : "text-rose"} opacity-30`} />
                   </div>
                   
                   <div className="space-y-5">
                     <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight text-[var(--text)] uppercase leading-[1.1]">
                       {lastResult.semester}
                     </h2>
                     <div className="flex items-center gap-6">
                       <span className="h-px bg-[var(--border)] flex-1" />
                       <p className="font-mono text-[14px] md:text-[15px] uppercase tracking-[0.4em] text-[var(--accent)] font-black">
                         {lastResult.year}
                       </p>
                       <span className="h-px bg-[var(--border)] flex-1 opacity-20" />
                     </div>
                   </div>

                   <div className="flex flex-col gap-4 border-l-2 border-[var(--border)] pl-10 ml-2">
                      <p className="text-[11px] font-mono text-[var(--sub)] uppercase tracking-widest italic opacity-40">Identity Witnessed</p>
                      <p className="text-3xl font-mono text-[var(--text)] tracking-[0.4em] font-medium">{lastResult.roll_number}</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Concept Low-Profile Footer */}
      <footer className="fixed bottom-12 flex flex-col items-center gap-5 opacity-30 text-[10px] font-mono tracking-[0.3em] uppercase text-[var(--sub)]">
        <div className="flex items-center gap-10 border-b border-[var(--border)] pb-4">
           <span>Digital Synthesis ✦ 2.9</span>
           <Activity className="w-3 h-3 text-rose animate-pulse" />
           <span>TU Result Grid</span>
        </div>
        <div className="flex items-center gap-3 opacity-60">
           <Terminal className="w-3 h-3" /> Ethereal Console: Active
        </div>
      </footer>
    </main>
  );
}
