import React from 'react';
import { X, Mail } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { ContactForm } from './ContactForm';

export const ContactModal: React.FC = () => {
  const { isContactModalOpen, setIsContactModalOpen } = useContent();

  if (!isContactModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
      onClick={() => setIsContactModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-[#081426] border border-[#C9AD78]/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/90 text-left max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton Fermer */}
        <button
          onClick={() => setIsContactModalOpen(false)}
          className="absolute top-5 right-5 text-[#F5F6FA]/60 hover:text-[#C9AD78] transition-colors p-1 rounded-md cursor-pointer"
          aria-label="Fermer la boîte de dialogue"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#142B4D]">
          <div className="w-10 h-10 rounded-lg bg-[#142B4D] border border-[#C9AD78]/30 flex items-center justify-center text-[#C9AD78]">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 id="contact-modal-title" className="text-xl font-serif font-bold text-[#F5F6FA]">
              Formulaire de Contact VAYLUNO
            </h3>
            <p className="text-xs text-[#C9AD78] font-mono uppercase tracking-wider">
              Transmission directe et confidentielle par e-mail
            </p>
          </div>
        </div>

        {/* Formulaire interne */}
        <ContactForm idPrefix="modal" onSuccess={() => setTimeout(() => setIsContactModalOpen(false), 2500)} />
      </div>
    </div>
  );
};
