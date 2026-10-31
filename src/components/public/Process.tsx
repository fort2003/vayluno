import React from 'react';
import { useContent } from '../../context/ContentContext';
import { ArrowRight } from 'lucide-react';

export const Process: React.FC = () => {
  const { content, triggerContactAction } = useContent();

  return (
    <section className="py-24 bg-[#081426] subtle-grid-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* En-tête */}
        <div className="max-w-2xl mb-16 text-left">
          <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-[#C9AD78] font-semibold mb-3">
            <span className="w-6 h-[1px] bg-[#C9AD78]" />
            <span>Processus Simple & Direct</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#F5F6FA] tracking-tight [text-wrap:balance]">
            {content.process.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#F5F6FA]/70 font-light leading-relaxed">
            {content.process.subtitle}
          </p>
        </div>

        {/* Timeline 3 Étapes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Ligne directrice dorée en arrière-plan (visible sur desktop) */}
          <div
            className="hidden md:block absolute top-12 left-12 right-12 h-[1px] bg-gradient-to-r from-[#C9AD78]/30 via-[#C9AD78]/60 to-[#C9AD78]/30 z-0 pointer-events-none"
            aria-hidden="true"
          />

          {content.process.steps.map((item, index) => (
            <div
              key={item.step}
              className="relative z-10 bg-[#081426]/90 border border-[#142B4D] hover:border-[#C9AD78]/50 rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 shadow-lg"
            >
              <div>
                {/* Numéro d'étape circulaire sur fond bleu nuit */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-full bg-[#142B4D] border-2 border-[#C9AD78] flex items-center justify-center text-[#C9AD78] font-serif font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <span className="text-xs uppercase tracking-widest text-[#F5F6FA]/40 font-mono">
                    Étape 0{index + 1}
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-[#F5F6FA] mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-[#F5F6FA]/75 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action contextuelle discrète pour l'étape 1 */}
              {index === 0 && (
                <div className="pt-6">
                  <button
                    onClick={triggerContactAction}
                    className="inline-flex items-center gap-1.5 text-xs text-[#C9AD78] hover:text-[#dfc99c] font-medium tracking-wide transition-colors cursor-pointer group/link"
                  >
                    <span>Lancer le premier échange</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          ))}

        </div>

      </div>
    </section>
  );
};
