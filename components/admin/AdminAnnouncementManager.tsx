
import React, { useState } from 'react';
import { Announcement } from '../../types';
import { MegaphoneIcon, SpeakerWaveIcon, PlusIcon, TrashIcon, CheckIcon } from './AdminIcons';

interface AdminAnnouncementManagerProps {
  announcements: Announcement[];
  onSave: (data: Partial<Announcement>) => void | boolean | Promise<void | boolean>;
  onDelete: (id: number) => void;
}

const AdminAnnouncementManager: React.FC<AdminAnnouncementManagerProps> = ({ announcements, onSave, onDelete }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || isSaving) return;

    setIsSaving(true);
    try {
      const saved = await onSave({ text, isActive: true });
      // En cas d’échec localStorage, conserver le texte saisi pour permettre
      // une nouvelle tentative au lieu de le vider malgré la notification.
      if (saved !== false) {
        setNewMessage('');
        setSaveError(null);
      }
    } catch {
      setSaveError("Le message n'a pas été enregistré. Votre saisie est conservée ; réessayez.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (item: Announcement) => {
    onSave({
      ...item,
      isActive: !item.isActive
    });
  };

  // Concaténation pour la prévisualisation
  const activeMessages = announcements
    .filter(a => a.isActive)
    .map(a => a.text)
    .join("   •   ");

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
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ajouter un nouveau message</label>
                <div className="flex gap-3">
                    <div className="relative flex-grow">
                        <div className="absolute top-2.5 left-3 pointer-events-none">
                            <MegaphoneIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
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
                {saveError && <p role="alert" className="text-xs text-red-700 mt-2">{saveError}</p>}
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
                                        onClick={() => handleToggle(item)}
                                        className={`px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${
                                            item.isActive 
                                            ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' 
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {item.isActive ? 'Actif' : 'Inactif'}
                                    </button>
                                    <button 
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
                {activeMessages ? (
                    <div className="bg-slate-900 text-white px-4 py-3 rounded-sm border border-slate-950 flex items-center overflow-hidden">
                        <div className="bg-white/10 p-1.5 rounded-sm mr-3 flex-shrink-0">
                            <MegaphoneIcon className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="overflow-hidden whitespace-nowrap w-full">
                            <p className="text-[11px] font-mono font-bold uppercase tracking-widest inline-block">
                                {activeMessages}
                            </p>
                        </div>
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
