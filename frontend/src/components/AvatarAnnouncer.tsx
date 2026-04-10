"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Play, Pause, Loader2 } from "lucide-react";
import Image from "next/image";
import ThreeAvatar from "./ThreeAvatar";

interface StudentData {
  roll_number: string;
  status: string;
  campus: string;
  semester: string;
  faculty: string;
  year?: string;
  reason?: string;
}

interface AvatarAnnouncerProps {
  studentData: StudentData;
  autoPlay?: boolean;
  currentLang?: string;
  onComplete?: () => void;
}

interface AnnouncementData {
  script: {
    nepali_text: string;
    english_text: string;
    emotion: string;
  };
  audio_url: string;
}

export default function AvatarAnnouncer({ 
  studentData, 
  autoPlay = true,
  currentLang = "np",
  onComplete 
}: AvatarAnnouncerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lipSyncIntensity, setLipSyncIntensity] = useState(0);
  const [showText, setShowText] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lipSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch announcement on mount
  useEffect(() => {
    fetchAnnouncement();
    return () => {
      cleanup();
    };
  }, [studentData.roll_number]);

  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (lipSyncIntervalRef.current) {
      clearInterval(lipSyncIntervalRef.current);
    }
  };

  const fetchAnnouncement = async () => {
    setIsLoading(true);
    try {
      const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:9099").replace(/\/$/, "");
      const response = await fetch(`${API_BASE_URL}/announce?lang=${currentLang}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch announcement");
      
      const data = await response.json();
      if (data.status === "success") {
        setAnnouncement(data);
        // Preload audio
        const audio = new Audio(`${API_BASE_URL}${data.audio_url}`);
        audio.preload = "auto";
        audioRef.current = audio;
        
        audio.addEventListener("loadedmetadata", () => {
          setDuration(audio.duration);
          setIsLoading(false);
          if (autoPlay) {
            setTimeout(() => playAudio(), 500);
          }
        });
        
        audio.addEventListener("ended", () => {
          setIsPlaying(false);
          setLipSyncIntensity(0);
          onComplete?.();
        });
        
        audio.addEventListener("error", () => {
          setIsLoading(false);
        });
      }
    } catch (error) {
      console.error("Announcement error:", error);
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        startLipSync();
      }).catch(err => {
        console.error("Audio play failed:", err);
      });
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setLipSyncIntensity(0);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Real-time lip sync simulation
  const startLipSync = () => {
    if (lipSyncIntervalRef.current) {
      clearInterval(lipSyncIntervalRef.current);
    }
    
    // Simulate lip movement based on audio time
    lipSyncIntervalRef.current = setInterval(() => {
      if (audioRef.current && isPlaying) {
        const time = audioRef.current.currentTime;
        setCurrentTime(time);
        
        // Create realistic lip sync pattern
        // Use sine waves with random variation for natural movement
        const baseIntensity = Math.sin(time * 15) * 0.5 + 0.5;
        const variation = Math.sin(time * 8) * 0.3;
        const randomFactor = Math.random() * 0.2;
        const intensity = Math.min(1, Math.max(0, baseIntensity + variation + randomFactor));
        
        setLipSyncIntensity(intensity);
      }
    }, 50); // Update every 50ms for smooth animation
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get emotion-based styling
  const getEmotionStyles = () => {
    const emotion = announcement?.script?.emotion || "neutral";
    switch (emotion) {
      case "happy":
        return {
          glow: "from-emerald-500/30 to-teal-500/30",
          border: "border-emerald-500/30",
          text: "text-emerald-400",
        };
      case "sympathetic":
        return {
          glow: "from-amber-500/30 to-orange-500/30",
          border: "border-amber-500/30",
          text: "text-amber-400",
        };
      default:
        return {
          glow: "from-violet-500/30 to-rose-500/30",
          border: "border-violet-500/30",
          text: "text-violet-400",
        };
    }
  };

  const emotionStyles = getEmotionStyles();

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main Avatar Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative rounded-3xl overflow-hidden border ${emotionStyles.border} bg-black/40 backdrop-blur-xl`}
      >
        {/* Animated Background Glow */}
        <motion.div
          animate={{ 
            opacity: isPlaying ? [0.3, 0.6, 0.3] : 0.2,
            scale: isPlaying ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute inset-0 bg-gradient-to-t ${emotionStyles.glow} blur-3xl`}
        />

        {/* Avatar Image with Lip Sync */}
        <div className="relative h-80 flex items-center justify-center">
          {/* 3D Oracle Entity */}
          <div className="relative w-64 h-64 rounded-full overflow-hidden bg-black/40 border border-rose-500/20 shadow-2xl">
            <ThreeAvatar isSpeaking={isPlaying} />
            
            {/* Speaking Indicator Ring */}
            {isPlaying && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-rose-400/30 pointer-events-none"
              />
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            {isLoading ? (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/60 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </span>
            ) : isPlaying ? (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-400 text-xs animate-pulse">
                <Volume2 className="w-3 h-3" />
                Speaking...
              </span>
            ) : (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/40 text-xs">
                <VolumeX className="w-3 h-3" />
                Ready
              </span>
            )}
          </div>
        </div>

        {/* Text Display */}
        <AnimatePresence>
          {showText && announcement && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-6 pb-4"
            >
              <p className={`text-sm ${emotionStyles.text} text-center leading-relaxed font-medium`}>
                {announcement.script.nepali_text}
              </p>
              <p className="text-xs text-white/40 text-center mt-2">
                {announcement.script.english_text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="px-6 pb-6">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-400 to-violet-400"
              initial={{ width: 0 }}
              animate={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-violet-500 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              
              <button
                onClick={toggleMute}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <span className="text-xs font-mono text-white/40">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Toggle Text Button */}
      <button
        onClick={() => setShowText(!showText)}
        className="mt-3 text-xs text-white/30 hover:text-white/60 transition-colors mx-auto block"
      >
        {showText ? "Hide Text" : "Show Text"}
      </button>
    </div>
  );
}
