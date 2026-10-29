
import React, { useState, useEffect } from 'react';
import { GopiItem } from '../../types';
import { XMarkIcon, BookOpenIcon, CalendarIcon, DocumentTextIcon, TagIcon, ArrowUpTrayIcon, CheckIcon } from './AdminIcons';

interface GopiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gopi: Partial<GopiItem>) => void;
  initialData: Partial<GopiItem>;
}

const GopiFormModal: React.FC<GopiFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<GopiItem>>({});
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      // Si une URL existe déjà (simulation d'un fichier existant)
      if (initialData.fileUrl && initialData.fileUrl.length > 50) {
          setFileName('Document PDF existant');
      } else {
          setFileName('');
      }
    }
  }, [isOpen, initialData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
          alert('Veuillez sélectionner un fichier PDF.');
          return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        // On stocke le fichier en Base64 dans fileUrl pour la démo
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
        <div className="bg-white border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center">
                    <BookOpenIcon className="w-4 h-4 mr-2 text-slate-500" />
                    {formData.id ? 'Éditer le numéro' : 'Ajouter une publication'}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Titre du numéro</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BookOpenIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            required
                            className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none text-slate-700 bg-slate-50/50"
                            value={formData.title || ''}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="Ex: GOPI N° 521"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type de Publication</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <TagIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <select 
                                required
                                className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none appearance-none text-slate-700 bg-slate-50/50"
                                value={formData.category || 'Gazette Officielle'}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="Gazette Officielle">Gazette Officielle (Dépôt)</option>
                                <option value="Inscription au Registre">Publication : Inscription au Registre</option>
                                <option value="Renouvellement">Publication : Renouvellement</option>
                                <option value="GOPI spéciale GMD">GOPI spéciale GMD (Marques Int.)</option>
                                <option value="GOPI spéciale GDM">GOPI spéciale GDM (Dessins Int.)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date / Période</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CalendarIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                required
                                className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none text-slate-700 bg-slate-50/50"
                                value={formData.date || ''}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                placeholder="Ex: Février 2024"
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
                            placeholder="Contenu sommaire..."
                        />
                    </div>
                </div>

                {/* File Upload Section */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fichier PDF de la Gazette</label>
                    
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-slate-200 border-dashed hover:bg-slate-50 transition-colors relative group bg-slate-50/30">
                        <div className="space-y-1 text-center">
                            {fileName ? (
                                <div className="text-slate-900 flex flex-col items-center">
                                    <DocumentTextIcon className="h-8 w-8 mb-2 text-slate-400" />
                                    <span className="text-xs font-mono break-all">{fileName}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-tight mt-1">Fichier sélectionné</span>
                                    <div className="mt-3 text-slate-900 text-[10px] font-bold uppercase tracking-wider hover:underline cursor-pointer">
                                        Changer le fichier
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <ArrowUpTrayIcon className="mx-auto h-10 w-10 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    <div className="flex text-xs text-slate-600 justify-center mt-2">
                                        <span className="font-bold uppercase tracking-wider text-slate-900">
                                            Uploader un fichier
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-1">PDF uniquement (Max 10MB)</p>
                                </>
                            )}
                        </div>
                        <input 
                            id="pdf-upload" 
                            name="pdf-upload" 
                            type="file" 
                            accept="application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            onChange={handleFileUpload} 
                        />
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

export default GopiFormModal;
