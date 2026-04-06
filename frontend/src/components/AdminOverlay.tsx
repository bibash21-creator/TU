"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ShieldCheck, Upload, LogOut, Trash2, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

interface AdminOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Check if user is logged in by checking for session cookie
function isLoggedIn(): boolean {
  return document.cookie.includes("admin_session=");
}

export default function AdminOverlay({ isOpen, onClose }: AdminOverlayProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [semester, setSemester] = useState("1st Semester");
  const [faculty, setFaculty] = useState("BIT");
  const [year, setYear] = useState("2080");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [view, setView] = useState<"upload" | "manage">("upload");
  const [extractedData, setExtractedData] = useState<any>(null);

  // Check auth status when overlay opens
  useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const checkAuthStatus = async () => {
    if (!isLoggedIn()) {
      setIsAuthenticated(false);
      return;
    }
    
    try {
      const data = await api.get("/admin/verify");
      if (data.status === "success" && data.admin) {
        setIsAuthenticated(true);
        fetchResults();
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await api.post("/admin/login", { username: user, password: pass });
      if (data.status === "success") {
        setIsAuthenticated(true);
        setMsg("Welcome, Oracle Admin.");
        fetchResults();
      } else {
        setMsg("Invalid credentials.");
      }
    } catch (e) {
      setMsg("Connection to backend failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout", {});
    } catch (e) {
      // Ignore error
    }
    setIsAuthenticated(false);
    setUser("");
    setPass("");
    setResults([]);
    setExtractedData(null);
    setMsg("");
  };

  const fetchResults = async () => {
    try {
      const data = await api.get("/list");
      if (Array.isArray(data)) setResults(data);
    } catch (e) {
      console.error("Failed to fetch results", e);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Delete results for ${item.campus} (${item.semester})?`)) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        campus: item.campus,
        semester: item.semester,
        faculty: item.faculty,
        year: item.year
      }).toString();

      const data = await api.delete(`/delete?${query}`);
      setMsg(data.message || "Result deleted.");
      fetchResults();
    } catch (e) {
      setMsg("Deletion failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMsg("Select a file first.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.upload("/upload-result", file);

      if (data.status === "success") {
        setExtractedData(data);
        setMsg(`Extracted for: ${data.campus}`);
      } else {
        setMsg(data.message || "Extraction failed.");
      }
    } catch (e) {
      setMsg("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!extractedData) return;
    setLoading(true);
    try {
      const pubData = await api.post("/publish", {
        campus: extractedData.campus,
        roll_numbers: extractedData.roll_numbers,
        semester,
        faculty,
        year,
      }, true); // requireCsrf = true
      
      setMsg(pubData.message || "Result published!");
      setExtractedData(null);
      setFile(null);
      fetchResults();
    } catch (e) {
      setMsg("Publishing failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-[#02020a]/95 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-[450px] glass rounded-[32px] p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose/20 blur-[60px] rounded-full" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose to-violet flex items-center justify-center shadow-lg shadow-rose/20">
                  {isAuthenticated ? <ShieldCheck className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-white" />}
                </div>
              </div>

              <h2 className="font-display text-2xl text-center mb-4 tracking-widest text-rose">
                {isAuthenticated ? "Oracle Dashboard" : "Admin Revelation"}
              </h2>

              {isAuthenticated && (
                <div className="flex gap-2 mb-6 justify-center">
                  <button 
                    onClick={() => setView("upload")}
                    className={`px-4 py-1.5 rounded-full font-mono text-[10px] tracking-widest uppercase transition-all ${view === "upload" ? "bg-rose text-white shadow-lg shadow-rose/20" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                  >
                    Upload
                  </button>
                  <button 
                    onClick={() => setView("manage")}
                    className={`px-4 py-1.5 rounded-full font-mono text-[10px] tracking-widest uppercase transition-all ${view === "manage" ? "bg-violet text-white shadow-lg shadow-violet/20" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                  >
                    Manage ({results.length})
                  </button>
                </div>
              )}

              {!isAuthenticated ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest ml-1">Oracle Identity</label>
                    <input
                      type="text"
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      placeholder="Username"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body outline-none focus:border-rose/50 transition-all placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest ml-1">Secret Key</label>
                    <input
                      type="password"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-body outline-none focus:border-rose/50 transition-all placeholder:text-white/10"
                    />
                  </div>
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-rose to-violet py-4 rounded-xl font-display text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    {loading ? "Verifying..." : "Enter Oracle Sanctum"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {view === "upload" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest ml-1">Semester</label>
                            <select 
                              value={semester}
                              onChange={(e) => setSemester(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 font-body outline-none text-white/80"
                            >
                              {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(s => (
                                <option key={s} value={`${s} Semester`} className="bg-[#02020a]">{s} Sem</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest ml-1">Faculty</label>
                            <select 
                              value={faculty}
                              onChange={(e) => setFaculty(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 font-body outline-none text-white/80"
                            >
                              {["BIT", "B.Sc.CSIT", "BIM", "BCA"].map(f => (
                                <option key={f} value={f} className="bg-[#02020a]">{f}</option>
                              ))}
                            </select>
                          </div>
                      </div>

                      <div className="space-y-2">
                          <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest ml-1">Batch Year (B.S.)</label>
                          <select 
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 font-body outline-none text-white/80"
                          >
                            {Array.from({ length: 41 }, (_, i) => 2060 + i).map(y => (
                              <option key={y} value={y.toString()} className="bg-[#02020a]">{y} B.S.</option>
                            ))}
                          </select>
                      </div>

                      <div className="space-y-4 pt-2">
                        {extractedData ? (
                          <div className="space-y-4 animate-fade-in">
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-1">Oracle Detection Result:</p>
                              <div className="space-y-1">
                                <p className="text-white text-[13px] font-display uppercase tracking-widest leading-tight">{extractedData.campus}</p>
                                <p className="text-[10px] text-white/40">{extractedData.roll_numbers.length} matching roll numbers extracted.</p>
                              </div>
                            </div>
                            <button
                              onClick={handlePublish}
                              disabled={loading}
                              className="w-full bg-emerald-500 py-4 rounded-xl font-display text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 active:scale-[0.98] transition-all"
                            >
                              {loading ? "Publishing..." : "Confirm & Publish"}
                            </button>
                            <button onClick={() => { setExtractedData(null); setFile(null); }} className="w-full text-[10px] font-mono text-white/20 hover:text-white/40 uppercase tracking-widest">Re-upload file</button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                             <div className="space-y-2">
                               <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest ml-1">Result Document (PDF/Image)</label>
                               <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-rose/30 transition-colors group cursor-pointer">
                                  <input 
                                    type="file" 
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                  <Upload className="w-8 h-8 text-white/20 group-hover:text-rose/50 transition-colors" />
                                  <span className="text-[11px] text-white/30 font-mono text-center">
                                    {file ? file.name : "Click or drag to manifest result file"}
                                  </span>
                               </div>
                             </div>

                             <button
                              onClick={handleUpload}
                              disabled={loading}
                              className="w-full bg-gradient-to-r from-rose to-violet py-4 rounded-xl font-display text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 active:scale-[0.98] transition-all"
                            >
                              {loading ? "Manifesting..." : "Manifest Result"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Active Databases</label>
                        <button onClick={() => fetchResults()} className="text-white/20 hover:text-rose transition-colors">
                          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {results.length === 0 ? (
                          <div className="text-center py-10 text-white/10 font-mono text-[10px] uppercase tracking-widest">No results published yet.</div>
                        ) : (
                          results.map((item, idx) => (
                            <div key={idx} className="glass p-3 rounded-2xl border border-white/5 flex items-center justify-between group">
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-rose truncate">{item.campus}</p>
                                <p className="text-[9px] font-mono text-white/30 uppercase tracking-tight">
                                  {item.year} · {item.semester} · {item.faculty}
                                </p>
                              </div>
                              <button 
                                onClick={() => handleDelete(item)}
                                className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full border border-white/10 py-3 rounded-xl font-mono text-[10px] tracking-widest text-white/20 hover:text-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3 h-3" /> Logout
                  </button>
                </div>
              )}

              {msg && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-center text-[10px] font-mono text-lavender tracking-wider"
                >
                  {msg}
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
