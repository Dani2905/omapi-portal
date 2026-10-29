
import React, { useState, useEffect } from 'react';
import { Formation } from '../../types';
import { XMarkIcon, AcademicCapIcon, FolderIcon, ClockIcon, MapPinIcon, CalendarIcon, DocumentTextIcon, ExclamationCircleIcon, SwatchIcon, ArrowUpTrayIcon } from './AdminIcons';
import { isSupportedFormationDocument, MAX_FORMATION_DOCUMENT_BYTES, normalizeFormationDraft, validateFormationDraft } from '../../utils/formationLogic';

interface FormationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formation: Partial<Formation>) => void | boolean | Promise<void | boolean>;
  initialData: Partial<Formation>;
}

const FormationFormModal: React.FC<FormationFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Formation>>({});
  const [fileName, setFileName] = useState<string>('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; category?: string; form?: string }>({});

  useEffect(() => {
    if (!isOpen) return;
    setFormData({ ...initialData });
    setFileName(initialData.fileUrl ? (initialData.fileName || 'Fichier joint existant') : '');
    setIsReadingFile(false);
    setIsSubmitting(false);
    setFieldErrors({});
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!isSupportedFormationDocument(file)) {
      setFieldErrors((errors) => ({ ...errors, form: 'Type de fichier refusé. Choisissez uniquement un fichier PDF ou DOCX.' }));
      return;
    }
    if (file.size === 0) {
      setFieldErrors((errors) => ({ ...errors, form: 'Le fichier choisi est vide. Sélectionnez un document valide.' }));
      return;
    }
    if (file.size > MAX_FORMATION_DOCUMENT_BYTES) {
      setFieldErrors((errors) => ({ ...errors, form: 'Le fichier dépasse 2 Mo. Réduisez sa taille avant de le joindre (stockage local de démonstration).' }));
      return;
    }

    setFieldErrors((errors) => ({ ...errors, form: undefined }));
    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setFieldErrors((errors) => ({ ...errors, form: 'Le document n’a pas pu être lu. Réessayez avec un autre fichier.' }));
        setIsReadingFile(false);
        return;
      }
      setFormData((previous) => ({ ...previous, fileUrl: reader.result as string, fileName: file.name }));
      setFileName(file.name);
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setFieldErrors((errors) => ({ ...errors, form: 'La lecture du document a échoué. Vérifiez le fichier puis réessayez.' }));
      setIsReadingFile(false);
    };
    reader.onabort = () => {
      setFieldErrors((errors) => ({ ...errors, form: 'La lecture du document a été interrompue. Vous pouvez réessayer.' }));
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFileName('');
    setFormData((previous) => ({ ...previous, fileUrl: undefined, fileName: undefined }));
    setFieldErrors((errors) => ({ ...errors, form: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isReadingFile) return;

    const normalizedData = normalizeFormationDraft(formData);
    const errors = validateFormationDraft(normalizedData);
    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const saved = await onSave(normalizedData);
      if (saved === false) {
        setFieldErrors({ form: 'La formation n’a pas été enregistrée. Vos données restent dans ce formulaire ; vérifiez le message puis réessayez.' });
      }
    } catch (error) {
      setFieldErrors({ form: error instanceof Error ? error.message : 'Une erreur est survenue pendant l’enregistrement. Vos données restent dans ce formulaire.' });
    } finally {
      setIsSubmitting(false);
    }
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
                
                {fieldErrors.form && (
                    <p role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs">{fieldErrors.form}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label htmlFor="formation-title" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Titre de la formation</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <AcademicCapIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                id="formation-title"
                                type="text"
                                required
                                maxLength={120}
                                autoComplete="off"
                                className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none text-slate-700 bg-slate-50/50"
                                value={formData.title || ''}
                                onChange={(e) => { setFormData((previous) => ({ ...previous, title: e.target.value })); setFieldErrors((errors) => ({ ...errors, title: undefined })); }}
                                placeholder="Ex. : Stratégies de protection PI"
                                aria-invalid={Boolean(fieldErrors.title)}
                                aria-describedby={fieldErrors.title ? 'formation-title-error' : undefined}
                            />
                            {fieldErrors.title && <p id="formation-title-error" role="alert" className="text-[11px] text-red-600 mt-1">{fieldErrors.title}</p>}
                        </div>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="formation-category" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Catégorie</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FolderIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <select
                                id="formation-category"
                                required
                                aria-invalid={Boolean(fieldErrors.category)}
                                className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none appearance-none text-slate-700 bg-slate-50/50"
                                value={formData.category || 'Base'}
                                onChange={(e) => { setFormData((previous) => ({ ...previous, category: e.target.value as 'Base' | 'Avancee' })); setFieldErrors((errors) => ({ ...errors, category: undefined })); }}
                            >
                                <option value="Base">Formation de base</option>
                                <option value="Avancee">Formation avancée</option>
                            </select>
                            {fieldErrors.category && <p role="alert" className="text-[11px] text-red-600 mt-1">{fieldErrors.category}</p>}
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
                                onChange={(e) => setFormData((previous) => ({ ...previous, colorTheme: e.target.value as Formation['colorTheme'] }))}
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
                                maxLength={80}
                                onChange={(e) => setFormData((previous) => ({ ...previous, date: e.target.value }))}
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
                                maxLength={80}
                                onChange={(e) => setFormData((previous) => ({ ...previous, time: e.target.value }))}
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
                                maxLength={150}
                                onChange={(e) => setFormData((previous) => ({ ...previous, location: e.target.value }))}
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
                            maxLength={5000}
                            rows={3}
                            className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none resize-none text-slate-700 bg-slate-50/50"
                            value={formData.description || ''}
                            onChange={(e) => setFormData((previous) => ({ ...previous, description: e.target.value }))}
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
                            maxLength={2000}
                            rows={2}
                            className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none resize-none text-slate-700 bg-slate-50/50"
                            value={formData.conditions || ''}
                            onChange={(e) => setFormData((previous) => ({ ...previous, conditions: e.target.value }))}
                            placeholder="Ex: Ouvert à tous, payant, sur dossier..."
                        />
                    </div>
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Document joint (Programme / Brochure)</label>
                    
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-slate-200 border-dashed hover:bg-slate-50 transition-colors relative group bg-slate-50/30">
                        <div className="space-y-1 text-center">
                            {isReadingFile && <p role="status" className="text-xs font-bold text-blue-700">Lecture du document en cours…</p>}
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
                                    <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-1">PDF ou DOCX · 2 Mo max (stockage local de démonstration)</p>
                                </>
                            )}
                        </div>
                        {!fileName && (
                            <input 
                                id="formation-file-upload" 
                                name="formation-file-upload" 
                                type="file"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                disabled={isReadingFile || isSubmitting}
                                aria-label="Joindre un document PDF ou DOCX"
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
                        disabled={isSubmitting || isReadingFile}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || isReadingFile}
                        className="px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-60"
                    >
                        {isSubmitting ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default FormationFormModal;
