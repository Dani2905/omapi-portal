
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { NewsItem } from '../../types';
import { 
  XMarkIcon, PhotoIcon, ArrowPathIcon, TagIcon, CalendarIcon, 
  NewspaperIcon, ArrowUpTrayIcon, StarIcon, EyeIcon
} from './AdminIcons';

interface NewsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (news: Partial<NewsItem>) => void;
  initialData: Partial<NewsItem>;
}

const NewsFormModal: React.FC<NewsFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<NewsItem>>({});
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setActiveTab('edit');
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
      ['link', 'blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 overflow-y-auto">
        <div className="bg-white border border-slate-200 w-full max-w-4xl overflow-hidden my-auto h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        {formData.id ? 'Éditer l\'actualité' : 'Ajouter une actualité'}
                    </h3>
                    <div className="flex bg-slate-200 p-0.5 text-[10px] font-bold uppercase tracking-tight">
                        <button
                            type="button"
                            onClick={() => setActiveTab('edit')}
                            className={`px-3 py-1 border ${activeTab === 'edit' ? 'bg-white text-slate-900 border-slate-300' : 'text-slate-500 hover:text-slate-700 border-transparent'}`}
                        >
                            Édition
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preview')}
                            className={`px-3 py-1 border flex items-center ${activeTab === 'preview' ? 'bg-white text-slate-900 border-slate-300' : 'text-slate-500 hover:text-slate-700 border-transparent'}`}
                        >
                            <EyeIcon className="w-3 h-3 mr-1" /> Aperçu
                        </button>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-red-600 p-1 border border-slate-200 bg-white">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
            
            <div className="flex-grow overflow-hidden flex">
                <form onSubmit={handleSubmit} className="w-full flex flex-col h-full">
                    <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                        
                        {activeTab === 'preview' ? (
                            <div className="space-y-6 max-w-3xl mx-auto">
                                <div className="bg-white border border-slate-200 p-8">
                                    <h1 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-tight">{formData.title || 'Titre de l\'article'}</h1>
                                    {formData.image && (
                                        <img src={formData.image} alt="Cover" className="w-full h-64 object-cover border border-slate-200 mb-6 grayscale" />
                                    )}
                                    <div className="prose prose-slate max-w-none text-slate-600 text-sm">
                                        {formData.content ? (
                                            <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                                        ) : (
                                            <p className="italic text-slate-400 font-mono text-xs uppercase tracking-widest">Aucun contenu...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    
                                    {/* Left Column: Main Info */}
                                    <div className="lg:col-span-2 space-y-5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Titre de l'article</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <NewspaperIcon className="h-3.5 w-3.5 text-slate-400" />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    required
                                                    className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-900 bg-white placeholder-slate-400 font-bold uppercase tracking-tight"
                                                    value={formData.title || ''}
                                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                                    placeholder="TITRE DE L'ARTICLE"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-1.5">
                                                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">Contenu de l'article</label>
                                              </div>
                                              
                                              {/* ReactQuill Editor */}
                                              <div className="bg-white [&_.ql-container]:min-h-[300px] [&_.ql-container]:text-sm [&_.ql-editor]:text-slate-800 [&_.ql-editor]:leading-relaxed [&_.ql-toolbar]:border-slate-300 [&_.ql-container]:border-slate-300 [&_.ql-toolbar]:bg-slate-50 [&_.ql-editor.ql-blank::before]:text-slate-400 [&_.ql-editor.ql-blank::before]:font-mono [&_.ql-editor.ql-blank::before]:text-xs">
                                                  <ReactQuill 
                                                      theme="snow"
                                                      value={formData.content || ''}
                                                      onChange={(content: string) => setFormData({...formData, content})}
                                                      modules={quillModules}
                                                      placeholder="Rédigez votre article ici..."
                                                  />
                                              </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Meta & Image */}
                                    <div className="space-y-5">
                                        {/* Image Section */}
                                        <div className="bg-slate-50 p-4 border border-slate-200">
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2 tracking-wide">Image de couverture</label>
                                            <div className="relative h-32 overflow-hidden bg-slate-200 border border-slate-300 mb-3 group">
                                                {formData.image ? (
                                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                                        <PhotoIcon className="w-6 h-6 mb-1 opacity-30" />
                                                        <span className="text-[9px] font-bold uppercase tracking-tighter">Aucune image</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <button
                                                        type="button"
                                                        onClick={generateRandomImage}
                                                        className="bg-white text-slate-900 text-[9px] font-bold uppercase tracking-widest px-2 py-1 border border-slate-300 hover:bg-slate-50"
                                                    >
                                                        <ArrowPathIcon className="w-3 h-3 inline mr-1" />
                                                        Aléatoire
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <input 
                                                    type="text" 
                                                    className="w-full px-2 py-1.5 border border-slate-300 text-[10px] text-slate-700 bg-white outline-none focus:border-slate-900 placeholder-slate-400 font-mono"
                                                    value={formData.image || ''}
                                                    onChange={e => setFormData({...formData, image: e.target.value})}
                                                    placeholder="HTTPS://..."
                                                />
                                                <label className="block w-full text-center px-2 py-1.5 border border-slate-300 border-dashed text-[9px] font-bold uppercase tracking-widest text-slate-500 cursor-pointer hover:bg-slate-100">
                                                    <ArrowUpTrayIcon className="w-3 h-3 inline mr-1" /> Uploader
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="bg-white p-4 border border-slate-200 space-y-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Catégorie</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <TagIcon className="h-3.5 w-3.5 text-slate-400" />
                                                    </div>
                                                    <select 
                                                        required
                                                        className="w-full pl-9 px-3 py-2 border border-slate-300 text-[10px] font-bold uppercase tracking-tight text-slate-700 bg-white outline-none focus:border-slate-900 cursor-pointer appearance-none"
                                                        value={formData.category || ''}
                                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                                    >
                                                        <option value="">SÉLECTIONNER...</option>
                                                        <option value="Annonce">ANNONCE</option>
                                                        <option value="Blog">BLOG DU DIRECTEUR</option>
                                                        <option value="Déclaration">DÉCLARATION</option>
                                                        <option value="Événement">ÉVÉNEMENT</option>
                                                        <option value="International">INTERNATIONAL</option>
                                                        <option value="Juridique">JURIDIQUE</option>
                                                        <option value="Formation">FORMATION</option>
                                                        <option value="Innovation">INNOVATION</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Date de publication</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        required
                                                        className="w-full pl-9 px-3 py-2 border border-slate-300 text-[10px] font-mono text-slate-700 bg-white outline-none focus:border-slate-900 placeholder-slate-400"
                                                        value={formData.date || ''}
                                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                                        placeholder="EX: 15 OCT 2023"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Description courte</label>
                                                <textarea 
                                                    required
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-slate-300 text-[10px] font-medium text-slate-700 bg-white outline-none focus:border-slate-900 resize-none placeholder-slate-400"
                                                    value={formData.description || ''}
                                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                                    placeholder="RÉSUMÉ POUR LA CARTE..."
                                                />
                                            </div>

                                            <div className="pt-2 border-t border-slate-100">
                                                <label className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-slate-50">
                                                    <input 
                                                        type="checkbox"
                                                        className="form-checkbox h-3 w-3 text-slate-900 border-slate-300 focus:ring-0"
                                                        checked={formData.featured || false}
                                                        onChange={e => setFormData({...formData, featured: e.target.checked})}
                                                    />
                                                    <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900">
                                                        <StarIcon className={`w-3 h-3 mr-2 ${formData.featured ? 'text-yellow-500 fill-yellow-500' : 'text-slate-400'}`} />
                                                        Mettre à la une
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50 flex-shrink-0">
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
                            Enregistrer l'article
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default NewsFormModal;
