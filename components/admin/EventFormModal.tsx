
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Event } from '../../types';
import { XMarkIcon, PhotoIcon, ArrowPathIcon, CalendarIcon, ClockIcon, MapPinIcon, DocumentTextIcon, TagIcon, ArrowUpTrayIcon } from './AdminIcons';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<Event>) => void;
  initialData: Partial<Event>;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Event>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  const generateRandomImage = () => {
    const randomId = Math.floor(Math.random() * 1000);
    setFormData({...formData, image: `https://picsum.photos/800/600?random=${randomId}`});
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            setFormData({ ...formData, image: dataUrl });
          } else {
            setFormData({ ...formData, image: reader.result as string });
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // For real implementation, this would upload to Supabase Storage and get a URL
            // Here, for demonstration, we create a fake URL or use object URL
            const fakeUrl = URL.createObjectURL(file);
            setFormData({ ...formData, fileUrl: fakeUrl, fileName: file.name });
        }
    };

    const handleRemoveDocument = () => {
        setFormData({ ...formData, fileUrl: '', fileName: '' });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 overflow-y-auto">
        <div className="bg-white border border-slate-200 w-full max-w-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {formData.id ? 'Modifier l\'événement' : 'Nouvel événement'}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-red-600 p-1 border border-slate-200 bg-white">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                    
                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2 tracking-wide">Image de couverture</label>
                        
                        {!formData.image ? (
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-slate-300 border-dashed cursor-pointer hover:border-slate-900 hover:bg-slate-50 bg-slate-50">
                                <div className="space-y-1 text-center">
                                    <ArrowUpTrayIcon className="mx-auto h-10 w-10 text-slate-400" />
                                    <div className="flex text-[11px] text-slate-600 justify-center font-bold uppercase tracking-tight">
                                        <label htmlFor="event-image-upload" className="relative cursor-pointer text-slate-900 hover:text-slate-700">
                                            <span>Télécharger</span>
                                            <input id="event-image-upload" name="event-image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                        <p className="pl-1">ou glisser-déposer</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase">PNG, JPG, GIF (MAX 5MB)</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative border border-slate-200 h-40 bg-slate-100 group">
                                {formData.image && (
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                                )}
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({...formData, image: ''})}
                                        className="text-white bg-red-600 px-4 py-2 text-[10px] font-bold uppercase tracking-widest"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={generateRandomImage}
                                className="text-[10px] font-bold uppercase tracking-tight text-slate-500 hover:text-slate-900 flex items-center"
                            >
                                <ArrowPathIcon className="h-3 w-3 mr-1" />
                                Image aléatoire
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Titre</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                            value={formData.title || ''}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="Nom de l'événement"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    placeholder="Ex: 26 Avril 2024"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Heure</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                    value={formData.time || ''}
                                    onChange={e => setFormData({...formData, time: e.target.value})}
                                    placeholder="Ex: 09:00 - 17:00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Lieu</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                    value={formData.location || ''}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                    placeholder="Lieu de l'événement"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Statut</label>
                            <select 
                                required
                                className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white appearance-none cursor-pointer"
                                value={formData.status || 'À venir'}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="À venir">À venir</option>
                                <option value="En cours">En cours</option>
                                <option value="Terminé">Terminé</option>
                                <option value="Annulé">Annulé</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Places / Accès</label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                            value={formData.places || ''}
                            onChange={e => setFormData({...formData, places: e.target.value})}
                            placeholder="Ex: Entrée libre, 50 places..."
                        />
                    </div>

                    {/* Document Upload Section */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2 tracking-wide">Document Joint (PDF, DOCX...)</label>
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            {formData.fileName ? (
                                <div className="flex-1 w-full bg-slate-50 border border-slate-200 px-3 py-2 flex items-center justify-between">
                                    <div className="flex items-center space-x-2 truncate">
                                        <DocumentTextIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">
                                            {formData.fileName}
                                        </span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleRemoveDocument}
                                        className="ml-2 text-red-500 hover:text-red-700 p-1 flex-shrink-0 focus:outline-none"
                                        title="Supprimer le document"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 w-full">
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                        value={formData.fileUrl || ''}
                                        onChange={e => setFormData({...formData, fileUrl: e.target.value})}
                                        placeholder="Collez l'URL du document..."
                                    />
                                </div>
                            )}
                            
                            {!formData.fileName && (
                                <label className="flex-shrink-0 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2 cursor-pointer transition-colors w-full sm:w-auto text-center">
                                    <span className="text-[11px] font-bold uppercase tracking-widest flex items-center justify-center">
                                        <ArrowUpTrayIcon className="w-3.5 h-3.5 mr-2" />
                                        <span>Importer</span>
                                    </span>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept=".pdf,.doc,.docx,.xls,.xlsx" 
                                        onChange={handleDocumentUpload} 
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase">Ajoutez un programme, une présentation ou des instructions relatives à l'événement.</p>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Description</label>
                        <div className="bg-white [&_.ql-container]:min-h-[200px] [&_.ql-container]:text-sm [&_.ql-editor]:text-slate-800 [&_.ql-editor]:leading-relaxed [&_.ql-toolbar]:border-slate-300 [&_.ql-container]:border-slate-300 [&_.ql-toolbar]:bg-slate-50 [&_.ql-editor.ql-blank::before]:text-slate-400 [&_.ql-editor.ql-blank::before]:font-mono [&_.ql-editor.ql-blank::before]:text-xs">
                            <ReactQuill 
                                theme="snow"
                                value={formData.description || ''}
                                onChange={(content: string) => setFormData({...formData, description: content})}
                                modules={quillModules}
                                placeholder="Détails de l'événement..."
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end space-x-3 border-t border-slate-200 mt-6">
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

export default EventFormModal;
