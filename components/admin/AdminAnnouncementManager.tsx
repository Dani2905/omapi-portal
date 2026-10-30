
import React, { useState } from 'react';
import { Announcement } from '../../types';
import { MegaphoneIcon, SpeakerWaveIcon, PlusIcon, TrashIcon } from './AdminIcons';
import { getActiveAnnouncements, MAX_ANNOUNCEMENT_LENGTH, normalizeAnnouncementText, validateAnnouncementText } from '../../utils/announcementLogic';
import { useAnnouncementRotation } from '../../hooks/useAnnouncementRotation';

interface AdminAnnouncementManagerProps {
  announcements: Announcement[];
  onSave: (data: Partial<Announcement>) => void | boolean | Promise<void | boolean>;
  onDelete: (id: number) => void;
}

const AdminAnnouncementManager: React.FC<AdminAnnouncementManagerProps> = ({ announcements, onSave, onDelete }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<number>>(() => new Set());
  const activeAnnouncements = getActiveAnnouncements(announcements);
  const rotation = useAnnouncementRotation(activeAnnouncements.length);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = normalizeAnnouncementText(newMessage);
    const validationError = validateAnnouncementText(text);
    if (validationError) {
      setSaveError(validationError);
      return;
    }
    if (isSaving) return;

    setIsSaving(true);
    try {
      const saved = await onSave({ text, isActive: true });
      if (saved === false) {
        setSaveError("Le message n'a pas été enregistré. Votre saisie est conservée ; réessayez.");
        return;
      }
      setNewMessage('');
      setSaveError(null);
    } catch {
      setSaveError("Le message n'a pas été enregistré. Votre saisie est conservée ; réessayez.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (item: Announcement) => {
    if (savingIds.has(item.id)) return;
    setSavingIds((current) => new Set(current).add(item.id));
    setActionError(null);
    try {
      const saved = await onSave({ ...item, isActive: !item.isActive });
      if (saved === false) setActionError('Le changement de statut n’a pas été enregistré. Réessayez.');
    } catch {
      setActionError('Le changement de statut n’a pas été enregistré. Réessayez.');
    } finally {
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
        <div className="bg-white rounded-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Bandeau d'Information</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Gérez les messages défilants affichés sous le slider principal.</p>
                </div>
                <div className="bg-slate-100 p-2 rounded-sm border border-slate-200 text-slate-600">
                    <SpeakerWaveIcon className="w-5 h-5" />
                </div>
            </div>

            {/* Formulaire d'ajout */}
            <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-sm border border-slate-200 mb-8">
                <label htmlFor="announcement-message" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ajouter un nouveau message</label>
                <div className="flex gap-3">
                    <div className="relative flex-grow">
                        <div className="absolute top-2.5 left-3 pointer-events-none">
                            <MegaphoneIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            id="announcement-message"
                            type="text"
                            required
                            maxLength={MAX_ANNOUNCEMENT_LENGTH}
                            aria-invalid={Boolean(saveError)}
                            aria-describedby="announcement-message-help"
                            className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-sm text-[11px] focus:border-blue-500 outline-none text-slate-700 bg-white placeholder-slate-400 font-bold uppercase tracking-tight"
                            value={newMessage}
                            onChange={(e) => { setNewMessage(e.target.value); setSaveError(null); }}
                            placeholder="EX: FERMETURE EXCEPTIONNELLE LE..."
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={!newMessage.trim() || isSaving}
                        className={`px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center border ${
                            newMessage.trim() && !isSaving
                            ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        {isSaving ? 'Enregistrement…' : 'Ajouter'}
                    </button>
                </div>
                <div id="announcement-message-help" className="mt-2 flex justify-between text-[10px] text-slate-500">
                    <span>Message bref, affiché sur le site public.</span>
                    <span aria-live="polite">{newMessage.length}/{MAX_ANNOUNCEMENT_LENGTH}</span>
                </div>
                {saveError && <p role="alert" className="text-xs text-red-700 mt-2">{saveError}</p>}
                {actionError && <p role="alert" className="text-xs text-red-700 mt-2">{actionError}</p>}
            </form>

            {/* Liste des annonces */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Messages enregistrés</h3>
                {announcements.length > 0 ? (
                    <div className="space-y-2">
                        {announcements.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-sm border border-slate-200 group">
                                <div className="flex items-center flex-1 mr-4">
                                    <div className={`w-1 h-8 rounded-sm mr-4 ${item.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                    <p className={`text-[11px] font-bold uppercase tracking-tight ${item.isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                                        {item.text}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => void handleToggle(item)}
                                        disabled={savingIds.has(item.id)}
                                        aria-pressed={item.isActive}
                                        className={`px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest border disabled:opacity-50 ${
                                            item.isActive
                                            ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {savingIds.has(item.id) ? 'Enregistrement…' : item.isActive ? 'Actif' : 'Inactif'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(item.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-sm border border-transparent hover:border-slate-200 hover:bg-slate-50"
                                        title="Supprimer"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-sm border border-dashed border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Aucun message configuré</p>
                    </div>
                )}
            </div>

            {/* Prévisualisation */}
            <div className="border-t border-slate-100 mt-8 pt-6">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Prévisualisation du bandeau</h3>
                {activeAnnouncements.length > 0 ? (
                    <div className="bg-[#002B49] text-white px-4 py-3 rounded-sm border border-[#003861] flex items-center gap-3 overflow-hidden">
                        <MegaphoneIcon className="w-4 h-4 text-amber-300 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 shrink-0">Avis officiel</span>
                        <span className="text-white/40 shrink-0" aria-hidden="true">|</span>
                        <p className="min-w-0 flex-1 truncate text-[11px] font-medium" aria-live="polite" aria-atomic="true">
                            {activeAnnouncements[rotation.index]?.text}
                        </p>
                        {activeAnnouncements.length > 1 && (
                            <div className="flex items-center gap-1 shrink-0 text-white/70 text-[10px]">
                                <span>{rotation.index + 1}/{activeAnnouncements.length}</span>
                                <button type="button" onClick={rotation.previous} className="p-1 hover:text-white" aria-label="Annonce précédente">&larr;</button>
                                <button type="button" onClick={rotation.next} className="p-1 hover:text-white" aria-label="Annonce suivante">&rarr;</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-sm p-6 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Aucun message actif. Le bandeau ne sera pas visible sur le site.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default AdminAnnouncementManager;
