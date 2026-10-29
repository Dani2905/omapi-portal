
import React, { useState, useEffect } from 'react';
import { LegislationItem } from '../../types';
import { XMarkIcon, DocumentTextIcon, CalendarIcon, TagIcon, LinkIcon, ScaleIcon, ArrowUpTrayIcon } from './AdminIcons';

interface LegislationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<LegislationItem>) => void;
  initialData: Partial<LegislationItem>;
}

const LegislationFormModal: React.FC<LegislationFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<LegislationItem>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, fileUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 overflow-y-auto">
        <div className="bg-white border border-slate-200 w-full max-w-lg overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {formData.id ? 'Modifier le texte juridique' : 'Ajouter un texte juridique'}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-red-600 p-1 border border-slate-200 bg-white">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                
                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Titre du texte</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ScaleIcon className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <textarea 
                            required
                            rows={3}
                            className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white resize-none placeholder-slate-400"
                            value={formData.title || ''}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="Ex: Ordonnance n° 89-019..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Type</label>
                        <select 
                            required
                            className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white appearance-none cursor-pointer"
                            value={formData.type || 'Loi'}
                            onChange={e => setFormData({...formData, type: e.target.value as any})}
                        >
                            <option value="Loi">Loi</option>
                            <option value="Ordonnance">Ordonnance</option>
                            <option value="Décret">Décret</option>
                            <option value="Arrêté">Arrêté</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Catégorie</label>
                        <select 
                            required
                            className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white appearance-none cursor-pointer"
                            value={formData.category || 'Fondamental'}
                            onChange={e => setFormData({...formData, category: e.target.value as any})}
                        >
                            <option value="Fondamental">Fondamental</option>
                            <option value="Application">Application</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Date</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            required
                            className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                            value={formData.date || ''}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            placeholder="Ex: 31/07/1989"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Description</label>
                    <div className="relative">
                        <div className="absolute top-2.5 left-3 pointer-events-none">
                            <DocumentTextIcon className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <textarea 
                            rows={4}
                            className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none resize-none text-xs text-slate-600 bg-white placeholder-slate-400"
                            value={formData.description || ''}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            placeholder="Résumé du contenu du texte..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Lien fichier (PDF)</label>
                    <div className="space-y-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                value={formData.fileUrl || ''}
                                onChange={e => setFormData({...formData, fileUrl: e.target.value})}
                                placeholder="URL du fichier ou base64..."
                            />
                        </div>
                        <label className="block w-full text-center px-3 py-2 border border-slate-300 border-dashed text-[10px] font-bold uppercase tracking-widest text-slate-500 cursor-pointer hover:bg-slate-100">
                            <ArrowUpTrayIcon className="w-3 h-3 inline mr-1" /> Uploader un document
                            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                        </label>
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-200">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 border border-slate-300 bg-white hover:bg-slate-50"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800"
                    >
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default LegislationFormModal;
