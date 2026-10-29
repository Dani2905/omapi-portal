
import React, { useState, useEffect } from 'react';
import { HomeResourcesConfig } from '../../types';
import { CheckIcon, PlayCircleIcon, ClockIcon, PhotoIcon, ArrowUpTrayIcon } from './AdminIcons';

interface AdminResourcesManagerProps {
  config: HomeResourcesConfig;
  onSave: (config: HomeResourcesConfig) => void;
}

const AdminResourcesManager: React.FC<AdminResourcesManagerProps> = ({ config, onSave }) => {
  const defaultConfig: HomeResourcesConfig = {
      omapiHourTitle: "L'Heure OMAPI",
      omapiHourDesc: "Rejoignez-nous mensuellement pour partager nos priorités et discuter des avancées de la propriété industrielle à Madagascar.",
      videoTitle: "Comment vérifier le statut de votre demande",
      videoDesc: "Un guide vidéo rapide pour naviguer dans notre portail et suivre l'avancement de vos dépôts de marques en temps réel.",
      videoThumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      videoDuration: "02:45"
  };
  const [localConfig, setLocalConfig] = useState<HomeResourcesConfig>(config || defaultConfig);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof HomeResourcesConfig) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;

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
            // Compress to JPEG with 0.6 quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            setLocalConfig(prev => ({ ...prev, [fieldName]: dataUrl }));
          } else {
            // Fallback
            setLocalConfig(prev => ({ ...prev, [fieldName]: reader.result as string }));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(localConfig);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
        <div className="bg-white rounded-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div>
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Ressources Vedettes</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Gérez les blocs "L'Heure OMAPI" et la vidéo mise en avant sur l'accueil.</p>
                </div>
                <div className="bg-slate-100 p-2 rounded-sm text-slate-600 border border-slate-200">
                    <PlayCircleIcon className="w-5 h-5" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Bloc Heure OMAPI */}
                <div className="space-y-6">
                    <div className="flex items-center pb-2 border-b border-slate-100">
                        <ClockIcon className="w-4 h-4 text-slate-400 mr-2" />
                        <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Bloc "L'Heure OMAPI"</h3>
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Titre</label>
                        <input 
                            type="text" 
                            name="omapiHourTitle"
                            className="w-full px-4 py-2 border border-slate-200 rounded-sm focus:border-blue-500 outline-none bg-slate-50 text-slate-900 text-[11px] font-bold uppercase tracking-tight"
                            value={localConfig.omapiHourTitle}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                        <textarea 
                            rows={4}
                            name="omapiHourDesc"
                            className="w-full px-4 py-2 border border-slate-200 rounded-sm focus:border-blue-500 outline-none resize-none bg-slate-50 text-slate-900 text-[11px] leading-relaxed"
                            value={localConfig.omapiHourDesc}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Image Miniature</label>
                        
                        {localConfig.omapiHourThumbnail && (
                            <div className="mt-2 mb-4 relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 shadow-sm mx-auto flex items-center justify-center bg-slate-100">
                                <img src={localConfig.omapiHourThumbnail} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => setLocalConfig(prev => ({ ...prev, omapiHourThumbnail: '' }))}
                                    className="absolute top-1 right-1 bg-white text-red-500 hover:bg-slate-50 p-1 rounded-sm shadow border border-slate-200"
                                >
                                    <span className="sr-only">Retirer logo</span>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                        
                        <label className="flex justify-center px-6 pt-5 pb-6 border border-slate-300 border-dashed cursor-pointer hover:border-slate-900 hover:bg-slate-50 bg-slate-50">
                            <div className="space-y-1 text-center">
                                <ArrowUpTrayIcon className="mx-auto h-8 w-8 text-slate-400" />
                                <div className="flex text-[11px] text-slate-600 justify-center font-bold uppercase tracking-tight">
                                    <span className="text-slate-900 hover:text-slate-700">Télécharger</span>
                                    <p className="pl-1">ou glisser-déposer</p>
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase">PNG, JPG</p>
                            </div>
                            <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageUpload(e, 'omapiHourThumbnail')} />
                        </label>
                        <p className="text-[9px] mt-1 text-slate-400 uppercase tracking-wider text-right">Idéalement format carré (1:1)</p>
                    </div>
                </div>

                {/* Bloc Vidéo */}
                <div className="space-y-6">
                    <div className="flex items-center pb-2 border-b border-slate-100">
                        <PlayCircleIcon className="w-4 h-4 text-slate-400 mr-2" />
                        <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Bloc Vidéo / Tutoriel</h3>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Titre de la vidéo</label>
                        <input 
                            type="text" 
                            name="videoTitle"
                            className="w-full px-4 py-2 border border-slate-200 rounded-sm focus:border-blue-500 outline-none bg-slate-50 text-slate-900 text-[11px] font-bold uppercase tracking-tight"
                            value={localConfig.videoTitle}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description courte</label>
                        <textarea 
                            rows={2}
                            name="videoDesc"
                            className="w-full px-4 py-2 border border-slate-200 rounded-sm focus:border-blue-500 outline-none resize-none bg-slate-50 text-slate-900 text-[11px] leading-relaxed"
                            value={localConfig.videoDesc}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Image Miniature de la Vidéo</label>
                            
                            {localConfig.videoThumbnail && (
                                <div className="mt-2 mb-4 relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center bg-slate-100">
                                    <img src={localConfig.videoThumbnail} alt="Preview vidéo" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <PlayCircleIcon className="w-12 h-12 text-white opacity-80" />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setLocalConfig(prev => ({ ...prev, videoThumbnail: '' }))}
                                        className="absolute top-2 right-2 bg-white text-red-500 hover:bg-slate-50 p-1.5 rounded-md shadow border border-slate-200"
                                    >
                                        <span className="sr-only">Retirer image</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            )}

                            <label className="flex justify-center px-6 pt-5 pb-6 border border-slate-300 border-dashed cursor-pointer hover:border-slate-900 hover:bg-slate-50 bg-slate-50">
                                <div className="space-y-1 text-center">
                                    <PhotoIcon className="mx-auto h-8 w-8 text-slate-400" />
                                    <div className="flex text-[11px] text-slate-600 justify-center font-bold uppercase tracking-tight">
                                        <span className="text-slate-900 hover:text-slate-700">Télécharger</span>
                                        <p className="pl-1">ou glisser-déposer</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase">PNG, JPG (Format Paysage 16:9)</p>
                                </div>
                                <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleImageUpload(e, 'videoThumbnail')} />
                            </label>
                        </div>
                        
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Durée (Optionnel)</label>
                            <input 
                                type="text" 
                                name="videoDuration"
                                className="w-full px-4 py-2 border border-slate-200 rounded-sm focus:border-blue-500 outline-none bg-slate-50 text-slate-900 text-[11px] font-mono"
                                value={localConfig.videoDuration}
                                onChange={handleChange}
                                placeholder="Ex: 02:45"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8 mt-4 border-t border-slate-100">
                <button 
                    onClick={handleSave}
                    className="flex items-center px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-sm border border-slate-900 transition-colors"
                >
                    {showSuccess ? (
                        <>
                            <CheckIcon className="w-4 h-4 mr-2 text-green-400" /> 
                            <span className="text-[10px] font-bold uppercase tracking-widest">Enregistré !</span>
                        </>
                    ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest">Enregistrer les modifications</span>
                    )}
                </button>
            </div>
        </div>
    </div>
  );
};

export default AdminResourcesManager;
