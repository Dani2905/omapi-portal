
import React, { useState } from 'react';
import { Formulaire, Guide } from '../../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, DocumentTextIcon, FolderIcon, ArrowRightOnRectangleIcon, BookOpenIcon, CheckIcon } from './AdminIcons';

interface AdminFormsManagerProps {
  forms: Formulaire[];
  guides: Guide[];
  onAddForm: () => void;
  onEditForm: (form: Formulaire) => void;
  onDeleteForm: (id: number) => void;
  onAddGuide: () => void;
  onEditGuide: (guide: Guide) => void;
  onDeleteGuide: (id: number) => void;
}

const AdminFormsManager: React.FC<AdminFormsManagerProps> = ({ 
    forms, guides, 
    onAddForm, onEditForm, onDeleteForm,
    onAddGuide, onEditGuide, onDeleteGuide
}) => {
  const [activeTab, setActiveTab] = useState<'forms' | 'guides'>('forms');
  const categories = ['Marques', 'Brevets', 'Dessins', 'Autres'];

  const getGradientClass = (theme: string) => {
    switch(theme) {
        case 'blue': return "bg-blue-100 text-blue-800";
        case 'amber': return "bg-amber-100 text-amber-800";
        case 'purple': return "bg-purple-100 text-purple-800";
        case 'emerald': return "bg-emerald-100 text-emerald-800";
        case 'orange': return "bg-orange-100 text-orange-800";
        default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
        {/* Tabs Control */}
        <div className="flex space-x-0 bg-slate-800 p-0 rounded-none border border-slate-700 w-fit">
            <button
                onClick={() => setActiveTab('forms')}
                className={`px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-none ${
                    activeTab === 'forms' 
                    ? 'bg-slate-700 text-white border-b-2 border-emerald-500' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
                Formulaires ({forms.length})
            </button>
            <button
                onClick={() => setActiveTab('guides')}
                className={`px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-none ${
                    activeTab === 'guides' 
                    ? 'bg-slate-700 text-white border-b-2 border-emerald-500' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
                Guides Pratiques ({guides.length})
            </button>
        </div>

        {/* --- View Formulaires --- */}
        {activeTab === 'forms' && (
            <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Documents administratifs</h2>
                        <p className="text-xs text-slate-500 mt-1">Gestion des formulaires de dépôt et procédures</p>
                    </div>
                    <button 
                        onClick={onAddForm}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-none flex items-center transition-none"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Ajouter un formulaire
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {categories.map(category => {
                        const categoryForms = forms.filter(f => f.category === category);
                        if (categoryForms.length === 0) return null;

                        return (
                            <div key={category} className="bg-slate-900 rounded-none border border-slate-800 overflow-hidden">
                                <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FolderIcon className="w-4 h-4 text-emerald-500 mr-2" />
                                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">{category}</h3>
                                    </div>
                                    <span className="text-[10px] font-mono bg-slate-700 text-emerald-400 px-2 py-0.5 rounded-none border border-slate-600">
                                        {categoryForms.length} ITEMS
                                    </span>
                                </div>
                                <div className="divide-y divide-slate-800">
                                    {categoryForms.map(form => (
                                        <div key={form.id} className="p-4 hover:bg-slate-800/30 flex items-center justify-between group transition-none">
                                            <div className="flex items-start space-x-4">
                                                <div className="bg-slate-800 text-emerald-500 p-2 border border-slate-700">
                                                    <DocumentTextIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-200">{form.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">{form.description ? form.description.replace(/<[^>]*>?/gm, '') : ''}</p>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 border border-slate-700 uppercase">
                                                            FILE: {form.fileName || 'fichier.pdf'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => onEditForm(form)}
                                                    className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-none" 
                                                    title="Modifier"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => onDeleteForm(form.id)}
                                                    className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-none" 
                                                    title="Supprimer"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* --- View Guides --- */}
        {activeTab === 'guides' && (
            <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Guides et tutoriels</h2>
                        <p className="text-xs text-slate-500 mt-1">Documentation d'aide et guides pratiques</p>
                    </div>
                    <button 
                        onClick={onAddGuide}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-none flex items-center transition-none"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Ajouter un guide
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {guides.map(guide => (
                        <div key={guide.id} className="bg-slate-900 rounded-none border border-slate-800 overflow-hidden flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-800 border border-slate-700 text-emerald-500">
                                        <BookOpenIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => onEditGuide(guide)}
                                            className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-none"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteGuide(guide.id)}
                                            className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-none"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-2">{guide.title}</h3>
                                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{guide.description ? guide.description.replace(/<[^>]*>?/gm, '') : ''}</p>
                                <div className="space-y-2">
                                    {guide.points.slice(0, 2).map((point, i) => (
                                        <div key={i} className="flex items-center text-[10px] uppercase tracking-wider text-slate-400">
                                            <CheckIcon className="w-3 h-3 text-emerald-500 mr-2" />
                                            <span className="truncate">{point}</span>
                                        </div>
                                    ))}
                                    {guide.points.length > 2 && (
                                        <div className="text-[10px] font-mono text-slate-600 pl-5">+{guide.points.length - 2} MORE POINTS</div>
                                    )}
                                </div>
                            </div>
                            <div className="px-5 py-3 bg-slate-800/50 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between items-center">
                                <span className="uppercase">THEME: {guide.colorTheme}</span>
                                <span className="flex items-center uppercase">
                                    <ArrowRightOnRectangleIcon className="w-3 h-3 mr-1" /> {guide.fileUrl === '#' ? 'NO LINK' : 'DOWNLOAD'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminFormsManager;