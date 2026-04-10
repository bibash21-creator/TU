"use client";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Sun, Moon, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import OracleAvatar from "@/components/OracleAvatar";
import AdminOverlay from "@/components/AdminOverlay";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";
import Navigation from "@/components/Navigation";

// Lazy load AvatarAnnouncer for performance
const AvatarAnnouncer = lazy(() => import("@/components/AvatarAnnouncer"));

const NovaLogo = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <div className="relative w-10 h-10 flex items-center justify-center transform transition-all duration-700">
    <motion.div 
      animate={isSpeaking ? { scale: [1, 1.2, 1], rotate: [45, 135, 45], opacity: [0.2, 0.5, 0.2] } : {}}
      transition={{ duration: 0.5, repeat: Infinity }}
      className="absolute inset-0 bg-gradient-to-tr from-rose via-violet to-rose rounded-xl rotate-45 blur-sm" 
    />
    <motion.div 
      animate={isSpeaking ? { scale: [1, 1.1, 1] } : {}}
      className="absolute inset-0 border-2 border-[var(--text)]/20 rounded-xl rotate-12" 
    />
    <svg viewBox="0 0 24 24" className="w-6 h-6 z-10 fill-none stroke-[var(--text)]" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" className="opacity-40" />
      <circle cx="12" cy="12" r="3" className="fill-[var(--accent)] stroke-none" />
      <path d="M12 8v8M8 12h8" className="stroke-[var(--text)]" />
    </svg>
  </div>
);

export default function Home() {
  const [roll, setRoll] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lastResult, setLastResult] = useState<any>(null);
  const [showAnnouncer, setShowAnnouncer] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const speakNova = async (text: string, lang = "en") => {
    if (!text) return;
    try {
      if (audioRef.current) audioRef.current.pause();
      const url = api.getVoiceUrl(text, lang);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsSpeaking(true);
            audio.onended = () => setIsSpeaking(false);
          })
          .catch(error => {
            console.error("Speech playback blocked or failed:", error);
            setIsSpeaking(false);
            toast.error("Vocal transmission dampened by the void.");
          });
      }
    } catch (e) {
      console.error("Voice engine fault:", e);
      setIsSpeaking(false);
    }
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
        const failText = currentLang === "np" ? (data.message_np || "नतिजा फेला परेन।") : (data.message_en || "Result not found.");
        speakNova(failText, currentLang);
        toast.info("Roll number not yet witnessed by the Oracle.");
      } else if (data.status === "error") {
        toast.error("Nexus sequence interrupted.");
      } else {
        setLastResult(data);
        setShowAnnouncer(true); // Show AI avatar announcer
        // Mute page's native speakNova to let AvatarAnnouncer take control seamlessly
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
      
      {/* Background Blobs (Dynamic for Theme) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="blob w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-rose -top-20 -left-20 animate-[blob-drift_12s_infinite]" />
        <div className="blob w-[400px] h-[400px] md:w-[500px] md:h-[500px] bg-violet bottom-0 right-0 opacity-10 animate-[blob-drift_18s_-3s_infinite]" />
      </div>

      {/* Brand Identity */}
      <header className="fixed top-6 left-6 md:left-10 z-50">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
           <NovaLogo isSpeaking={isSpeaking} />
           <div className="text-left hidden sm:block">
              <h1 className="text-[12px] font-black tracking-[0.5em] uppercase text-[var(--text)] leading-none mb-1">NOVA ORACLE</h1>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[7px] font-mono text-[var(--sub)] tracking-widest uppercase">Witness Engine Active</p>
              </div>
           </div>
        </div>
      </header>
      
      <button 
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
        className="fixed top-6 right-6 md:right-10 p-2.5 glass rounded-full hover:scale-110 transition-all z-50 text-[var(--text)] border border-[var(--border)] shadow-sm"
      >
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
        <section className="w-full max-w-[500px] space-y-10 z-10">
          
          <div className="space-y-8 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight text-[var(--text)] leading-tight">
               Witness your <br className="hidden lg:block"/>
               <em className="bg-gradient-to-r from-rose via-violet to-lavender bg-clip-text text-transparent italic not-italic font-black">Academic Fate.</em>
            </h2>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-rose/20 via-violet/20 to-transparent rounded-[32px] opacity-0 group-focus-within:opacity-100 transition-opacity blur-2xl" />
              <div className="relative flex glass rounded-[28px] p-2 focus-within:ring-2 focus-within:ring-rose/40 transition-all border border-[var(--border)]">
                <input 
                  type="text"
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askNova()}
                  placeholder="SYMBOL ID..."
                  className="flex-1 bg-transparent px-5 md:px-7 py-4 md:py-5 font-mono text-lg md:text-2xl tracking-[0.3em] md:tracking-[0.4em] outline-none text-[var(--text)] placeholder:text-[var(--text)]/10 uppercase w-full"
                />
                <button 
                  onClick={askNova}
                  disabled={isTyping}
                  className="bg-[var(--text)] text-[var(--bg)] px-8 md:px-12 py-4 md:py-5 rounded-[22px] font-black text-[11px] md:text-[12px] tracking-widest uppercase hover:bg-rose hover:text-white active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3 flex-shrink-0 shadow-lg"
                >
                  {isTyping ? "SCANNING..." : "REVEAL"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4">
                {["en", "np"].map(l => (
                  <button
                    key={l}
                    onClick={() => setCurrentLang(l)}
                    className={`text-[9px] font-mono px-5 py-2 rounded-xl border transition-all uppercase tracking-[0.2em] font-bold ${
                      currentLang === l ? "border-rose/50 bg-rose/10 text-rose" : "border-[var(--border)] text-[var(--sub)] hover:text-[var(--text)] hover:bg-[var(--text)]/5"
                    }`}
                  >
                    {l === "np" ? "नेपाली भाषा" : "English Mode"}
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
                className="w-full space-y-6"
              >
                {/* AI Avatar Announcer */}
                <AnimatePresence>
                  {showAnnouncer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Suspense fallback={
                        <div className="h-80 flex items-center justify-center">
                          <div className="animate-pulse text-white/40">Loading AI Announcer...</div>
                        </div>
                      }>
                        <AvatarAnnouncer
                          studentData={{
                            roll_number: lastResult.roll_number,
                            status: lastResult.status,
                            campus: lastResult.campus,
                            semester: lastResult.semester,
                            faculty: lastResult.faculty,
                            year: lastResult.year,
                            reason: lastResult.reason,
                          }}
                          autoPlay={true}
                          currentLang={currentLang}
                          onComplete={() => console.log("Announcement complete")}
                        />
                      </Suspense>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Result Card */}
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
