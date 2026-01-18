"use client";

import { useState, useEffect } from "react";
import { Construction, X } from "lucide-react";

export default function DevelopmentBanner() {
  const [isVisible, setIsVisible] = useState(true);

  // Clear old localStorage key if exists (from previous version)
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("developmentBannerDismissed");
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 text-amber-950 py-3 px-4 relative shadow-md">
      <div className="container-custom flex items-center justify-center gap-3 text-sm font-semibold">
        <Construction className="w-5 h-5 animate-bounce" />
        <span>
          <span className="hidden sm:inline">🚧 Website in ontwikkeling - Sommige functies worden nog gebouwd</span>
          <span className="sm:hidden">🚧 Website in ontwikkeling</span>
        </span>
        <Construction className="w-5 h-5 animate-bounce hidden sm:block" />
      </div>
      
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-amber-600/30 rounded-full transition-colors"
        aria-label="Banner sluiten"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
