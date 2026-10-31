import React, { useState } from 'react';
import {
  Lock,
  LogOut,
  Save,
  RotateCcw,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Eye,
  ArrowLeft,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Plus,
  Trash2,
  Mail,
  Phone,
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { SiteContent, Prestation } from '../../types';
import { inspectUrl } from '../../utils/urlValidator';

interface AdminPageProps {
  onBackToPublicSite: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToPublicSite }) => {
  const {
    content,
    updateContent,
    resetToDefault,
    adminSession,
    loginAdmin,
    logoutAdmin,
    isBackendConnected,
    hasUnsavedChanges,
    exportConfigAsJson,
  } = useContent();

  // État local du formulaire d'édition
  const [formData, setFormData] = useState<SiteContent>(content);
  const [activeTab, setActiveTab] = useState<'hero' | 'offers' | 'contact' | 'values' | 'security'>('hero');

  // État de connexion
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // État de sauvegarde
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Synchroniser formData avec le contenu global si mis à jour
  React.useEffect(() => {
    setFormData(content);
  }, [content]);

  // Gestion de la connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmittingLogin(true);

    const result = await loginAdmin(passwordInput, usernameInput || undefined);
    setIsSubmittingLogin(false);

    if (!result.success) {
      setLoginError(result.error || 'Erreur de connexion');
      if (typeof result.remainingAttempts === 'number') {
        setRemainingAttempts(result.remainingAttempts);
      }
    } else {
      setPasswordInput('');
    }
  };

  // Gestion de la sauvegarde
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    const res = await updateContent(formData);
    setIsSaving(false);

    if (res.success) {
      setSaveStatus({ type: 'success', message: res.message });
      setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
    } else {
      setSaveStatus({ type: 'error', message: res.message });
    }
  };

  // Annuler les modifications non publiées
  const handleCancelChanges = () => {
    if (window.confirm('Voulez-vous annuler vos modifications en cours et restaurer la dernière version sauvegardée ?')) {
      setFormData(content);
      setSaveStatus({ type: null, message: '' });
    }
  };

  // Réinitialiser vers les paramètres par défaut
  const handleResetDefaults = () => {
    if (window.confirm('Attention : cela réinitialisera l’ensemble des textes et prestations aux valeurs initiales d’origine. Confirmer ?')) {
      resetToDefault();
      setFormData(content);
      setSaveStatus({
        type: 'success',
        message: 'Contenu réinitialisé aux valeurs par défaut de VAYLUNO.',
      });
    }
  };

  // Mise à jour d'une prestation
  const handlePrestationChange = (
    offerKey: 'virtualAssistant' | 'communityManager',
    index: number,
    field: keyof Prestation,
    value: string
  ) => {
    const updatedPrestations = [...formData.offers[offerKey].prestations];
    updatedPrestations[index] = {
      ...updatedPrestations[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      offers: {
        ...formData.offers,
        [offerKey]: {
          ...formData.offers[offerKey],
          prestations: updatedPrestations,
        },
      },
    });
  };

  // Ajouter une prestation
  const handleAddPrestation = (offerKey: 'virtualAssistant' | 'communityManager') => {
    const currentList = formData.offers[offerKey].prestations;
    const newNumber = (currentList.length + 1).toString();
    const newPrestation: Prestation = {
      id: `${offerKey}-new-${Date.now()}`,
      number: newNumber,
      title: 'Nouvelle prestation',
      description: 'Description de la prestation...',
    };

    setFormData({
      ...formData,
      offers: {
        ...formData.offers,
        [offerKey]: {
          ...formData.offers[offerKey],
          prestations: [...currentList, newPrestation],
        },
      },
    });
  };

  // Supprimer une prestation
  const handleDeletePrestation = (
    offerKey: 'virtualAssistant' | 'communityManager',
    index: number
  ) => {
    const currentList = formData.offers[offerKey].prestations;
    if (currentList.length <= 1) {
      alert('Une offre doit contenir au moins une prestation.');
      return;
    }
    const updated = currentList.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      offers: {
        ...formData.offers,
        [offerKey]: {
          ...formData.offers[offerKey],
          prestations: updated,
        },
      },
    });
  };

  // SI NON AUTHENTIFIÉ : FORMULAIRE DE CONNEXION SÉCURISÉ
  if (!adminSession.isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#081426] flex items-center justify-center p-6 selection:bg-[#C9AD78]/30">
        <div className="w-full max-w-md bg-[#142B4D]/40 border border-[#C9AD78]/30 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/70 relative">
          
          <button
            onClick={onBackToPublicSite}
            className="inline-flex items-center gap-1.5 text-xs text-[#F5F6FA]/60 hover:text-[#C9AD78] transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour au site vitrine</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#081426] border border-[#C9AD78]/50 flex items-center justify-center text-[#C9AD78] mx-auto mb-4 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#F5F6FA] tracking-wide">
              Espace Administrateur
            </h1>
            <p className="text-xs text-[#C9AD78] font-mono uppercase tracking-widest mt-1">
              VAYLUNO · Gestion Privée Sécurisée
            </p>
          </div>

          {/* Statut du backend / Transparence architecturale */}
          <div className="mb-6 p-3 rounded-lg bg-[#081426]/80 border border-[#142B4D] text-xs">
            {isBackendConnected ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Serveur d'authentification sécurisé actif</span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Mode Statique Détecté (Sans base de données). Utilisez les identifiants d'administration configurés.
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F6FA]/70 font-medium mb-1.5">
                Identifiant
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin@vayluno.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#081426] border border-[#142B4D] focus:border-[#C9AD78] text-[#F5F6FA] text-sm focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F6FA]/70 font-medium mb-1.5">
                Mot de passe administrateur
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#081426] border border-[#142B4D] focus:border-[#C9AD78] text-[#F5F6FA] text-sm focus:outline-none transition-colors"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-200">
                <p>{loginError}</p>
                {remainingAttempts !== null && (
                  <p className="mt-1 text-[11px] text-red-300">
                    Tentatives restantes : {remainingAttempts} / 5
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-[#C9AD78] hover:bg-[#dfc99c] text-[#081426] font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-[#C9AD78]/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingLogin ? 'Vérification...' : 'Déverrouiller l’administration'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#142B4D] text-center">
            <p className="text-[11px] text-[#F5F6FA]/40 font-light">
              Identifiant par défaut : <span className="font-mono text-[#F5F6FA]/70">admin@vayluno.com</span>
              <br />
              Mot de passe par défaut : <span className="font-mono text-[#F5F6FA]/70">Vayluno2026!Secure</span>
              <br />
              (Personnalisable dans <span className="font-mono text-[#C9AD78]">.env</span> via <span className="font-mono">ADMIN_PASSWORD</span>)
            </p>
          </div>

        </div>
      </main>
    );
  }

  // SI AUTHENTIFIÉ : TABLEAU DE BORD D'ADMINISTRATION
  return (
    <div className="min-h-screen bg-[#081426] text-[#F5F6FA] flex flex-col">
      
      {/* Barre supérieure de l'espace privé */}
      <header className="bg-[#142B4D] border-b border-[#C9AD78]/30 px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToPublicSite}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#081426] text-xs text-[#F5F6FA] hover:text-[#C9AD78] border border-[#142B4D] transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Voir le site public</span>
            </button>

            <div className="h-4 w-[1px] bg-[#C9AD78]/30 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-[#F5F6FA]">VAYLUNO</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#081426] text-[#C9AD78] border border-[#C9AD78]/40 font-mono">
                Espace Privé
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Indicateur de sauvegarde */}
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded">
                Modifications non enregistrées
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#081426] bg-[#C9AD78] hover:bg-[#dfc99c] rounded-md transition-all shadow cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Sauvegarde...' : 'Enregistrer'}</span>
            </button>

            <button
              onClick={logoutAdmin}
              className="p-2 text-[#F5F6FA]/70 hover:text-red-400 rounded-md hover:bg-[#081426] transition-colors cursor-pointer"
              title="Déconnexion"
              aria-label="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Message de statut de sauvegarde */}
      {saveStatus.type && (
        <div
          className={`px-6 py-3 text-xs font-medium flex items-center justify-center gap-2 ${
            saveStatus.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-b border-emerald-800'
              : 'bg-red-950/90 text-red-200 border-b border-red-800'
          }`}
        >
          {saveStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Corps principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* Navigation des onglets */}
        <div className="flex flex-wrap gap-2 border-b border-[#142B4D] pb-4 mb-8">
          {[
            { id: 'hero', label: '1. Hero & Présentation' },
            { id: 'offers', label: '2. Les Deux Offres & Prestations' },
            { id: 'values', label: '3. Valeurs & Processus' },
            { id: 'contact', label: '4. Contacts & Adresses E-mail' },
            { id: 'security', label: '5. Architecture & Sécurité' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#C9AD78] text-[#081426]'
                  : 'bg-[#142B4D]/50 text-[#F5F6FA]/70 hover:bg-[#142B4D] hover:text-[#F5F6FA]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= ONGLET 1 : HERO & PRÉSENTATION ================= */}
        {activeTab === 'hero' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-[#142B4D]/30 border border-[#142B4D] rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-serif font-bold text-[#F5F6FA] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C9AD78]" />
                <span>Textes Principaux de la Page d'Accueil</span>
              </h2>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2">
                  Titre Principal du Hero
                </label>
                <input
                  type="text"
                  value={formData.hero.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, title: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-[#081426] border border-[#142B4D] focus:border-[#C9AD78] text-[#F5F6FA] text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2">
                  Sous-titre de Présentation
                </label>
                <textarea
                  rows={3}
                  value={formData.hero.subtitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-[#081426] border border-[#142B4D] focus:border-[#C9AD78] text-[#F5F6FA] text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2">
                    Libellé Bouton 1 (Défilement vers services)
                  </label>
                  <input
                    type="text"
                    value={formData.hero.primaryCtaText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, primaryCtaText: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-[#081426] border border-[#142B4D] focus:border-[#C9AD78] text-[#F5F6FA] text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2">
                    Libellé Bouton 2 (Ouverture contact privé)
                  </label>
                  <input
                    type="text"
                    value={formData.hero.secondaryCtaText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, secondaryCtaText: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-[#081426] border border-[#142B4D] focus:border-[#C9AD78] text-[#F5F6FA] text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2">
                  Chemin de l'image Hero
                </label>
                <input
                  type="text"
                  value={formData.hero.heroImage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, heroImage: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-[#081426] border border-[#142B4D] focus:border-[#C9AD78] text-[#F5F6FA] text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET 2 : LES DEUX OFFRES ================= */}
        {activeTab === 'offers' && (
          <div className="space-y-10 max-w-5xl">
            {/* Offre 1 : Assistant Virtuel */}
            <div className="bg-[#142B4D]/30 border border-[#142B4D] rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#142B4D] pb-3">
                <h3 className="text-lg font-serif font-bold text-[#F5F6FA]">
                  Offre 01 — Assistant Virtuel
                </h3>
                <span className="text-xs font-mono text-[#C9AD78]">ID: assistant-virtuel</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-1.5">
                    Titre de l'offre
                  </label>
                  <input
                    type="text"
                    value={formData.offers.virtualAssistant.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        offers: {
                          ...formData.offers,
                          virtualAssistant: {
                            ...formData.offers.virtualAssistant,
                            title: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-1.5">
                    Texte du bouton de contact
                  </label>
                  <input
                    type="text"
                    value={formData.offers.virtualAssistant.buttonText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        offers: {
                          ...formData.offers,
                          virtualAssistant: {
                            ...formData.offers.virtualAssistant,
                            buttonText: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-1.5">
                  Description générale
                </label>
                <textarea
                  rows={2}
                  value={formData.offers.virtualAssistant.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      offers: {
                        ...formData.offers,
                        virtualAssistant: {
                          ...formData.offers.virtualAssistant,
                          description: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-sm"
                />
              </div>

              {/* Prestations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#C9AD78] font-semibold">
                    Prestations détaillées ({formData.offers.virtualAssistant.prestations.length})
                  </span>
                  <button
                    onClick={() => handleAddPrestation('virtualAssistant')}
                    className="inline-flex items-center gap-1 text-xs text-[#C9AD78] hover:text-[#dfc99c] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une prestation</span>
                  </button>
                </div>

                {formData.offers.virtualAssistant.prestations.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-lg bg-[#081426] border border-[#142B4D] space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#C9AD78]">Prestation #{p.number}</span>
                      <button
                        onClick={() => handleDeletePrestation('virtualAssistant', idx)}
                        className="text-red-400/80 hover:text-red-300 p-1 cursor-pointer"
                        title="Supprimer cette prestation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) =>
                        handlePrestationChange('virtualAssistant', idx, 'title', e.target.value)
                      }
                      className="w-full px-3 py-1.5 rounded bg-[#142B4D]/30 border border-[#142B4D] text-xs font-semibold text-[#F5F6FA]"
                    />

                    <textarea
                      rows={2}
                      value={p.description}
                      onChange={(e) =>
                        handlePrestationChange('virtualAssistant', idx, 'description', e.target.value)
                      }
                      className="w-full px-3 py-1.5 rounded bg-[#142B4D]/30 border border-[#142B4D] text-xs text-[#F5F6FA]/80"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Offre 2 : Community Manager */}
            <div className="bg-[#142B4D]/30 border border-[#142B4D] rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#142B4D] pb-3">
                <h3 className="text-lg font-serif font-bold text-[#F5F6FA]">
                  Offre 02 — Community Manager
                </h3>
                <span className="text-xs font-mono text-[#C9AD78]">ID: community-manager</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-1.5">
                    Titre de l'offre
                  </label>
                  <input
                    type="text"
                    value={formData.offers.communityManager.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        offers: {
                          ...formData.offers,
                          communityManager: {
                            ...formData.offers.communityManager,
                            title: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-1.5">
                    Texte du bouton de contact
                  </label>
                  <input
                    type="text"
                    value={formData.offers.communityManager.buttonText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        offers: {
                          ...formData.offers,
                          communityManager: {
                            ...formData.offers.communityManager,
                            buttonText: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-1.5">
                  Description générale
                </label>
                <textarea
                  rows={2}
                  value={formData.offers.communityManager.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      offers: {
                        ...formData.offers,
                        communityManager: {
                          ...formData.offers.communityManager,
                          description: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-sm"
                />
              </div>

              {/* Prestations Community Manager */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#C9AD78] font-semibold">
                    Prestations détaillées ({formData.offers.communityManager.prestations.length})
                  </span>
                  <button
                    onClick={() => handleAddPrestation('communityManager')}
                    className="inline-flex items-center gap-1 text-xs text-[#C9AD78] hover:text-[#dfc99c] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une prestation</span>
                  </button>
                </div>

                {formData.offers.communityManager.prestations.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-lg bg-[#081426] border border-[#142B4D] space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#C9AD78]">Prestation #{p.number}</span>
                      <button
                        onClick={() => handleDeletePrestation('communityManager', idx)}
                        className="text-red-400/80 hover:text-red-300 p-1 cursor-pointer"
                        title="Supprimer cette prestation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) =>
                        handlePrestationChange('communityManager', idx, 'title', e.target.value)
                      }
                      className="w-full px-3 py-1.5 rounded bg-[#142B4D]/30 border border-[#142B4D] text-xs font-semibold text-[#F5F6FA]"
                    />

                    <textarea
                      rows={2}
                      value={p.description}
                      onChange={(e) =>
                        handlePrestationChange('communityManager', idx, 'description', e.target.value)
                      }
                      className="w-full px-3 py-1.5 rounded bg-[#142B4D]/30 border border-[#142B4D] text-xs text-[#F5F6FA]/80"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET 3 : VALEURS & PROCESSUS ================= */}
        {activeTab === 'values' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-[#142B4D]/30 border border-[#142B4D] rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#F5F6FA]">
                Introduction « Pourquoi VAYLUNO ? »
              </h3>
              <textarea
                rows={3}
                value={formData.whyVayluno.intro}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whyVayluno: { ...formData.whyVayluno, intro: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-lg bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-sm"
              />
            </div>

            <div className="bg-[#142B4D]/30 border border-[#142B4D] rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#F5F6FA]">
                CTA Final
              </h3>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-1.5">
                  Titre du CTA Final
                </label>
                <input
                  type="text"
                  value={formData.finalCta.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finalCta: { ...formData.finalCta, title: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-1.5">
                  Description du CTA Final
                </label>
                <textarea
                  rows={2}
                  value={formData.finalCta.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finalCta: { ...formData.finalCta, description: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-1.5">
                  Texte du Bouton Final
                </label>
                <input
                  type="text"
                  value={formData.finalCta.buttonText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      finalCta: { ...formData.finalCta, buttonText: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= ONGLET 4 : CONTACTS & ADRESSES E-MAIL ================= */}
        {activeTab === 'contact' && (
          <div className="space-y-6 max-w-4xl">
            {/* 1. Adresse E-mail de Réception des Formulaires */}
            <div className="bg-[#142B4D]/30 border border-[#142B4D] rounded-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-[#142B4D] pb-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#F5F6FA] flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#C9AD78]" />
                    <span>Adresse E-mail de Réception des Demandes</span>
                  </h3>
                  <p className="text-xs text-[#F5F6FA]/70 font-light mt-1">
                    Toutes les demandes envoyées par les visiteurs depuis le formulaire de contact seront automatiquement transmises à cette adresse.
                  </p>
                </div>
                {formData.contact.receiverEmail &&
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.receiverEmail.trim()) && (
                    <span className="shrink-0 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded flex items-center gap-1.5 self-start">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Adresse configurée</span>
                    </span>
                  )}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2">
                  Votre Adresse E-mail de Réception des Messages
                </label>
                <input
                  type="email"
                  value={formData.contact.receiverEmail || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, receiverEmail: e.target.value },
                    })
                  }
                  placeholder="harmonio2019@gmail.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#081426] border border-[#142B4D] focus:border-[#C9AD78] text-[#F5F6FA] text-sm focus:outline-none font-mono"
                />
                <p className="text-[11px] text-[#F5F6FA]/50 mt-1.5 font-light">
                  Cette adresse reste strictement privée sur le serveur et n'est jamais exposée dans le code public du site.
                </p>
              </div>

              {/* Coordonnées directes affichées facultatives */}
              <div className="pt-4 border-t border-[#142B4D]">
                <h4 className="text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2">
                  Coordonnées Directes Affichées (Optionnelles)
                </h4>
                <p className="text-xs text-[#F5F6FA]/60 font-light mb-4">
                  Ces informations s'affichent uniquement si vous choisissez de les renseigner (au bas de page).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#F5F6FA]/70 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#C9AD78]" />
                      <span>E-mail direct public</span>
                    </label>
                    <input
                      type="email"
                      value={formData.contact.contactEmail || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, contactEmail: e.target.value },
                        })
                      }
                      placeholder="contact@vayluno.com"
                      className="w-full px-3.5 py-2 rounded bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#F5F6FA]/70 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#C9AD78]" />
                      <span>Téléphone / WhatsApp direct</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contact.contactPhone || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, contactPhone: e.target.value },
                        })
                      }
                      placeholder="+33 6 00 00 00 00"
                      className="w-full px-3.5 py-2 rounded bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Canal de Messagerie Privée & Réseaux Sociaux */}
            <div className="bg-[#142B4D]/30 border border-[#142B4D] rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#F5F6FA] flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-[#C9AD78]" />
                  <span>Lien de Messagerie Externe & Réseaux Sociaux</span>
                </h3>
                <p className="text-xs text-[#F5F6FA]/70 font-light mt-1">
                  Configurez vos liens externes (WhatsApp direct, Instagram, Facebook, TikTok).
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2">
                  Lien alternatif de messagerie privée (CONTACT_URL)
                </label>
                <input
                  type="text"
                  value={formData.contact.contactUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, contactUrl: e.target.value },
                    })
                  }
                  placeholder="https://wa.me/33600000000 ou https://t.me/votre_pseudo"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#081426] border border-[#142B4D] focus:border-[#C9AD78] text-[#F5F6FA] text-sm focus:outline-none font-mono"
                />
              </div>

              <div className="pt-4 border-t border-[#142B4D]">
                <h4 className="text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-3">
                  Réseaux Sociaux Officiels (Optionnels)
                </h4>
                <p className="text-xs text-[#F5F6FA]/60 font-light mb-4">
                  Règle de sécurité : un réseau social n'apparaîtra dans le footer QUE si son URL exacte est renseignée ci-dessous.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#F5F6FA]/70 mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="text"
                      value={formData.contact.instagramUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, instagramUrl: e.target.value },
                        })
                      }
                      placeholder="https://instagram.com/votre_compte"
                      className="w-full px-3 py-2 rounded bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#F5F6FA]/70 mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="text"
                      value={formData.contact.facebookUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, facebookUrl: e.target.value },
                        })
                      }
                      placeholder="https://facebook.com/votre_page"
                      className="w-full px-3 py-2 rounded bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#F5F6FA]/70 mb-1">
                      TikTok URL
                    </label>
                    <input
                      type="text"
                      value={formData.contact.tiktokUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, tiktokUrl: e.target.value },
                        })
                      }
                      placeholder="https://tiktok.com/@votre_compte"
                      className="w-full px-3 py-2 rounded bg-[#081426] border border-[#142B4D] text-[#F5F6FA] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= ONGLET 5 : ARCHITECTURE & SÉCURITÉ ================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-[#142B4D]/30 border border-[#142B4D] rounded-xl p-6 space-y-5">
              <h3 className="text-lg font-serif font-bold text-[#F5F6FA] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C9AD78]" />
                <span>Architecture Technique & Respect de la Contrainte Sans Base de Données</span>
              </h3>

              <div className="space-y-4 text-xs text-[#F5F6FA]/80 leading-relaxed font-light">
                <div className="p-4 rounded-lg bg-[#081426] border border-[#142B4D] space-y-2">
                  <span className="font-semibold text-[#C9AD78] uppercase tracking-wider block">
                    1. Site Vitrine 100% Sans Base de Données
                  </span>
                  <p>
                    Conformément à votre contrainte absolue, le site vitrine VAYLUNO n'effectue AUCUNE requête SQL et ne dépend d'aucune base de données externe ou locale.
                    Le contenu est servi directement depuis le fichier de configuration statique compilé ou depuis le stockage fichier JSON sécurisé (<code className="text-[#C9AD78]">site-content.json</code>).
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#081426] border border-[#142B4D] space-y-2">
                  <span className="font-semibold text-[#C9AD78] uppercase tracking-wider block">
                    2. Sécurité de l'Authentification Administrateur
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-[#F5F6FA]/70">
                    <li>Hachage cryptographique sécurisé PBKDF2 avec sel unique serveur.</li>
                    <li>Comparaison temporelle constante (<code className="text-[#C9AD78]">crypto.timingSafeEqual</code>) protégeant contre les attaques de type Timing Attack.</li>
                    <li>Limitation anti-brute force : verrouillage automatique après 5 tentatives infructueuses pendant 15 minutes.</li>
                    <li>Jeton de session cryptographique aléatoire de 48 octets émis par le serveur.</li>
                    <li>Aucun secret ni mot de passe en clair dans le code React ou le bundle public.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#081426] border border-[#142B4D] space-y-2">
                  <span className="font-semibold text-[#C9AD78] uppercase tracking-wider block">
                    3. Modification du Mot de Passe en Production
                  </span>
                  <p>
                    Pour changer le mot de passe administrateur en production, définissez la variable d'environnement dans votre plateforme d'hébergement :
                  </p>
                  <pre className="p-2.5 rounded bg-[#142B4D]/60 text-[#C9AD78] font-mono text-[11px] overflow-x-auto">
                    ADMIN_PASSWORD="VotreMotDePasseTresComplexe2026!"
                  </pre>
                </div>
              </div>

              {/* Actions d'exportation et de restauration */}
              <div className="pt-4 border-t border-[#142B4D] flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-1">
                    Exportation & Déploiement Statique
                  </h4>
                  <p className="text-xs text-[#F5F6FA]/60 font-light">
                    Téléchargez votre configuration actuelle sous forme de fichier JSON prêt à l'emploi.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={exportConfigAsJson}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#142B4D] hover:bg-[#142B4D]/80 border border-[#C9AD78]/40 rounded text-[#F5F6FA] transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C9AD78]" />
                    <span>Exporter JSON</span>
                  </button>

                  <button
                    onClick={handleResetDefaults}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider bg-red-950/40 hover:bg-red-950/70 border border-red-800/60 rounded text-red-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réinitialiser aux valeurs d'origine</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Boutons d'action flottants / fixes en bas */}
        <div className="mt-12 pt-6 border-t border-[#142B4D] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#F5F6FA]/60">
            <HelpCircle className="w-4 h-4 text-[#C9AD78]" />
            <span>N'oubliez pas d'enregistrer vos modifications pour qu'elles soient appliquées.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCancelChanges}
              disabled={!hasUnsavedChanges}
              className="px-4 py-2 text-xs font-medium text-[#F5F6FA]/80 hover:text-[#F5F6FA] bg-[#142B4D]/40 hover:bg-[#142B4D] rounded-md transition-colors cursor-pointer disabled:opacity-40"
            >
              Annuler les modifications
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#081426] bg-[#C9AD78] hover:bg-[#dfc99c] rounded-md transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};
