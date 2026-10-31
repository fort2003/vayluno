import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SiteContent, AdminSession, ContactFormData, ContactSubmissionResult, ContactServiceOption } from '../types';
import { DEFAULT_SITE_CONTENT } from '../config/siteDefaults';
import { inspectUrl, UrlStatus } from '../utils/urlValidator';

interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: SiteContent) => Promise<{ success: boolean; message: string }>;
  resetToDefault: () => void;
  adminSession: AdminSession;
  loginAdmin: (password: string, username?: string) => Promise<{ success: boolean; error?: string; remainingAttempts?: number }>;
  logoutAdmin: () => Promise<void>;
  isBackendConnected: boolean;
  contactStatus: UrlStatus;
  triggerContactAction: (service?: ContactServiceOption | React.MouseEvent) => void;
  selectedServiceForContact: ContactServiceOption;
  setSelectedServiceForContact: (service: ContactServiceOption) => void;
  sendContactForm: (formData: ContactFormData) => Promise<ContactSubmissionResult>;
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;
  hasUnsavedChanges: boolean;
  exportConfigAsJson: () => void;
  importConfigFromJson: (jsonStr: string) => boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'vayluno_preview_content';
const AUTH_TOKEN_STORAGE_KEY = 'vayluno_admin_token';

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(() => {
    // Essayer de charger depuis le stockage local (pour prévisualisation instantanée si disponible)
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignorer
    }
    return DEFAULT_SITE_CONTENT;
  });

  const [initialSavedContent, setInitialSavedContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [selectedServiceForContact, setSelectedServiceForContact] = useState<ContactServiceOption>('autre');

  const [adminSession, setAdminSession] = useState<AdminSession>({
    isAuthenticated: false,
    username: '',
    isBackendConnected: false,
  });

  // Détection du serveur backend & chargement du contenu
  useEffect(() => {
    let isMounted = true;

    async function checkBackendAndLoadContent() {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          if (isMounted) setIsBackendConnected(true);

          // Vérifier session existante
          const savedToken = sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
          if (savedToken) {
            try {
              const sessionRes = await fetch('/api/admin/session', {
                headers: { Authorization: `Bearer ${savedToken}` },
              });
              if (sessionRes.ok) {
                const sessionData = await sessionRes.json();
                if (sessionData.isAuthenticated && isMounted) {
                  setAdminSession({
                    isAuthenticated: true,
                    username: sessionData.username,
                    token: savedToken,
                    expiresAt: sessionData.expiresAt,
                    isBackendConnected: true,
                  });
                }
              } else {
                sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
              }
            } catch {
              sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
            }
          }

          // Charger le contenu sauvegardé sur le serveur s'il existe
          try {
            const contentRes = await fetch('/api/content');
            if (contentRes.ok) {
              const contentData = await contentRes.json();
              if (contentData.success && contentData.content && isMounted) {
                setContent(contentData.content);
                setInitialSavedContent(contentData.content);
              }
            }
          } catch (e) {
            console.error('Erreur chargement /api/content:', e);
          }
        } else {
          if (isMounted) setIsBackendConnected(false);
        }
      } catch {
        // En mode statique pur (sans serveur Node actif)
        if (isMounted) setIsBackendConnected(false);
      }
    }

    checkBackendAndLoadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const contactStatus = inspectUrl(content.contact.contactUrl);

  // Déclencheur centralisé pour tous les boutons de contact
  const triggerContactAction = useCallback((service?: ContactServiceOption | React.MouseEvent) => {
    if (typeof service === 'string') {
      setSelectedServiceForContact(service);
    }
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const nameInput = document.getElementById('contact-name');
        if (nameInput) {
          nameInput.focus();
        }
      }, 500);
    } else {
      setIsContactModalOpen(true);
    }
  }, []);

  // Envoi du formulaire de contact sécurisé
  const sendContactForm = async (formData: ContactFormData): Promise<ContactSubmissionResult> => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message || "Votre message a bien été envoyé. Merci d'avoir contacté VAYLUNO.",
        };
      } else {
        return {
          success: false,
          message: data.details || data.error || "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
          missingConfig: data.missingConfig,
        };
      }
    } catch {
      return {
        success: false,
        message: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      };
    }
  };

  // Connexion administrateur
  const loginAdmin = async (password: string, username = 'admin@vayluno.com') => {
    if (isBackendConnected) {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.token);
          setAdminSession({
            isAuthenticated: true,
            username: data.username,
            token: data.token,
            expiresAt: data.expiresAt,
            isBackendConnected: true,
          });
          return { success: true };
        } else {
          return {
            success: false,
            error: data.error || 'Identifiants invalides.',
            remainingAttempts: data.remainingAttempts,
          };
        }
      } catch {
        return {
          success: false,
          error: 'Impossible de joindre le serveur d’authentification.',
        };
      }
    } else {
      // Mode Statique pur : information transparente
      // Autoriser l'accès en mode aperçu local sécurisé pour que l'administrateur puisse préparer sa config
      if (password === 'Vayluno2026!Secure' || password === 'admin') {
        setAdminSession({
          isAuthenticated: true,
          username: 'admin@vayluno.com (Mode Statique)',
          isBackendConnected: false,
        });
        return { success: true };
      }
      return {
        success: false,
        error: 'Mot de passe incorrect (Mode statique : utilisez le mot de passe de configuration).',
      };
    }
  };

  // Déconnexion
  const logoutAdmin = async () => {
    if (isBackendConnected && adminSession.token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminSession.token}` },
        });
      } catch {
        // Ignorer
      }
    }
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setAdminSession({
      isAuthenticated: false,
      username: '',
      isBackendConnected,
    });
  };

  // Sauvegarde des modifications
  const updateContent = async (newContent: SiteContent) => {
    setContent(newContent);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newContent));
    } catch {
      // Ignorer
    }

    if (isBackendConnected && adminSession.token) {
      try {
        const res = await fetch('/api/admin/content', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminSession.token}`,
          },
          body: JSON.stringify(newContent),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setInitialSavedContent(newContent);
          return { success: true, message: 'Modifications sauvegardées avec succès sur le serveur.' };
        } else {
          return { success: false, message: data.error || 'Erreur lors de la sauvegarde sur le serveur.' };
        }
      } catch {
        return { success: false, message: 'Erreur réseau lors de la communication avec le serveur.' };
      }
    }

    // Mode statique (sauvegarde en session locale + prêt pour export)
    setInitialSavedContent(newContent);
    return {
      success: true,
      message: 'Modifications enregistrées localement. Vous pouvez exporter le fichier JSON pour mise en production statique.',
    };
  };

  // Réinitialiser au contenu d'origine
  const resetToDefault = () => {
    setContent(DEFAULT_SITE_CONTENT);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignorer
    }
  };

  // Télécharger la configuration actuelle en JSON
  const exportConfigAsJson = () => {
    const jsonStr = JSON.stringify(content, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vayluno-site-content-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Importer un fichier JSON
  const importConfigFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.hero && parsed.offers && parsed.contact) {
        setContent(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const hasUnsavedChanges = JSON.stringify(content) !== JSON.stringify(initialSavedContent);

  return (
    <ContentContext.Provider
      value={{
        content,
        updateContent,
        resetToDefault,
        adminSession,
        loginAdmin,
        logoutAdmin,
        isBackendConnected,
        contactStatus,
        triggerContactAction,
        selectedServiceForContact,
        setSelectedServiceForContact,
        sendContactForm,
        isContactModalOpen,
        setIsContactModalOpen,
        hasUnsavedChanges,
        exportConfigAsJson,
        importConfigFromJson,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent doit être utilisé au sein d’un ContentProvider');
  }
  return context;
};
