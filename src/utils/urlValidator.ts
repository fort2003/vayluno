/**
 * Validation et sécurisation des URLs externes
 */

export interface UrlStatus {
  isValid: boolean;
  isConfigured: boolean;
  cleanUrl: string;
  errorMessage?: string;
}

const PLACEHOLDER_STRINGS = [
  'REMPLACER_PAR_MON_LIEN',
  'REMPLACER',
  'VOTRE_LIEN',
  'EXAMPLE.COM',
  '#',
];

export function inspectUrl(rawUrl?: string): UrlStatus {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      isConfigured: false,
      cleanUrl: '',
      errorMessage: "Aucun lien n'a encore été configuré.",
    };
  }

  const trimmed = rawUrl.trim();

  if (trimmed === '') {
    return {
      isValid: false,
      isConfigured: false,
      cleanUrl: '',
      errorMessage: "Le lien est vide.",
    };
  }

  // Vérifier si c'est un placeholder
  const isPlaceholder = PLACEHOLDER_STRINGS.some((ph) =>
    trimmed.toUpperCase().includes(ph)
  );

  if (isPlaceholder) {
    return {
      isValid: false,
      isConfigured: false,
      cleanUrl: '',
      errorMessage:
        "Lien en cours de configuration par l'administrateur (valeur d'exemple détectée).",
    };
  }

  // Support direct des liens whatsapp ou protocoles sécurisés
  let urlToTest = trimmed;
  if (urlToTest.startsWith('wa.me/') || urlToTest.startsWith('t.me/')) {
    urlToTest = `https://${urlToTest}`;
  }

  try {
    const parsed = new URL(urlToTest);
    const isAllowedProtocol =
      parsed.protocol === 'https:' ||
      parsed.protocol === 'http:' ||
      parsed.protocol === 'mailto:';

    if (!isAllowedProtocol) {
      return {
        isValid: false,
        isConfigured: true,
        cleanUrl: '',
        errorMessage: 'Protocole non supporté pour des raisons de sécurité.',
      };
    }

    return {
      isValid: true,
      isConfigured: true,
      cleanUrl: urlToTest,
    };
  } catch {
    return {
      isValid: false,
      isConfigured: true,
      cleanUrl: '',
      errorMessage: 'Format de lien invalide (doit commencer par https://).',
    };
  }
}

/**
 * Ouvre une URL en toute sécurité dans un nouvel onglet
 */
export function openSafeUrl(url: string): void {
  const status = inspectUrl(url);
  if (status.isValid && status.cleanUrl) {
    window.open(status.cleanUrl, '_blank', 'noopener,noreferrer');
  }
}
