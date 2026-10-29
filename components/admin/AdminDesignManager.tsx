
import React, { useState, useEffect } from 'react';
import { SiteConfig } from '../../types';
import { CheckIcon, SwatchIcon } from './AdminIcons';

interface AdminDesignManagerProps {
  config: SiteConfig;
  onSave: (config: SiteConfig) => void;
}

const AdminDesignManager: React.FC<AdminDesignManagerProps> = ({ config, onSave }) => {
  const defaultConfig: SiteConfig = {
    newsSectionBgImage: "https://picsum.photos/1920/1080?random=1"
  };
  const [localConfig, setLocalConfig] = useState<SiteConfig>(config || defaultConfig);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalConfig(prev => ({ ...prev, [name]: value }));
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
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Configuration du Design</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Personnalisez l'apparence visuelle du site.</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-sm text-blue-600 border border-blue-200">
                    <SwatchIcon className="w-5 h-5" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-3xl">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Image de fond de la section Actualités</label>
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            name="newsSectionBgImage"
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-sm focus:border-blue-500 outline-none bg-slate-50 text-slate-900 text-[11px] font-bold uppercase tracking-tight"
                            value={localConfig.newsSectionBgImage || ''}
                            onChange={handleChange}
                            placeholder="URL de l'image (ex: https://...)"
                        />
                        <button 
                            onClick={() => setLocalConfig(prev => ({ ...prev, newsSectionBgImage: `https://picsum.photos/1920/1080?random=${Math.floor(Math.random() * 1000)}` }))}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-slate-200 transition-colors"
                        >
                            Aléatoire
                        </button>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100 mt-8 pt-6">
                 <h3 className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-widest">Aperçu de l'image</h3>
                 {localConfig.newsSectionBgImage ? (
                     <div className="relative aspect-video w-full max-w-xl rounded-sm overflow-hidden border border-slate-200 bg-slate-100">
                        <img 
                            src={localConfig.newsSectionBgImage} 
                            alt="Aperçu" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em] drop-shadow-md">Section Actualités</span>
                        </div>
                     </div>
                 ) : (
                     <div className="aspect-video w-full max-w-xl rounded-sm border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Aucune image sélectionnée</span>
                     </div>
                 )}
            </div>

            <div className="flex justify-end pt-8">
                <button 
                    onClick={handleSave}
                    className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm border border-blue-700 transition-all active:scale-95"
                >
                    {showSuccess ? (
                        <>
                            <CheckIcon className="w-4 h-4 mr-2" /> 
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

export default AdminDesignManager;
