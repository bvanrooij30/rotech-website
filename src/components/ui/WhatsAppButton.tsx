"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  const phoneNumber = "31657235574";
  const message = encodeURIComponent(
    "Hallo! Ik heb een vraag over jullie diensten."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-emerald-500 text-white p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">RoTech Development</h3>
                  <p className="text-sm text-emerald-100">
                    Meestal binnen een uur antwoord
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="bg-slate-100 rounded-xl p-3 mb-4">
                <p className="text-sm text-slate-700">
                  👋 Hallo! Heeft u een vraag of wilt u uw project bespreken? 
                  Stuur ons een bericht via WhatsApp!
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-center rounded-xl font-semibold transition-colors"
              >
                Start Gesprek
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
          isOpen
            ? "bg-slate-700 text-white"
            : "bg-emerald-500 text-white hover:bg-emerald-600"
        }`}
        aria-label={isOpen ? "Sluit chat" : "Open WhatsApp chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>

      {/* Pulse animation when closed */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25 pointer-events-none" />
      )}
    </div>
  );
}
