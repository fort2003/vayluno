import React, { useState, useEffect } from 'react';
import { ContentProvider } from './context/ContentContext';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { Offers } from './components/public/Offers';
import { WhyVayluno } from './components/public/WhyVayluno';
import { Process } from './components/public/Process';
import { FinalCta } from './components/public/FinalCta';
import { Footer } from './components/public/Footer';
import { ContactModal } from './components/public/ContactModal';
import { AdminPage } from './components/admin/AdminPage';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>('public');

  useEffect(() => {
    const checkRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const cleanPath = pathname.replace(/\/+$/, '');
      const cleanHash = hash.replace(/\/+$/, '');

      if (
        cleanPath === '/admin-fanahy' ||
        cleanPath === '/gestion-privee' ||
        cleanHash === '#/admin-fanahy' ||
        cleanHash === '#admin-fanahy' ||
        cleanHash === '#/gestion-privee' ||
        cleanHash === '#gestion-privee'
      ) {
        setCurrentRoute('admin');
      } else {
        setCurrentRoute('public');
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);

  const navigateToPublic = () => {
    window.history.pushState({}, '', '/');
    window.location.hash = '';
    setCurrentRoute('public');
  };

  if (currentRoute === 'admin') {
    return <AdminPage onBackToPublicSite={navigateToPublic} />;
  }

  return (
    <div className="min-h-screen bg-[#081426] text-[#F5F6FA] flex flex-col font-sans selection:bg-[#C9AD78]/30 selection:text-white">
      {/* Navigation publique (Stricte : aucun lien d'administration) */}
      <Navbar />

      <main className="flex-1">
        {/* Section Hero */}
        <Hero />

        {/* Section Nos deux offres (Assistant Virtuel & Community Manager) */}
        <Offers />

        {/* Section Pourquoi VAYLUNO ? (4 valeurs) */}
        <WhyVayluno />

        {/* Section Comment ça fonctionne ? (Timeline 3 étapes) */}
        <Process />

        {/* Section CTA Final (Accents Champagne Gold & Midnight Navy) */}
        <FinalCta />
      </main>

      {/* Footer public (Sans aucun lien d'administration) */}
      <Footer />

      {/* Dialogue modal de contact et validation du canal privé */}
      <ContactModal />
    </div>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <AppContent />
    </ContentProvider>
  );
}
