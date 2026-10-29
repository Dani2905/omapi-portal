
import React, { useState, useEffect } from 'react';
import { HomeScamConfig } from '../../types';
import { CheckIcon, ExclamationTriangleIcon } from './AdminIcons';

interface AdminScamManagerProps {
  config: HomeScamConfig;
  onSave: (config: HomeScamConfig) => void;
}

const AdminScamManager: React.FC<AdminScamManagerProps> = ({ config, onSave }) => {
  const defaultConfig: HomeScamConfig = {
      title: "Les arnaques augmentent",
      subtitle: "Signes courants des escroqueries aux marques et brevets",
      description: "Des entités non officielles envoient des factures trompeuses aux déposants de brevets et de marques. Apprenez à repérer ces fraudes et protégez vos droits de propriété intellectuelle."
  };
  const [localConfig, setLocalConfig] = useState<HomeScamConfig>(config || defaultConfig);
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
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Section Alerte Arnaques</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Modifiez le contenu du bloc d'avertissement visible sur la page d'accueil.</p>
                </div>
                <div className="bg-amber-50 p-2 rounded-sm text-amber-600 border border-amber-200">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 max-w-3xl">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Titre Principal</label>
                    <input 
                        type="text" 
                        name="title"
                        className="w-full px-4 py-2 border border-slate-200 rounded-sm focus:border-amber-500 outline-none bg-slate-50 text-slate-900 text-[11px] font-bold uppercase tracking-tight"
                        value={localConfig.title}
                        onChange={handleChange}
                        placeholder="Ex: Les arnaques augmentent"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Sous-titre (en couleur)</label>
                    <input 
                        type="text" 
                        name="subtitle"
                        className="w-full px-4 py-2 border border-slate-200 rounded-sm focus:border-amber-500 outline-none bg-slate-50 text-slate-900 text-[11px] font-bold uppercase tracking-tight"
                        value={localConfig.subtitle}
                        onChange={handleChange}
                        placeholder="Ex: Signes courants des escroqueries..."
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                    <textarea 
                        rows={4}
                        name="description"
                        className="w-full px-4 py-2 border border-slate-200 rounded-sm focus:border-amber-500 outline-none resize-none bg-slate-50 text-slate-900 text-[11px] leading-relaxed"
                        value={localConfig.description}
                        onChange={handleChange}
                        placeholder="Texte explicatif pour prévenir les utilisateurs..."
                    />
                </div>
            </div>

            <div className="border-t border-slate-100 mt-8 pt-6">
                 <h3 className="text-[10px] font-bold text-slate-500 mb-4 uppercase tracking-widest">Aperçu Visuel</h3>
                 <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-sm max-w-3xl border border-amber-100">
                    <div className="flex items-start mb-4">
                        <div className="bg-amber-500 text-white p-1.5 rounded-sm mr-4 mt-1">
                            <ExclamationTriangleIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 mb-1 uppercase tracking-tight">{localConfig.title}</h2>
                            <p className="text-amber-700 text-[11px] font-bold uppercase tracking-widest">{localConfig.subtitle}</p>
                        </div>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                        {localConfig.description}
                    </p>
                 </div>
            </div>

            <div className="flex justify-end pt-8">
                <button 
                    onClick={handleSave}
                    className="flex items-center px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-sm border border-amber-700"
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

export default AdminScamManager;
