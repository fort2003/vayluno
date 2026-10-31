import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Configuration administrateur
// Le mot de passe par défaut est personnalisable via la variable d'environnement ADMIN_PASSWORD
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin@vayluno.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Vayluno2026!Secure';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Chemin de stockage du fichier de configuration du site (SANS base de données)
const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const CONTENT_FILE_PATH = path.join(DATA_DIR, 'site-content.json');

// Création du répertoire de données si nécessaire
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Système de limitation des tentatives de connexion (Anti-Brute Force)
interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
}
const loginAttempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes de blocage

// Sessions actives en mémoire serveur
interface SessionData {
  username: string;
  expiresAt: number;
  createdAt: number;
}
const activeSessions = new Map<string, SessionData>();
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 heures

app.use(express.json({ limit: '2mb' }));

// Middleware de sécurité basique
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Helper pour hacher le mot de passe de façon sécurisée (PBKDF2)
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// Sel statique pour l'instance
const SERVER_SALT = crypto.createHash('sha256').update(SESSION_SECRET).digest('hex').substring(0, 32);
const EXPECTED_PASSWORD_HASH = hashPassword(ADMIN_PASSWORD, SERVER_SALT);

// Helper pour vérification temporelle constante (Anti-Timing Attacks)
function verifyPasswordTimingSafe(provided: string): boolean {
  const providedHash = hashPassword(provided, SERVER_SALT);
  const bufExpected = Buffer.from(EXPECTED_PASSWORD_HASH);
  const bufProvided = Buffer.from(providedHash);
  if (bufExpected.length !== bufProvided.length) return false;
  return crypto.timingSafeEqual(bufExpected, bufProvided);
}

// Extraction du token de session depuis les en-têtes
function getSessionToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const customHeader = req.headers['x-admin-token'];
  if (typeof customHeader === 'string') {
    return customHeader;
  }
  return null;
}

// Middleware de protection de route d'administration
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const token = getSessionToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Non autorisé. Veuillez vous connecter à la session administrateur.',
    });
  }

  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Session expirée ou invalide. Veuillez vous reconnecter.',
    });
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return res.status(401).json({
      success: false,
      error: 'Session expirée. Veuillez vous reconnecter.',
    });
  }

  (req as unknown as { adminUser: string }).adminUser = session.username;
  next();
}

// ==================== API ROUTES ====================

// Route de statut de l'API
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'VAYLUNO',
    backendType: 'express-standalone',
    databaseRequired: false,
    timestamp: new Date().toISOString(),
  });
});

// Rate limiter pour le formulaire de contact (anti-spam)
interface ContactRateRecord {
  count: number;
  resetAt: number;
}
const contactRateLimits = new Map<string, ContactRateRecord>();
const CONTACT_RATE_LIMIT_MAX = 5;
const CONTACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Nettoyage basique des chaînes contre les injections HTML
function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Route publique pour récupérer le contenu (lecture seule, sans authentification)
app.get('/api/content', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      const data = fs.readFileSync(CONTENT_FILE_PATH, 'utf-8');
      return res.json({ success: true, source: 'server-file', content: JSON.parse(data) });
    }
  } catch (error) {
    console.error('Erreur lecture site-content.json:', error);
  }
  // Si le fichier n'existe pas encore sur le serveur, renvoyer null pour déclencher le fallback client
  return res.json({ success: true, source: 'default-fallback', content: null });
});

// Route publique pour l'envoi sécurisé du formulaire de contact
app.post('/api/contact', async (req: Request, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  // Rate limiting par IP
  const record = contactRateLimits.get(ip) || { count: 0, resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + CONTACT_RATE_LIMIT_WINDOW_MS;
  }
  if (record.count >= CONTACT_RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: 'Trop de messages envoyés récemment depuis votre adresse. Veuillez patienter quelques minutes.',
    });
  }

  const { name, email, company, service, subject, message, _gotcha } = req.body || {};

  // Protection Honeypot anti-spam : si le champ invisible est rempli, ignorer discrètement
  if (_gotcha) {
    return res.json({
      success: true,
      message: "Votre message a bien été envoyé. Merci d'avoir contacté VAYLUNO.",
    });
  }

  // Validation des champs
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const trimmedCompany = typeof company === 'string' ? company.trim() : '';
  const trimmedService = typeof service === 'string' ? service.trim() : 'autre';
  const trimmedSubject = typeof subject === 'string' ? subject.trim() : '';
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (!trimmedName || trimmedName.length > 100) {
    return res.status(400).json({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: 'Veuillez renseigner votre nom complet (100 caractères maximum).',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || trimmedEmail.length > 120 || !emailRegex.test(trimmedEmail)) {
    return res.status(400).json({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: 'Veuillez renseigner une adresse e-mail valide.',
    });
  }

  if (trimmedCompany.length > 120) {
    return res.status(400).json({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: "Le nom d'entreprise ne peut pas dépasser 120 caractères.",
    });
  }

  const validServices = ['assistant-virtuel', 'community-manager', 'autre'];
  if (!validServices.includes(trimmedService)) {
    return res.status(400).json({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: 'Service sélectionné invalide.',
    });
  }

  if (!trimmedSubject || trimmedSubject.length > 150) {
    return res.status(400).json({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: 'Veuillez renseigner un objet pour votre message (150 caractères maximum).',
    });
  }

  if (!trimmedMessage || trimmedMessage.length < 10 || trimmedMessage.length > 3000) {
    return res.status(400).json({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: 'Le message doit contenir entre 10 et 3000 caractères.',
    });
  }

  // Configuration e-mail : priorité à l'adresse e-mail configurée dans l'espace Admin
  let receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'harmonio2019@gmail.com';
  try {
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      const savedData = JSON.parse(fs.readFileSync(CONTENT_FILE_PATH, 'utf-8'));
      if (
        savedData?.contact?.receiverEmail &&
        typeof savedData.contact.receiverEmail === 'string' &&
        savedData.contact.receiverEmail.trim()
      ) {
        receiverEmail = savedData.contact.receiverEmail.trim();
      }
    }
  } catch (err) {
    console.error('Erreur lecture receiverEmail personnalisé:', err);
  }

  const emailApiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'VAYLUNO <onboarding@resend.dev>';

  const serviceLabels: Record<string, string> = {
    'assistant-virtuel': 'Assistant Virtuel',
    'community-manager': 'Community Manager',
    'autre': 'Autre demande',
  };
  const serviceLabel = serviceLabels[trimmedService] || 'Autre demande';

  const dateStr = new Date().toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  // Si le fournisseur d'e-mail n'est pas encore configuré : ne JAMAIS prétendre le succès
  if (!emailApiKey) {
    console.warn('[VAYLUNO CONTACT] Variable EMAIL_API_KEY manquante dans .env.');
    return res.status(503).json({
      success: false,
      missingConfig: true,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: "Le service d'envoi d'e-mails n'est pas configuré. Veuillez définir EMAIL_API_KEY dans le fichier .env.",
    });
  }

  // Enregistrement de la tentative
  record.count += 1;
  contactRateLimits.set(ip, record);

  try {
    const emailPayload = {
      from: emailFrom,
      to: [receiverEmail],
      reply_to: `${trimmedName} <${trimmedEmail}>`,
      subject: `[VAYLUNO - ${serviceLabel}] ${trimmedSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #081426; color: #F5F6FA; padding: 30px; border-radius: 8px; border: 1px solid #C9AD78;">
          <h2 style="color: #C9AD78; margin-top: 0; border-bottom: 1px solid #142B4D; padding-bottom: 15px;">
            VAYLUNO — Nouvelle Demande de Contact
          </h2>
          <p style="font-size: 13px; color: #C9AD78; margin-bottom: 25px;">Reçue le ${dateStr}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 8px 0; color: #C9AD78; font-weight: bold; width: 150px;">Nom complet :</td>
              <td style="padding: 8px 0; color: #F5F6FA;">${sanitizeString(trimmedName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #C9AD78; font-weight: bold;">Adresse e-mail :</td>
              <td style="padding: 8px 0; color: #F5F6FA;"><a href="mailto:${sanitizeString(trimmedEmail)}" style="color: #C9AD78;">${sanitizeString(trimmedEmail)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #C9AD78; font-weight: bold;">Entreprise / Boutique :</td>
              <td style="padding: 8px 0; color: #F5F6FA;">${trimmedCompany ? sanitizeString(trimmedCompany) : 'Non spécifiée'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #C9AD78; font-weight: bold;">Service demandé :</td>
              <td style="padding: 8px 0; color: #F5F6FA;"><strong>${sanitizeString(serviceLabel)}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #C9AD78; font-weight: bold;">Objet :</td>
              <td style="padding: 8px 0; color: #F5F6FA;">${sanitizeString(trimmedSubject)}</td>
            </tr>
          </table>

          <div style="background-color: #142B4D; padding: 20px; border-radius: 6px; border-left: 3px solid #C9AD78;">
            <p style="color: #C9AD78; font-weight: bold; margin-top: 0; margin-bottom: 10px;">Message du visiteur :</p>
            <p style="color: #F5F6FA; line-height: 1.6; white-space: pre-wrap; margin: 0;">${sanitizeString(trimmedMessage)}</p>
          </div>

          <p style="font-size: 11px; color: #8899aa; margin-top: 30px; text-align: center; border-top: 1px solid #142B4D; padding-top: 15px;">
            Ce message a été envoyé depuis le formulaire de contact officiel VAYLUNO. Vous pouvez répondre directement à cet e-mail pour joindre ${sanitizeString(trimmedName)}.
          </p>
        </div>
      `,
      text: `VAYLUNO — Nouvelle Demande de Contact
Date : ${dateStr}
Nom complet : ${trimmedName}
Adresse e-mail : ${trimmedEmail}
Entreprise / Boutique : ${trimmedCompany || 'Non spécifiée'}
Service demandé : ${serviceLabel}
Objet : ${trimmedSubject}

Message :
${trimmedMessage}
      `,
    };

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (resendRes.ok) {
      return res.json({
        success: true,
        message: "Votre message a bien été envoyé. Merci d'avoir contacté VAYLUNO.",
      });
    } else {
      const errData = await resendRes.json().catch(() => ({}));
      console.error('[VAYLUNO CONTACT] Réponse erreur fournisseur e-mail:', errData);
      return res.status(502).json({
        success: false,
        error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      });
    }
  } catch (err) {
    console.error('[VAYLUNO CONTACT] Erreur réseau lors de la transmission:', err);
    return res.status(500).json({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
    });
  }
});

// Connexion administrateur avec limitation des tentatives
app.post('/api/admin/login', (req: Request, res: Response) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const { username, password } = req.body || {};

  const now = Date.now();
  const attempt = loginAttempts.get(ip) || { count: 0, lockedUntil: null };

  // Vérification de blocage
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    const minutesLeft = Math.ceil((attempt.lockedUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      error: `Trop de tentatives infructueuses. Accès temporairement suspendu pour ${minutesLeft} minute(s).`,
      locked: true,
      retryAfterMinutes: minutesLeft,
    });
  }

  // Si le délai est passé, réinitialiser
  if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    attempt.count = 0;
    attempt.lockedUntil = null;
  }

  const isValidUser = typeof username === 'string' && username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
  const isValidPass = typeof password === 'string' && verifyPasswordTimingSafe(password);

  if (!isValidUser || !isValidPass) {
    attempt.count += 1;
    if (attempt.count >= MAX_ATTEMPTS) {
      attempt.lockedUntil = now + LOCKOUT_MS;
      loginAttempts.set(ip, attempt);
      return res.status(429).json({
        success: false,
        error: `Nombre maximum de tentatives atteint (${MAX_ATTEMPTS}). Accès suspendu pendant 15 minutes.`,
        locked: true,
        retryAfterMinutes: 15,
      });
    }

    loginAttempts.set(ip, attempt);
    const remaining = MAX_ATTEMPTS - attempt.count;
    return res.status(401).json({
      success: false,
      error: `Identifiants invalides. (${remaining} tentative(s) restante(s))`,
      remainingAttempts: remaining,
    });
  }

  // Connexion réussie -> réinitialiser les compteurs
  loginAttempts.delete(ip);

  // Générer un token cryptographique de session
  const token = crypto.randomBytes(48).toString('hex');
  const sessionData: SessionData = {
    username: ADMIN_USERNAME,
    expiresAt: now + SESSION_DURATION_MS,
    createdAt: now,
  };
  activeSessions.set(token, sessionData);

  return res.json({
    success: true,
    token,
    username: ADMIN_USERNAME,
    expiresAt: sessionData.expiresAt,
    message: 'Authentification administrateur réussie.',
  });
});

// Vérifier la session en cours
app.get('/api/admin/session', (req: Request, res: Response) => {
  const token = getSessionToken(req);
  if (!token) {
    return res.status(401).json({ isAuthenticated: false });
  }

  const session = activeSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ isAuthenticated: false });
  }

  return res.json({
    isAuthenticated: true,
    username: session.username,
    expiresAt: session.expiresAt,
  });
});

// Déconnexion
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const token = getSessionToken(req);
  if (token) {
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'Session fermée.' });
});

// Sauvegarde du contenu par l'administrateur
app.put('/api/admin/content', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const newContent = req.body;
    if (!newContent || typeof newContent !== 'object') {
      return res.status(400).json({ success: false, error: 'Contenu invalide fourni.' });
    }

    // Horodatage de la sauvegarde
    if (newContent.meta) {
      newContent.meta.lastUpdated = new Date().toISOString();
    }

    fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(newContent, null, 2), 'utf-8');

    return res.json({
      success: true,
      message: 'Modifications sauvegardées avec succès sur le serveur.',
      lastUpdated: newContent.meta?.lastUpdated,
    });
  } catch (error) {
    console.error('Erreur écriture site-content.json:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la sauvegarde du fichier sur le serveur.',
    });
  }
});

// ==================== VITE / STATIC SERVING ====================
async function startServer() {
  if (!isProduction) {
    // Mode développement avec Vite middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Mode production
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VAYLUNO] Serveur actif sur http://0.0.0.0:${PORT}`);
    console.log(`[VAYLUNO] Site public : http://0.0.0.0:${PORT}/`);
    console.log(`[VAYLUNO] Espace privé : http://0.0.0.0:${PORT}/Admin-fanahy`);
  });
}

startServer().catch((err) => {
  console.error('Erreur démarrage serveur:', err);
  process.exit(1);
});
