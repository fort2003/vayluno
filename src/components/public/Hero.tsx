import React, { useState } from 'react';
import { ArrowDown, MessageSquare, Sparkles } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export const Hero: React.FC = () => {
  const { content, triggerContactAction } = useContent();
  const [imageError, setImageError] = useState(false);

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] pt-32 pb-20 flex items-center justify-center overflow-hidden bg-[#081426] subtle-grid-bg"
    >
      {/* Halo de lumière doré discret en arrière-plan */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#C9AD78]/10 blur-[130px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-[#142B4D]/40 blur-[100px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Colonne Gauche : Argumentaire & Typographie */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 text-left">
            
            {/* Tagline sobre sans pill badge */}
            <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-[#C9AD78] font-semibold">
              <span className="w-6 h-[1px] bg-[#C9AD78]" />
              <span>Accompagnement Digital Sur-Mesure</span>
            </div>

            {/* Titre Principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#F5F6FA] leading-[1.14] tracking-tight [text-wrap:balance]">
              {content.hero.title}
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-[#F5F6FA]/80 leading-relaxed max-w-2xl font-light">
              {content.hero.subtitle}
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-[#081426] bg-[#C9AD78] hover:bg-[#dfc99c] rounded-md transition-all duration-200 shadow-md hover:shadow-[#C9AD78]/20 cursor-pointer whitespace-nowrap active:scale-95"
              >
                <span>{content.hero.primaryCtaText}</span>
                <ArrowDown className="w-4 h-4" />
              </a>

              <button
                onClick={triggerContactAction}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium text-[#F5F6FA] bg-[#142B4D]/60 hover:bg-[#142B4D] border border-[#C9AD78]/30 hover:border-[#C9AD78] rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95"
              >
                <MessageSquare className="w-4 h-4 text-[#C9AD78]" />
                <span>{content.hero.secondaryCtaText}</span>
              </button>
            </div>

            {/* Note discrète de réassurance */}
            <div className="pt-4 flex items-center gap-3 text-xs text-[#F5F6FA]/60 font-light">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9AD78]" />
              <span>Deux expertises dédiées · Prise en charge humaine et confidentielle</span>
            </div>
          </div>

          {/* Colonne Droite : Visuel Cinématographique */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl p-2 bg-gradient-to-b from-[#142B4D]/80 via-[#142B4D]/40 to-[#081426] border border-[#C9AD78]/25 shadow-2xl shadow-black/60 overflow-hidden group">
              
              <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-xl overflow-hidden bg-[#142B4D]">
                {!imageError ? (
                  <img
                    src={content.hero.heroImage}
                    alt="Espace de travail et organisation commerciale VAYLUNO"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  /* Conteneur de remplacement élégant (Zero-Broken-Image Policy) */
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#142B4D] to-[#081426] p-8 text-center">
                    <div className="w-16 h-16 rounded-full border border-[#C9AD78]/40 flex items-center justify-center mb-4 text-[#C9AD78]">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <span className="font-serif text-2xl font-bold tracking-widest text-[#F5F6FA] mb-2">
                      VAYLUNO
                    </span>
                    <p className="text-xs text-[#C9AD78] uppercase tracking-wider">
                      Gestion rigoureuse & Présence digitale
                    </p>
                  </div>
                )}

                {/* Filtre d'ambiance discret */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#081426]/70 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Encadré éditorial discret incrusté */}
              <div className="absolute bottom-5 left-5 right-5 bg-[#081426]/85 backdrop-blur-md border border-[#C9AD78]/20 rounded-lg p-3.5 flex items-center justify-between text-xs text-[#F5F6FA]">
                <div className="flex flex-col">
                  <span className="text-[#C9AD78] font-medium tracking-wide">Accompagnement privé</span>
                  <span className="text-[#F5F6FA]/70 text-[11px]">Boutique en ligne & Réseaux sociaux</span>
                </div>
                <span className="text-[11px] font-mono text-[#C9AD78]/90 tracking-wider">01 & 02</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
