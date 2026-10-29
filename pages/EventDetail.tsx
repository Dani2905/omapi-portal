
import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { DEFAULT_EVENTS, DEFAULT_EVENT_REGISTRATIONS } from '../constants';
import { Event, EventRegistration } from '../types';
import { useCrud } from '../hooks/useCrud';

// --- Icons ---
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const TicketIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
    </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', org: '' });
  const { items: allEvents, loading: crudLoading } = useCrud<Event>('omapi_events', DEFAULT_EVENTS);
  const { saveItem: saveRegistration } = useCrud<EventRegistration>('omapi_event_registrations', DEFAULT_EVENT_REGISTRATIONS);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (crudLoading) return;
    
    const found = allEvents.find(e => e.id === Number(id));
    if (found) setEvent(found);
    setLoading(false);
  }, [id, allEvents, crudLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!event) return;

      const newRegistration: EventRegistration = {
          id: Date.now(),
          eventId: event.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          organization: formData.org,
          registrationDate: new Date().toLocaleDateString('fr-FR')
      };

      await saveRegistration(newRegistration);

      alert(`Merci ${formData.name}. Votre demande de participation pour "${event?.title}" a été enregistrée. Vous recevrez une confirmation par email.`);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', org: '' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!event) return <Navigate to="/events" replace />;

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[
          { label: 'Ressources' }, 
          { label: 'Événements', path: '/events' },
          { label: event.title.substring(0, 20) + '...' }
      ]} />

      <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="container mx-auto max-w-7xl px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800 mb-4">
                          {event.status}
                      </span>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{event.title}</h1>
                      <div className="space-y-3 text-gray-600 mb-8">
                          <div className="flex items-center"><CalendarIcon className="w-5 h-5 mr-3 text-primary" /> {event.date}</div>
                          <div className="flex items-center"><ClockIcon className="w-5 h-5 mr-3 text-primary" /> {event.time}</div>
                          <div className="flex items-center"><MapPinIcon className="w-5 h-5 mr-3 text-primary" /> {event.location}</div>
                      </div>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all transform hover:-translate-y-1"
                        disabled={event.status === 'Terminé' || event.status === 'Annulé'}
                      >
                          {event.status === 'À venir' || event.status === 'En cours' ? 'S\'inscrire maintenant' : 'Inscriptions closes'}
                      </button>
                  </div>
                  <div className="h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  </div>
              </div>
          </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">À propos de l'événement</h2>
              <style>{`
                  .rich-content { 
                      word-wrap: break-word; 
                      overflow-wrap: break-word; 
                  }
                  .rich-content * { max-width: 100%; }
                  .rich-content h2 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-top: 2rem; margin-bottom: 1rem; }
                  .rich-content h3 { font-size: 1.25rem; font-weight: 600; color: #374151; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                  .rich-content p { margin-bottom: 1rem; line-height: 1.75; white-space: normal; }
                  .rich-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                  .rich-content li { margin-bottom: 0.5rem; }
                  .rich-content strong { font-weight: 700; color: #111827; }
                  .rich-content a { color: #2563eb; text-decoration: underline; }
                  .rich-content a:hover { color: #1d4ed8; }
              `}</style>
              <div 
                  className="text-gray-700 leading-relaxed text-lg break-words rich-content"
                  dangerouslySetInnerHTML={{ __html: event.description }}
              />
              
              <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start">
                  <TicketIcon className="w-8 h-8 text-primary mr-4 flex-shrink-0" />
                  <div>
                      <h3 className="font-bold text-blue-900 mb-2">Informations pratiques</h3>
                      <p className="text-blue-800 mb-1"><strong>Lieu :</strong> {event.location}</p>
                      <p className="text-blue-800 mb-1"><strong>Accès :</strong> {event.places || "Non spécifié"}</p>
                      <p className="text-sm text-blue-600 mt-2">Veuillez vous munir d'une pièce d'identité à l'entrée.</p>
                  </div>
              </div>

              {event.fileUrl && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border border-gray-200 rounded-xl p-6 bg-white hover:border-primary/50 transition-colors shadow-sm">
                      <div className="flex items-center mb-4 sm:mb-0">
                          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mr-4">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                              </svg>
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-900">Document attaché</h3>
                              <p className="text-sm text-gray-500">{event.fileName || 'document_evenement.pdf'}</p>
                          </div>
                      </div>
                      <a 
                          href={event.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-all text-sm w-full sm:w-auto text-center flex items-center justify-center"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                          Télécharger
                      </a>
                  </div>
              )}
          </div>
      </div>

      {/* Modal Inscription */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800">Inscription à l'événement</h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <XMarkIcon className="w-6 h-6" />
                      </button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <p className="text-sm font-bold text-blue-900">{event.title}</p>
                          <p className="text-xs text-blue-700">{event.date} à {event.location}</p>
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                          <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none" 
                              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none" 
                              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                              <input type="tel" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none" 
                                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Organisme</label>
                              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none" 
                                  value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} />
                          </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
                          <button type="submit" className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-secondary shadow-md">Valider</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default EventDetail;