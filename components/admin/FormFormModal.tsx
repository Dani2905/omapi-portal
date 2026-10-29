import React, { useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Formulaire, Guide } from '../../types';
import {
  FORM_CATEGORIES,
  GUIDE_ICONS,
  GUIDE_THEMES,
  isAllowedLibraryUrl,
  isValidLibraryFileSignature,
  libraryFileMime,
  MAX_LIBRARY_FILE_BYTES,
  normalizeFormDraft,
  normalizeGuideDraft,
  validateFormDraft,
  validateGuideDraft,
  validateLibraryFileMetadata,
} from '../../utils/documentLibraryLogic';
import { XMarkIcon, DocumentTextIcon, FolderIcon, LinkIcon, TagIcon, SwatchIcon, ArrowUpTrayIcon, CheckIcon } from './AdminIcons';

interface FormFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Formulaire> | Partial<Guide>) => Promise<boolean | void> | boolean | void;
  initialData: Partial<Formulaire> | Partial<Guide>;
  mode: 'form' | 'guide';
}

const quillModules = {
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const FormFormModal: React.FC<FormFormModalProps> = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [pointsString, setPointsString] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const normalized = mode === 'form'
      ? normalizeFormDraft(initialData as Partial<Formulaire>)
      : normalizeGuideDraft(initialData as Partial<Guide>);
    const prepared = mode === 'guide'
      ? {
          ...normalized,
          iconName: (normalized as Partial<Guide>).iconName || 'book',
          colorTheme: (normalized as Partial<Guide>).colorTheme || 'blue',
        }
      : normalized;
    setFormData(prepared as Record<string, any>);
    setPointsString(mode === 'guide' && Array.isArray((prepared as Partial<Guide>).points)
      ? (prepared as Partial<Guide>).points!.join('; ')
      : '');
    setFileName(String(prepared.fileName || (typeof prepared.fileUrl === 'string' && prepared.fileUrl.startsWith('data:') ? 'Document importé' : '')));
    setError(null);
    setIsReadingFile(false);
    setIsSaving(false);
  }, [isOpen, initialData, mode]);

  const isDataDocument = typeof formData.fileUrl === 'string' && formData.fileUrl.startsWith('data:');
  const externalUrl = useMemo(() => isDataDocument ? '' : String(formData.fileUrl || ''), [formData.fileUrl, isDataDocument]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setError(null);

    const metadataError = validateLibraryFileMetadata(file);
    if (metadataError) {
      setError(metadataError);
      input.value = '';
      return;
    }

    setIsReadingFile(true);
    try {
      const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
      if (!isValidLibraryFileSignature(file.name, signature)) {
        setError('Fichier refusé : son contenu ne correspond pas à son extension.');
        input.value = '';
        return;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== 'string' || !reader.result.includes(',')) {
            reject(new Error('Lecture du document impossible.'));
            return;
          }
          const base64 = reader.result.slice(reader.result.indexOf(',') + 1);
          resolve(`data:${libraryFileMime(file.name)};base64,${base64}`);
        };
        reader.onerror = () => reject(new Error('Lecture du document impossible.'));
        reader.readAsDataURL(file);
      });
      setFormData((current) => ({ ...current, fileUrl: dataUrl, fileName: file.name }));
      setFileName(file.name);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'Lecture du document impossible.');
      input.value = '';
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || isReadingFile) return;

    const draft = { ...formData, fileName };
    const normalized = mode === 'form'
      ? normalizeFormDraft(draft as Partial<Formulaire>)
      : normalizeGuideDraft({
          ...draft,
          points: pointsString.split(';').map((point) => point.trim()).filter(Boolean),
        } as Partial<Guide>);
    const validationError = mode === 'form'
      ? validateFormDraft(normalized as Partial<Formulaire>)
      : validateGuideDraft(normalized as Partial<Guide>);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      const saved = await onSave(normalized);
      if (saved === false) setError('Enregistrement échoué. Vos saisies sont conservées ; vérifiez l’espace disponible dans ce navigateur puis réessayez.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Une erreur a empêché l’enregistrement. Vos saisies sont conservées.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentCategory = String(formData.category || '').trim();
  const linkError = externalUrl && !isAllowedLibraryUrl(externalUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-lg overflow-hidden my-auto max-h-[95vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {formData.id ? `Éditer le ${mode === 'form' ? 'formulaire' : 'guide'}` : `Ajouter un ${mode === 'form' ? 'formulaire' : 'guide'}`}
          </h3>
          <button type="button" onClick={onClose} disabled={isSaving || isReadingFile} aria-label="Fermer" className="text-slate-400 hover:text-red-600 p-1 border border-slate-200 bg-white disabled:opacity-50">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="library-title" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Titre du document</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><DocumentTextIcon className="h-3.5 w-3.5 text-slate-400" /></div>
              <input id="library-title" type="text" required minLength={3} maxLength={150} className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400" value={formData.title || ''} onChange={(e) => { setFormData((current) => ({ ...current, title: e.target.value })); setError(null); }} placeholder={mode === 'form' ? 'Ex. : Demande de brevet' : 'Ex. : Guide des marques'} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Description</label>
            <div className="bg-white [&_.ql-container]:min-h-[120px] [&_.ql-container]:text-sm [&_.ql-editor]:text-slate-800 [&_.ql-editor]:leading-relaxed [&_.ql-toolbar]:border-slate-300 [&_.ql-container]:border-slate-300 [&_.ql-toolbar]:bg-slate-50 [&_.ql-editor.ql-blank::before]:text-slate-400 [&_.ql-editor.ql-blank::before]:font-mono [&_.ql-editor.ql-blank::before]:text-xs">
              <ReactQuill theme="snow" value={formData.description || ''} onChange={(content: string) => setFormData((current) => ({ ...current, description: content }))} modules={quillModules} placeholder="Brève description de ce document…" />
            </div>
          </div>

          {mode === 'form' ? (
            <div>
              <label htmlFor="library-category" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Catégorie</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FolderIcon className="h-3.5 w-3.5 text-slate-400" /></div>
                <select id="library-category" required className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none appearance-none text-xs text-slate-600 bg-white cursor-pointer" value={currentCategory} onChange={(e) => setFormData((current) => ({ ...current, category: e.target.value }))}>
                  {!currentCategory && <option value="">Sélectionnez une catégorie…</option>}
                  {currentCategory && !FORM_CATEGORIES.includes(currentCategory as typeof FORM_CATEGORIES[number]) && <option value={currentCategory}>À corriger : {currentCategory}</option>}
                  {FORM_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="guide-icon" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Icône</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><TagIcon className="h-3.5 w-3.5 text-slate-400" /></div>
                    <select id="guide-icon" required className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none appearance-none text-xs text-slate-600 bg-white cursor-pointer" value={formData.iconName || 'book'} onChange={(e) => setFormData((current) => ({ ...current, iconName: e.target.value }))}>
                      {formData.iconName && !GUIDE_ICONS.includes(formData.iconName as typeof GUIDE_ICONS[number]) && <option value={formData.iconName}>À corriger : {formData.iconName}</option>}
                      {GUIDE_ICONS.map((icon) => <option key={icon} value={icon}>{({ tag: 'Étiquette', bulb: 'Ampoule', swatch: 'Palette', book: 'Livre', globe: 'Globe', banknotes: 'Billet' } as Record<string, string>)[icon]}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="guide-theme" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Thème couleur</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SwatchIcon className="h-3.5 w-3.5 text-slate-400" /></div>
                    <select id="guide-theme" required className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none appearance-none text-xs text-slate-600 bg-white cursor-pointer" value={formData.colorTheme || 'blue'} onChange={(e) => setFormData((current) => ({ ...current, colorTheme: e.target.value }))}>
                      {formData.colorTheme && !GUIDE_THEMES.includes(formData.colorTheme as typeof GUIDE_THEMES[number]) && <option value={formData.colorTheme}>À corriger : {formData.colorTheme}</option>}
                      {GUIDE_THEMES.map((theme) => <option key={theme} value={theme}>{({ blue: 'Bleu', amber: 'Ambre', purple: 'Violet', emerald: 'Émeraude', orange: 'Orange', gray: 'Gris' } as Record<string, string>)[theme]}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="guide-points" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Points clés</label>
                <textarea id="guide-points" rows={3} maxLength={4000} className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none resize-none text-xs text-slate-600 bg-white placeholder-slate-400" value={pointsString} onChange={(e) => setPointsString(e.target.value)} placeholder="Point 1 ; Point 2 ; Point 3 (séparés par un point-virgule)" />
                <p className="text-[10px] text-slate-500 mt-1">Jusqu’à 20 points, 180 caractères par point.</p>
              </div>
            </>
          )}

          <div>
            <label htmlFor="library-url" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Lien de téléchargement sécurisé</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LinkIcon className="h-3.5 w-3.5 text-slate-400" /></div>
              <input id="library-url" type="text" required={!isDataDocument} maxLength={2048} className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400 disabled:bg-slate-100" value={externalUrl} disabled={isDataDocument} onChange={(e) => { setFormData((current) => ({ ...current, fileUrl: e.target.value })); setFileName(''); setError(null); }} placeholder="https://… ou importez un document ci-dessous" />
            </div>
            {isDataDocument && <p className="mt-1 text-xs text-emerald-700">Document importé : {fileName || 'fichier joint'}</p>}
            {linkError && <p className="mt-1 text-xs text-red-700">Le lien doit être une URL HTTPS sécurisée ou un chemin local.</p>}

            <label className="mt-2 block w-full text-center px-3 py-2 border border-slate-300 border-dashed text-[10px] font-bold uppercase tracking-widest text-slate-500 cursor-pointer hover:bg-slate-100">
              <ArrowUpTrayIcon className="w-3 h-3 inline mr-1" /> {isReadingFile ? 'Lecture du document…' : 'Importer PDF, DOC ou DOCX (2 Mo max.)'}
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileUpload} disabled={isReadingFile || isSaving} />
            </label>
            {fileName && <button type="button" className="mt-2 text-xs font-semibold text-red-700 hover:underline" onClick={() => { setFormData((current) => ({ ...current, fileUrl: '', fileName: '' })); setFileName(''); setError(null); }}>Retirer le document</button>}
            <div className="mt-3">
              <label htmlFor="library-filename" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nom du fichier affiché (facultatif)</label>
              <input id="library-filename" type="text" maxLength={120} className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-600" value={fileName} onChange={(e) => { setFileName(e.target.value); setFormData((current) => ({ ...current, fileName: e.target.value })); }} placeholder={mode === 'form' ? 'Ex. : formulaire-marque.pdf' : 'Ex. : guide-pratique.pdf'} />
            </div>
          </div>

          {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-200">
            <button type="button" onClick={onClose} disabled={isSaving || isReadingFile} className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50">Annuler</button>
            <button type="submit" disabled={isSaving || isReadingFile} className="px-6 py-2 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50">
              {isSaving ? 'Enregistrement…' : isReadingFile ? 'Lecture…' : <><CheckIcon className="inline w-4 h-4 mr-1" />Enregistrer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormFormModal;
