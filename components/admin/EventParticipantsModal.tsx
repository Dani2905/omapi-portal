
import React from 'react';
import { Event, EventRegistration } from '../../types';
import { XMarkIcon, UsersIcon, TrashIcon, CalendarIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon } from './AdminIcons';
import { normalizeEventRegistration } from '../../utils/eventLogic';

interface EventParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  registrations: EventRegistration[];
  onDeleteRegistration: (id: number) => void;
}

const EventParticipantsModal: React.FC<EventParticipantsModalProps> = ({ 
    isOpen, onClose, event, registrations, onDeleteRegistration 
}) => {
  if (!isOpen || !event) return null;

  const eventRegistrations = (Array.isArray(registrations) ? registrations : [])
    .map(normalizeEventRegistration)
    .filter((registration): registration is EventRegistration => Boolean(registration && String(registration.eventId) === String(event.id)))
    .sort((left, right) => {
      const leftTime = new Date(left.registrationDate).getTime();
      const rightTime = new Date(right.registrationDate).getTime();
      return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
    });
  const formatRegistrationDate = (value: string) => {
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? new Date(timestamp).toLocaleDateString('fr-FR') : value || 'Date inconnue';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <UsersIcon className="w-5 h-5 mr-2 text-primary" />
                        Participants inscrits
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Événement : <span className="font-semibold text-gray-800">{event.title}</span>
                    </p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-1 border border-gray-200 shadow-sm">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1 custom-scrollbar bg-white">
                {eventRegistrations.length > 0 ? (
                    <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Participant
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date Inscr.
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {eventRegistrations.map((reg) => (
                                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mr-3">
                                                {reg.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{reg.name}</div>
                                                {reg.organization && (
                                                    <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                                        <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                                                        {reg.organization}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm text-gray-600 flex items-center">
                                                <EnvelopeIcon className="w-3 h-3 mr-2 text-gray-400" />
                                                {reg.email}
                                            </span>
                                            <span className="text-sm text-gray-600 flex items-center">
                                                <PhoneIcon className="w-3 h-3 mr-2 text-gray-400" />
                                                {reg.phone}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatRegistrationDate(reg.registrationDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => {
                                                if(window.confirm('Voulez-vous supprimer cette inscription ?')) {
                                                    onDeleteRegistration(reg.id);
                                                }
                                            }}
                                            className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                            title="Supprimer l'inscription"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                            <UsersIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-gray-900 font-medium">Aucun participant</h4>
                        <p className="text-gray-500 text-sm mt-1">Personne ne s'est encore inscrit à cet événement.</p>
                    </div>
                )}
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                <span>Total : {eventRegistrations.length} inscrits</span>
                <button 
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                    Fermer
                </button>
            </div>
        </div>
    </div>
  );
};

export default EventParticipantsModal;
