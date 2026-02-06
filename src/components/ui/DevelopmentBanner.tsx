"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, PartyPopper, Rocket } from "lucide-react";

export default function DevelopmentBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [sparkle, setSparkle] = useState(false);

  // Sparkle animation every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSparkle(true);
      setTimeout(() => setSparkle(false), 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-3 px-4 relative shadow-lg sticky top-0 z-[100] overflow-hidden">
      {/* Animated background sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[10%] w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: "0s" }} />
        <div className="absolute top-1 left-[30%] w-1.5 h-1.5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-0 left-[50%] w-2 h-2 bg-white/25 rounded-full animate-ping" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1 left-[70%] w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-0 left-[90%] w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container-custom flex items-center justify-center gap-3 text-sm md:text-base font-bold relative">
        <PartyPopper className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-transform ${sparkle ? "scale-125 rotate-12" : ""}`} />
        
        <span className="text-center flex items-center gap-2">
          <span className="hidden md:inline">
            Welkom bij RoTech Development! Wij helpen u graag met uw digitale ambities.
          </span>
          <span className="md:hidden">
            Welkom! Wij staan voor u klaar.
          </span>
          <Rocket className="w-4 h-4 inline-block animate-pulse" />
        </span>
        
        <Sparkles className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 hidden sm:block transition-all ${sparkle ? "text-yellow-200 scale-110" : ""}`} />
        
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 md:right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Banner sluiten"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
