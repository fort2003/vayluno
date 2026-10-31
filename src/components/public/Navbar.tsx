import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export const Navbar: React.FC = () => {
  const { content, triggerContactAction } = useContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Accueil', href: '#hero' },
    { label: 'Nos services', href: '#services' },
    { label: 'À propos', href: '#a-propos' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#081426]/95 backdrop-blur-md border-b border-[#142B4D]/90 py-3 shadow-lg shadow-black/20'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between gap-8">
          {/* Zone 1: Logo Wordmark (single text element) */}
          <a
            href="#hero"
            className="flex items-center gap-2 group text-xl sm:text-2xl font-serif font-bold tracking-[0.18em] text-[#F5F6FA] hover:text-[#C9AD78] transition-colors whitespace-nowrap shrink-0"
            aria-label="VAYLUNO - Retour en haut de page"
          >
            <span>{content.meta.brandName || 'VAYLUNO'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9AD78] inline-block opacity-80 group-hover:scale-125 transition-transform"></span>
          </a>

          {/* Zone 2: Navigation Links (single line, no wrap) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#F5F6FA]/80">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative py-1 transition-colors hover:text-[#C9AD78] whitespace-nowrap shrink-0 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#C9AD78] hover:after:w-full after:transition-all after:duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <button
              onClick={triggerContactAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#081426] bg-[#C9AD78] hover:bg-[#dfc99c] rounded-md transition-all duration-200 shadow-sm hover:shadow-[#C9AD78]/20 whitespace-nowrap shrink-0 active:scale-95 cursor-pointer"
            >
              <span>Parlons de votre projet</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bouton Menu Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#F5F6FA] hover:text-[#C9AD78] transition-colors focus:outline-none cursor-pointer"
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Déroulant Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#081426]/98 border-b border-[#142B4D] px-6 py-6 backdrop-blur-xl animate-fadeIn">
          <nav className="flex flex-col gap-4 mb-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-[#F5F6FA]/90 hover:text-[#C9AD78] py-2 transition-colors border-b border-[#142B4D]/40"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              triggerContactAction();
            }}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-[#081426] bg-[#C9AD78] hover:bg-[#dfc99c] rounded-md transition-all cursor-pointer"
          >
            <span>Parlons de votre projet</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
