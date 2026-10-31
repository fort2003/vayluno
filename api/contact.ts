import type { IncomingMessage, ServerResponse } from 'http';

interface ExtendedRequest extends IncomingMessage {
  body?: any;
  query?: any;
}

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

export default async function handler(req: ExtendedRequest, res: ServerResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Méthode non autorisée.' }));
    return;
  }

  // Parse body si nécessaire
  let body = req.body;
  if (!body) {
    const buffers: Buffer[] = [];
    for await (const chunk of req) {
      buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const dataStr = Buffer.concat(buffers).toString('utf-8');
    try {
      body = JSON.parse(dataStr);
    } catch {
      body = {};
    }
  }

  const { name, email, company, service, subject, message, _gotcha } = body || {};

  // Protection Honeypot
  if (_gotcha) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: "Votre message a bien été envoyé. Merci d'avoir contacté VAYLUNO.",
    }));
    return;
  }

  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim() : '';
  const trimmedCompany = typeof company === 'string' ? company.trim() : '';
  const trimmedService = typeof service === 'string' ? service.trim() : 'autre';
  const trimmedSubject = typeof subject === 'string' ? subject.trim() : '';
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (!trimmedName || trimmedName.length > 100) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: 'Veuillez renseigner votre nom complet (100 caractères maximum).',
    }));
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || trimmedEmail.length > 120 || !emailRegex.test(trimmedEmail)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: 'Veuillez renseigner une adresse e-mail valide.',
    }));
    return;
  }

  if (trimmedCompany.length > 120) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: "Le nom d'entreprise ne peut pas dépasser 120 caractères.",
    }));
    return;
  }

  const validServices = ['assistant-virtuel', 'community-manager', 'autre'];
  if (!validServices.includes(trimmedService)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: 'Service sélectionné invalide.',
    }));
    return;
  }

  if (!trimmedSubject || trimmedSubject.length > 150) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: 'Veuillez renseigner un objet pour votre message (150 caractères maximum).',
    }));
    return;
  }

  if (!trimmedMessage || trimmedMessage.length < 10 || trimmedMessage.length > 3000) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: 'Le message doit contenir entre 10 et 3000 caractères.',
    }));
    return;
  }

  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'harmonio2019@gmail.com';
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

  if (!emailApiKey) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      missingConfig: true,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      details: "Le service d'envoi d'e-mails n'est pas configuré. Veuillez définir EMAIL_API_KEY dans vos variables d'environnement Vercel.",
    }));
    return;
  }

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
            Ce message a été envoyé depuis le formulaire de contact officiel VAYLUNO.
          </p>
        </div>
      `,
      text: `VAYLUNO — Nouvelle Demande de Contact\nDate : ${dateStr}\nNom complet : ${trimmedName}\nAdresse e-mail : ${trimmedEmail}\nEntreprise : ${trimmedCompany || 'Non spécifiée'}\nService : ${serviceLabel}\nObjet : ${trimmedSubject}\n\nMessage :\n${trimmedMessage}`,
    };

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (resendRes.ok) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: "Votre message a bien été envoyé. Merci d'avoir contacté VAYLUNO.",
      }));
    } else {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      }));
    }
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
    }));
  }
}
