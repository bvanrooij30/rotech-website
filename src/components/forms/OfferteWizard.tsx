"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, CheckCircle, Globe, ShoppingCart, Layers, Smartphone, HelpCircle } from "lucide-react";

const offerteSchema = z.object({
  // Step 1
  name: z.string().min(2, "Naam is verplicht"),
  email: z.string().email("Voer een geldig e-mailadres in"),
  phone: z.string().min(10, "Voer een geldig telefoonnummer in"),
  company: z.string().optional(),
  // Step 2
  projectType: z.enum(["website", "webshop", "webapp", "app", "andere"]),
  // Step 3
  currentWebsite: z.string().optional(),
  description: z.string().min(20, "Beschrijf uw project in minimaal 20 karakters"),
  features: z.array(z.string()).optional(),
  deadline: z.string().optional(),
  // Step 4
  budgetRange: z.enum([
    "< €2.500",
    "€2.500 - €5.000",
    "€5.000 - €10.000",
    "€10.000 - €20.000",
    "> €20.000",
    "Weet ik nog niet",
  ]),
  // Step 5
  howDidYouFindUs: z.string().optional(),
  additionalInfo: z.string().optional(),
  privacy: z.boolean().refine((val) => val === true, {
    message: "U moet akkoord gaan met het privacybeleid",
  }),
});

type OfferteFormData = z.infer<typeof offerteSchema>;

const projectTypes = [
  { id: "website", label: "Website", icon: Globe, description: "Bedrijfswebsite, portfolio, landing page" },
  { id: "webshop", label: "Webshop", icon: ShoppingCart, description: "E-commerce, online verkopen" },
  { id: "webapp", label: "Web Applicatie", icon: Layers, description: "Portaal, dashboard, maatwerk" },
  { id: "app", label: "Mobile App", icon: Smartphone, description: "iOS, Android, cross-platform" },
  { id: "andere", label: "Anders", icon: HelpCircle, description: "Automatisering, API, etc." },
];

const featureOptions = [
  "Contactformulier",
  "Blog/Nieuws sectie",
  "Portfolio/Projecten",
  "Klantportaal met login",
  "Betalingen (iDEAL)",
  "Boekhoud koppeling",
  "Meertalig (NL/EN)",
  "Zoekmachine optimalisatie",
  "Onderhoud & support",
];

const budgetOptions = [
  "< €2.500",
  "€2.500 - €5.000",
  "€5.000 - €10.000",
  "€10.000 - €20.000",
  "> €20.000",
  "Weet ik nog niet",
];

const referralOptions = [
  "Google zoeken",
  "Social media",
  "Aanbeveling",
  "LinkedIn",
  "Anders",
];

export default function OfferteWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const totalSteps = 5;

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OfferteFormData>({
    resolver: zodResolver(offerteSchema),
    defaultValues: {
      features: [],
    },
  });

  const selectedProjectType = watch("projectType");

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof OfferteFormData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ["name", "email", "phone"];
        break;
      case 2:
        fieldsToValidate = ["projectType"];
        break;
      case 3:
        fieldsToValidate = ["description"];
        break;
      case 4:
        fieldsToValidate = ["budgetRange"];
        break;
      case 5:
        fieldsToValidate = ["privacy"];
        break;
    }

    return await trigger(fieldsToValidate);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((f) => f !== feature)
      : [...selectedFeatures, feature];
    setSelectedFeatures(newFeatures);
    setValue("features", newFeatures);
  };

  const onSubmit = async (data: OfferteFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/offerte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Er is iets misgegaan. Probeer het later opnieuw.");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-3xl font-bold text-slate-900 mb-4">
          Bedankt voor uw aanvraag!
        </h3>
        <p className="text-lg text-slate-600 mb-6 max-w-md mx-auto">
          Wij hebben uw offerte-aanvraag ontvangen en nemen binnen 24 uur contact met u op.
        </p>
        <Link href="/" className="btn-primary">
          Terug naar Home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                i + 1 === currentStep
                  ? "bg-indigo-600 text-white"
                  : i + 1 < currentStep
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {i + 1 < currentStep ? "✓" : i + 1}
            </div>
          ))}
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Contact Details */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Uw contactgegevens
              </h2>
              <p className="text-slate-600">Hoe kunnen wij u bereiken?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Naam <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  type="text"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.name ? "border-red-300" : "border-slate-200"
                  } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200`}
                  placeholder="Uw volledige naam"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.email ? "border-red-300" : "border-slate-200"
                  } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200`}
                  placeholder="uw@email.nl"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Telefoon <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("phone")}
                  type="tel"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.phone ? "border-red-300" : "border-slate-200"
                  } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200`}
                  placeholder="+31 6 12345678"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bedrijf
                </label>
                <input
                  {...register("company")}
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="Uw bedrijfsnaam (optioneel)"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Project Type */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Wat wilt u laten maken?
              </h2>
              <p className="text-slate-600">Selecteer het type project</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <label
                    key={type.id}
                    className={`block p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedProjectType === type.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      {...register("projectType")}
                      type="radio"
                      value={type.id}
                      className="sr-only"
                    />
                    <IconComponent
                      className={`w-8 h-8 mb-3 ${
                        selectedProjectType === type.id
                          ? "text-indigo-600"
                          : "text-slate-400"
                      }`}
                    />
                    <h3 className="font-semibold text-slate-900">{type.label}</h3>
                    <p className="text-sm text-slate-500">{type.description}</p>
                  </label>
                );
              })}
            </div>
            {errors.projectType && (
              <p className="text-sm text-red-600">{errors.projectType.message}</p>
            )}
          </motion.div>
        )}

        {/* Step 3: Project Details */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Vertel ons over uw project
              </h2>
              <p className="text-slate-600">Hoe meer details, hoe beter wij kunnen adviseren</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Huidige website (indien van toepassing)
              </label>
              <input
                {...register("currentWebsite")}
                type="url"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="https://uwhuidigewebsite.nl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Projectomschrijving <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.description ? "border-red-300" : "border-slate-200"
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none`}
                placeholder="Beschrijf wat u wilt laten maken, welke functionaliteit u nodig heeft, en andere relevante details..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Gewenste functionaliteit
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {featureOptions.map((feature) => (
                  <label
                    key={feature}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFeatures.includes(feature)
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                    />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gewenste deadline
              </label>
              <input
                {...register("deadline")}
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Bijv. 'Binnen 2 maanden' of 'Flexibel'"
              />
            </div>
          </motion.div>
        )}

        {/* Step 4: Budget */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Wat is uw budget?
              </h2>
              <p className="text-slate-600">Dit helpt ons om een passend voorstel te doen</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {budgetOptions.map((budget) => (
                <label
                  key={budget}
                  className={`block p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${
                    watch("budgetRange") === budget
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    {...register("budgetRange")}
                    type="radio"
                    value={budget}
                    className="sr-only"
                  />
                  <span className="font-medium text-slate-900">{budget}</span>
                </label>
              ))}
            </div>
            {errors.budgetRange && (
              <p className="text-sm text-red-600">{errors.budgetRange.message}</p>
            )}
          </motion.div>
        )}

        {/* Step 5: Final */}
        {currentStep === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Bijna klaar!
              </h2>
              <p className="text-slate-600">Nog een paar laatste vragen</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hoe heeft u ons gevonden?
              </label>
              <select
                {...register("howDidYouFindUs")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
              >
                <option value="">Selecteer een optie</option>
                {referralOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Overige opmerkingen
              </label>
              <textarea
                {...register("additionalInfo")}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
                placeholder="Is er nog iets dat u wilt toevoegen?"
              />
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  {...register("privacy")}
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600">
                  Ik ga akkoord met het{" "}
                  <a href="/privacy" className="text-indigo-600 hover:underline">
                    privacybeleid
                  </a>{" "}
                  en geef toestemming voor het verwerken van mijn gegevens.{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.privacy && (
                <p className="mt-1 text-sm text-red-600">{errors.privacy.message}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Vorige
          </button>
        ) : (
          <div />
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className="btn-primary inline-flex items-center gap-2"
          >
            Volgende
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verzenden...
              </>
            ) : (
              <>
                Offerte Aanvragen
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
