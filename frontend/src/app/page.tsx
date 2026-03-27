"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Sun, Moon, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import OracleAvatar from "@/components/OracleAvatar";
import AdminOverlay from "@/components/AdminOverlay";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";
import Navigation from "@/components/Navigation";

export default function Home() {
  const [roll, setRoll] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
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
    setLastResult(null); 
    try {
      const data = await api.get(`/query/${encodeURIComponent(roll)}`);
      setIsTyping(false);
      if (data.status === "Not Found") {
        setLastResult(null);
        speakNova(data.message_en, currentLang);
        toast.info("Roll number not yet witnessed by the Oracle.");
      } else if (data.status === "error") {
        toast.error("Nexus sequence interrupted.");
      } else {
        setLastResult(data);
        const msgText = currentLang === "np" ? data.message_np : data.message_en;
        speakNova(msgText, currentLang);
        toast.success("Destiny Revealed ✨");
      }
    } catch (e: any) {
      setIsTyping(false);
      toast.error("Network interface offline.");
    }
  };

  return (
    <main className="relative min-h-screen w-screen bg-[var(--bg)] text-[var(--text)] transition-all duration-700 font-body flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar pb-32">
      <div className="bg-pattern" />
      <Toaster position="top-center" richColors theme={theme} />
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="blob w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-rose -top-20 -left-20 animate-[blob-drift_12s_infinite]" />
        <div className="blob w-[400px] h-[400px] md:w-[500px] md:h-[500px] bg-violet bottom-0 right-0 opacity-10 animate-[blob-drift_18s_-3s_infinite]" />
      </div>

      {/* Simplified Branding */}
      <header className="fixed top-6 left-6 md:left-8 z-50">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose to-violet flex items-center justify-center shadow-lg transform hover:scale-110 active:rotate-12 transition-all cursor-pointer">
              <Sparkles className="w-4 h-4 text-white" />
           </div>
           <div className="text-left hidden sm:block">
              <h1 className="text-[10px] font-black tracking-[0.4em] uppercase text-white leading-none">NOVA</h1>
              <p className="text-[7px] font-mono text-white/30 tracking-widest uppercase mt-1">Witness Engine 3.2</p>
           </div>
        </div>
      </header>
      
      <button 
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
        className="fixed top-6 right-6 md:right-8 p-2.5 glass rounded-full hover:scale-110 transition-all z-50 text-[var(--sub)] hover:text-white"
      >
        {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </button>

      <Navigation 
        onAdminClick={() => setIsAdminOpen(true)} 
        activeTab="probe" 
      />

      <AdminOverlay isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      {/* Workspace: Responsive, Centered */}
      <div className="relative z-10 w-full max-w-[1240px] flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-24 animate-in fade-in zoom-in duration-700 px-4 mt-16 md:mt-0">
        
        {/* Left Side: Oracle Avatar */}
        <section className="relative scale-90 md:scale-95 lg:scale-100 transition-all w-full max-w-[350px] md:max-w-none flex justify-center">
           <div className={`absolute inset-[-20%] rounded-full blur-[80px] transition-all duration-[3000ms] ${isSpeaking ? "bg-rose/20 opacity-30 scale-110" : "bg-violet/10 opacity-10"}`} />
           <OracleAvatar isSpeaking={isSpeaking} />
        </section>

        {/* Right Side: Interactions */}
        <section className="w-full max-w-[500px] space-y-8 z-10">
          
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium tracking-tight text-white/90 leading-tight">
               Witness your <br className="hidden lg:block"/>
               <em className="bg-gradient-to-r from-rose via-violet to-lavender bg-clip-text text-transparent italic not-italic font-black">Academic Fate.</em>
            </h2>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-rose/20 via-violet/20 to-transparent rounded-[32px] opacity-0 group-focus-within:opacity-100 transition-opacity blur-2xl" />
              <div className="relative flex glass rounded-[28px] p-1.5 focus-within:ring-2 focus-within:ring-rose/40 transition-all border border-white/5">
                <input 
                  type="text"
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askNova()}
                  placeholder="SYMBOL ID..."
                  className="flex-1 bg-transparent px-4 md:px-6 py-3 md:py-4 font-mono text-base md:text-xl tracking-[0.3em] md:tracking-[0.4em] outline-none text-white placeholder:text-white/10 uppercase w-full"
                />
                <button 
                  onClick={askNova}
                  disabled={isTyping}
                  className="bg-[var(--text)] text-[var(--bg)] px-6 md:px-10 py-3 md:py-4 rounded-[22px] font-black text-[10px] md:text-[11px] tracking-widest uppercase hover:bg-rose hover:text-white active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 flex-shrink-0"
                >
                  {isTyping ? "SCAN" : "REVEAL"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-3">
                {["en", "np"].map(l => (
                  <button
                    key={l}
                    onClick={() => setCurrentLang(l)}
                    className={`text-[8px] font-mono px-4 py-1.5 rounded-lg border transition-all uppercase tracking-[0.2em] ${
                      currentLang === l ? "border-rose/50 bg-rose/10 text-rose" : "border-white/5 text-[var(--sub)] hover:text-white"
                    }`}
                  >
                    {l === "np" ? "नेपाली" : "English"}
                  </button>
                ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {lastResult && (
              <motion.div 
                key={lastResult.roll_number}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                  <motion.div 
                    layoutId="result-card"
                    className={`glass rounded-[32px] md:rounded-[44px] p-6 md:p-8 border-t-[3px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] ${lastResult.status === "Passed" ? "border-t-emerald-400" : "border-t-rose"}`}
                  >
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <span className={`px-4 py-1 rounded-full text-[8.5px] font-black tracking-[0.4em] uppercase ${lastResult.status === "Passed" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose/10 text-rose"}`}>
                          Status: {lastResult.status}
                        </span>
                        <ShieldCheck className={`w-5 h-5 ${lastResult.status === "Passed" ? "text-emerald-400" : "text-rose"} opacity-40`} />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-rose/60">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">{lastResult.campus}</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-display font-medium tracking-tight text-[var(--text)] uppercase italic">
                          {lastResult.semester}
                        </h2>
                      </div>

                      <div className="flex flex-col gap-2 py-4 px-6 bg-[var(--text)]/5 rounded-2xl border border-[var(--text)]/10">
                          <p className="text-[8px] font-mono text-[var(--sub)] uppercase tracking-[0.4em]">SYMBOL ID</p>
                          <p className="text-xl md:text-2xl font-mono text-[var(--text)] tracking-[0.3em] font-medium">{lastResult.roll_number}</p>
                      </div>
                    </div>
                  </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
