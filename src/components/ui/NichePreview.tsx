"use client";

import { NicheExample } from "@/data/niche-examples";
import { Project } from "@/data/portfolio";

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
}

interface LayoutProps {
  colors: ColorScheme;
}

interface NichePreviewProps {
  example?: NicheExample;
  project?: Project;
  size?: "small" | "medium" | "large";
}

/**
 * Renders a realistic visual preview based on niche/industry type
 */
export default function NichePreview({ example, project }: NichePreviewProps) {
  const industry = example?.industry || project?.client || "";
  const category = example?.category || project?.category;
  const colors = example?.colorScheme || {
    primary: "#4F46E5",
    secondary: "#7C3AED",
    accent: "#F59E0B",
  };

  // Determine layout based on industry/category
  const getLayout = () => {
    if (category === "webshop") {
      return <WebshopLayout colors={colors} />;
    }
    
    if (industry.toLowerCase().includes("restaurant") || industry.toLowerCase().includes("horeca")) {
      return <RestaurantLayout colors={colors} />;
    }
    
    if (industry.toLowerCase().includes("tandarts") || industry.toLowerCase().includes("fysio") || industry.toLowerCase().includes("zorg")) {
      return <HealthcareLayout colors={colors} />;
    }
    
    if (industry.toLowerCase().includes("advocaat") || industry.toLowerCase().includes("accountant") || industry.toLowerCase().includes("professional")) {
      return <ProfessionalServicesLayout colors={colors} />;
    }
    
    if (industry.toLowerCase().includes("fitness") || industry.toLowerCase().includes("sportschool")) {
      return <FitnessLayout colors={colors} />;
    }
    
    if (industry.toLowerCase().includes("makelaar") || industry.toLowerCase().includes("real estate")) {
      return <RealEstateLayout colors={colors} />;
    }
    
    if (category === "webapp") {
      return <WebAppLayout colors={colors} />;
    }
    
    // Default business website
    return <BusinessWebsiteLayout colors={colors} />;
  };

  return (
    <div className="w-full h-full">
      {getLayout()}
    </div>
  );
}

// Restaurant Layout
function RestaurantLayout({ colors }: LayoutProps) {
  return (
    <div className="h-full bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="h-12 bg-white border-b border-amber-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full" style={{ background: colors.primary }}></div>
          <div className="space-y-1">
            <div className="h-2 w-20 rounded" style={{ background: colors.primary }}></div>
            <div className="h-1.5 w-16 rounded" style={{ background: colors.secondary, opacity: 0.6 }}></div>
          </div>
        </div>
        <div className="flex gap-2">
          {["Menu", "Reserveren", "Contact"].map((item, i) => (
            <div key={i} className="h-6 w-16 rounded" style={{ background: colors.accent, opacity: 0.3 }}></div>
          ))}
        </div>
      </div>
      
      {/* Hero */}
      <div className="h-32 bg-gradient-to-r" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-4 w-32 mx-auto rounded" style={{ background: "white", opacity: 0.9 }}></div>
            <div className="h-3 w-24 mx-auto rounded" style={{ background: "white", opacity: 0.7 }}></div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="h-3 w-3/4 rounded" style={{ background: colors.primary, opacity: 0.4 }}></div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square rounded-lg" style={{ background: colors.accent, opacity: 0.2 }}></div>
          ))}
        </div>
        <div className="h-2 w-2/3 rounded" style={{ background: colors.secondary, opacity: 0.3 }}></div>
      </div>
    </div>
  );
}

// Healthcare Layout (Tandarts, Fysio)
function HealthcareLayout({ colors }: LayoutProps) {
  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="h-14 bg-white border-b-2" style={{ borderColor: colors.primary }}>
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{ background: colors.primary }}></div>
            <div className="space-y-1.5">
              <div className="h-2.5 w-24 rounded" style={{ background: colors.primary }}></div>
              <div className="h-1.5 w-20 rounded" style={{ background: colors.secondary, opacity: 0.5 }}></div>
            </div>
          </div>
          <div className="h-8 w-28 rounded-full" style={{ background: colors.accent, opacity: 0.3 }}></div>
        </div>
      </div>
      
      {/* Hero */}
      <div className="h-40 bg-gradient-to-br" style={{ background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}15 100%)` }}>
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center space-y-3 w-full">
            <div className="h-5 w-48 mx-auto rounded" style={{ background: colors.primary, opacity: 0.8 }}></div>
            <div className="h-3 w-36 mx-auto rounded" style={{ background: colors.secondary, opacity: 0.6 }}></div>
            <div className="h-10 w-40 mx-auto rounded-full" style={{ background: colors.accent, opacity: 0.4 }}></div>
          </div>
        </div>
      </div>
      
      {/* Services Grid */}
      <div className="p-4">
        <div className="h-3 w-32 mb-3 rounded" style={{ background: colors.primary, opacity: 0.4 }}></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-lg border border-opacity-20" style={{ borderColor: colors.primary }}>
              <div className="p-2 space-y-2">
                <div className="h-2 w-3/4 rounded" style={{ background: colors.primary, opacity: 0.3 }}></div>
                <div className="h-1.5 w-1/2 rounded" style={{ background: colors.secondary, opacity: 0.2 }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Professional Services Layout (Advocaat, Accountant)
function ProfessionalServicesLayout({ colors }: LayoutProps) {
  return (
    <div className="h-full bg-slate-50">
      {/* Header */}
      <div className="h-16 bg-white shadow-sm">
        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded" style={{ background: colors.primary }}></div>
            <div className="space-y-2">
              <div className="h-3 w-32 rounded" style={{ background: colors.primary }}></div>
              <div className="h-2 w-24 rounded" style={{ background: colors.secondary, opacity: 0.5 }}></div>
            </div>
          </div>
          <div className="flex gap-3">
            {["Expertise", "Team", "Contact"].map((item, i) => (
              <div key={i} className="h-6 w-16 rounded" style={{ background: colors.primary, opacity: 0.2 }}></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Hero */}
      <div className="h-48 bg-white">
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-2xl w-full space-y-4">
            <div className="h-6 w-3/4 rounded" style={{ background: colors.primary, opacity: 0.8 }}></div>
            <div className="h-4 w-2/3 rounded" style={{ background: colors.secondary, opacity: 0.6 }}></div>
            <div className="h-4 w-4/5 rounded" style={{ background: colors.secondary, opacity: 0.4 }}></div>
            <div className="h-10 w-40 rounded" style={{ background: colors.accent, opacity: 0.5 }}></div>
          </div>
        </div>
      </div>
      
      {/* Content Grid */}
      <div className="p-6 grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="h-4 w-20 mb-3 rounded" style={{ background: colors.primary, opacity: 0.3 }}></div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded" style={{ background: colors.secondary, opacity: 0.2 }}></div>
              <div className="h-2 w-3/4 rounded" style={{ background: colors.secondary, opacity: 0.2 }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fitness Layout
function FitnessLayout({ colors }: LayoutProps) {
  return (
    <div className="h-full bg-slate-900">
      {/* Header */}
      <div className="h-14 bg-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full" style={{ background: colors.primary }}></div>
          <div className="h-3 w-24 rounded" style={{ background: "white", opacity: 0.9 }}></div>
        </div>
        <div className="flex gap-2">
          {["Lidmaatschap", "Lesrooster", "Contact"].map((item, i) => (
            <div key={i} className="h-6 w-20 rounded" style={{ background: colors.accent, opacity: 0.3 }}></div>
          ))}
        </div>
      </div>
      
      {/* Hero */}
      <div className="h-40 bg-gradient-to-r" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-5 w-40 mx-auto rounded" style={{ background: "white", opacity: 0.9 }}></div>
            <div className="h-10 w-32 mx-auto rounded-full" style={{ background: colors.accent, opacity: 0.8 }}></div>
          </div>
        </div>
      </div>
      
      {/* Packages */}
      <div className="p-4">
        <div className="h-3 w-28 mb-3 rounded" style={{ background: "white", opacity: 0.3 }}></div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-3 border border-opacity-30" style={{ borderColor: colors.accent }}>
              <div className="h-2 w-16 mb-2 rounded" style={{ background: colors.accent, opacity: 0.5 }}></div>
              <div className="h-1.5 w-12 rounded" style={{ background: "white", opacity: 0.2 }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Real Estate Layout
function RealEstateLayout({ colors }: LayoutProps) {
  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200">
        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded" style={{ background: colors.primary }}></div>
            <div className="h-3 w-28 rounded" style={{ background: colors.primary }}></div>
          </div>
          <div className="h-10 w-32 rounded-full" style={{ background: colors.accent, opacity: 0.3 }}></div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="h-20 bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl h-12 rounded-lg border-2" style={{ background: "white", borderColor: `${colors.primary}50` }}></div>
      </div>
      
      {/* Properties Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="h-24 bg-slate-200"></div>
              <div className="p-3 space-y-2">
                <div className="h-2.5 w-3/4 rounded" style={{ background: colors.primary, opacity: 0.4 }}></div>
                <div className="h-2 w-1/2 rounded" style={{ background: colors.secondary, opacity: 0.3 }}></div>
                <div className="h-2 w-1/3 rounded" style={{ background: colors.accent, opacity: 0.3 }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Webshop Layout
function WebshopLayout({ colors }: LayoutProps) {
  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="h-14 bg-white border-b border-slate-200">
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded" style={{ background: colors.primary }}></div>
            <div className="h-3 w-24 rounded" style={{ background: colors.primary }}></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-32 rounded" style={{ background: colors.secondary, opacity: 0.2 }}></div>
            <div className="w-8 h-8 rounded-full" style={{ background: colors.accent, opacity: 0.3 }}></div>
          </div>
        </div>
      </div>
      
      {/* Hero Banner */}
      <div className="h-32 bg-gradient-to-r" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}>
        <div className="h-full flex items-center justify-center">
          <div className="h-4 w-48 rounded" style={{ background: "white", opacity: 0.9 }}></div>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="p-4">
        <div className="h-3 w-24 mb-3 rounded" style={{ background: colors.primary, opacity: 0.4 }}></div>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="aspect-square bg-slate-100"></div>
              <div className="p-2 space-y-1.5">
                <div className="h-2 w-3/4 rounded" style={{ background: colors.primary, opacity: 0.3 }}></div>
                <div className="h-2 w-1/2 rounded" style={{ background: colors.accent, opacity: 0.4 }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Web App Layout
function WebAppLayout({ colors }: LayoutProps) {
  return (
    <div className="h-full bg-slate-50">
      {/* Sidebar */}
      <div className="h-full flex">
        <div className="w-16 bg-slate-800 flex flex-col items-center py-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-10 h-10 rounded-lg" style={{ background: colors.primary, opacity: i === 1 ? 0.8 : 0.3 }}></div>
          ))}
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <div className="h-4 w-32 rounded" style={{ background: colors.primary, opacity: 0.4 }}></div>
            <div className="w-10 h-10 rounded-full" style={{ background: colors.accent, opacity: 0.3 }}></div>
          </div>
          
          {/* Dashboard */}
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="h-3 w-16 mb-2 rounded" style={{ background: colors.secondary, opacity: 0.3 }}></div>
                  <div className="h-6 w-20 rounded" style={{ background: colors.primary, opacity: 0.4 }}></div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="h-4 w-32 mb-4 rounded" style={{ background: colors.primary, opacity: 0.4 }}></div>
              <div className="h-32 bg-slate-50 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default Business Website Layout
function BusinessWebsiteLayout({ colors }: LayoutProps) {
  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="h-14 bg-white border-b border-slate-200">
        <div className="h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded" style={{ background: colors.primary }}></div>
            <div className="h-3 w-28 rounded" style={{ background: colors.primary }}></div>
          </div>
          <div className="flex gap-3">
            {["Diensten", "Over Ons", "Contact"].map((item, i) => (
              <div key={i} className="h-6 w-16 rounded" style={{ background: colors.primary, opacity: 0.2 }}></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Hero */}
      <div className="h-40 bg-gradient-to-br" style={{ background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}15 100%)` }}>
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center space-y-3 max-w-xl">
            <div className="h-5 w-3/4 mx-auto rounded" style={{ background: colors.primary, opacity: 0.8 }}></div>
            <div className="h-3 w-2/3 mx-auto rounded" style={{ background: colors.secondary, opacity: 0.6 }}></div>
            <div className="h-10 w-36 mx-auto rounded-full" style={{ background: colors.accent, opacity: 0.4 }}></div>
          </div>
        </div>
      </div>
      
      {/* Services */}
      <div className="p-6">
        <div className="h-3 w-32 mb-4 rounded" style={{ background: colors.primary, opacity: 0.4 }}></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-4">
              <div className="h-8 w-8 rounded-lg mb-3" style={{ background: colors.primary, opacity: 0.3 }}></div>
              <div className="h-2.5 w-3/4 mb-2 rounded" style={{ background: colors.primary, opacity: 0.4 }}></div>
              <div className="h-2 w-full rounded" style={{ background: colors.secondary, opacity: 0.2 }}></div>
              <div className="h-2 w-2/3 rounded" style={{ background: colors.secondary, opacity: 0.2 }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
