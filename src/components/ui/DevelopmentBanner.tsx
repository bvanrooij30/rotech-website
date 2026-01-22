"use client";

import { Construction } from "lucide-react";

export default function DevelopmentBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white py-3 px-4 relative shadow-lg sticky top-0 z-[100]">
      <div className="container-custom flex items-center justify-center gap-3 text-sm md:text-base font-bold">
        <Construction className="w-5 h-5 md:w-6 md:h-6 animate-bounce flex-shrink-0" />
        <span className="text-center">
          <span className="hidden md:inline">
            🚧 Wij zijn druk bezig met het bouwen van onze webshop! Wijzigingen worden nog doorgevoerd. 🚧
          </span>
          <span className="md:hidden">
            🚧 Website in aanbouw - Wijzigingen volgen!
          </span>
        </span>
        <Construction className="w-5 h-5 md:w-6 md:h-6 animate-bounce flex-shrink-0 hidden sm:block" />
      </div>
    </div>
  );
}
