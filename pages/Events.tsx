
import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { DEFAULT_EVENTS } from '../constants';
import { Event } from '../types';
import { useCrud } from '../hooks/useCrud';

// --- Icons ---
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

const Events: React.FC = () => {
  const { items: events } = useCrud<Event>('omapi_events', DEFAULT_EVENTS);

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'À venir': return 'bg-green-100 text-green-800';
          case 'En cours': return 'bg-blue-100 text-blue-800';
          case 'Terminé': return 'bg-gray-100 text-gray-800';
          case 'Annulé': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Événements' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
            <h1 className="text-4xl font-bold text-primary mb-2">Agenda des Événements</h1>
            <p className="text-xl text-gray-600">Conférences, ateliers et rencontres de l'OMAPI</p>
            <div className="w-24 h-1.5 bg-primary rounded-full mt-4"></div>
        </div>

        {events.length > 0 ? (
            <div className="space-y-8">
                {events.map((event) => (
                    <article key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group border border-gray-100">
                        <div className="md:w-1/3 h-64 md:h-auto relative overflow-hidden">
                            <img 
                                src={event.image} 
                                alt={event.title} 
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${getStatusBadge(event.status)}`}>
                                    {event.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-8 md:w-2/3 flex flex-col">
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center">
                                    <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                                    {event.date}
                                </div>
                                <div className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-2 text-primary" />
                                    {event.time}
                                </div>
                                <div className="flex items-center">
                                    <MapPinIcon className="w-4 h-4 mr-2 text-primary" />
                                    {event.location}
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-primary transition-colors">
                                <Link to={`/events/${event.id}`}>{event.title}</Link>
                            </h3>
                            
                            <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-1 break-words">
                                {event.description ? event.description.replace(/<[^>]*>?/gm, '') : ''}
                            </p>
                            
                            <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                                    {event.places || 'Places limitées'}
                                </span>
                                <Link to={`/events/${event.id}`} className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-secondary transition-colors shadow-sm">
                                    Détails & Inscription <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        ) : (
            <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-gray-100">
                <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">Aucun événement prévu</h3>
                <p className="text-gray-500 mt-2">Revenez plus tard pour découvrir nos prochaines activités.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Events;
