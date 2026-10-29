
import React from 'react';
import { Formation, FormationRegistration } from '../../types';
import { XMarkIcon, UsersIcon, TrashIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon, DocumentTextIcon } from './AdminIcons';

interface FormationParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  formation: Formation | null;
  registrations: FormationRegistration[];
  onDeleteRegistration: (id: number) => void;
}

const FormationParticipantsModal: React.FC<FormationParticipantsModalProps> = ({ 
    isOpen, onClose, formation, registrations, onDeleteRegistration 
}) => {
  if (!isOpen || !formation) return null;

  const formationRegistrations = registrations.filter(r => r.formationId === formation.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <UsersIcon className="w-5 h-5 mr-2 text-primary" />
                        Inscriptions : <span className="ml-2 font-normal text-gray-600">{formation.title}</span>
                    </h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-1 border border-gray-200 shadow-sm">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1 custom-scrollbar bg-white">
                {formationRegistrations.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Participant
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Coordonnées
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Organisme & Message
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {formationRegistrations.map((reg) => (
                                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3 uppercase">
                                                {reg.name.charAt(0)}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{reg.name}</div>
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
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 flex items-center mb-1">
                                            <BuildingOfficeIcon className="w-3 h-3 mr-2 text-gray-400" />
                                            {reg.organization || '-'}
                                        </div>
                                        {reg.message && (
                                            <div className="text-xs text-gray-500 flex items-start mt-1 max-w-xs italic">
                                                <DocumentTextIcon className="w-3 h-3 mr-1 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2" title={reg.message}>{reg.message}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {reg.registrationDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => {
                                                if(window.confirm(`Voulez-vous supprimer l'inscription de ${reg.name} ?`)) {
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
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                            <UsersIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-gray-900 font-medium">Aucune inscription</h4>
                        <p className="text-gray-500 text-sm mt-1">Personne ne s'est encore inscrit pour le moment.</p>
                    </div>
                )}
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                <span>Total : {formationRegistrations.length} inscrits</span>
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

export default FormationParticipantsModal;
