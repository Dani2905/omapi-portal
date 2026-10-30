
import React, { useState } from 'react';
import { Event, EventRegistration } from '../../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, CalendarIcon, MapPinIcon, ClockIcon, UsersIcon } from './AdminIcons';
import EventParticipantsModal from './EventParticipantsModal';
import { formatEventDate, getEffectiveEventStatus, getEventCapacity, normalizeEventRecord, normalizeEventRegistration, isSafeEventImage } from '../../utils/eventLogic';

interface AdminEventsManagerProps {
  events: Event[];
  registrations?: EventRegistration[]; // Optional for backward compatibility if needed, but intended to be used
  onAdd: () => void;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
  onDeleteRegistration?: (id: number) => void; // Optional logic prop
}

const AdminEventsManager: React.FC<AdminEventsManagerProps> = ({ 
    events, registrations = [], onAdd, onEdit, onDelete, onDeleteRegistration = () => {} 
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const safeEvents = (Array.isArray(events) ? events : [])
    .map(normalizeEventRecord)
    .filter((event): event is Event => event !== null);
  const safeRegistrations = (Array.isArray(registrations) ? registrations : [])
    .map(normalizeEventRegistration)
    .filter((registration): registration is EventRegistration => registration !== null);
  
  const getStatusColor = (status: string) => {
      switch(status) {
          case 'À venir': return 'bg-green-100 text-green-800';
          case 'En cours': return 'bg-blue-100 text-blue-800';
          case 'Terminé': return 'bg-gray-100 text-gray-800';
          case 'Annulé': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  const getRegistrationCount = (eventId: number) => {
      return safeRegistrations.filter((registration) => String(registration.eventId) === String(eventId)).length;
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Gestion des Événements</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Planifiez vos conférences, ateliers et célébrations.</p>
            </div>
            <button 
                onClick={onAdd}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-sm border border-slate-900 flex items-center"
            >
                <PlusIcon className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Créer un événement</span>
            </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {safeEvents.map((event) => {
                const eventStatus = getEffectiveEventStatus(event);
                const linkedRegistrations = getRegistrationCount(event.id);
                const capacity = getEventCapacity(event.places);
                return (
                <div key={event.id} className="bg-white rounded-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row group">
                    <div className="w-full md:w-64 h-48 md:h-auto relative bg-slate-50 flex-shrink-0 border-r border-slate-100">
                        {event.image && isSafeEventImage(event.image) ? (
                            <img 
                                src={event.image} 
                                alt={event.title} 
                                className="w-full h-full object-cover grayscale"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aucune image</span>
                            </div>
                        )}
                        <div className="absolute top-3 left-3">
                            <span className={`px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-widest shadow-sm ${getStatusColor(eventStatus)}`}>
                                {eventStatus}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">
                                    {event.title}
                                </h3>
                                <div className="flex space-x-1">
                                    <button 
                                        onClick={() => onEdit(event)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-sm border border-transparent hover:border-slate-200 hover:bg-slate-50"
                                        title="Modifier"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => { if (window.confirm('Voulez-vous vraiment supprimer cet événement ?')) onDelete(event.id); }}
                                        disabled={linkedRegistrations > 0}
                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-sm border border-transparent hover:border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                        title={linkedRegistrations > 0 ? 'Supprimez d’abord les participants ou annulez l’événement' : 'Supprimer'}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                                <div className="flex items-center text-[10px] font-mono text-slate-500">
                                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                    {formatEventDate(event.date)}
                                </div>
                                <div className="flex items-center text-[10px] font-mono text-slate-500">
                                    <ClockIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                    {event.time}
                                </div>
                                <div className="flex items-center text-[10px] font-mono text-slate-500">
                                    <MapPinIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                    {event.location}
                                </div>
                            </div>
                            
                            <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{event.description.replace(/<[^>]*>/g, ' ')}</p>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <button 
                                onClick={() => setSelectedEvent(event)}
                                className="flex items-center text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 px-2 py-1 rounded-sm border border-transparent hover:border-blue-100 hover:bg-blue-50"
                            >
                                <UsersIcon className="w-3.5 h-3.5 mr-1.5" />
                                {linkedRegistrations}{capacity !== null ? ` / ${capacity}` : ''} participant(s)
                            </button>
                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">ID: {event.id}</span>
                        </div>
                    </div>
                </div>
                );
            })}
            
            {safeEvents.length === 0 && (
                <div className="text-center py-16 bg-white rounded-sm border border-slate-200">
                    <CalendarIcon className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Aucun événement planifié</h3>
                </div>
            )}
        </div>

        {/* Modal Participants */}
        <EventParticipantsModal 
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            event={selectedEvent}
            registrations={safeRegistrations}
            onDeleteRegistration={onDeleteRegistration}
        />
    </div>
  );
};

export default AdminEventsManager;