

import React, { useState } from 'react';
import { Formation, FormationRegistration } from '../../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, AcademicCapIcon, FolderIcon, UsersIcon, ArrowDownTrayIcon } from './AdminIcons';
import FormationParticipantsModal from './FormationParticipantsModal';

interface AdminFormationsManagerProps {
  formations: Formation[];
  registrations?: FormationRegistration[];
  onAdd: () => void;
  onEdit: (formation: Formation) => void;
  onDelete: (id: number) => void;
  onDeleteRegistration?: (id: number) => void;
}

const AdminFormationsManager: React.FC<AdminFormationsManagerProps> = ({ 
    formations, registrations = [], onAdd, onEdit, onDelete, onDeleteRegistration = () => {} 
}) => {
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  const baseFormations = formations.filter(f => f.category === 'Base');
  const advancedFormations = formations.filter(f => f.category === 'Avancee');

  const getThemeColor = (color?: string) => {
      switch(color) {
          case 'blue': return 'bg-blue-500';
          case 'emerald': return 'bg-emerald-500';
          case 'amber': return 'bg-amber-500';
          case 'rose': return 'bg-rose-500';
          case 'indigo': return 'bg-indigo-500';
          case 'purple': return 'bg-purple-500';
          case 'cyan': return 'bg-cyan-500';
          default: return 'bg-gray-400';
      }
  };

  const getRegistrationCount = (formationId: number) => {
      return registrations.filter(r => r.formationId === formationId).length;
  };

  const renderSection = (title: string, items: Formation[], bgColorClass: string, iconColorClass: string) => (
      <div className={`border border-slate-200 rounded-sm p-6 ${bgColorClass}`}>
          <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-sm flex items-center justify-center mr-3 shadow-sm ${iconColorClass}`}>
                  <AcademicCapIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{title}</h3>
              <span className="ml-auto bg-white px-3 py-1 rounded-sm text-[10px] font-bold text-slate-600 border border-slate-200 uppercase tracking-widest">
                  {items.length}
              </span>
          </div>

          <div className="space-y-3">
              {items.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-sm border border-slate-100 flex justify-between items-center group shadow-sm">
                      <div className="flex items-center space-x-3 truncate flex-1">
                          {/* Indicateur de couleur */}
                          <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${getThemeColor(item.colorTheme)}`} title={`Thème: ${item.colorTheme || 'Défaut'}`}></div>
                          <div className="truncate flex-1">
                              <span className="text-slate-900 text-[11px] font-bold uppercase tracking-tight block truncate">
                                  {item.title}
                                  {item.fileUrl && (
                                      <span title="Fichier joint disponible">
                                          <ArrowDownTrayIcon className="inline-block w-3 h-3 ml-2 text-slate-400" />
                                      </span>
                                  )}
                              </span>
                              <div className="text-[10px] text-slate-500 flex items-center mt-0.5 font-bold uppercase tracking-tight">
                                  <UsersIcon className="w-3 h-3 mr-1" />
                                  {getRegistrationCount(item.id)} inscrits
                              </div>
                          </div>
                      </div>
                      <div className="flex space-x-1 flex-shrink-0 ml-2">
                          <button 
                              onClick={() => setSelectedFormation(item)}
                              className="p-1.5 rounded-sm hover:bg-blue-50 text-slate-400 hover:text-blue-600"
                              title="Voir les inscrits"
                          >
                              <UsersIcon className="w-4 h-4" />
                          </button>
                          <button 
                              onClick={() => onEdit(item)}
                              className="p-1.5 rounded-sm hover:bg-slate-100 text-slate-400 hover:text-slate-900"
                              title="Modifier"
                          >
                              <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button 
                              onClick={() => onDelete(item.id)}
                              className="p-1.5 rounded-sm hover:bg-slate-100 text-slate-400 hover:text-red-600"
                              title="Supprimer"
                          >
                              <TrashIcon className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              ))}
              {items.length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                      Aucune formation dans cette catégorie.
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Catalogue des formations</h2>
            <button 
                onClick={onAdd}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-sm border border-slate-900 flex items-center"
            >
                <PlusIcon className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Ajouter une formation</span>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderSection('Formations de base', baseFormations, 'bg-slate-50/50', 'bg-slate-900')}
            {renderSection('Formations avancées', advancedFormations, 'bg-slate-50/50', 'bg-slate-700')}
        </div>

        {/* Modale de gestion des inscrits */}
        <FormationParticipantsModal 
            isOpen={!!selectedFormation}
            onClose={() => setSelectedFormation(null)}
            formation={selectedFormation}
            registrations={registrations}
            onDeleteRegistration={onDeleteRegistration}
        />
    </div>
  );
};

export default AdminFormationsManager;
