import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { ContactFormData, ContactServiceOption } from '../../types';

interface ContactFormProps {
  idPrefix?: string;
  onSuccess?: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ idPrefix = 'contact', onSuccess }) => {
  const { selectedServiceForContact, setSelectedServiceForContact, sendContactForm } = useContent();

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    service: selectedServiceForContact || 'autre',
    subject: '',
    message: '',
    _gotcha: '',
  });

  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | null;
    text: string;
    details?: string;
  }>({
    type: null,
    text: '',
  });

  // Synchroniser le service sélectionné lorsqu'un bouton externe clique sur une offre
  useEffect(() => {
    if (selectedServiceForContact) {
      setFormData((prev) => ({
        ...prev,
        service: selectedServiceForContact,
      }));
    }
  }, [selectedServiceForContact]);

  // Validation côté client
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Veuillez renseigner votre nom complet.';
    } else if (formData.name.trim().length > 100) {
      errors.name = '100 caractères maximum.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Veuillez renseigner votre adresse e-mail.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Format d’adresse e-mail invalide.';
    } else if (formData.email.trim().length > 120) {
      errors.email = '120 caractères maximum.';
    }

    if (formData.company && formData.company.trim().length > 120) {
      errors.company = '120 caractères maximum.';
    }

    if (!formData.service) {
      errors.service = 'Veuillez sélectionner un service.';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Veuillez préciser l’objet de votre demande.';
    } else if (formData.subject.trim().length > 150) {
      errors.subject = '150 caractères maximum.';
    }

    if (!formData.message.trim()) {
      errors.message = 'Veuillez rédiger votre message.';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Votre message doit contenir au moins 10 caractères.';
    } else if (formData.message.trim().length > 3000) {
      errors.message = '3000 caractères maximum.';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setStatusMessage({ type: null, text: '' });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendContactForm(formData);

      if (result.success) {
        // En cas de succès : texte officiel obligatoire
        setStatusMessage({
          type: 'success',
          text: "Votre message a bien été envoyé. Merci d'avoir contacté VAYLUNO.",
        });

        // Réinitialiser les champs en cas de succès
        setFormData({
          name: '',
          email: '',
          company: '',
          service: selectedServiceForContact || 'autre',
          subject: '',
          message: '',
          _gotcha: '',
        });
        setClientErrors({});
        if (onSuccess) onSuccess();
      } else {
        // En cas d'échec : texte officiel obligatoire + préservation intégrale des valeurs saisies
        setStatusMessage({
          type: 'error',
          text: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
          details: result.message,
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 text-left w-full">
      {/* Honeypot invisible pour la protection anti-spam */}
      <input
        type="text"
        name="_gotcha"
        value={formData._gotcha}
        onChange={(e) => setFormData({ ...formData, _gotcha: e.target.value })}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {/* Bannière de notification d'état */}
      {statusMessage.type === 'success' && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-100 flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-sm font-medium leading-relaxed">
            <p>{statusMessage.text}</p>
          </div>
        </div>
      )}

      {statusMessage.type === 'error' && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-700/80 text-red-100 flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm font-medium leading-relaxed">
            <p>{statusMessage.text}</p>
            {statusMessage.details && (
              <p className="text-xs text-red-300 font-light mt-1 opacity-90">{statusMessage.details}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Champ Nom complet */}
        <div>
          <label
            htmlFor={`${idPrefix}-name`}
            className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2"
          >
            Nom complet <span className="text-amber-400">*</span>
          </label>
          <input
            id={`${idPrefix}-name`}
            type="text"
            required
            maxLength={100}
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (clientErrors.name) setClientErrors({ ...clientErrors, name: '' });
            }}
            placeholder="Ex : Camille Bernard"
            className={`w-full px-4 py-3 rounded-lg bg-[#081426] border text-[#F5F6FA] text-sm focus:outline-none transition-colors placeholder-[#F5F6FA]/30 ${
              clientErrors.name ? 'border-red-500' : 'border-[#142B4D] focus:border-[#C9AD78]'
            }`}
          />
          {clientErrors.name && (
            <p className="text-xs text-red-400 mt-1 font-light">{clientErrors.name}</p>
          )}
        </div>

        {/* Champ E-mail */}
        <div>
          <label
            htmlFor={`${idPrefix}-email`}
            className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2"
          >
            Adresse e-mail <span className="text-amber-400">*</span>
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            required
            maxLength={120}
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (clientErrors.email) setClientErrors({ ...clientErrors, email: '' });
            }}
            placeholder="Ex : camille@entreprise.fr"
            className={`w-full px-4 py-3 rounded-lg bg-[#081426] border text-[#F5F6FA] text-sm focus:outline-none transition-colors placeholder-[#F5F6FA]/30 ${
              clientErrors.email ? 'border-red-500' : 'border-[#142B4D] focus:border-[#C9AD78]'
            }`}
          />
          {clientErrors.email && (
            <p className="text-xs text-red-400 mt-1 font-light">{clientErrors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Champ Entreprise / Boutique (facultatif) */}
        <div>
          <label
            htmlFor={`${idPrefix}-company`}
            className="block text-xs uppercase tracking-wider text-[#F5F6FA]/70 font-semibold mb-2"
          >
            Entreprise ou boutique <span className="text-xs text-[#F5F6FA]/40 normal-case">(facultatif)</span>
          </label>
          <input
            id={`${idPrefix}-company`}
            type="text"
            maxLength={120}
            value={formData.company}
            onChange={(e) => {
              setFormData({ ...formData, company: e.target.value });
              if (clientErrors.company) setClientErrors({ ...clientErrors, company: '' });
            }}
            placeholder="Ex : Maison Atelier Paris"
            className="w-full px-4 py-3 rounded-lg bg-[#081426] border border-[#142B4D] focus:border-[#C9AD78] text-[#F5F6FA] text-sm focus:outline-none transition-colors placeholder-[#F5F6FA]/30"
          />
          {clientErrors.company && (
            <p className="text-xs text-red-400 mt-1 font-light">{clientErrors.company}</p>
          )}
        </div>

        {/* Champ Service sélectionné (obligatoire) */}
        <div>
          <label
            htmlFor={`${idPrefix}-service`}
            className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2"
          >
            Service souhaité <span className="text-amber-400">*</span>
          </label>
          <div className="relative">
            <select
              id={`${idPrefix}-service`}
              required
              value={formData.service}
              onChange={(e) => {
                const val = e.target.value as ContactServiceOption;
                setFormData({ ...formData, service: val });
                setSelectedServiceForContact(val);
                if (clientErrors.service) setClientErrors({ ...clientErrors, service: '' });
              }}
              className="w-full px-4 py-3 rounded-lg bg-[#081426] border border-[#142B4D] focus:border-[#C9AD78] text-[#F5F6FA] text-sm focus:outline-none transition-colors cursor-pointer appearance-none"
            >
              <option value="assistant-virtuel" className="bg-[#081426] text-[#F5F6FA]">
                Assistant virtuel
              </option>
              <option value="community-manager" className="bg-[#081426] text-[#F5F6FA]">
                Community Manager
              </option>
              <option value="autre" className="bg-[#081426] text-[#F5F6FA]">
                Autre demande
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#C9AD78]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          {clientErrors.service && (
            <p className="text-xs text-red-400 mt-1 font-light">{clientErrors.service}</p>
          )}
        </div>
      </div>

      {/* Champ Objet */}
      <div>
        <label
          htmlFor={`${idPrefix}-subject`}
          className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2"
        >
          Objet de votre demande <span className="text-amber-400">*</span>
        </label>
        <input
          id={`${idPrefix}-subject`}
          type="text"
          required
          maxLength={150}
          value={formData.subject}
          onChange={(e) => {
            setFormData({ ...formData, subject: e.target.value });
            if (clientErrors.subject) setClientErrors({ ...clientErrors, subject: '' });
          }}
          placeholder="Ex : Gestion des commandes et support client pour boutique en ligne"
          className={`w-full px-4 py-3 rounded-lg bg-[#081426] border text-[#F5F6FA] text-sm focus:outline-none transition-colors placeholder-[#F5F6FA]/30 ${
            clientErrors.subject ? 'border-red-500' : 'border-[#142B4D] focus:border-[#C9AD78]'
          }`}
        />
        {clientErrors.subject && (
          <p className="text-xs text-red-400 mt-1 font-light">{clientErrors.subject}</p>
        )}
      </div>

      {/* Champ Message */}
      <div>
        <label
          htmlFor={`${idPrefix}-message`}
          className="block text-xs uppercase tracking-wider text-[#C9AD78] font-semibold mb-2"
        >
          Votre message <span className="text-amber-400">*</span>
        </label>
        <textarea
          id={`${idPrefix}-message`}
          required
          rows={5}
          maxLength={3000}
          value={formData.message}
          onChange={(e) => {
            setFormData({ ...formData, message: e.target.value });
            if (clientErrors.message) setClientErrors({ ...clientErrors, message: '' });
          }}
          placeholder="Présentez-nous votre activité, vos objectifs et vos besoins quotidiens..."
          className={`w-full px-4 py-3 rounded-lg bg-[#081426] border text-[#F5F6FA] text-sm focus:outline-none transition-colors placeholder-[#F5F6FA]/30 leading-relaxed ${
            clientErrors.message ? 'border-red-500' : 'border-[#142B4D] focus:border-[#C9AD78]'
          }`}
        />
        <div className="flex items-center justify-between text-[11px] text-[#F5F6FA]/50 mt-1 font-light">
          {clientErrors.message ? (
            <p className="text-red-400">{clientErrors.message}</p>
          ) : (
            <span>Minimum 10 caractères</span>
          )}
          <span>{formData.message.length} / 3000</span>
        </div>
      </div>

      {/* Bouton de soumission */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#081426] bg-[#C9AD78] hover:bg-[#dfc99c] rounded-md transition-all duration-200 shadow-lg hover:shadow-[#C9AD78]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#081426]" />
              <span>Transmission en cours...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Envoyer ma demande</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
