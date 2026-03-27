"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Sparkles, Sun, Moon, ArrowRight, Activity, Terminal, ShieldCheck, Bell, MapPin, Globe } from "lucide-react";
import OracleAvatar from "@/components/OracleAvatar";
import AdminOverlay from "@/components/AdminOverlay";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";

const COLLEGES = [
  "Amrit Campus", "Patan Multiple Campus", "Nepal Commerce Campus", 
  "Padma Kanya Multiple Campus", "Shanker Dev Campus", "Tri-Chandra Multiple Campus",
  "Bhaktapur Multiple Campus", "Central Department of CSIT", "Kathmandu BernHardt College",
  "Deerwalk Institute of Technology", "St. Xavier's College", "Texas International College",
  "National College of Computer Studies", "Prime College", "Orchid International College",
  "Himalaya College of Engineering", "Kathford International College", "Sagarmatha College of Science and Technology"
];

import Navigation from "@/components/Navigation";

export default function Home() {
  const [roll, setRoll] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lastResult, setLastResult] = useState<any>(null);
  const [showAlertUI, setShowAlertUI] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("");
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
    setShowAlertUI(false);
    try {
      const data = await api.get(`/query/${encodeURIComponent(roll)}`);
      setIsTyping(false);
      if (data.status === "Not Found") {
        setLastResult(null);
        speakNova(data.message_en, currentLang);
        setShowAlertUI(true);
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

  const subscribeAlert = () => {
    if (!selectedCollege) {
      toast.warning("Choose your College first.");
      return;
    }
    toast.success("Ethereal Link Established!", {
      description: `I will alert you when ${roll} appears.`,
    });
    setShowAlertUI(false);
  };

  return (
    <main className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] transition-all duration-700 font-body flex flex-col items-center justify-center p-6 md:p-12 overflow-x-hidden">
      <Toaster position="top-center" richColors theme={theme} />
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="blob w-[500px] h-[500px] bg-rose -top-40 -left-40 animate-[blob-drift_12s_infinite]" />
        <div className="blob w-[600px] h-[600px] bg-violet bottom-0 right-0 opacity-10 animate-[blob-drift_18s_-3s_infinite]" />
      </div>

      {/* Simplified Branding */}
      <header className="fixed top-8 left-10 z-50">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose to-violet flex items-center justify-center shadow-lg transform hover:scale-110 active:rotate-12 transition-all cursor-pointer">
              <Sparkles className="w-5 h-5 text-white" />
           </div>
           <div className="text-left">
              <h1 className="text-xs font-black tracking-[0.4em] uppercase text-white leading-none">NOVA</h1>
              <p className="text-[8px] font-mono text-white/30 tracking-widest uppercase mt-1">Witness Engine 3.1</p>
           </div>
        </div>
      </header>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
        className="fixed top-10 right-10 p-3 glass rounded-full hover:scale-110 transition-all z-50 text-white/40 hover:text-white border border-white/5"
      >
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Floating Navigation */}
      <Navigation onAdminClick={() => setIsAdminOpen(true)} activeTab={lastResult ? "alerts" : "probe"} />

      <AdminOverlay isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      {/* Integrated Workspace: Side-by-Side Flex Layout */}
      <div className="relative z-10 w-full max-w-[1400px] flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32 animate-in fade-in zoom-in duration-1000 px-4">
        
        {/* The Oracle Appearance: Left Side */}
        <section className="relative scale-[0.9] md:scale-110 lg:scale-125 transition-all">
           <div className={`absolute -inset-24 rounded-full blur-[120px] transition-all duration-[3000ms] ${isSpeaking ? "bg-rose/30 opacity-40 scale-150 rotate-90" : "bg-violet/10 opacity-10"}`} />
           <OracleAvatar isSpeaking={isSpeaking} />
        </section>

        {/* Unified Search and Insight Section: Right Side */}
        <section className="w-full max-w-[650px] space-y-16">
          
          <div className="space-y-12">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold tracking-tight text-white leading-tight">
               Witness your <br/>
               <em className="bg-gradient-to-r from-rose via-violet to-lavender bg-clip-text text-transparent italic not-italic">Fate.</em>
            </h2>

            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-rose/40 via-violet/40 to-transparent rounded-[50px] opacity-0 group-focus-within:opacity-100 transition-opacity blur-3xl" />
              <div className="relative flex flex-col md:flex-row glass rounded-[44px] p-4 focus-within:ring-4 focus-within:ring-rose/40 transition-all shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20">
                <input 
                  type="text"
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askNova()}
                  placeholder="ENTER SYMBOL ID..."
                  className="flex-1 bg-transparent px-10 py-7 font-mono text-2xl md:text-3xl tracking-[0.5em] outline-none text-white placeholder:text-white/20 uppercase"
                />
                <button 
                  onClick={askNova}
                  disabled={isTyping}
                  className="bg-white text-black px-16 md:px-20 py-7 rounded-[32px] font-black text-[16px] md:text-[18px] tracking-[0.4em] uppercase hover:bg-rose hover:text-white active:scale-90 disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-2xl hover:shadow-rose/50"
                >
                  {isTyping ? "SCANNING" : "REVEAL"} <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4">
                {["en", "np"].map(l => (
                  <button
                    key={l}
                    onClick={() => setCurrentLang(l)}
                    className={`text-[9px] font-mono px-5 py-2 rounded-xl border transition-all uppercase tracking-[0.3em] ${
                      currentLang === l ? "border-rose/50 bg-rose/10 text-rose" : "border-white/5 text-white/30 hover:text-white"
                    }`}
                  >
                    {l === "np" ? "Nepali Translation" : "English Mode"}
                  </button>
                ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {lastResult && (
              <motion.div 
                key={lastResult.roll_number}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full glass rounded-[54px] p-10 md:p-14 border-t-[4px] shadow-3xl ${lastResult.status === "Passed" ? "border-t-emerald-400" : "border-t-rose"}`}
              >
                <div className="flex flex-col gap-10 text-center md:text-left">
                   <div className="flex items-center justify-center md:justify-between px-2">
                     <span className={`px-8 py-2.5 rounded-full text-[10px] font-black tracking-[0.5em] uppercase border ${lastResult.status === "Passed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose/10 text-rose border-rose/20"}`}>
                       Result Status: {lastResult.status}
                     </span>
                     <ShieldCheck className={`hidden md:block w-8 h-8 ${lastResult.status === "Passed" ? "text-emerald-400" : "text-rose"} opacity-40`} />
                   </div>
                   
                   <div className="space-y-6">
                     <div className="flex items-center justify-center md:justify-start gap-2.5 text-rose/60 group">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-mono text-[11px] uppercase tracking-widest font-bold group-hover:text-rose transition-colors">{lastResult.campus}</span>
                     </div>
                     <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight text-white uppercase leading-[1.1]">
                       {lastResult.semester}
                     </h2>
                     <div className="flex items-center gap-6 opacity-60">
                       <span className="h-px bg-white/10 flex-1" />
                       <p className="font-mono text-[13px] uppercase tracking-[0.4em] text-violet font-black whitespace-nowrap">
                         {lastResult.year} · {lastResult.faculty}
                       </p>
                       <span className="h-px bg-white/10 flex-1" />
                     </div>
                   </div>

                   <div className="flex flex-col gap-3 py-6 px-10 bg-white/[0.02] rounded-3xl border border-white/5 mx-auto md:mx-0 w-full">
                      <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.4em]">PROBED IDENTIFIER</p>
                      <p className="text-3xl md:text-4xl font-mono text-white tracking-[0.4em] font-medium">{lastResult.roll_number}</p>
                   </div>
                </div>
              </motion.div>
            )}

            {showAlertUI && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full glass rounded-[40px] p-12 border border-white/5 space-y-10 text-center"
              >
                <div className="flex flex-col items-center space-y-5">
                   <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose to-violet p-px shadow-2xl">
                      <div className="w-full h-full bg-[#02020a] rounded-3xl flex items-center justify-center">
                         <Bell className="w-8 h-8 text-rose animate-bounce" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <h3 className="font-display text-2xl tracking-[0.2em] text-white uppercase italic">Divine Alert</h3>
                      <p className="text-white/40 text-[11px] font-mono uppercase tracking-[0.3em] max-w-[400px] leading-relaxed">
                        This roll number of {roll} hasn&apos;t manifested in our Nexus. Establish a link to be notified?
                      </p>
                   </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <select 
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    className="w-full max-w-[400px] bg-white/5 border border-white/10 rounded-2xl px-6 py-5 font-mono text-[11px] uppercase tracking-widest text-white/70 outline-none focus:border-rose/50 transition-all appearance-none text-center"
                  >
                    <option value="" className="bg-[#02020a]">-- Identify your Sanctuary --</option>
                    {COLLEGES.map(c => <option key={c} value={c} className="bg-[#02020a]">{c}</option>)}
                  </select>

                  <button 
                    onClick={subscribeAlert}
                    className="w-full max-w-[400px] bg-white text-black py-5 rounded-2xl font-black text-[11px] tracking-[0.4em] uppercase hover:bg-rose hover:text-white transition-all flex items-center justify-center gap-4 shadow-xl"
                  >
                    ESTABLISH LINK <Activity className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

    </main>
  );
}
