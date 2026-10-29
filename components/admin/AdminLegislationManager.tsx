
import React from 'react';
import { LegislationItem } from '../../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, DocumentTextIcon, ScaleIcon } from './AdminIcons';

interface AdminLegislationManagerProps {
  items: LegislationItem[];
  onAdd: () => void;
  onEdit: (item: LegislationItem) => void;
  onDelete: (id: number) => void;
}

const AdminLegislationManager: React.FC<AdminLegislationManagerProps> = ({ items, onAdd, onEdit, onDelete }) => {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Législation</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Gérez les textes juridiques (Lois, Ordonnances, Décrets, Arrêtés).</p>
            </div>
            <button 
                onClick={onAdd}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-sm border border-slate-900 flex items-center"
            >
                <PlusIcon className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Ajouter un texte</span>
            </button>
        </div>

        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Titre / Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Catégorie
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 group">
                                <td className="px-6 py-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 h-8 w-8 bg-slate-100 text-slate-600 rounded-sm flex items-center justify-center mt-1">
                                            <ScaleIcon className="w-4 h-4" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-[11px] font-bold text-slate-900 uppercase tracking-tight line-clamp-2">{item.title}</div>
                                            <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{item.description}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-0.5 inline-flex text-[9px] font-bold rounded-sm bg-slate-100 text-slate-800 uppercase tracking-widest border border-slate-200">
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 inline-flex text-[9px] font-bold rounded-sm uppercase tracking-widest border ${
                                        item.category === 'Fondamental' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-green-50 text-green-700 border-green-100'
                                    }`}>
                                        {item.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                    {item.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => onEdit(item)}
                                        className="text-slate-400 hover:text-blue-600 mr-2 p-1.5 hover:bg-slate-50 rounded-sm border border-transparent hover:border-slate-200"
                                        title="Modifier"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(item.id)}
                                        className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-slate-50 rounded-sm border border-transparent hover:border-slate-200"
                                        title="Supprimer"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                    <DocumentTextIcon className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest italic">Aucun texte juridique enregistré.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default AdminLegislationManager;