import React from 'react';
import { ArrowUpRight, Instagram, Facebook } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { inspectUrl, openSafeUrl } from '../../utils/urlValidator';

// Composant pour l'icône TikTok (non présente dans lucide par défaut)
const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.34 6.34 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.07a8.28 8.28 0 0 0 4.87 1.57V7.19a4.82 4.82 0 0 1-1.1-.5z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { content, triggerContactAction } = useContent();
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: 'Accueil', href: '#hero' },
    { label: 'Nos services', href: '#services' },
    { label: 'À propos', href: '#a-propos' },
    { label: 'Contact', href: '#contact' },
  ];

  // Vérification stricte des réseaux sociaux : uniquement ceux configurés avec un vrai lien
  const instagramStatus = inspectUrl(content.contact.instagramUrl);
  const facebookStatus = inspectUrl(content.contact.facebookUrl);
  const tiktokStatus = inspectUrl(content.contact.tiktokUrl);

  const activeSocials = [
    {
      name: 'Instagram',
      status: instagramStatus,
      icon: <Instagram className="w-4 h-4" />,
    },
    {
      name: 'Facebook',
      status: facebookStatus,
      icon: <Facebook className="w-4 h-4" />,
    },
    {
      name: 'TikTok',
      status: tiktokStatus,
      icon: <TikTokIcon className="w-4 h-4" />,
    },
  ].filter((s) => s.status.isValid);

  return (
    <footer className="bg-[#081426] border-t border-[#142B4D] pt-16 pb-12 text-[#F5F6FA]/70">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#142B4D]/60 items-start">
          
          {/* Colonne 1 : Marque & Mission */}
          <div className="md:col-span-5 space-y-4 text-left">
            <a
              href="#hero"
              className="inline-flex items-center gap-2 text-2xl font-serif font-bold tracking-[0.18em] text-[#F5F6FA] hover:text-[#C9AD78] transition-colors"
            >
              <span>{content.meta.brandName || 'VAYLUNO'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9AD78]" />
            </a>

            <p className="text-sm text-[#F5F6FA]/70 font-light leading-relaxed max-w-sm">
              Accompagnement digital sur-mesure pour commerçants, entrepreneurs et marques : gestion opérationnelle, relation client et rayonnement sur les réseaux sociaux.
            </p>

            {/* Réseaux sociaux (uniquement si validés) */}
            {activeSocials.length > 0 && (
              <div className="pt-2">
                <span className="text-xs uppercase tracking-wider text-[#C9AD78] font-semibold block mb-2">
                  Nous suivre
                </span>
                <div className="flex items-center gap-3">
                  {activeSocials.map((social) => (
                    <button
                      key={social.name}
                      onClick={() => openSafeUrl(social.status.cleanUrl)}
                      className="w-8 h-8 rounded-full bg-[#142B4D] hover:bg-[#C9AD78] hover:text-[#081426] text-[#F5F6FA] transition-colors flex items-center justify-center cursor-pointer"
                      aria-label={`Visiter notre profil ${social.name}`}
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne 2 : Liens de navigation rapide */}
          <div className="md:col-span-3 space-y-4 text-left">
            <h4 className="text-xs uppercase tracking-widest text-[#C9AD78] font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-[#C9AD78] transition-colors font-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Contact & Modalités */}
          <div className="md:col-span-4 space-y-4 text-left">
            <h4 className="text-xs uppercase tracking-widest text-[#C9AD78] font-semibold">
              Canal d'échange
            </h4>
            <p className="text-sm text-[#F5F6FA]/70 font-light leading-relaxed">
              Pour une réactivité maximale et un accompagnement confidentiel, toutes nos demandes sont traitées directement via notre formulaire ou par message.
            </p>
            {content.contact.contactEmail && (
              <p className="text-xs text-[#C9AD78] font-mono">
                E-mail : <a href={`mailto:${content.contact.contactEmail}`} className="hover:underline">{content.contact.contactEmail}</a>
              </p>
            )}
            {content.contact.contactPhone && (
              <p className="text-xs text-[#F5F6FA]/80 font-mono">
                Tél : <span>{content.contact.contactPhone}</span>
              </p>
            )}
            <button
              onClick={triggerContactAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#081426] bg-[#C9AD78] hover:bg-[#dfc99c] rounded transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span>Contacter l'équipe</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Ligne inférieure de Copyright (Strictement sans lien admin) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5F6FA]/50 font-light">
          <p>© {currentYear} VAYLUNO. Tous droits réservés.</p>
          <p className="text-center sm:text-right">
            Deux expertises exclusives : Assistant Virtuel & Community Manager.
          </p>
        </div>

      </div>
    </footer>
  );
};
