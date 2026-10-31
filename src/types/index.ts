/**
 * Types pour le site vitrine et l'administration VAYLUNO
 */

export interface Prestation {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface ServiceOffer {
  id: 'assistant-virtuel' | 'community-manager';
  offerNumber: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  prestations: Prestation[];
  buttonText: string;
  image: string;
  imageAlt: string;
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface ContactConfig {
  receiverEmail?: string; // Adresse e-mail de réception des formulaires de contact
  contactEmail?: string; // Adresse e-mail de contact direct
  contactPhone?: string; // Téléphone ou WhatsApp
  contactUrl: string; // Lien canal messagerie privée (ex: WhatsApp, Telegram, etc.)
  contactChannelLabel: string; // Libellé indicatif (ex: "Messagerie privée", "WhatsApp")
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  linkedinUrl?: string;
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  heroImage: string;
}

export interface SiteContent {
  hero: HeroConfig;
  offers: {
    virtualAssistant: ServiceOffer;
    communityManager: ServiceOffer;
  };
  whyVayluno: {
    intro: string;
    values: ValueItem[];
    editorialImage: string;
  };
  process: {
    title: string;
    subtitle: string;
    steps: ProcessStep[];
  };
  finalCta: {
    title: string;
    description: string;
    buttonText: string;
  };
  contact: ContactConfig;
  meta: {
    brandName: string;
    tagline: string;
    lastUpdated: string;
  };
}

export interface AdminSession {
  isAuthenticated: boolean;
  username: string;
  expiresAt?: number;
  token?: string;
  isBackendConnected: boolean;
}

export type ContactServiceOption = 'assistant-virtuel' | 'community-manager' | 'autre';

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  service: ContactServiceOption;
  subject: string;
  message: string;
  _gotcha?: string; // Honeypot anti-spam
}

export interface ContactSubmissionResult {
  success: boolean;
  message: string;
  missingConfig?: boolean;
}

