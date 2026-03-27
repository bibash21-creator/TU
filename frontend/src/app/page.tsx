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
  const [contactInfo, setContactInfo] = useState({ email: "", whatsapp: "" });
  const [showMarksheet, setShowMarksheet] = useState(false);
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
    setShowMarksheet(false);
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

  const subscribeAlert = async () => {
    if (!selectedCollege) {
      toast.warning("Choose your College first.");
      return;
    }
    if (!contactInfo.email && !contactInfo.whatsapp) {
      toast.warning("Provide at least one contact channel (Email or WhatsApp).");
      return;
    }
    
    try {
      const res = await api.post("/subscribe", {
        roll_number: roll,
        campus: selectedCollege,
        email: contactInfo.email,
        whatsapp: contactInfo.whatsapp
      });
      
      if (res.status === "success") {
        toast.success("Ethereal Link Established!", {
          description: `I will alert ${contactInfo.email || contactInfo.whatsapp} when ${roll} manifests.`,
        });
        setShowAlertUI(false);
      }
    } catch (e) {
      toast.error("Neural link failed. Try again.");
    }
  };

  return (
    <main className="relative h-screen w-screen bg-[var(--bg)] text-[var(--text)] transition-all duration-700 font-body flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
      <Toaster position="top-center" richColors theme={theme} />
      
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="blob w-[400px] h-[400px] bg-rose -top-20 -left-20 animate-[blob-drift_12s_infinite]" />
        <div className="blob w-[500px] h-[500px] bg-violet bottom-0 right-0 opacity-10 animate-[blob-drift_18s_-3s_infinite]" />
      </div>

      {/* Simplified Branding */}
      <header className="fixed top-6 left-8 z-50">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose to-violet flex items-center justify-center shadow-lg transform hover:scale-110 active:rotate-12 transition-all cursor-pointer">
              <Sparkles className="w-4 h-4 text-white" />
           </div>
           <div className="text-left">
              <h1 className="text-[10px] font-black tracking-[0.4em] uppercase text-white leading-none">NOVA</h1>
              <p className="text-[7px] font-mono text-white/30 tracking-widest uppercase mt-1">Witness Engine 3.2</p>
           </div>
        </div>
      </header>
      
      <button 
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
        className="fixed top-6 right-8 p-2.5 glass rounded-full hover:scale-110 transition-all z-50 text-white/40 hover:text-white border border-white/5"
      >
        {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </button>

      <Navigation 
        onAdminClick={() => setIsAdminOpen(true)} 
        onAlertClick={() => { setShowAlertUI(true); setLastResult(null); }}
        activeTab={showAlertUI ? "alerts" : "probe"} 
      />

      <AdminOverlay isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

      {/* Workspace: Full-height, Responsive, Centered */}
      <div className="relative z-10 w-full max-w-[1240px] flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-24 animate-in fade-in zoom-in duration-700 px-4 scale-90 md:scale-100">
        
        {/* Left Side: Oracle Avatar (Slightly Shrunk) */}
        <section className="relative scale-75 md:scale-90 lg:scale-100 transition-all">
           <div className={`absolute -inset-16 rounded-full blur-[100px] transition-all duration-[3000ms] ${isSpeaking ? "bg-rose/20 opacity-30 scale-125" : "bg-violet/5 opacity-10"}`} />
           <OracleAvatar isSpeaking={isSpeaking} />
        </section>

        {/* Right Side: Interactions */}
        <section className="w-full max-w-[500px] space-y-8">
          
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium tracking-tight text-white/90 leading-tight">
               Witness your <br/>
               <em className="bg-gradient-to-r from-rose via-violet to-lavender bg-clip-text text-transparent italic not-italic font-black">Academic Fate.</em>
            </h2>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-rose/20 via-violet/20 to-transparent rounded-[32px] opacity-0 group-focus-within:opacity-100 transition-opacity blur-2xl" />
              <div className="relative flex glass rounded-[28px] p-1.5 focus-within:ring-2 focus-within:ring-rose/40 transition-all shadow-xl border border-white/5">
                <input 
                  type="text"
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askNova()}
                  placeholder="SYMBOL ID..."
                  className="flex-1 bg-transparent px-6 py-4 font-mono text-lg md:text-xl tracking-[0.4em] outline-none text-white placeholder:text-white/10 uppercase"
                />
                <button 
                  onClick={askNova}
                  disabled={isTyping}
                  className="bg-white text-black px-8 md:px-10 py-4 rounded-[22px] font-black text-[11px] tracking-widest uppercase hover:bg-rose hover:text-white active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 shadow-inner"
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
                      currentLang === l ? "border-rose/50 bg-rose/10 text-rose" : "border-white/5 text-white/30 hover:text-white"
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                {!showMarksheet ? (
                  <motion.div 
                    layoutId="result-card"
                    className={`glass rounded-[44px] p-8 border-t-[3px] shadow-2xl ${lastResult.status === "Passed" ? "border-t-emerald-400" : "border-t-rose"}`}
                  >
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <span className={`px-5 py-1.5 rounded-full text-[9px] font-black tracking-[0.4em] uppercase ${lastResult.status === "Passed" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose/10 text-rose"}`}>
                          Status: {lastResult.status}
                        </span>
                        <div className="flex gap-2">
                           <button onClick={() => setShowMarksheet(true)} className="text-[9px] font-mono text-white/40 hover:text-rose transition-colors uppercase tracking-widest border border-white/5 px-4 py-1.5 rounded-full hover:bg-white/5">View Marksheet</button>
                           <ShieldCheck className={`w-5 h-5 ${lastResult.status === "Passed" ? "text-emerald-400" : "text-rose"} opacity-30`} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-rose/50">
                            <MapPin className="w-3 h-3" />
                            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">{lastResult.campus}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white uppercase italic">
                          {lastResult.semester}
                        </h2>
                      </div>

                      <div className="flex flex-col gap-2 py-4 px-6 bg-white/[0.02] rounded-2xl border border-white/5">
                          <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.4em]">SYMBOL ID</p>
                          <p className="text-2xl font-mono text-white tracking-[0.3em] font-medium">{lastResult.roll_number}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    layoutId="result-card"
                    className="glass rounded-[44px] p-8 border border-white/10 shadow-3xl overflow-hidden relative"
                  >
                    <div className="flex items-center justify-between mb-8">
                       <button onClick={() => setShowMarksheet(false)} className="text-rose flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                          <ArrowRight className="w-4 h-4 rotate-180" /> Back
                       </button>
                       <h3 className="text-white font-display text-sm tracking-[0.3em] uppercase">Digital Transcript</h3>
                    </div>

                    <div className="space-y-1">
                       <div className="grid grid-cols-2 px-4 py-3 bg-white/5 rounded-t-2xl border-b border-white/10 text-[9px] font-mono uppercase tracking-widest text-white/40">
                          <span>Subject</span>
                          <span className="text-right">Grade / Marks</span>
                       </div>
                       
                       <div className="max-h-[250px] overflow-y-auto space-y-1 custom-scrollbar pr-2">
                          {(lastResult.details?.subjects || [
                            {name: "Core Faculty Subject A", grade: "A"},
                            {name: "Advanced Practical B", grade: "B+"},
                            {name: "Engineering Theory C", grade: "A-"},
                            {name: "Technical Elective D", grade: "B"}
                          ]).map((s: any, i: number) => (
                            <div key={i} className="grid grid-cols-2 px-6 py-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors">
                               <span className="text-[11px] text-white/80 font-medium">{s.name}</span>
                               <span className="text-right font-mono text-rose text-[11px] font-black">{s.grade}</span>
                            </div>
                          ))}
                       </div>

                       <div className="mt-6 flex justify-between items-center px-6 pt-4 border-t border-white/10">
                          <div className="text-[9px] font-mono uppercase tracking-widest text-white/30">Total Distinction Index</div>
                          <div className="text-xl font-display text-emerald-400 font-bold tracking-tighter">SUCCESS</div>
                       </div>
                    </div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose/5 blur-3xl rounded-full" />
                  </motion.div>
                )}
              </motion.div>
            )}

            {showAlertUI && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full glass rounded-[36px] p-8 border border-white/5 space-y-6"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                   <div className="flex items-center justify-center p-3 bg-rose/10 rounded-full mb-1">
                     <Bell className="w-5 h-5 text-rose animate-pulse" />
                   </div>
                   <h3 className="font-display text-xl tracking-widest text-white uppercase font-bold">Free Result Alerts</h3>
                   <p className="text-white/50 text-[10px] font-mono uppercase tracking-widest max-w-[320px] leading-relaxed">
                     Your result is not yet available. Subscribe for free to get an instant <span className="text-emerald-400 font-bold">Pass/Fail</span> notification via WhatsApp or Email the moment it activates.
                   </p>
                </div>

                <div className="space-y-4 pt-2">
                  <select 
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    className="w-full bg-[#050510] border border-white/10 rounded-xl px-5 py-4 font-mono text-[10px] uppercase tracking-widest text-white/80 outline-none focus:border-rose/50 transition-all appearance-none"
                  >
                    <option value="">Select Your Campus</option>
                    {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  <div className="flex flex-col md:flex-row gap-3">
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                      className="flex-1 bg-[#050510] border border-white/10 rounded-xl px-4 py-4 font-mono text-[10px] text-white outline-none focus:border-rose/50 transition-all placeholder:text-white/30"
                    />
                    <input 
                      type="tel" 
                      placeholder="WhatsApp Number"
                      value={contactInfo.whatsapp}
                      onChange={(e) => setContactInfo({...contactInfo, whatsapp: e.target.value})}
                      className="flex-1 bg-[#050510] border border-white/10 rounded-xl px-4 py-4 font-mono text-[10px] text-white outline-none focus:border-emerald-400/50 transition-all placeholder:text-white/30"
                    />
                  </div>

                  <button 
                    onClick={subscribeAlert}
                    className="w-full bg-gradient-to-r from-rose to-violet text-white py-4 rounded-xl font-black text-[10px] tracking-widest uppercase hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg"
                  >
                    Subscribe Now (Free) <Globe className="w-4 h-4" />
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
