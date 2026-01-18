"use client";

import { useState } from "react";
import { Construction, X } from "lucide-react";

export default function DevelopmentBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 py-2 px-4 relative">
      <div className="container-custom flex items-center justify-center gap-2 text-sm font-medium">
        <Construction className="w-4 h-4 animate-pulse" />
        <span>
          <span className="hidden sm:inline">🚧 Deze website is nog in ontwikkeling. </span>
          <span className="sm:hidden">🚧 Website in ontwikkeling </span>
          <span className="hidden md:inline">Sommige functies worden nog toegevoegd.</span>
        </span>
        <Construction className="w-4 h-4 animate-pulse hidden sm:block" />
      </div>
      
      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-amber-600/20 rounded-full transition-colors"
        aria-label="Banner sluiten"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
