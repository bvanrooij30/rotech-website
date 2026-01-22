"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Shield,
  FileText,
  Package,
  Settings,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Minus,
  Loader2,
  Download,
  Globe,
  Search,
  Workflow,
  Link2,
  Wrench,
} from "lucide-react";
import { generateQuotePDF, generateQuoteNumber } from "@/lib/quote-pdf";
import {
  packageDefinitions,
  allFeatures,
  getFeaturesForPackage,
  getFeaturesByCategory,
  getFeatureById,
  getPackageById,
  calculateQuoteTotal,
  calculateCancellationFee,
  cancellationTiers,
  categoryNames,
  maintenancePlans,
  type SelectedFeature,
  type SelectableFeature,
  type PackageDefinition,
  type FeatureCategory,
  type ServiceType,
} from "@/data/packages";
import { formatPrice } from "@/lib/stripe";

// Service types met iconen en info
const serviceTypeOptions = [
  {
    id: "website" as ServiceType,
    name: "Website of Webshop",
    description: "Een nieuwe website, webshop of web applicatie laten bouwen",
    icon: Globe,
    color: "from-indigo-500 to-violet-600",
  },
  {
    id: "seo" as ServiceType,
    name: "SEO Optimalisatie",
    description: "Uw bestaande website beter vindbaar maken in Google",
    icon: Search,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "automation" as ServiceType,
    name: "Automatisering",
    description: "Bedrijfsprocessen automatiseren en tijd besparen",
    icon: Workflow,
    color: "from-orange-500 to-amber-600",
  },
  {
    id: "maintenance" as ServiceType,
    name: "Website Onderhoud",
    description: "Onderhoud van uw bestaande website overnemen",
    icon: Wrench,
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "integration" as ServiceType,
    name: "API & Integraties",
    description: "Systemen koppelen en data synchroniseren",
    icon: Link2,
    color: "from-purple-500 to-pink-600",
  },
];

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  postalCode: string;
  city: string;
  kvkNumber: string;
}

interface LegalAgreements {
  termsAccepted: boolean;
  quoteAccepted: boolean;
  cancellationAccepted: boolean;
  privacyAccepted: boolean;
}

export default function QuoteBuilder() {
  const searchParams = useSearchParams();
  const preselectedPackage = searchParams.get("pakket");
  const preselectedService = searchParams.get("dienst") as ServiceType | null;
  
  // Step 0 = service type, step 1+ = depends on service type
  const [step, setStep] = useState(preselectedService ? 1 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Service type selection (website, seo, automation, maintenance, integration)
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(preselectedService);
  
  // Package selection (only for website service type)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(preselectedPackage);
  
  // Maintenance plan selection
  const [selectedMaintenancePlan, setSelectedMaintenancePlan] = useState<string | null>(null);
  
  // Feature selection
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>([]);
  
  // Customer info
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    postalCode: "",
    city: "",
    kvkNumber: "",
  });
  
  // Legal agreements
  const [agreements, setAgreements] = useState<LegalAgreements>({
    termsAccepted: false,
    quoteAccepted: false,
    cancellationAccepted: false,
    privacyAccepted: false,
  });
  
  // Signature
  const [signature, setSignature] = useState("");
  const [signatureDate] = useState(new Date().toLocaleDateString("nl-NL"));
  
  // Quote number for PDF
  const [quoteNumber] = useState(() => generateQuoteNumber());

  // Get selected package
  const selectedPackage = selectedPackageId ? getPackageById(selectedPackageId) : null;
  
  // Get available features for package
  const availableFeatures = useMemo(() => {
    if (!selectedPackageId) return [];
    return getFeaturesForPackage(selectedPackageId);
  }, [selectedPackageId]);
  
  // Group features by category
  const groupedFeatures = useMemo(() => {
    return getFeaturesByCategory(availableFeatures);
  }, [availableFeatures]);
  
  // Calculate total
  const quoteTotal = useMemo(() => {
    return calculateQuoteTotal(selectedFeatures);
  }, [selectedFeatures]);
  
  // Calculate cancellation fee (before start phase)
  const cancellationFee = useMemo(() => {
    return calculateCancellationFee(quoteTotal, "before_start");
  }, [quoteTotal]);

  // Initialize features when package changes
  useEffect(() => {
    if (selectedPackage) {
      const initialFeatures: SelectedFeature[] = [];
      
      // Add required features
      for (const featureId of selectedPackage.requiredFeatures) {
        const feature = getFeatureById(featureId);
        if (feature) {
          initialFeatures.push({
            featureId,
            quantity: feature.defaultQuantity || 1,
          });
        }
      }
      
      // Add recommended features
      for (const featureId of selectedPackage.recommendedFeatures) {
        if (!initialFeatures.find(f => f.featureId === featureId)) {
          const feature = getFeatureById(featureId);
          if (feature) {
            initialFeatures.push({
              featureId,
              quantity: feature.defaultQuantity || 1,
            });
          }
        }
      }
      
      setSelectedFeatures(initialFeatures);
    }
  }, [selectedPackage]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // Toggle feature selection
  const toggleFeature = (featureId: string) => {
    const feature = getFeatureById(featureId);
    if (!feature) return;
    
    // Check if required
    if (selectedPackage?.requiredFeatures.includes(featureId)) return;
    
    setSelectedFeatures(prev => {
      const exists = prev.find(f => f.featureId === featureId);
      if (exists) {
        return prev.filter(f => f.featureId !== featureId);
      } else {
        return [...prev, { featureId, quantity: feature.defaultQuantity || 1 }];
      }
    });
  };
  
  // Update feature quantity
  const updateQuantity = (featureId: string, delta: number) => {
    const feature = getFeatureById(featureId);
    if (!feature || !feature.unit) return;
    
    setSelectedFeatures(prev => {
      return prev.map(f => {
        if (f.featureId === featureId) {
          const newQuantity = Math.max(
            feature.minQuantity || 1,
            Math.min(feature.maxQuantity || 99, f.quantity + delta)
          );
          return { ...f, quantity: newQuantity };
        }
        return f;
      });
    });
  };
  
  // Check if feature is selected
  const isFeatureSelected = (featureId: string) => {
    return selectedFeatures.some(f => f.featureId === featureId);
  };
  
  // Get feature quantity
  const getFeatureQuantity = (featureId: string) => {
    return selectedFeatures.find(f => f.featureId === featureId)?.quantity || 0;
  };

  // Helper to determine what step type we're on
  const getStepType = () => {
    if (step === 0) return "serviceType";
    
    if (selectedServiceType === "website") {
      if (step === 1) return "package";
      if (step === 2) return "features";
      if (step === 3) return "customerInfo";
      if (step === 4) return "agreement";
      if (step === 5) return "success";
    }
    
    if (selectedServiceType === "maintenance") {
      if (step === 1) return "maintenancePlan";
      if (step === 2) return "customerInfo";
      if (step === 3) return "agreement";
      if (step === 4) return "success";
    }
    
    // SEO, automation, integration
    if (step === 1) return "features";
    if (step === 2) return "customerInfo";
    if (step === 3) return "agreement";
    if (step === 4) return "success";
    
    return "unknown";
  };
  
  const stepType = getStepType();
  
  // Check if customer info is valid
  const isCustomerInfoValid = () => {
    return (
      customerInfo.name &&
      customerInfo.email &&
      customerInfo.phone &&
      customerInfo.address &&
      customerInfo.postalCode &&
      customerInfo.city
    );
  };
  
  // Check if agreements are valid
  const isAgreementsValid = () => {
    // For maintenance, we don't need cancellation accepted
    if (selectedServiceType === "maintenance") {
      return (
        agreements.termsAccepted &&
        agreements.quoteAccepted &&
        agreements.privacyAccepted &&
        signature.trim().length > 0
      );
    }
    return (
      agreements.termsAccepted &&
      agreements.quoteAccepted &&
      agreements.cancellationAccepted &&
      agreements.privacyAccepted &&
      signature.trim().length > 0
    );
  };

  // Validate step
  const canProceed = () => {
    switch (stepType) {
      case "serviceType":
        return selectedServiceType !== null;
      case "package":
        return selectedPackageId !== null;
      case "maintenancePlan":
        return selectedMaintenancePlan !== null;
      case "features":
        // For non-website services, features are optional (just a starting point)
        if (selectedServiceType !== "website") return true;
        return selectedFeatures.length > 0;
      case "customerInfo":
        return isCustomerInfoValid();
      case "agreement":
        return isAgreementsValid();
      default:
        return false;
    }
  };

  // Get success step number based on service type
  const getSuccessStep = () => {
    if (selectedServiceType === "website") return 5;
    return 4; // maintenance, seo, automation, integration
  };

  // Submit quote request
  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Build feature list for submission
      const featureDetails = selectedFeatures.map(sf => {
        const feature = getFeatureById(sf.featureId);
        return {
          id: sf.featureId,
          name: feature?.name || "",
          quantity: sf.quantity,
        };
      });
      
      // Build request body based on service type
      const requestBody: Record<string, unknown> = {
        serviceType: selectedServiceType,
        customer: customerInfo,
        agreements: {
          ...agreements,
          signature,
          signatureDate,
        },
      };
      
      if (selectedServiceType === "website") {
        requestBody.packageId = selectedPackageId;
        requestBody.packageName = selectedPackage?.name;
        requestBody.features = featureDetails;
        requestBody.totalAmount = quoteTotal;
        requestBody.cancellationFee = cancellationFee;
      } else if (selectedServiceType === "maintenance") {
        const plan = maintenancePlans.find(p => p.id === selectedMaintenancePlan);
        requestBody.maintenancePlanId = selectedMaintenancePlan;
        requestBody.maintenancePlanName = plan?.name;
        requestBody.monthlyPrice = plan?.price;
      } else {
        // SEO, automation, integration
        requestBody.features = featureDetails;
        requestBody.totalAmount = quoteTotal;
      }
      
      const response = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Er is een fout opgetreden");
      }
      
      setSubmitSuccess(true);
      setStep(getSuccessStep());
      
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Er is een fout opgetreden");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download quote as PDF
  const handleDownloadPDF = () => {
    if (!selectedPackage) return;
    
    generateQuotePDF({
      quoteNumber,
      date: new Date().toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      package: selectedPackage,
      selectedFeatures,
      totalAmount: quoteTotal,
      customerName: customerInfo.name || undefined,
      customerEmail: customerInfo.email || undefined,
    });
  };

  // Render feature card
  const renderFeatureCard = (feature: SelectableFeature) => {
    const isSelected = isFeatureSelected(feature.id);
    const isRequired = selectedPackage?.requiredFeatures.includes(feature.id);
    const quantity = getFeatureQuantity(feature.id);
    const featurePrice = feature.price * (isSelected ? quantity : 1);
    
    return (
      <div
        key={feature.id}
        className={`p-4 rounded-xl border-2 transition-all ${
          isRequired
            ? "border-indigo-300 bg-indigo-50 cursor-not-allowed"
            : isSelected
            ? "border-indigo-600 bg-indigo-50 cursor-pointer hover:shadow-md"
            : "border-slate-200 hover:border-slate-300 cursor-pointer"
        }`}
        onClick={() => !isRequired && toggleFeature(feature.id)}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
              isSelected || isRequired
                ? "bg-indigo-600 border-indigo-600"
                : "border-slate-300"
            }`}
          >
            {(isSelected || isRequired) && <Check className="w-3 h-3 text-white" />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-slate-900">{feature.name}</h4>
                {isRequired && (
                  <span className="text-xs bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded">
                    Inbegrepen
                  </span>
                )}
                {feature.isIncluded && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                    Gratis
                  </span>
                )}
              </div>
              {/* Price indicator */}
              {!feature.isIncluded && feature.price > 0 && (
                <span className={`text-sm font-medium shrink-0 ml-2 ${
                  isSelected ? "text-indigo-600" : "text-slate-400"
                }`}>
                  {feature.unit 
                    ? `${formatPrice(feature.price)}/${feature.unit}`
                    : formatPrice(feature.price)
                  }
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-1">{feature.description}</p>
            
            {/* Quantity selector */}
            {feature.unit && isSelected && (
              <div className="flex items-center justify-between mt-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">Aantal:</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(feature.id, -1)}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                    disabled={quantity <= (feature.minQuantity || 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(feature.id, 1)}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                    disabled={quantity >= (feature.maxQuantity || 99)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-slate-500">{feature.unit}</span>
                </div>
                {/* Subtotal for quantity features */}
                <span className="text-sm font-medium text-indigo-600">
                  = {formatPrice(featurePrice)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Get steps based on service type
  const getSteps = () => {
    if (!selectedServiceType) {
      return [{ num: 0, label: "Dienst", icon: Package }];
    }
    
    if (selectedServiceType === "website") {
      return [
        { num: 0, label: "Dienst", icon: Globe },
        { num: 1, label: "Pakket", icon: Package },
        { num: 2, label: "Functies", icon: Settings },
        { num: 3, label: "Gegevens", icon: User },
        { num: 4, label: "Akkoord", icon: FileText },
      ];
    }
    
    if (selectedServiceType === "maintenance") {
      return [
        { num: 0, label: "Dienst", icon: Globe },
        { num: 1, label: "Plan", icon: Package },
        { num: 2, label: "Gegevens", icon: User },
        { num: 3, label: "Akkoord", icon: FileText },
      ];
    }
    
    // SEO, automation, integration - direct naar functies
    return [
      { num: 0, label: "Dienst", icon: Globe },
      { num: 1, label: "Opties", icon: Settings },
      { num: 2, label: "Gegevens", icon: User },
      { num: 3, label: "Akkoord", icon: FileText },
    ];
  };
  
  const steps = getSteps();
  const maxStep = steps[steps.length - 1].num;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Offerte Aanvragen</h1>
        <div className="flex items-center gap-2 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step > s.num
                    ? "bg-emerald-500"
                    : step === s.num
                    ? "bg-white text-indigo-600"
                    : "bg-white/20"
                }`}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span className="ml-2 hidden sm:inline text-sm font-medium whitespace-nowrap">
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-2 ${
                  step > s.num ? "bg-emerald-500" : "bg-white/20"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {/* Step 0: Service Type Selection */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Wat wilt u laten maken?
              </h2>
              <p className="text-slate-600 mb-6">
                Kies de dienst die het beste bij uw wensen past. Op basis hiervan stellen we de juiste opties samen.
              </p>

              <div className="grid gap-4">
                {serviceTypeOptions.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <label
                      key={service.id}
                      className={`block p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedServiceType === service.id
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="serviceType"
                          value={service.id}
                          checked={selectedServiceType === service.id}
                          onChange={() => {
                            setSelectedServiceType(service.id);
                            // Reset selections when changing service type
                            setSelectedPackageId(null);
                            setSelectedFeatures([]);
                            setSelectedMaintenancePlan(null);
                          }}
                          className="mt-1 w-5 h-5 text-indigo-600"
                        />
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shrink-0`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 text-lg">{service.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          )}
          
          {/* Step 1: Package Selection (Website only) */}
          {step === 1 && selectedServiceType === "website" && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Kies uw pakket
              </h2>
              <p className="text-slate-600 mb-6">
                Selecteer het pakket dat het beste bij uw project past. In de volgende stap kiest u de exacte functies.
              </p>

              <div className="grid gap-4">
                {packageDefinitions.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`block p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedPackageId === pkg.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    } ${pkg.popular ? "ring-2 ring-emerald-500 ring-offset-2" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="package"
                        value={pkg.id}
                        checked={selectedPackageId === pkg.id}
                        onChange={() => setSelectedPackageId(pkg.id)}
                        className="mt-1 w-5 h-5 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-lg">{pkg.name}</h3>
                          <span className="text-sm text-indigo-600 font-medium">{pkg.subtitle}</span>
                          {pkg.popular && (
                            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                              Populair
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{pkg.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            {pkg.deliveryTime}
                          </span>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            Ideaal voor: {pkg.idealFor}
                          </span>
                        </div>
                        
                        {/* Price indicator */}
                        <div className="mt-4 p-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-lg">
                          <p className="text-sm font-medium text-slate-700">
                            Prijs op basis van uw wensen
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            U bepaalt zelf welke functies u nodig heeft
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Maintenance Plan Selection */}
          {step === 1 && selectedServiceType === "maintenance" && (
            <motion.div
              key="step1-maintenance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Kies uw onderhoudsplan
              </h2>
              <p className="text-slate-600 mb-6">
                Selecteer het plan dat het beste past bij uw behoeften. Alle plannen bevatten essentiële diensten.
              </p>

              <div className="grid gap-4">
                {maintenancePlans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`block p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedMaintenancePlan === plan.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    } ${plan.id === "business" ? "ring-2 ring-emerald-500 ring-offset-2" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="maintenancePlan"
                        value={plan.id}
                        checked={selectedMaintenancePlan === plan.id}
                        onChange={() => setSelectedMaintenancePlan(plan.id)}
                        className="mt-1 w-5 h-5 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                            {plan.id === "business" && (
                              <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                                Populair
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-indigo-600">{formatPrice(plan.price)}</span>
                            <span className="text-sm text-slate-500">/maand</span>
                          </div>
                        </div>
                        <ul className="space-y-2 mt-4">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {plan.hoursIncluded > 0 && (
                          <p className="mt-3 text-sm text-indigo-600 font-medium">
                            Inclusief {plan.hoursIncluded} uur content wijzigingen per maand
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Feature Selection for SEO, Automation, Integration */}
          {step === 1 && (selectedServiceType === "seo" || selectedServiceType === "automation" || selectedServiceType === "integration") && (
            <motion.div
              key="step1-features"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {selectedServiceType === "seo" && "SEO Opties"}
                {selectedServiceType === "automation" && "Automatisering Opties"}
                {selectedServiceType === "integration" && "Integratie Opties"}
              </h2>
              <p className="text-slate-600 mb-6">
                Selecteer de diensten die u nodig heeft. Wij nemen contact met u op voor een gedetailleerde bespreking.
              </p>

              <div className="space-y-4">
                {allFeatures
                  .filter(f => {
                    if (selectedServiceType === "seo") return f.category === "seo";
                    if (selectedServiceType === "automation") return f.category === "automation";
                    if (selectedServiceType === "integration") return f.category === "integration";
                    return false;
                  })
                  .map((feature) => renderFeatureCard(feature))}
              </div>

              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Prijzen zijn indicatief</p>
                    <p className="text-sm text-amber-700">
                      De exacte prijs hangt af van uw specifieke situatie. Na ontvangst van uw aanvraag 
                      nemen wij contact op voor een vrijblijvend adviesgesprek.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Feature Selection (Website only) */}
          {step === 2 && selectedServiceType === "website" && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Selecteer uw functies
              </h2>
              <p className="text-slate-600 mb-6">
                Kies de functies die u nodig heeft voor uw {selectedPackage?.name}. 
                Aanbevolen functies zijn al aangevinkt.
              </p>

              {/* Feature categories */}
              <div className="space-y-8">
                {(Object.entries(groupedFeatures) as [FeatureCategory, SelectableFeature[]][])
                  .filter(([, features]) => features.length > 0)
                  .map(([category, features]) => (
                    <div key={category}>
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Settings className="w-4 h-4 text-indigo-600" />
                        </div>
                        {categoryNames[category]}
                      </h3>
                      <div className="grid gap-3">
                        {features.map(renderFeatureCard)}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Info box */}
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Tip</p>
                    <p className="text-sm text-amber-700">
                      Weet u niet zeker welke functies u nodig heeft? Geen probleem! 
                      Selecteer wat u denkt nodig te hebben - wij adviseren u graag na ontvangst van uw aanvraag.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Customer Info Step */}
          {stepType === "customerInfo" && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Uw gegevens
              </h2>
              <p className="text-slate-600 mb-6">
                Vul uw contactgegevens in voor de offerte.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Volledige naam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Uw volledige naam"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="uw@email.nl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefoon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="+31 6 12345678"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bedrijfsnaam
                  </label>
                  <input
                    type="text"
                    value={customerInfo.company}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Uw bedrijfsnaam (optioneel)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Adres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Straat en huisnummer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Postcode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.postalCode}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="1234 AB"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Plaats <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Uw woonplaats"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    KvK-nummer
                  </label>
                  <input
                    type="text"
                    value={customerInfo.kvkNumber}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, kvkNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="12345678 (optioneel)"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Quote Review & Legal Step */}
          {stepType === "agreement" && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Offerte Overzicht & Akkoord
              </h2>
              <p className="text-slate-600 mb-6">
                Controleer uw offerte en geef akkoord om de opdracht te starten.
              </p>

              {/* Quote Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Offerte #{new Date().getFullYear()}-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                </h3>
                
                {/* Package */}
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <p className="text-sm text-slate-500">Pakket</p>
                  <p className="font-medium text-slate-900">{selectedPackage?.name} - {selectedPackage?.subtitle}</p>
                </div>
                
                {/* Selected Features */}
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <p className="text-sm text-slate-500 mb-2">Geselecteerde functies</p>
                  <ul className="space-y-1">
                    {selectedFeatures.map(sf => {
                      const feature = getFeatureById(sf.featureId);
                      return (
                        <li key={sf.featureId} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-slate-700">
                            {feature?.name}
                            {sf.quantity > 1 && ` (${sf.quantity}x)`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                {/* Customer */}
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <p className="text-sm text-slate-500 mb-2">Klantgegevens</p>
                  <div className="text-sm text-slate-700">
                    <p className="font-medium">{customerInfo.name}</p>
                    {customerInfo.company && <p>{customerInfo.company}</p>}
                    <p>{customerInfo.address}</p>
                    <p>{customerInfo.postalCode} {customerInfo.city}</p>
                    <p className="mt-2">{customerInfo.email}</p>
                    <p>{customerInfo.phone}</p>
                  </div>
                </div>
                
                {/* Total */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Totaal (excl. BTW)</p>
                    <p className="text-3xl font-bold text-indigo-600">{formatPrice(quoteTotal)}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Incl. BTW (21%): {formatPrice(quoteTotal * 1.21)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Levertijd</p>
                    <p className="font-medium text-slate-900">{selectedPackage?.deliveryTime}</p>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
                <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Annuleringsbeleid
                </h4>
                <p className="text-sm text-amber-700 mb-4">
                  Bij annulering van de opdracht zijn de volgende kosten van toepassing:
                </p>
                <div className="grid gap-2">
                  {cancellationTiers.map(tier => (
                    <div key={tier.phase} className="flex justify-between text-sm">
                      <span className="text-amber-800">{tier.description}</span>
                      <span className="font-medium text-amber-900">
                        {tier.percentage}% (min. {formatPrice(tier.minimumFee)})
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-amber-700 mt-4">
                  <strong>Uw huidige annuleringskosten:</strong> {formatPrice(cancellationFee)} 
                  (voor start project)
                </p>
              </div>

              {/* Legal Agreements */}
              <div className="space-y-4 mb-6">
                <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300">
                  <input
                    type="checkbox"
                    checked={agreements.termsAccepted}
                    onChange={(e) => setAgreements({ ...agreements, termsAccepted: e.target.checked })}
                    className="mt-1 w-5 h-5 text-indigo-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      Ik ga akkoord met de{" "}
                      <a href="/algemene-voorwaarden" target="_blank" className="text-indigo-600 hover:underline">
                        algemene voorwaarden
                      </a>
                      <span className="text-red-500"> *</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      Inclusief betalingsvoorwaarden, intellectueel eigendom en aansprakelijkheid.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300">
                  <input
                    type="checkbox"
                    checked={agreements.quoteAccepted}
                    onChange={(e) => setAgreements({ ...agreements, quoteAccepted: e.target.checked })}
                    className="mt-1 w-5 h-5 text-indigo-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      Ik accepteer deze offerte van {formatPrice(quoteTotal)} (excl. BTW)
                      <span className="text-red-500"> *</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      Door akkoord te gaan geeft u RoTech Development opdracht om het project te starten.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300">
                  <input
                    type="checkbox"
                    checked={agreements.cancellationAccepted}
                    onChange={(e) => setAgreements({ ...agreements, cancellationAccepted: e.target.checked })}
                    className="mt-1 w-5 h-5 text-indigo-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      Ik begrijp het annuleringsbeleid
                      <span className="text-red-500"> *</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      Bij annulering worden de hierboven genoemde annuleringskosten in rekening gebracht.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300">
                  <input
                    type="checkbox"
                    checked={agreements.privacyAccepted}
                    onChange={(e) => setAgreements({ ...agreements, privacyAccepted: e.target.checked })}
                    className="mt-1 w-5 h-5 text-indigo-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      Ik ga akkoord met het{" "}
                      <a href="/privacy" target="_blank" className="text-indigo-600 hover:underline">
                        privacybeleid
                      </a>
                      <span className="text-red-500"> *</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      Uw gegevens worden verwerkt conform de AVG.
                    </p>
                  </div>
                </label>
              </div>

              {/* Digital Signature */}
              <div className="bg-slate-50 rounded-xl p-5 mb-6">
                <h4 className="font-bold text-slate-900 mb-3">
                  Digitale handtekening <span className="text-red-500">*</span>
                </h4>
                <p className="text-sm text-slate-600 mb-4">
                  Typ uw volledige naam als digitale handtekening om akkoord te geven.
                </p>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 font-signature text-lg"
                  placeholder="Uw volledige naam"
                  style={{ fontFamily: "'Brush Script MT', cursive" }}
                />
                <p className="text-sm text-slate-500 mt-2">
                  Datum: {signatureDate}
                </p>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-red-700">{submitError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Bezig met verzenden...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Offerte Accepteren & Opdracht Versturen
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Veilig & vertrouwd</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Juridisch bindend</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success Step */}
          {stepType === "success" && submitSuccess && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Opdracht Ontvangen!
              </h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Bedankt voor uw vertrouwen! Wij hebben uw opdracht ontvangen en nemen 
                binnen 24 uur contact met u op om de details te bespreken en de volgende stappen te plannen.
              </p>
              
              <div className="bg-slate-50 rounded-xl p-6 max-w-md mx-auto mb-8">
                <h3 className="font-bold text-slate-900 mb-3">Wat nu?</h3>
                <ol className="text-left text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                    <span>U ontvangt een bevestiging per e-mail</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                    <span>Wij plannen een kennismakingsgesprek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                    <span>Na goedkeuring ontvangt u de factuur voor de aanbetaling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">4</span>
                    <span>Wij starten met uw project!</span>
                  </li>
                </ol>
              </div>
              
              <a href="/" className="btn-primary inline-flex items-center gap-2">
                Terug naar Home
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {stepType !== "success" && (
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Vorige
              </button>
            ) : (
              <div />
            )}

            {stepType !== "agreement" && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
              >
                Volgende
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Floating Price Summary */}
        {step >= 1 && stepType !== "success" && (selectedServiceType === "website" ? step >= 2 : true) && (
          <div className="mt-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-indigo-600 font-medium">
                    {selectedServiceType === "maintenance" ? "Uw plan" : "Uw offerte"}
                  </p>
                  <p className="text-3xl font-bold text-indigo-700">
                    {selectedServiceType === "maintenance" && selectedMaintenancePlan
                      ? formatPrice(maintenancePlans.find(p => p.id === selectedMaintenancePlan)?.price || 0)
                      : formatPrice(quoteTotal)}
                  </p>
                  <p className="text-xs text-indigo-500">
                    {selectedServiceType === "maintenance" ? "per maand" : "excl. BTW"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    {selectedServiceType === "maintenance" ? (
                      <Wrench className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <Package className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quick breakdown */}
              <div className="pt-3 border-t border-indigo-200/50 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-600">Dienst</span>
                  <span className="font-medium text-indigo-700">
                    {serviceTypeOptions.find(s => s.id === selectedServiceType)?.name}
                  </span>
                </div>
                {selectedServiceType === "website" && selectedPackage && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-600">Pakket</span>
                      <span className="font-medium text-indigo-700">{selectedPackage.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-600">Functies</span>
                      <span className="font-medium text-indigo-700">{selectedFeatures.length} geselecteerd</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-600">Incl. BTW (21%)</span>
                      <span className="font-medium text-indigo-700">{formatPrice(quoteTotal * 1.21)}</span>
                    </div>
                  </>
                )}
                {selectedServiceType === "maintenance" && selectedMaintenancePlan && (
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-600">Plan</span>
                    <span className="font-medium text-indigo-700">
                      {maintenancePlans.find(p => p.id === selectedMaintenancePlan)?.name}
                    </span>
                  </div>
                )}
                {(selectedServiceType === "seo" || selectedServiceType === "automation" || selectedServiceType === "integration") && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-indigo-600">Opties</span>
                      <span className="font-medium text-indigo-700">{selectedFeatures.length} geselecteerd</span>
                    </div>
                    {quoteTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-indigo-600">Geschat (incl. BTW)</span>
                        <span className="font-medium text-indigo-700">{formatPrice(quoteTotal * 1.21)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Deposit indicator (only for website projects) */}
            {selectedServiceType === "website" && quoteTotal > 0 && (
              <div className="bg-indigo-100/50 px-4 py-2 border-t border-indigo-200/50">
                <div className="flex justify-between text-xs">
                  <span className="text-indigo-600">Aanbetaling (50%)</span>
                  <span className="font-medium text-indigo-700">{formatPrice(quoteTotal * 0.5)}</span>
                </div>
              </div>
            )}
            
            {/* Download PDF Button (only for website projects with selected features) */}
            {selectedServiceType === "website" && selectedFeatures.length > 0 && (
              <div className="p-4 border-t border-indigo-200/50">
                <button
                  onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-indigo-200 text-indigo-700 rounded-xl font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Geschatte Offerte (PDF)</span>
              </button>
              <p className="text-xs text-indigo-500 text-center mt-2">
                Vrijblijvend - definitieve prijs na bespreking
              </p>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
