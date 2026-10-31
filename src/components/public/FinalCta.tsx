import React from 'react';
import { useContent } from '../../context/ContentContext';
import { ContactForm } from './ContactForm';

export const FinalCta: React.FC = () => {
  const { content } = useContent();

  return (
    <section id="contact" className="py-24 bg-[#081426] relative overflow-hidden">
      
      {/* Halo lumineux doré central */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#C9AD78]/10 blur-[140px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="relative rounded-3xl p-8 sm:p-12 lg:p-14 bg-gradient-to-b from-[#142B4D]/80 via-[#081426] to-[#081426] border border-[#C9AD78]/30 shadow-2xl shadow-black/60 overflow-hidden">
          
          {/* Ligne d'accent supérieure dorée */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#C9AD78] to-transparent" />

          {/* En-tête */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-[#C9AD78] font-semibold mb-4">
              <span>Contact Direct & Confidentiel</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#F5F6FA] mb-4 leading-tight [text-wrap:balance]">
              {content.finalCta.title}
            </h2>

            <p className="text-base sm:text-lg text-[#F5F6FA]/80 max-w-xl mx-auto font-light leading-relaxed">
              {content.finalCta.description}
            </p>
          </div>

          {/* Formulaire de Contact Réel */}
          <div className="max-w-2xl mx-auto">
            <ContactForm idPrefix="contact" />
          </div>

          {/* Précision rassurante */}
          <p className="mt-8 text-center text-xs text-[#F5F6FA]/50 font-light">
            Transmission directe et confidentielle par e-mail · Réponse sous 24 à 48 heures ouvrées.
          </p>

        </div>
      </div>
    </section>
  );
};
