"use client";

import Image from "next/image";

interface LogoWatermarkProps {
  opacity?: number;
  size?: number;
  className?: string;
}

/**
 * Subtle logo watermark component
 * Used to subtly brand sections of the website
 */
export default function LogoWatermark({ 
  opacity = 0.03, 
  size = 200,
  className = "" 
}: LogoWatermarkProps) {
  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}
      style={{ opacity }}
    >
      <Image
        src="/images/rotech/rotech-icon.svg"
        alt=""
        width={size}
        height={size}
        className="w-full h-full max-w-[200px] max-h-[200px]"
        aria-hidden="true"
      />
    </div>
  );
}
