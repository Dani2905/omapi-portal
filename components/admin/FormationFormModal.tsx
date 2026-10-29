
import React, { useState, useEffect } from 'react';
import { Formation } from '../../types';
import { XMarkIcon, AcademicCapIcon, FolderIcon, ClockIcon, MapPinIcon, CalendarIcon, DocumentTextIcon, ExclamationCircleIcon, SwatchIcon, ArrowUpTrayIcon } from './AdminIcons';

interface FormationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formation: Partial<Formation>) => void;
  initialData: Partial<Formation>;
}

const FormationFormModal: React.FC<FormationFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Formation>>({});
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      if (initialData.fileUrl && initialData.fileUrl.length > 20) {
          setFileName(initialData.fileName || 'Fichier joint existant');
      } else {
          setFileName('');
      }
    }
  }, [isOpen, initialData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fileUrl: reader.result as string, fileName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
      setFileName('');
      setFormData({ ...formData, fileUrl: undefined, fileName: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 overflow-y-auto">
        <div className="bg-white border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center">
                    <AcademicCapIcon className="w-4 h-4 mr-2 text-slate-500" />
                    {formData.id ? 'Éditer la formation' : 'Ajouter une formation'}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Titre de la formation</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <AcademicCapIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                required
                                className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none text-slate-700 bg-slate-50/50"
                                value={formData.title || ''}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="Ex: Stratégies de protection PI"
                            />
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Catégorie</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FolderIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <select 
                                required
                                className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none appearance-none text-slate-700 bg-slate-50/50"
                                value={formData.category || 'Base'}
                                onChange={e => setFormData({...formData, category: e.target.value as 'Base' | 'Avancee'})}
                            >
                                <option value="Base">Formation de base</option>
                                <option value="Avancee">Formation avancée</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Thème Couleur</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SwatchIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <select 
                                className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none appearance-none text-slate-700 bg-slate-50/50"
                                value={formData.colorTheme || 'blue'}
                                onChange={e => setFormData({...formData, colorTheme: e.target.value as any})}
                            >
                                <option value="blue">Bleu (Standard)</option>
                                <option value="indigo">Indigo (Sérieux)</option>
                                <option value="emerald">Émeraude (Bio/Nature)</option>
                                <option value="amber">Ambre (Important)</option>
                                <option value="rose">Rose (Urgent/Action)</option>
                                <option value="purple">Violet (Créatif)</option>
                                <option value="cyan">Cyan (Tech)</option>
                            </select>
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CalendarIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none text-slate-700 bg-slate-50/50"
                                value={formData.date || ''}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                placeholder="Ex: 15 Avril 2024"
                            />
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Horaire</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ClockIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none text-slate-700 bg-slate-50/50"
                                value={formData.time || ''}
                                onChange={e => setFormData({...formData, time: e.target.value})}
                                placeholder="Ex: 09h00 - 12h00"
                            />
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lieu</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPinIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none text-slate-700 bg-slate-50/50"
                                value={formData.location || ''}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                placeholder="Ex: Siège OMAPI"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                    <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                            <DocumentTextIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <textarea 
                            rows={3}
                            className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none resize-none text-slate-700 bg-slate-50/50"
                            value={formData.description || ''}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Détails sur le contenu de la formation..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Conditions / Prérequis</label>
                    <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                            <ExclamationCircleIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <textarea 
                            rows={2}
                            className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none resize-none text-slate-700 bg-slate-50/50"
                            value={formData.conditions || ''}
                            onChange={e => setFormData({...formData, conditions: e.target.value})}
                            placeholder="Ex: Ouvert à tous, payant, sur dossier..."
                        />
                    </div>
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Document joint (Programme / Brochure)</label>
                    
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-slate-200 border-dashed hover:bg-slate-50 transition-colors relative group bg-slate-50/30">
                        <div className="space-y-1 text-center">
                            {fileName ? (
                                <div className="text-slate-900 flex flex-col items-center">
                                    <DocumentTextIcon className="h-8 w-8 mb-2 text-slate-400" />
                                    <span className="text-xs font-mono break-all">{fileName}</span>
                                    <button 
                                        type="button" 
                                        onClick={removeFile}
                                        className="mt-3 text-red-600 text-[10px] font-bold uppercase tracking-wider hover:text-red-700 flex items-center"
                                    >
                                        <XMarkIcon className="w-3 h-3 mr-1" />
                                        Supprimer
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <ArrowUpTrayIcon className="mx-auto h-10 w-10 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    <div className="flex text-xs text-slate-600 justify-center mt-2">
                                        <span className="font-bold uppercase tracking-wider text-slate-900">
                                            Télécharger un fichier
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-1">PDF, DOCX jusqu'à 5MB</p>
                                </>
                            )}
                        </div>
                        {!fileName && (
                            <input 
                                id="formation-file-upload" 
                                name="formation-file-upload" 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                onChange={handleFileUpload} 
                            />
                        )}
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default FormationFormModal;
