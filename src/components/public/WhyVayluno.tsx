import React, { useState } from 'react';
import { Layers, MessageCircle, Palette, UserCheck, Sparkles } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export const WhyVayluno: React.FC = () => {
  const { content } = useContent();
  const [imageError, setImageError] = useState(false);

  // Mappage des icônes fonctionnelles pour les 4 valeurs
  const getIconForValue = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('organisation')) return <Layers className="w-5 h-5 text-[#C9AD78]" />;
    if (t.includes('communication')) return <MessageCircle className="w-5 h-5 text-[#C9AD78]" />;
    if (t.includes('créativité')) return <Palette className="w-5 h-5 text-[#C9AD78]" />;
    return <UserCheck className="w-5 h-5 text-[#C9AD78]" />;
  };

  return (
    <section id="a-propos" className="py-24 bg-[#081426] border-t border-[#142B4D]/60 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Titre et Philosophie */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-16">
          <div className="lg:col-span-5 text-left">
            <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-[#C9AD78] font-semibold mb-3">
              <span className="w-6 h-[1px] bg-[#C9AD78]" />
              <span>Notre Philosophie</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#F5F6FA] tracking-tight leading-tight [text-wrap:balance]">
              Pourquoi faire confiance à VAYLUNO ?
            </h2>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-lg sm:text-xl text-[#F5F6FA]/85 font-light leading-relaxed border-l-2 border-[#C9AD78]/40 pl-6">
              « {content.whyVayluno.intro} »
            </p>
          </div>
        </div>

        {/* Visuel d'ambiance et Grille des 4 valeurs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Photographie architecturale éditoriale */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative rounded-2xl overflow-hidden border border-[#142B4D] bg-[#142B4D]/30 flex-1 min-h-[320px] shadow-lg">
              {!imageError ? (
                <img
                  src={content.whyVayluno.editorialImage}
                  alt="Atmosphère sobre et rigoureuse de VAYLUNO"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#142B4D] to-[#081426] text-center">
                  <Sparkles className="w-8 h-8 text-[#C9AD78] mb-3" />
                  <span className="font-serif text-xl text-[#F5F6FA]">Rigueur & Clarté</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#081426]/80 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs text-[#C9AD78] font-mono uppercase tracking-widest mb-1">Engagement & Discrétion</p>
                <p className="text-sm text-[#F5F6FA] font-light">
                  Chaque collaboration s'articule autour de directives claires et d'un respect strict de la confidentialité commerciale.
                </p>
              </div>
            </div>
          </div>

          {/* Grille des 4 Piliers */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {content.whyVayluno.values.map((v, index) => (
              <div
                key={v.id}
                className="bg-[#142B4D]/25 border border-[#142B4D] hover:border-[#C9AD78]/40 rounded-xl p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-lg bg-[#081426] border border-[#142B4D] flex items-center justify-center shadow-inner">
                      {getIconForValue(v.title)}
                    </div>
                    <span className="font-mono text-xs text-[#C9AD78]/60">0{index + 1}</span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#F5F6FA] uppercase tracking-wider mb-2.5">
                    {v.title}
                  </h3>

                  <p className="text-sm text-[#F5F6FA]/75 font-light leading-relaxed">
                    {v.description}
                  </p>
                </div>

                <div className="pt-6">
                  <div className="w-8 h-[1px] bg-[#C9AD78]/30" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
