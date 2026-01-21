"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Consistente card styling voor de hele website.
 * Gebaseerd op het Services.tsx design met gradient achtergrond,
 * paarse iconen, border-hover effects en bottom accent line.
 */
export function FeatureCard({
  title,
  description,
  icon: Icon,
  badge,
  children,
  variant = "primary",
  className = "",
  href,
  onClick,
}: FeatureCardProps) {
  const isPrimary = variant === "primary";
  
  const cardContent = (
    <div
      className={`
        relative h-full flex flex-col rounded-2xl p-6 transition-all duration-300 overflow-hidden
        ${isPrimary
          ? "bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/15"
          : "bg-gradient-to-br from-violet-50/70 via-white to-purple-50/50 border-2 border-violet-100 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/15"
        }
        hover:-translate-y-1.5
        ${className}
      `}
    >
      {/* Corner accent */}
      <div
        className={`
          absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-60
          ${isPrimary
            ? "bg-gradient-to-bl from-indigo-200/80 via-indigo-100/50 to-transparent"
            : "bg-gradient-to-bl from-violet-200/80 via-violet-100/50 to-transparent"
          }
        `}
      />

      {/* Bottom accent line */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-1
          ${isPrimary
            ? "bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400"
            : "bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400"
          }
        `}
      />

      {/* Icon */}
      {Icon && (
        <div
          className={`
            relative z-10 w-14 h-14 rounded-xl flex items-center justify-center mb-5
            transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
            ${isPrimary
              ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30"
              : "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
            }
          `}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
      )}

      {/* Title */}
      <h3 className="relative z-10 text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="relative z-10 text-slate-600 mb-4 flex-grow leading-relaxed">
          {description}
        </p>
      )}

      {/* Badge */}
      {badge && (
        <div className="relative z-10 text-sm mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
            {badge}
          </span>
        </div>
      )}

      {/* Children for custom content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );

  // Wrap with motion for animations
  const motionProps = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  if (href) {
    return (
      <motion.a href={href} className="group block h-full" {...motionProps}>
        {cardContent}
      </motion.a>
    );
  }

  if (onClick) {
    return (
      <motion.button onClick={onClick} className="group block h-full text-left w-full" {...motionProps}>
        {cardContent}
      </motion.button>
    );
  }

  return (
    <motion.div className="group h-full" {...motionProps}>
      {cardContent}
    </motion.div>
  );
}

/**
 * Simpelere card variant voor content cards (blog, portfolio).
 * Met image placeholder en gradient overlay.
 */
interface ContentCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  imagePlaceholder?: boolean;
  badges?: string[];
  footer?: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function ContentCard({
  title,
  subtitle,
  description,
  imagePlaceholder = true,
  badges = [],
  footer,
  variant = "primary",
  className = "",
}: ContentCardProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={`
        relative h-full flex flex-col rounded-2xl overflow-hidden transition-all duration-300
        ${isPrimary
          ? "bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/15"
          : "bg-gradient-to-br from-violet-50/70 via-white to-purple-50/50 border-2 border-violet-100 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/15"
        }
        hover:-translate-y-1.5
        ${className}
      `}
    >
      {/* Image placeholder */}
      {imagePlaceholder && (
        <div className="relative h-48 overflow-hidden">
          <div
            className={`
              absolute inset-0 flex items-center justify-center
              ${isPrimary
                ? "bg-gradient-to-br from-indigo-500/90 to-violet-600/90"
                : "bg-gradient-to-br from-violet-500/90 to-purple-600/90"
              }
              group-hover:scale-105 transition-transform duration-500
            `}
          >
            <span className="text-white/90 font-medium text-center px-4">
              {title}
            </span>
          </div>
          
          {/* Badges on image */}
          {badges.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {badges.map((badge, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-slate-700"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {subtitle && (
          <div className="text-sm text-indigo-600 font-medium mb-2">
            {subtitle}
          </div>
        )}
        
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        
        {description && (
          <p className="text-slate-600 mb-4 flex-grow">
            {description}
          </p>
        )}
        
        {footer && <div className="mt-auto">{footer}</div>}
      </div>

      {/* Bottom accent line */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-1
          ${isPrimary
            ? "bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400"
            : "bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400"
          }
        `}
      />
    </div>
  );
}

export default FeatureCard;
