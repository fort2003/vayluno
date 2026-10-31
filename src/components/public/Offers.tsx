import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { ServiceOffer } from '../../types';

interface ServiceCardProps {
  offer: ServiceOffer;
  isReversed?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ offer, isReversed = false }) => {
  const { triggerContactAction } = useContent();
  const [imageError, setImageError] = useState(false);

  return (
    <article className="relative bg-[#142B4D]/40 border border-[#142B4D] hover:border-[#C9AD78]/40 rounded-2xl p-6 sm:p-10 lg:p-12 transition-all duration-300 shadow-xl shadow-black/20 group">
      
      {/* Halo subtil au survol */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#C9AD78]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#C9AD78]/10 transition-colors" />

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
        
        {/* Colonne Contenu */}
        <div className={`lg:col-span-7 flex flex-col justify-center space-y-6 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
          
          {/* Header de l'offre (Editorial, sans pill sandwich) */}
          <div className="flex items-center gap-3 text-xs font-mono tracking-wider text-[#C9AD78]">
            <span className="font-semibold text-sm">{offer.offerNumber}</span>
            <span className="text-[#C9AD78]/40">/</span>
            <span className="uppercase tracking-[0.2em] font-sans font-medium text-[#F5F6FA]/70">
              {offer.tagline}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#F5F6FA] leading-tight [text-wrap:balance]">
            {offer.title}
          </h3>

          <p className="text-[#F5F6FA]/80 text-base leading-relaxed font-light">
            {offer.description}
          </p>

          {/* Hairline Divider */}
          <div className="w-full h-[1px] bg-[#142B4D] my-2" />

          {/* Liste des prestations */}
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-wider text-[#C9AD78] font-semibold block">
              Nos prestations incluses :
            </span>
            <ul className="space-y-3.5">
              {offer.prestations.map((p) => (
                <li key={p.id} className="flex items-start gap-3 text-sm text-[#F5F6FA]/90">
                  <span className="mt-1 flex-shrink-0 text-[#C9AD78]">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-semibold text-[#F5F6FA] uppercase tracking-wide text-xs block mb-0.5">
                      {p.number}. {p.title}
                    </span>
                    <span className="text-[#F5F6FA]/70 text-xs sm:text-sm leading-relaxed block font-light">
                      {p.description}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Bouton de contact distinct */}
          <div className="pt-4">
            <button
              onClick={() =>
                triggerContactAction(
                  offer.id === 'assistant-virtuel' ? 'assistant-virtuel' : 'community-manager'
                )
              }
              className="inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#081426] bg-[#C9AD78] hover:bg-[#dfc99c] rounded-md transition-all duration-200 shadow-md hover:shadow-[#C9AD78]/25 cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span>{offer.buttonText}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <p className="mt-2 text-[11px] text-[#F5F6FA]/50 font-light">
              Demande transmise directement par e-mail à notre équipe.
            </p>
          </div>
        </div>

        {/* Colonne Image / Illustration humaine */}
        <div className={`lg:col-span-5 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="relative rounded-xl overflow-hidden border border-[#C9AD78]/20 bg-[#081426] shadow-lg group-hover:border-[#C9AD78]/40 transition-colors">
            
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              {!imageError ? (
                <img
                  src={offer.image}
                  alt={offer.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                />
              ) : (
                /* Fallback élégant en cas de problème de chargement */
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#142B4D] to-[#081426] text-center">
                  <div className="w-12 h-12 rounded-full border border-[#C9AD78]/40 flex items-center justify-center mb-3 text-[#C9AD78]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="font-serif text-lg font-bold text-[#F5F6FA] mb-1">{offer.tagline}</span>
                  <span className="text-xs text-[#C9AD78]">VAYLUNO · Accompagnement Premium</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#081426]/60 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Badge discret d'engagement */}
            <div className="p-3 bg-[#081426]/90 border-t border-[#142B4D] flex items-center gap-2 text-xs text-[#F5F6FA]/70">
              <ShieldCheck className="w-4 h-4 text-[#C9AD78]" />
              <span>Modalités définies ensemble selon vos consignes</span>
            </div>
          </div>
        </div>

      </div>
    </article>
  );
};

export const Offers: React.FC = () => {
  const { content } = useContent();

  return (
    <section id="services" className="py-24 bg-[#081426] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* En-tête de Section */}
        <div className="max-w-3xl mb-16 text-left">
          <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-[#C9AD78] font-semibold mb-3">
            <span className="w-6 h-[1px] bg-[#C9AD78]" />
            <span>Nos Deux Offres Clés</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#F5F6FA] tracking-tight mb-4 [text-wrap:balance]">
            Deux expertises, une seule ambition : votre tranquillité.
          </h2>
          <p className="text-base sm:text-lg text-[#F5F6FA]/70 font-light leading-relaxed">
            Pour garantir un niveau d'exigence irréprochable, VAYLUNO concentre son savoir-faire sur deux piliers essentiels du commerce moderne.
          </p>
        </div>

        {/* Les 2 offres présentées successivement avec une hiérarchie irréprochable */}
        <div className="space-y-16">
          <ServiceCard offer={content.offers.virtualAssistant} isReversed={false} />
          <ServiceCard offer={content.offers.communityManager} isReversed={true} />
        </div>

      </div>
    </section>
  );
};
