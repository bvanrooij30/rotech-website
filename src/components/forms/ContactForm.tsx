"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, CheckCircle } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Naam is verplicht (min. 2 karakters)"),
  email: z.string().email("Voer een geldig e-mailadres in"),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(1, "Selecteer een onderwerp"),
  message: z.string().min(20, "Bericht moet minimaal 20 karakters zijn"),
  privacy: z.boolean().refine((val) => val === true, {
    message: "U moet akkoord gaan met het privacybeleid",
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const subjectOptions = [
  "Nieuwe website laten maken",
  "Webshop laten maken",
  "Web applicatie ontwikkeling",
  "Mobile app ontwikkeling",
  "SEO optimalisatie",
  "Website onderhoud",
  "Automatisering / n8n",
  "Overige vraag",
];

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Er is iets misgegaan. Probeer het later opnieuw.");
      }

      setIsSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">
          Bedankt voor uw bericht!
        </h3>
        <p className="text-slate-600 mb-6">
          Wij nemen binnen 24 uur contact met u op.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="btn-secondary"
        >
          Nog een bericht versturen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
            Naam <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            id="name"
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.name ? "border-red-300" : "border-slate-200"
            } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all`}
            placeholder="Uw naam"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            E-mail <span className="text-red-500">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.email ? "border-red-300" : "border-slate-200"
            } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all`}
            placeholder="uw@email.nl"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
            Telefoon
          </label>
          <input
            {...register("phone")}
            type="tel"
            id="phone"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            placeholder="+31 6 12345678"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
            Bedrijf
          </label>
          <input
            {...register("company")}
            type="text"
            id="company"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            placeholder="Uw bedrijfsnaam"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
          Onderwerp <span className="text-red-500">*</span>
        </label>
        <select
          {...register("subject")}
          id="subject"
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.subject ? "border-red-300" : "border-slate-200"
          } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white`}
        >
          <option value="">Selecteer een onderwerp</option>
          {subjectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
          Bericht <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("message")}
          id="message"
          rows={5}
          className={`w-full px-4 py-3 rounded-xl border ${
            errors.message ? "border-red-300" : "border-slate-200"
          } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none`}
          placeholder="Vertel ons over uw project of vraag..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      {/* Privacy */}
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

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full md:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Versturen...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Bericht Versturen
          </>
        )}
      </button>
    </form>
  );
}
