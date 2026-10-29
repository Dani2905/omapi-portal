import React, { useEffect, useState } from 'react';
import { GopiItem } from '../../types';
import { normalizeGopiPublication, GOPI_CATEGORIES, MAX_GOPI_PDF_BYTES, validateGopiPublication } from '../../utils/gopiLogic';
import { XMarkIcon, BookOpenIcon, CalendarIcon, DocumentTextIcon, TagIcon, ArrowUpTrayIcon, CheckIcon } from './AdminIcons';

interface GopiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gopi: Partial<GopiItem>) => Promise<boolean | void> | boolean | void;
  initialData: Partial<GopiItem>;
}

const GopiFormModal: React.FC<GopiFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<GopiItem>>({});
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const normalized = normalizeGopiPublication(initialData);
    setFormData(normalized);
    setFileName(normalized.fileUrl
      ? normalized.fileName || 'Document PDF existant'
      : '');
    setError(null);
    setIsReadingFile(false);
    setIsSaving(false);
  }, [isOpen, initialData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setError(null);

    if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) {
      setError('Fichier refusé : choisissez un fichier PDF.');
      input.value = '';
      return;
    }
    if (file.size > MAX_GOPI_PDF_BYTES) {
      setError('Fichier refusé : le PDF dépasse la limite de 2 Mo.');
      input.value = '';
      return;
    }

    setIsReadingFile(true);
    try {
      const signature = await file.slice(0, 5).text();
      if (signature !== '%PDF-') {
        setError('Fichier refusé : le contenu ne semble pas être un PDF valide.');
        input.value = '';
        return;
      }

      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Lecture du PDF impossible.'));
        reader.onerror = () => reject(new Error('Lecture du PDF impossible.'));
        reader.readAsDataURL(file);
      });
      setFormData((current) => ({ ...current, fileUrl: dataUrl, fileName: file.name }));
      setFileName(file.name);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'Lecture du PDF impossible.');
      input.value = '';
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || isReadingFile) return;
    const normalized = normalizeGopiPublication(formData);
    const validationError = validateGopiPublication(normalized);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const saved = await onSave(normalized);
      if (saved === false) setError('La publication n’a pas été enregistrée. Vos saisies sont conservées ; vérifiez le stockage du navigateur puis réessayez.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Une erreur a empêché l’enregistrement. Vos saisies sont conservées.');
    } finally {
      setIsSaving(false);
    }
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
          <button type="button" onClick={onClose} disabled={isSaving} aria-label="Fermer" className="text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="gopi-title" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Titre du numéro</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><BookOpenIcon className="h-4 w-4 text-slate-400" /></div>
              <input id="gopi-title" type="text" required minLength={3} maxLength={150} className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none text-slate-700 bg-slate-50/50" value={formData.title || ''} onChange={(e) => setFormData((current) => ({ ...current, title: e.target.value }))} placeholder="Ex. : GOPI n° 521" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="gopi-category" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type de publication</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><TagIcon className="h-4 w-4 text-slate-400" /></div>
                <select id="gopi-category" required className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none appearance-none text-slate-700 bg-slate-50/50" value={formData.category?.trim() || ''} onChange={(e) => setFormData((current) => ({ ...current, category: e.target.value }))}>
                  {!formData.category?.trim() && <option value="">Sélectionnez une catégorie…</option>}
                  {formData.category && !GOPI_CATEGORIES.includes(formData.category.trim() as typeof GOPI_CATEGORIES[number]) && <option value={formData.category.trim()}>Catégorie à corriger : {formData.category}</option>}
                  {GOPI_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="gopi-date" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date / période</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarIcon className="h-4 w-4 text-slate-400" /></div>
                <input id="gopi-date" type="text" required maxLength={80} className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none text-slate-700 bg-slate-50/50" value={formData.date || ''} onChange={(e) => setFormData((current) => ({ ...current, date: e.target.value }))} placeholder="Ex. : Février 2026" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="gopi-description" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none"><DocumentTextIcon className="h-4 w-4 text-slate-400" /></div>
              <textarea id="gopi-description" rows={3} maxLength={1000} className="w-full pl-10 px-3 py-2 border border-slate-200 text-sm focus:border-slate-900 outline-none resize-none text-slate-700 bg-slate-50/50" value={formData.description || ''} onChange={(e) => setFormData((current) => ({ ...current, description: e.target.value }))} placeholder="Contenu sommaire…" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fichier PDF de la Gazette</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-slate-200 border-dashed hover:bg-slate-50 transition-colors relative group bg-slate-50/30">
              <div className="space-y-1 text-center pointer-events-none">
                {fileName ? (
                  <div className="text-slate-900 flex flex-col items-center">
                    <DocumentTextIcon className="h-8 w-8 mb-2 text-slate-400" />
                    <span className="text-xs font-mono break-all">{fileName}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-tight mt-1">PDF sélectionné</span>
                    <span className="mt-3 text-slate-900 text-[10px] font-bold uppercase tracking-wider">Choisir un autre PDF</span>
                  </div>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="mx-auto h-10 w-10 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    <div className="flex text-xs text-slate-600 justify-center mt-2"><span className="font-bold uppercase tracking-wider text-slate-900">Importer un fichier</span></div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-1">PDF uniquement — 2 Mo maximum</p>
                  </>
                )}
              </div>
              <input id="gopi-pdf-upload" name="gopi-pdf-upload" type="file" accept="application/pdf,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isReadingFile || isSaving} aria-label="Importer un PDF de la Gazette" />
            </div>
            {fileName && <button type="button" className="mt-2 text-xs font-semibold text-red-700 hover:underline" onClick={() => { setFormData((current) => ({ ...current, fileUrl: '', fileName: '' })); setFileName(''); setError(null); }}>Retirer le PDF</button>}
            {isReadingFile && <p role="status" className="mt-2 text-xs text-slate-500">Lecture du PDF en cours…</p>}
          </div>

          {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>}

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50">Annuler</button>
            <button type="submit" disabled={isSaving || isReadingFile} className="px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-60">
              {isSaving ? 'Enregistrement…' : isReadingFile ? 'Lecture du PDF…' : <><CheckIcon className="inline w-4 h-4 mr-1" />Enregistrer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GopiFormModal;
