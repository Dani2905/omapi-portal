
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Formulaire, Guide } from '../../types';
import { XMarkIcon, DocumentTextIcon, FolderIcon, LinkIcon, TagIcon, SwatchIcon, ArrowUpTrayIcon } from './AdminIcons';

interface FormFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
  mode: 'form' | 'guide';
}

const FormFormModal: React.FC<FormFormModalProps> = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const [formData, setFormData] = useState<any>({});
  const [pointsString, setPointsString] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      if (mode === 'guide' && initialData.points) {
          setPointsString(initialData.points.join('; '));
      } else {
          setPointsString('');
      }
    }
  }, [isOpen, initialData, mode]);

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
    if (mode === 'guide') {
        // Convertir la chaîne de points en tableau
        const pointsArray = pointsString.split(';').map(p => p.trim()).filter(p => p !== '');
        onSave({ ...formData, points: pointsArray });
    } else {
        onSave(formData);
    }
  };

  // --- Toolbar config for ReactQuill ---
  const quillModules = {
    toolbar: [
      [{ 'header': [2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  if (!isOpen) return null;

  return (    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 overflow-y-auto">
        <div className="bg-white border border-slate-200 w-full max-w-lg overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {formData.id ? `Éditer le ${mode === 'form' ? 'formulaire' : 'guide'}` : `Ajouter un ${mode === 'form' ? 'formulaire' : 'guide'}`}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-red-600 p-1 border border-slate-200 bg-white">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                
                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Titre du document</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DocumentTextIcon className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            required
                            className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                            value={formData.title || ''}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder={mode === 'form' ? "Ex: Demande de brevet" : "Ex: Guide des Marques"}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Description</label>
                    <div className="bg-white [&_.ql-container]:min-h-[120px] [&_.ql-container]:text-sm [&_.ql-editor]:text-slate-800 [&_.ql-editor]:leading-relaxed [&_.ql-toolbar]:border-slate-300 [&_.ql-container]:border-slate-300 [&_.ql-toolbar]:bg-slate-50 [&_.ql-editor.ql-blank::before]:text-slate-400 [&_.ql-editor.ql-blank::before]:font-mono [&_.ql-editor.ql-blank::before]:text-xs">
                        <ReactQuill 
                            theme="snow"
                            value={formData.description || ''}
                            onChange={(content: string) => setFormData({...formData, description: content})}
                            modules={quillModules}
                            placeholder="Brève description de ce document..."
                        />
                    </div>
                </div>

                {/* Champs Spécifiques Formulaire */}
                {mode === 'form' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Catégorie</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FolderIcon className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <select 
                                    required
                                    className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none appearance-none text-xs text-slate-600 bg-white cursor-pointer"
                                    value={formData.category || 'Autres'}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="Marques">Marques</option>
                                    <option value="Brevets">Brevets</option>
                                    <option value="Dessins">Dessins</option>
                                    <option value="Autres">Autres</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Nom du fichier</label>
                            <input 
                                type="text" 
                                className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                value={formData.fileName || ''}
                                onChange={e => setFormData({...formData, fileName: e.target.value})}
                                placeholder="Ex: form_v2.pdf"
                            />
                        </div>
                    </div>
                )}

                {/* Champs Spécifiques Guide */}
                {mode === 'guide' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Icône</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <TagIcon className="h-3.5 w-3.5 text-slate-400" />
                                    </div>
                                    <select 
                                        required
                                        className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none appearance-none text-xs text-slate-600 bg-white cursor-pointer"
                                        value={formData.iconName || 'book'}
                                        onChange={e => setFormData({...formData, iconName: e.target.value})}
                                    >
                                        <option value="book">Livre</option>
                                        <option value="tag">Étiquette</option>
                                        <option value="bulb">Ampoule</option>
                                        <option value="swatch">Palette</option>
                                        <option value="globe">Globe</option>
                                        <option value="banknotes">Billet</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Thème Couleur</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <SwatchIcon className="h-3.5 w-3.5 text-slate-400" />
                                    </div>
                                    <select 
                                        required
                                        className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none appearance-none text-xs text-slate-600 bg-white cursor-pointer"
                                        value={formData.colorTheme || 'blue'}
                                        onChange={e => setFormData({...formData, colorTheme: e.target.value})}
                                    >
                                        <option value="blue">Bleu</option>
                                        <option value="amber">Ambre (Orange/Jaune)</option>
                                        <option value="purple">Violet</option>
                                        <option value="emerald">Émeraude (Vert)</option>
                                        <option value="orange">Orange</option>
                                        <option value="gray">Gris</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Points clés</label>
                            <textarea 
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none resize-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                value={pointsString}
                                onChange={e => setPointsString(e.target.value)}
                                placeholder="Point 1; Point 2; Point 3 (séparés par un point-virgule)"
                            />
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">Séparez les points clés par des points-virgules.</p>
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Lien de téléchargement</label>
                    <div className="space-y-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                required
                                className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                value={formData.fileUrl || ''}
                                onChange={e => setFormData({...formData, fileUrl: e.target.value})}
                                placeholder="https://... ou base64..."
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

export default FormFormModal;
