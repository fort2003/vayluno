import { SiteContent } from '../types';

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    title: "Votre business mérite mieux que de tout gérer seul.",
    subtitle: "VAYLUNO vous accompagne dans la gestion de votre boutique en ligne et le développement de votre présence sur les réseaux sociaux.",
    primaryCtaText: "Découvrir nos services",
    secondaryCtaText: "Nous contacter",
    heroImage: "/src/assets/images/hero_vayluno_workspace_1793377544662.jpg",
  },
  offers: {
    virtualAssistant: {
      id: "assistant-virtuel",
      offerNumber: "01",
      badge: "Offre 01",
      title: "Votre boutique, mieux organisée.",
      tagline: "Assistant Virtuel",
      description: "Nous vous accompagnons dans la gestion quotidienne de votre activité pour vous aider à gagner du temps et à mieux suivre vos opérations.",
      prestations: [
        {
          id: "va-1",
          number: "1",
          title: "Réponse aux messages clients",
          description: "Réponse rapide aux demandes clients selon vos consignes et les disponibilités convenues.",
        },
        {
          id: "va-2",
          number: "2",
          title: "Gestion des commandes",
          description: "Réception, enregistrement, organisation et suivi des commandes.",
        },
        {
          id: "va-3",
          number: "3",
          title: "Suivi hebdomadaire des ventes et des stocks",
          description: "Organisation des données dans un fichier Excel clair et structuré : produits vendus, quantités disponibles, état des stocks et récapitulatif hebdomadaire des ventes.",
        },
        {
          id: "va-4",
          number: "4",
          title: "Gestion et suivi des livraisons",
          description: "Organisation des informations, coordination et suivi de l'avancement des livraisons.",
        },
      ],
      buttonText: "Discuter de votre besoin",
      image: "/src/assets/images/service_virtual_assistant_1793377545282.jpg",
      imageAlt: "Assistante virtuelle professionnelle organisant les commandes et la relation client",
    },
    communityManager: {
      id: "community-manager",
      offerNumber: "02",
      badge: "Offre 02",
      title: "Une présence digitale qui vous ressemble.",
      tagline: "Community Manager",
      description: "Construisez une présence professionnelle sur les réseaux sociaux grâce à une communication cohérente, créative et adaptée à votre marque.",
      prestations: [
        {
          id: "cm-1",
          number: "1",
          title: "Création de contenu",
          description: "Conception de contenus adaptés à votre activité et à votre audience.",
        },
        {
          id: "cm-2",
          number: "2",
          title: "Création de visuels",
          description: "Conception de publications et de visuels respectant votre identité visuelle.",
        },
        {
          id: "cm-3",
          number: "3",
          title: "Rédaction",
          description: "Rédaction de légendes, textes de publications et contenus promotionnels.",
        },
        {
          id: "cm-4",
          number: "4",
          title: "Planification éditoriale",
          description: "Organisation du calendrier de publication et planification des contenus.",
        },
        {
          id: "cm-5",
          number: "5",
          title: "Animation de communauté",
          description: "Gestion des interactions et modération selon les modalités convenues.",
        },
      ],
      buttonText: "Parlons de votre communication",
      image: "/src/assets/images/service_community_manager_1793377545767.jpg",
      imageAlt: "Équipe de community management concevant des visuels et un calendrier éditorial",
    },
  },
  whyVayluno: {
    intro: "Chaque activité a ses propres défis. Notre objectif est de vous accompagner avec une approche structurée, créative et adaptée à votre réalité.",
    editorialImage: "/src/assets/images/editorial_about_vision_1793377588307.jpg",
    values: [
      {
        id: "val-1",
        title: "Organisation",
        description: "Des informations structurées et un quotidien mieux organisé.",
      },
      {
        id: "val-2",
        title: "Communication",
        description: "Une attention portée aux échanges avec vos clients et votre communauté.",
      },
      {
        id: "val-3",
        title: "Créativité",
        description: "Des contenus pensés pour valoriser votre identité.",
      },
      {
        id: "val-4",
        title: "Accompagnement",
        description: "Une approche adaptée à vos besoins et à vos priorités.",
      },
    ],
  },
  process: {
    title: "Comment ça fonctionne ?",
    subtitle: "Un accompagnement fluide, transparent et adapté à vos opérations dès le premier échange.",
    steps: [
      {
        step: "01",
        title: "Échange",
        description: "Contactez-nous en message privé et présentez-nous votre activité.",
      },
      {
        step: "02",
        title: "Compréhension",
        description: "Nous échangeons sur vos besoins, vos objectifs et votre organisation actuelle.",
      },
      {
        step: "03",
        title: "Accompagnement",
        description: "Nous définissons ensemble les services adaptés et les modalités de collaboration.",
      },
    ],
  },
  finalCta: {
    title: "Et si vous passiez à la prochaine étape ?",
    description: "Parlons de votre activité et découvrons comment VAYLUNO peut vous accompagner.",
    buttonText: "Contactez-nous en message privé",
  },
  contact: {
    // Adresse e-mail de réception des formulaires (modifiable dans l'espace Admin)
    receiverEmail: "harmonio2019@gmail.com",
    contactEmail: "",
    contactPhone: "",
    // Configuré centralement conformément au cahier des charges :
    contactUrl: "REMPLACER_PAR_MON_LIEN",
    contactChannelLabel: "Messagerie privée",
    instagramUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
    linkedinUrl: "",
  },
  meta: {
    brandName: "VAYLUNO",
    tagline: "Accompagnement Digital Premium",
    lastUpdated: "2026-10-30",
  },
};
