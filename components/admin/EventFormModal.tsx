import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Event } from '../../types';
import { XMarkIcon, PhotoIcon, ArrowPathIcon, CalendarIcon, ClockIcon, MapPinIcon, DocumentTextIcon, ArrowUpTrayIcon } from './AdminIcons';
import {
  EVENT_IMAGE_MAX_BYTES,
  getEventDocumentMime,
  isSafeEventImage,
  normalizeEventDraft,
  parseEventDate,
  validateEventDocumentFile,
  validateEventDraft,
  isValidEventDocumentSignature,
} from '../../utils/eventLogic';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<Event>) => unknown | Promise<unknown>;
  initialData: Partial<Event>;
}

const quillModules = {
  toolbar: [[{ header: [2, 3, 4, false] }], ['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['link'], ['clean']],
};

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...normalizeEventDraft(initialData), date: parseEventDate(initialData.date) || '' });
      setValidationError('');
    }
  }, [isOpen, initialData]);

  const updateField = <K extends keyof Event>(field: K, value: Event[K]) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    setValidationError('');
  };

  const generateRandomImage = () => updateField('image', `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`);

  const readAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Lecture impossible'));
    reader.onerror = () => reject(new Error('Lecture impossible'));
    reader.readAsDataURL(file);
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setValidationError('Formats d’image acceptés : JPG, PNG, WEBP ou GIF.');
      input.value = '';
      return;
    }
    if (file.size <= 0 || file.size > EVENT_IMAGE_MAX_BYTES) {
      setValidationError('L’image doit être valide et ne pas dépasser 5 Mo.');
      input.value = '';
      return;
    }

    setIsUploadingImage(true);
    setValidationError('');
    try {
      const source = await readAsDataUrl(file);
      const compressedImage = await new Promise<string>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          if (!image.naturalWidth || !image.naturalHeight) return reject(new Error('Image invalide'));
          const scale = Math.min(1, 800 / image.naturalWidth, 800 / image.naturalHeight);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const context = canvas.getContext('2d');
          if (!context) return reject(new Error('Compression impossible'));
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        image.onerror = () => reject(new Error('Image illisible'));
        image.src = source;
      });
      if (compressedImage.length > 2 * 1024 * 1024) throw new Error('Image compressée trop volumineuse');
      updateField('image', compressedImage);
    } catch {
      setValidationError('Cette image ne peut pas être traitée. Choisissez une autre image ou utilisez une URL HTTPS.');
    } finally {
      setIsUploadingImage(false);
      input.value = '';
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const metadataError = validateEventDocumentFile(file);
    if (metadataError) {
      setValidationError(metadataError);
      input.value = '';
      return;
    }

    setIsUploadingDocument(true);
    setValidationError('');
    try {
      const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
      if (!isValidEventDocumentSignature(file.name, header)) throw new Error('Signature de fichier incorrecte');
      const dataUrl = await readAsDataUrl(file);
      const comma = dataUrl.indexOf(',');
      if (comma < 0) throw new Error('Fichier invalide');
      updateField('fileUrl', `data:${getEventDocumentMime(file.name)};base64,${dataUrl.slice(comma + 1)}`);
      updateField('fileName', file.name);
    } catch {
      setValidationError('Le document est illisible ou son contenu ne correspond pas à son extension.');
    } finally {
      setIsUploadingDocument(false);
      input.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = validateEventDraft(formData);
    if (message) {
      setValidationError(message);
      return;
    }
    setIsSaving(true);
    setValidationError('');
    try {
      const saved = await onSave(normalizeEventDraft(formData));
      if (saved === false) return;
    } catch {
      setValidationError("L’événement n’a pas pu être enregistré. Vérifiez les champs et réessayez.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveDocument = () => {
    updateField('fileUrl', '');
    updateField('fileName', '');
  };

  if (!isOpen) return null;
  const isBusy = isSaving || isUploadingImage || isUploadingDocument;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 overflow-y-auto" role="presentation">
      <div className="bg-white border border-slate-200 w-full max-w-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{formData.id ? 'Modifier l’événement' : 'Nouvel événement'}</h3>
          <button type="button" onClick={onClose} disabled={isBusy} aria-label="Fermer" className="text-slate-400 hover:text-red-600 p-1 border border-slate-200 bg-white disabled:opacity-50"><XMarkIcon className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          {validationError && <p role="alert" className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{validationError}</p>}
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2 tracking-wide">Image de couverture (facultative)</label>
              {!formData.image ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-slate-300 border-dashed hover:border-slate-900 hover:bg-slate-50 bg-slate-50">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-10 w-10 text-slate-400" />
                    <label htmlFor="event-image-upload" className="relative cursor-pointer text-slate-900 hover:text-slate-700 font-bold uppercase text-[11px]">
                      <span>{isUploadingImage ? 'Traitement…' : 'Téléverser une image'}</span>
                      <input id="event-image-upload" name="event-image-upload" type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,image/gif" disabled={isBusy} onChange={(e) => void handleImageUpload(e)} />
                    </label>
                    <p className="text-[10px] text-slate-500 uppercase">JPG, PNG, WEBP ou GIF · maximum 5 Mo</p>
                  </div>
                </div>
              ) : (
                <div className="relative border border-slate-200 h-40 bg-slate-100">
                  {isSafeEventImage(formData.image) ? <img src={formData.image} alt="Aperçu de l’événement" className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-sm text-slate-500">Image non valide</span>}
                  <button type="button" onClick={() => updateField('image', '')} disabled={isBusy} className="absolute bottom-2 right-2 text-white bg-red-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50">Retirer l’image</button>
                </div>
              )}
              <button type="button" onClick={generateRandomImage} disabled={isBusy} className="mt-2 text-[10px] font-bold uppercase text-slate-500 hover:text-slate-900 flex items-center disabled:opacity-50"><ArrowPathIcon className="h-3 w-3 mr-1" />Image aléatoire</button>
            </div>

            <div>
              <label htmlFor="event-title" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Titre</label>
              <input id="event-title" type="text" required maxLength={180} value={formData.title || ''} onChange={(e) => updateField('title', e.target.value)} className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-sm" placeholder="Nom de l’événement" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-date" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Date</label>
                <div className="relative"><CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" /><input id="event-date" type="date" required value={parseEventDate(formData.date) || ''} onChange={(e) => updateField('date', e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 text-sm" /></div>
              </div>
              <div>
                <label htmlFor="event-time" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Heure</label>
                <div className="relative"><ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" /><input id="event-time" type="text" required maxLength={40} value={formData.time || ''} onChange={(e) => updateField('time', e.target.value)} placeholder="09:00 - 17:00" className="w-full pl-9 pr-3 py-2 border border-slate-300 text-sm" /></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-location" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Lieu</label>
                <div className="relative"><MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" /><input id="event-location" type="text" required maxLength={180} value={formData.location || ''} onChange={(e) => updateField('location', e.target.value)} placeholder="Lieu de l’événement" className="w-full pl-9 pr-3 py-2 border border-slate-300 text-sm" /></div>
              </div>
              <div>
                <label htmlFor="event-status" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Statut</label>
                <select id="event-status" value={formData.status || 'À venir'} onChange={(e) => updateField('status', e.target.value as Event['status'])} className="w-full px-3 py-2 border border-slate-300 text-sm">
                  <option value="À venir">À venir</option><option value="En cours">En cours</option><option value="Terminé">Terminé</option><option value="Annulé">Annulé</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="event-places" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Places / Accès (facultatif)</label>
              <input id="event-places" type="text" maxLength={180} value={formData.places || ''} onChange={(e) => updateField('places', e.target.value)} placeholder="Entrée libre, 50 places…" className="w-full px-3 py-2 border border-slate-300 text-sm" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2 tracking-wide">Document joint — PDF, DOC ou DOCX</label>
              {formData.fileName ? (
                <div className="w-full bg-slate-50 border border-slate-200 px-3 py-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0"><DocumentTextIcon className="w-4 h-4 text-slate-400 shrink-0" /><span className="text-xs font-bold text-slate-700 truncate">{formData.fileName}</span></div>
                  <button type="button" onClick={handleRemoveDocument} disabled={isBusy} className="text-red-600 hover:text-red-800 p-1 shrink-0" aria-label="Supprimer le document"><XMarkIcon className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input id="event-document-url" type="text" value={formData.fileUrl || ''} onChange={(e) => updateField('fileUrl', e.target.value)} placeholder="Lien HTTPS vers le document (facultatif)" className="flex-1 min-w-0 px-3 py-2 border border-slate-300 text-sm" />
                  <label className="flex-shrink-0 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2 cursor-pointer text-center">
                    <span className="text-[11px] font-bold uppercase tracking-widest flex items-center justify-center"><ArrowUpTrayIcon className="w-3.5 h-3.5 mr-2" />{isUploadingDocument ? 'Vérification…' : 'Importer'}</span>
                    <input type="file" className="sr-only" accept=".pdf,.doc,.docx" disabled={isBusy} onChange={(e) => void handleDocumentUpload(e)} />
                  </label>
                </div>
              )}
              <p className="text-[10px] text-slate-500 mt-1">Un programme, une présentation ou des instructions (2 Mo maximum pour un fichier importé).</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Description</label>
              <div className="bg-white [&_.ql-container]:min-h-[200px] [&_.ql-container]:text-sm [&_.ql-editor]:text-slate-800 [&_.ql-editor]:leading-relaxed [&_.ql-toolbar]:border-slate-300 [&_.ql-container]:border-slate-300 [&_.ql-toolbar]:bg-slate-50 [&_.ql-editor.ql-blank::before]:text-slate-400 [&_.ql-editor.ql-blank::before]:font-mono [&_.ql-editor.ql-blank::before]:text-xs">
                <ReactQuill theme="snow" value={formData.description || ''} onChange={(content) => { updateField('description', content); }} modules={quillModules} placeholder="Détails de l’événement…" />
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-200 mt-6">
            <button type="button" onClick={onClose} disabled={isBusy} className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50">Annuler</button>
            <button type="submit" disabled={isBusy} className="px-6 py-2 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50">{isSaving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
