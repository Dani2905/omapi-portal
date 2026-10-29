
import React from 'react';
import { Slide } from '../../types';
import { PlusIcon, PencilSquareIcon, TrashIcon } from './AdminIcons';

interface AdminHeroManagerProps {
  slides: Slide[];
  onAdd: () => void;
  onEdit: (slide: Slide) => void;
  onDelete: (id: number) => void;
}

const AdminHeroManager: React.FC<AdminHeroManagerProps> = ({ slides, onAdd, onEdit, onDelete }) => {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Slides actifs ({slides.length})</h2>
                <p className="text-xs text-slate-500 mt-1">Gestion des bannières de la page d'accueil</p>
            </div>
            <button 
                onClick={onAdd}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-none flex items-center transition-none"
            >
                <PlusIcon className="w-4 h-4 mr-2" />
                Ajouter un slide
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {slides.map((slide) => (
                <div key={slide.id} className="bg-slate-900 rounded-none border border-slate-800 overflow-hidden group">
                    <div className="relative h-48 bg-slate-950 border-b border-slate-800">
                        {slide.image ? (
                            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-none" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aucune image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-none">
                            <button 
                                onClick={() => onEdit(slide)}
                                className="bg-slate-800 p-3 border border-slate-700 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-none" title="Modifier"
                            >
                                <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => onDelete(slide.id)}
                                className="bg-slate-800 p-3 border border-slate-700 text-red-500 hover:bg-red-500 hover:text-white transition-none" title="Supprimer"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="absolute top-2 left-2">
                            <span className="text-[10px] font-mono bg-slate-900/80 text-emerald-400 px-2 py-1 border border-slate-700 uppercase tracking-tighter">
                                ID: {slide.id}
                            </span>
                        </div>
                    </div>
                    <div className="p-5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-2 truncate">{slide.title}</h3>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{slide.subtitle}</p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-4">
                            <span className="truncate max-w-[60%] uppercase tracking-tighter">LINK: {slide.ctaLink}</span>
                            <span className="bg-slate-800 px-2 py-1 text-emerald-400 border border-slate-700 uppercase tracking-tighter">{slide.ctaText}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default AdminHeroManager;
