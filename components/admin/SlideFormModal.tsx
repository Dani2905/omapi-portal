
import React, { useState, useEffect } from 'react';
import { Slide } from '../../types';
import { XMarkIcon, PhotoIcon, ArrowPathIcon, TagIcon, LinkIcon, ArrowUpTrayIcon } from './AdminIcons';

interface SlideFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slide: Partial<Slide>) => void;
  initialData: Partial<Slide>;
}

const SlideFormModal: React.FC<SlideFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Slide>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  const generateRandomImage = () => {
    const randomId = Math.floor(Math.random() * 1000);
    setFormData({...formData, image: `https://picsum.photos/1920/800?random=${randomId}`});
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 overflow-y-auto">
        <div className="bg-white border border-slate-200 w-full max-w-2xl overflow-hidden my-auto">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {formData.id ? 'Éditer le slide' : 'Créer un nouveau slide'}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-red-600 p-1 border border-slate-200 bg-white">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
                {/* Live Preview Section */}
                <div className="mb-6">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Prévisualisation</label>
                    <div className="relative w-full h-40 md:h-48 border border-slate-200 bg-slate-900 group">
                        {formData.image ? (
                            <>
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                                <div className="absolute inset-0 bg-slate-900/60"></div>
                                <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                                    <h1 className="text-lg md:text-xl font-bold text-white mb-1 uppercase tracking-tight">
                                        {formData.title || 'Titre du Slide'}
                                    </h1>
                                    <p className="text-[10px] text-slate-300 mb-3 max-w-md uppercase tracking-wide line-clamp-1">
                                        {formData.subtitle || 'Description courte du slide'}
                                    </p>
                                    <span className="bg-white text-slate-900 px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                                        {formData.ctaText || 'Action'}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                <PhotoIcon className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Aucune image</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Image Input Group */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2 tracking-wide">Image de fond</label>
                        
                        {/* URL Input */}
                        <div className="flex mb-3">
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <PhotoIcon className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <input 
                                    type="text" 
                                    className="block w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                    value={formData.image || ''}
                                    onChange={e => setFormData({...formData, image: e.target.value})}
                                    placeholder="https://... (URL de l'image)"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={generateRandomImage}
                                className="ml-2 px-3 py-2 border border-slate-300 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-50 hover:bg-slate-100"
                                title="Générer une image aléatoire"
                            >
                                <ArrowPathIcon className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">Ou upload</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        {/* File Upload */}
                        <div className="mt-2">
                             <label className="flex justify-center px-6 pt-5 pb-6 border border-slate-300 border-dashed cursor-pointer hover:border-slate-900 hover:bg-slate-50 bg-slate-50">
                                <div className="space-y-1 text-center">
                                    <ArrowUpTrayIcon className="mx-auto h-10 w-10 text-slate-400" />
                                    <div className="flex text-[11px] text-slate-600 justify-center font-bold uppercase tracking-tight">
                                        <span className="text-slate-900 hover:text-slate-700">
                                            Télécharger
                                        </span>
                                        <p className="pl-1">ou glisser-déposer</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase">PNG, JPG, GIF (MAX 5MB)</p>
                                </div>
                                <input id="slide-file-upload" name="slide-file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Titre Principal</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                value={formData.title || ''}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="Titre accrocheur"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Sous-titre</label>
                            <textarea 
                                required
                                rows={1}
                                className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none resize-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                value={formData.subtitle || ''}
                                onChange={e => setFormData({...formData, subtitle: e.target.value})}
                                placeholder="Description courte"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Texte du bouton</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <TagIcon className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <input 
                                    type="text" 
                                    required
                                    className="block w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                    value={formData.ctaText || ''}
                                    onChange={e => setFormData({...formData, ctaText: e.target.value})}
                                    placeholder="Ex: En savoir plus"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Lien de destination</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <input 
                                    type="text" 
                                    required
                                    className="block w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                    value={formData.ctaLink || ''}
                                    onChange={e => setFormData({...formData, ctaLink: e.target.value})}
                                    placeholder="/service/..."
                                />
                            </div>
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

export default SlideFormModal;
