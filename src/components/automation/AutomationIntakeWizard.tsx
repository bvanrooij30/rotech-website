"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Users,
  FileText,
  ShoppingCart,
  Receipt,
  MessageCircle,
  Mail,
  Bell,
  RefreshCw,
  BarChart3,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import {
  workflowTypes,
  commonSystems,
  generalIntakeQuestions,
  getQuestionsForWorkflows,
  getSystemsByCategory,
  type IntakeQuestion,
  type WorkflowQuestions,
} from "@/data/automation-intake-questions";
import { automationPlans, formatPrice } from "@/data/automation-subscriptions";

// Icon mapping for workflow types
const workflowIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "lead-capture": Users,
  content: FileText,
  "e-commerce": ShoppingCart,
  invoicing: Receipt,
  "customer-service": MessageCircle,
  "email-marketing": Mail,
  notifications: Bell,
  "data-sync": RefreshCw,
  reporting: BarChart3,
  custom: Sparkles,
};

interface IntakeFormData {
  // Contact info
  contactName: string;
  email: string;
  phone: string;
  companyName: string;
  website: string;
  
  // Plan
  planType: string;
  billingPeriod: "monthly" | "yearly";
  
  // Workflows
  selectedWorkflows: string[];
  priorityWorkflow: string;
  
  // Systems
  selectedSystems: string[];
  otherSystems: string;
  
  // General
  teamSize: string;
  preferredContactTime: string;
  kickoffUrgency: string;
  additionalNotes: string;
  
  // Workflow-specific answers (dynamic)
  workflowAnswers: Record<string, Record<string, string | string[]>>;
  
  // Agreements
  termsAccepted: boolean;
  dataProcessingAccepted: boolean;
}

interface AutomationIntakeWizardProps {
  planType?: string;
  billingPeriod?: "monthly" | "yearly";
  onComplete?: (data: IntakeFormData) => void;
}

type WizardStep = "contact" | "workflows" | "systems" | "workflow-details" | "general" | "review";

const steps: { id: WizardStep; title: string; description: string }[] = [
  { id: "contact", title: "Contactgegevens", description: "Uw bedrijfsinformatie" },
  { id: "workflows", title: "Workflows", description: "Wat wilt u automatiseren?" },
  { id: "systems", title: "Systemen", description: "Welke software gebruikt u?" },
  { id: "workflow-details", title: "Details", description: "Specifieke wensen" },
  { id: "general", title: "Algemeen", description: "Laatste vragen" },
  { id: "review", title: "Overzicht", description: "Controleer uw gegevens" },
];

export function AutomationIntakeWizard({
  planType = "business",
  billingPeriod = "monthly",
  onComplete,
}: AutomationIntakeWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("contact");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<IntakeFormData>({
    contactName: "",
    email: "",
    phone: "",
    companyName: "",
    website: "",
    planType,
    billingPeriod,
    selectedWorkflows: [],
    priorityWorkflow: "",
    selectedSystems: [],
    otherSystems: "",
    teamSize: "",
    preferredContactTime: "",
    kickoffUrgency: "",
    additionalNotes: "",
    workflowAnswers: {},
    termsAccepted: false,
    dataProcessingAccepted: false,
  });

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const selectedPlan = automationPlans.find((p) => p.id === planType);
  const systemsByCategory = getSystemsByCategory();
  const workflowQuestions = getQuestionsForWorkflows(formData.selectedWorkflows);

  const updateFormData = (updates: Partial<IntakeFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateWorkflowAnswer = (
    workflowType: string,
    questionId: string,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      workflowAnswers: {
        ...prev.workflowAnswers,
        [workflowType]: {
          ...prev.workflowAnswers[workflowType],
          [questionId]: value,
        },
      },
    }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case "contact":
        return !!(
          formData.contactName &&
          formData.email &&
          formData.companyName
        );
      case "workflows":
        return formData.selectedWorkflows.length > 0;
      case "systems":
        return formData.selectedSystems.length > 0 || !!formData.otherSystems;
      case "workflow-details":
        // Check if required questions are answered
        for (const wq of workflowQuestions) {
          for (const q of wq.questions) {
            if (q.required) {
              const answer = formData.workflowAnswers[wq.workflowType]?.[q.id];
              if (!answer || (Array.isArray(answer) && answer.length === 0)) {
                return false;
              }
            }
          }
        }
        return true;
      case "general":
        return !!(formData.teamSize && formData.preferredContactTime);
      case "review":
        return formData.termsAccepted && formData.dataProcessingAccepted;
      default:
        return true;
    }
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      // Skip workflow-details if no workflows selected with questions
      if (steps[nextIndex].id === "workflow-details" && workflowQuestions.length === 0) {
        setCurrentStep(steps[nextIndex + 1].id);
      } else {
        setCurrentStep(steps[nextIndex].id);
      }
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      // Skip workflow-details when going back if no questions
      if (steps[prevIndex].id === "workflow-details" && workflowQuestions.length === 0) {
        setCurrentStep(steps[prevIndex - 1].id);
      } else {
        setCurrentStep(steps[prevIndex].id);
      }
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/automation/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Er is iets misgegaan");
      }

      const result = await response.json();
      
      if (onComplete) {
        onComplete(formData);
      }

      // Redirect to payment or confirmation
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: IntakeQuestion, workflowType?: string) => {
    const value = workflowType
      ? formData.workflowAnswers[workflowType]?.[question.id]
      : (formData as Record<string, unknown>)[question.id];

    switch (question.type) {
      case "text":
        return (
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) =>
              workflowType
                ? updateWorkflowAnswer(workflowType, question.id, e.target.value)
                : updateFormData({ [question.id]: e.target.value } as Partial<IntakeFormData>)
            }
            placeholder={question.placeholder}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        );

      case "textarea":
        return (
          <textarea
            value={(value as string) || ""}
            onChange={(e) =>
              workflowType
                ? updateWorkflowAnswer(workflowType, question.id, e.target.value)
                : updateFormData({ [question.id]: e.target.value } as Partial<IntakeFormData>)
            }
            placeholder={question.placeholder}
            rows={4}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
          />
        );

      case "select":
        return (
          <select
            value={(value as string) || ""}
            onChange={(e) =>
              workflowType
                ? updateWorkflowAnswer(workflowType, question.id, e.target.value)
                : updateFormData({ [question.id]: e.target.value } as Partial<IntakeFormData>)
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="">Selecteer...</option>
            {question.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        const selectedValues = (value as string[]) || [];
        return (
          <div className="grid grid-cols-2 gap-2">
            {question.options?.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const newValues = selectedValues.includes(opt.value)
                    ? selectedValues.filter((v) => v !== opt.value)
                    : [...selectedValues, opt.value];
                  if (workflowType) {
                    updateWorkflowAnswer(workflowType, question.id, newValues);
                  } else {
                    updateFormData({ [question.id]: newValues } as Partial<IntakeFormData>);
                  }
                }}
                className={`px-3 py-2 text-sm rounded-lg border transition-all text-left ${
                  selectedValues.includes(opt.value)
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {question.options?.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  value === opt.value
                    ? "bg-indigo-50 border-indigo-300"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) =>
                    workflowType
                      ? updateWorkflowAnswer(workflowType, question.id, e.target.value)
                      : updateFormData({ [question.id]: e.target.value } as Partial<IntakeFormData>)
                  }
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium hidden sm:block ${
                      isActive ? "text-indigo-600" : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-2 rounded ${
                      index < currentStepIndex ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Plan Info */}
      {selectedPlan && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-sm text-indigo-600 font-medium">Geselecteerd pakket:</span>
            <span className="ml-2 font-bold text-slate-900">{selectedPlan.name}</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(
                formData.billingPeriod === "yearly"
                  ? selectedPlan.yearlyPrice / 12
                  : selectedPlan.monthlyPrice
              )}
            </span>
            <span className="text-slate-500">/maand</span>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step: Contact */}
            {currentStep === "contact" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Uw Gegevens
                </h2>
                <p className="text-slate-600 mb-6">
                  Vul uw contactgegevens in zodat wij u kunnen bereiken.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Naam *
                      </label>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => updateFormData({ contactName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Uw naam"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Telefoonnummer
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="06-12345678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      E-mailadres *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="uw@email.nl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bedrijfsnaam *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => updateFormData({ companyName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="Uw bedrijfsnaam"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Website (optioneel)
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateFormData({ website: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="https://uwwebsite.nl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step: Workflows */}
            {currentStep === "workflows" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Wat wilt u automatiseren?
                </h2>
                <p className="text-slate-600 mb-6">
                  Selecteer de workflows die u wilt opzetten. U kunt er meerdere kiezen.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {workflowTypes.map((wf) => {
                    const Icon = workflowIcons[wf.id] || Sparkles;
                    const isSelected = formData.selectedWorkflows.includes(wf.id);
                    
                    return (
                      <button
                        key={wf.id}
                        type="button"
                        onClick={() => {
                          const newWorkflows = isSelected
                            ? formData.selectedWorkflows.filter((w) => w !== wf.id)
                            : [...formData.selectedWorkflows, wf.id];
                          updateFormData({
                            selectedWorkflows: newWorkflows,
                            priorityWorkflow:
                              newWorkflows.length === 1 ? newWorkflows[0] : formData.priorityWorkflow,
                          });
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? "bg-indigo-500 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{wf.name}</div>
                            <div className="text-sm text-slate-500">{wf.description}</div>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-indigo-500 ml-auto" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {formData.selectedWorkflows.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Welke workflow heeft de hoogste prioriteit?
                    </label>
                    <select
                      value={formData.priorityWorkflow}
                      onChange={(e) => updateFormData({ priorityWorkflow: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                    >
                      <option value="">Selecteer...</option>
                      {formData.selectedWorkflows.map((wfId) => {
                        const wf = workflowTypes.find((w) => w.id === wfId);
                        return wf ? (
                          <option key={wfId} value={wfId}>
                            {wf.name}
                          </option>
                        ) : null;
                      })}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Step: Systems */}
            {currentStep === "systems" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Welke systemen gebruikt u?
                </h2>
                <p className="text-slate-600 mb-6">
                  Selecteer de software die u momenteel gebruikt of wilt gaan gebruiken.
                </p>

                <div className="space-y-6">
                  {Object.entries(systemsByCategory).map(([category, systems]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-slate-500 mb-2">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {systems.map((system) => {
                          const isSelected = formData.selectedSystems.includes(system.id);
                          return (
                            <button
                              key={system.id}
                              type="button"
                              onClick={() => {
                                const newSystems = isSelected
                                  ? formData.selectedSystems.filter((s) => s !== system.id)
                                  : [...formData.selectedSystems, system.id];
                                updateFormData({ selectedSystems: newSystems });
                              }}
                              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                                isSelected
                                  ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              {system.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Andere systemen (niet in de lijst)
                    </label>
                    <input
                      type="text"
                      value={formData.otherSystems}
                      onChange={(e) => updateFormData({ otherSystems: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="Bijv: Custom ERP, branche-specifieke software..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step: Workflow Details */}
            {currentStep === "workflow-details" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Workflow Details
                </h2>
                <p className="text-slate-600 mb-6">
                  Beantwoord de volgende vragen zodat wij uw workflows precies kunnen
                  bouwen zoals u wilt.
                </p>

                <div className="space-y-8">
                  {workflowQuestions.map((wq) => (
                    <div key={wq.workflowType} className="border-b border-slate-200 pb-6 last:border-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{wq.title}</h3>
                      <p className="text-sm text-slate-500 mb-4">{wq.description}</p>

                      <div className="space-y-4">
                        {wq.questions.map((question) => (
                          <div key={question.id}>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              {question.question}
                              {question.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {question.helpText && (
                              <p className="text-xs text-slate-500 mb-2">{question.helpText}</p>
                            )}
                            {renderQuestion(question, wq.workflowType)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step: General */}
            {currentStep === "general" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Laatste Vragen
                </h2>
                <p className="text-slate-600 mb-6">
                  Nog een paar vragen zodat we de samenwerking goed kunnen starten.
                </p>

                <div className="space-y-4">
                  {generalIntakeQuestions.map((question) => (
                    <div key={question.id}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Review */}
            {currentStep === "review" && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Controleer Uw Gegevens
                </h2>
                <p className="text-slate-600 mb-6">
                  Bekijk de ingevulde gegevens en ga akkoord met de voorwaarden.
                </p>

                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-medium text-slate-900 mb-2">Contactgegevens</h3>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p><strong>Naam:</strong> {formData.contactName}</p>
                        <p><strong>Email:</strong> {formData.email}</p>
                        {formData.phone && <p><strong>Telefoon:</strong> {formData.phone}</p>}
                        <p><strong>Bedrijf:</strong> {formData.companyName}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-medium text-slate-900 mb-2">Geselecteerde Workflows</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedWorkflows.map((wfId) => {
                          const wf = workflowTypes.find((w) => w.id === wfId);
                          return wf ? (
                            <span
                              key={wfId}
                              className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-lg"
                            >
                              {wf.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-medium text-slate-900 mb-2">Systemen</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedSystems.map((sysId) => {
                          const sys = commonSystems.find((s) => s.id === sysId);
                          return sys ? (
                            <span
                              key={sysId}
                              className="px-2 py-1 bg-slate-200 text-slate-700 text-sm rounded-lg"
                            >
                              {sys.name}
                            </span>
                          ) : null;
                        })}
                        {formData.otherSystems && (
                          <span className="px-2 py-1 bg-slate-200 text-slate-700 text-sm rounded-lg">
                            {formData.otherSystems}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Agreements */}
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
                        className="w-5 h-5 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-600">
                        Ik ga akkoord met de{" "}
                        <a href="/algemene-voorwaarden" className="text-indigo-600 hover:underline" target="_blank">
                          algemene voorwaarden
                        </a>
                        .
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.dataProcessingAccepted}
                        onChange={(e) =>
                          updateFormData({ dataProcessingAccepted: e.target.checked })
                        }
                        className="w-5 h-5 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-600">
                        Ik ga akkoord met de{" "}
                        <a href="/privacy" className="text-indigo-600 hover:underline" target="_blank">
                          privacyverklaring
                        </a>{" "}
                        en geef toestemming voor de verwerking van mijn gegevens.
                      </span>
                    </label>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStepIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            currentStepIndex === 0
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Vorige
        </button>

        {currentStep === "review" ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canProceed() || submitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verwerken...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Afronden & Betalen
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Volgende
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AutomationIntakeWizard;
