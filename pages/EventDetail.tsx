import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { CalendarDays, Clock3, MapPin, Ticket, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { DEFAULT_EVENTS, DEFAULT_EVENT_REGISTRATIONS } from '../constants';
import type { Event, EventRegistration } from '../types';
import { useCrud } from '../hooks/useCrud';
import {
  formatEventDate,
  getEffectiveEventStatus,
  getEventCapacity,
  isEventRegistrationOpen,
  isSafeEventDocument,
  isSafeEventImage,
  normalizeEventRecord,
  normalizeEventRegistration,
  normalizeEventRegistrationDraft,
  normalizeEventDownloadName,
  validateEventRegistrationDraft,
} from '../utils/eventLogic';
import { sanitizeNewsHtml } from '../utils/editorialLogic';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', org: '' });
  const [formError, setFormError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const { items: allEvents, loading: crudLoading } = useCrud<Event>('omapi_events', DEFAULT_EVENTS);
  const { items: registrations, saveItem: saveRegistration } = useCrud<EventRegistration>('omapi_event_registrations', DEFAULT_EVENT_REGISTRATIONS);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (crudLoading) return;
    const safeEvents = (Array.isArray(allEvents) ? allEvents : []).map(normalizeEventRecord).filter((item): item is Event => item !== null);
    const found = safeEvents.find((item) => String(item.id) === String(id));
    setEvent(found || null);
    setLoading(false);
  }, [id, allEvents, crudLoading]);

  const effectiveStatus = event ? getEffectiveEventStatus(event) : null;
  const safeRegistrations = (Array.isArray(registrations) ? registrations : []).map(normalizeEventRegistration).filter((item): item is EventRegistration => item !== null);
  const eventRegistrationCount = event ? safeRegistrations.filter((item) => String(item.eventId) === String(event.id)).length : 0;
  const eventCapacity = event ? getEventCapacity(event.places) : null;
  const isEventFull = eventCapacity !== null && eventRegistrationCount >= eventCapacity;
  const registrationOpen = Boolean(event && isEventRegistrationOpen(event) && !isEventFull);

  const openRegistrationModal = () => {
    setFormData({ name: '', email: '', phone: '', org: '' });
    setFormError('');
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submissionLock.current || !event) return;
    setFormError('');

    let latestEvent = event;
    let latestRegistrations: EventRegistration[] = Array.isArray(registrations) ? registrations.map(normalizeEventRegistration).filter((item): item is EventRegistration => item !== null) : [];
    try {
      const storedEvents = localStorage.getItem('omapi_events');
      if (storedEvents !== null) {
        const parsed: unknown = JSON.parse(storedEvents);
        if (!Array.isArray(parsed)) throw new Error('Invalid event list');
        latestEvent = parsed.map(normalizeEventRecord).find((item): item is Event => Boolean(item && String(item.id) === String(event.id))) as Event;
      }
      const storedRegistrations = localStorage.getItem('omapi_event_registrations');
      if (storedRegistrations !== null) {
        const parsed: unknown = JSON.parse(storedRegistrations);
        if (!Array.isArray(parsed)) throw new Error('Invalid registration list');
        latestRegistrations = parsed.map(normalizeEventRegistration).filter((item): item is EventRegistration => item !== null);
      }
    } catch {
      setFormError("Impossible de vérifier les inscriptions actuellement. Actualisez la page puis réessayez.");
      return;
    }

    if (!latestEvent) {
      setFormError("Cet événement n’existe plus. Revenez à l’agenda pour choisir un autre événement.");
      return;
    }

    const draft = normalizeEventRegistrationDraft({
      eventId: latestEvent.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      organization: formData.org,
    });
    const validationError = validateEventRegistrationDraft(draft, latestEvent, latestRegistrations);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    try {
      const registration: Omit<EventRegistration, 'id'> = {
        eventId: latestEvent.id,
        name: draft.name || '',
        email: draft.email || '',
        phone: draft.phone || '',
        ...(draft.organization ? { organization: draft.organization } : {}),
        registrationDate: new Date().toISOString(),
      };
      const saved = await saveRegistration(registration);
      if (!saved) {
        setFormError("L’inscription n’a pas pu être enregistrée dans ce navigateur. Vérifiez l’espace disponible puis réessayez.");
        return;
      }
      setSubmitSuccess(true);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', org: '' });
    } catch {
      setFormError("Une erreur est survenue pendant l’enregistrement. Veuillez réessayer.");
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;
  if (!event) return <Navigate to="/events" replace />;

  const safeDescription = sanitizeNewsHtml(event.description);
  const safeImage = isSafeEventImage(event.image) ? event.image : '';
  const safeDocument = isSafeEventDocument(event.fileUrl, event.fileName) ? event.fileUrl : '';

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[
        { label: 'Ressources' },
        { label: 'Événements', path: '/events' },
        { label: event.title.length > 20 ? `${event.title.slice(0, 20)}…` : event.title },
      ]} />

      {submitSuccess && <div className="container mx-auto max-w-7xl px-4 pt-6"><div role="status" className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"><CheckCircle className="w-5 h-5 shrink-0" /><p>Votre inscription a bien été enregistrée.</p></div></div>}

      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800 mb-4">{effectiveStatus}</span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{event.title}</h1>
              <div className="space-y-3 text-gray-600 mb-8">
                <div className="flex items-center"><CalendarDays className="w-5 h-5 mr-3 text-primary" />{formatEventDate(event.date)}</div>
                <div className="flex items-center"><Clock3 className="w-5 h-5 mr-3 text-primary" />{event.time || 'Heure à confirmer'}</div>
                <div className="flex items-center"><MapPin className="w-5 h-5 mr-3 text-primary" />{event.location || 'Lieu à confirmer'}</div>
              </div>
              <button onClick={openRegistrationModal} disabled={!registrationOpen} className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isEventFull ? 'Événement complet' : registrationOpen ? 'S’inscrire maintenant' : 'Inscriptions closes'}
              </button>
              {formError && !isModalOpen && <p role="alert" className="mt-3 text-sm text-red-700">{formError}</p>}
            </div>
            <div className="h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg bg-slate-100">
              {safeImage ? <img src={safeImage} alt={event.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><CalendarDays className="w-16 h-16" /></div>}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">À propos de l’événement</h2>
          <style>{`.rich-content{word-wrap:break-word;overflow-wrap:break-word}.rich-content *{max-width:100%}.rich-content h2{font-size:1.5rem;font-weight:700;color:#1f2937;margin-top:2rem;margin-bottom:1rem}.rich-content h3{font-size:1.25rem;font-weight:600;color:#374151;margin-top:1.5rem;margin-bottom:.75rem}.rich-content p{margin-bottom:1rem;line-height:1.75}.rich-content ul{list-style:disc;padding-left:1.5rem;margin-bottom:1rem}.rich-content li{margin-bottom:.5rem}.rich-content strong{font-weight:700;color:#111827}.rich-content a{color:#2563eb;text-decoration:underline}`}</style>
          <div className="text-gray-700 leading-relaxed text-lg break-words rich-content" dangerouslySetInnerHTML={{ __html: safeDescription }} />

          <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start">
            <Ticket className="w-8 h-8 text-primary mr-4 shrink-0" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Informations pratiques</h3>
              <p className="text-blue-800 mb-1"><strong>Lieu :</strong> {event.location || 'Non spécifié'}</p>
              <p className="text-blue-800 mb-1"><strong>Accès / places :</strong> {event.places || 'Non spécifié'}{eventCapacity !== null ? ` — ${eventRegistrationCount}/${eventCapacity} inscrits` : ''}</p>
              <p className="text-sm text-blue-600 mt-2">Veuillez vous munir d’une pièce d’identité à l’entrée.</p>
            </div>
          </div>

          {safeDocument && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border border-gray-200 rounded-xl p-6 bg-white shadow-sm gap-4">
              <div className="flex items-center min-w-0"><FileText className="w-6 h-6 text-red-600 mr-4 shrink-0" /><div className="min-w-0"><h3 className="font-bold text-gray-900">Document attaché</h3><p className="text-sm text-gray-500 truncate">{event.fileName || 'document_evenement.pdf'}</p></div></div>
              <a href={safeDocument} download={normalizeEventDownloadName(event.fileName)} target={safeDocument.startsWith('data:') ? undefined : '_blank'} rel="noopener noreferrer" className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-lg text-sm w-full sm:w-auto text-center">Télécharger</a>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" role="presentation">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-auto">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Inscription à l’événement</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Fermer" className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg"><p className="text-sm font-bold text-blue-900">{event.title}</p><p className="text-xs text-blue-700">{formatEventDate(event.date)} à {event.location}</p></div>
              {formError && <div role="alert" className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{formError}</div>}
              <div><label htmlFor="participant-name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label><input id="participant-name" type="text" required maxLength={120} autoComplete="name" value={formData.name} onChange={(e) => setFormData((previous) => ({ ...previous, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none" /></div>
              <div><label htmlFor="participant-email" className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label><input id="participant-email" type="email" required maxLength={254} autoComplete="email" value={formData.email} onChange={(e) => setFormData((previous) => ({ ...previous, email: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label htmlFor="participant-phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label><input id="participant-phone" type="tel" required maxLength={50} autoComplete="tel" value={formData.phone} onChange={(e) => setFormData((previous) => ({ ...previous, phone: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none" /></div>
                <div><label htmlFor="participant-organization" className="block text-sm font-medium text-gray-700 mb-1">Organisme</label><input id="participant-organization" type="text" maxLength={160} autoComplete="organization" value={formData.org} onChange={(e) => setFormData((previous) => ({ ...previous, org: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none" /></div>
              </div>
              <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-secondary shadow-md disabled:opacity-50">{isSubmitting ? 'Enregistrement…' : 'Valider l’inscription'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
