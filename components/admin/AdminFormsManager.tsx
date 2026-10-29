import React, { useState } from 'react';
import { Formulaire, Guide } from '../../types';
import {
  ArrowRightOnRectangleIcon, BanknotesIcon, BookOpenIcon,
} from './AdminIcons';
import {
  FORM_CATEGORIES,
  getLibraryPlainText,
  isAllowedLibraryUrl,
} from '../../utils/documentLibraryLogic';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, DocumentTextIcon, FolderIcon,
  CheckIcon, GlobeAltIcon, LightBulbIcon, SwatchIcon, TagIcon,
} from './AdminIcons';

interface AdminFormsManagerProps {
  forms: Formulaire[];
  guides: Guide[];
  onAddForm: () => void;
  onEditForm: (form: Formulaire) => void;
  onDeleteForm: (id: number) => Promise<boolean> | boolean;
  onAddGuide: () => void;
  onEditGuide: (guide: Guide) => void;
  onDeleteGuide: (id: number) => Promise<boolean> | boolean;
}

const UNCATEGORIZED = '__forms_no_category__';
const AdminFormsManager: React.FC<AdminFormsManagerProps> = ({
  forms, guides, onAddForm, onEditForm, onDeleteForm, onAddGuide, onEditGuide, onDeleteGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'forms' | 'guides'>('forms');
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ type: 'form' | 'guide'; id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = [
    ...FORM_CATEGORIES.map((category) => ({ id: category, label: category })),
    ...(forms.some((form) => !String(form.category || '').trim()) ? [{ id: UNCATEGORIZED, label: 'Catégorie non définie' }] : []),
    ...Array.from(new Set(forms.map((form) => String(form.category || '').trim()).filter(Boolean)))
      .filter((category) => !FORM_CATEGORIES.includes(category as typeof FORM_CATEGORIES[number]))
      .map((category) => ({ id: category, label: `À corriger : ${category}` })),
  ];

  const getThemeClass = (theme: string) => {
    switch (theme) {
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'amber': return 'bg-amber-100 text-amber-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'emerald': return 'bg-emerald-100 text-emerald-800';
      case 'orange': return 'bg-orange-100 text-orange-800';
      case 'gray': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getGuideIcon = (name: string) => {
    switch (name) {
      case 'tag': return TagIcon;
      case 'bulb': return LightBulbIcon;
      case 'swatch': return SwatchIcon;
      case 'globe': return GlobeAltIcon;
      case 'banknotes': return BanknotesIcon;
      case 'book':
      default: return BookOpenIcon;
    }
  };

  const askDelete = (type: 'form' | 'guide', id: number, title: string) => {
    setActionError(null);
    setPendingDelete({ type, id, title });
  };

  const confirmDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      const remove = pendingDelete.type === 'form' ? onDeleteForm : onDeleteGuide;
      const deleted = await remove(pendingDelete.id);
      if (!deleted) {
        setActionError('La suppression a échoué. Le document est toujours enregistré ; actualisez puis réessayez.');
        return;
      }
      setPendingDelete(null);
    } catch {
      setActionError('Une erreur a empêché la suppression. Le document est conservé ; réessayez.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-0 bg-slate-800 border border-slate-700 w-fit">
        <button type="button" onClick={() => setActiveTab('forms')} className={`px-6 py-2.5 text-xs font-bold tracking-widest uppercase ${activeTab === 'forms' ? 'bg-slate-700 text-white border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
          Formulaires ({forms.length})
        </button>
        <button type="button" onClick={() => setActiveTab('guides')} className={`px-6 py-2.5 text-xs font-bold tracking-widest uppercase ${activeTab === 'guides' ? 'bg-slate-700 text-white border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
          Guides pratiques ({guides.length})
        </button>
      </div>

      {actionError && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{actionError}</p>}

      {activeTab === 'forms' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Documents administratifs</h2>
              <p className="text-xs text-slate-500 mt-1">Gestion des formulaires de dépôt et procédures</p>
            </div>
            <button type="button" onClick={onAddForm} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 flex items-center">
              <PlusIcon className="w-4 h-4 mr-2" />Ajouter un formulaire
            </button>
          </div>

          {forms.length === 0 && <div className="bg-slate-900 border border-slate-800 p-10 text-center text-sm text-slate-400">Aucun formulaire enregistré.</div>}
          <div className="grid grid-cols-1 gap-8">
            {categories.map(({ id, label }) => {
              const categoryForms = forms.filter((form) => id === UNCATEGORIZED
                ? !String(form.category || '').trim()
                : String(form.category || '').trim() === id);
              if (!categoryForms.length) return null;
              return (
                <section key={id} className="bg-slate-900 border border-slate-800 overflow-hidden">
                  <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center"><FolderIcon className="w-4 h-4 text-emerald-500 mr-2" /><h3 className="text-xs font-bold text-white uppercase tracking-widest">{label}</h3></div>
                    <span className="text-[10px] font-mono bg-slate-700 text-emerald-400 px-2 py-0.5 border border-slate-600">{categoryForms.length} DOCUMENT(S)</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {categoryForms.map((form) => (
                      <div key={form.id} className="p-4 hover:bg-slate-800/30 flex items-center justify-between gap-4 group">
                        <div className="flex items-start space-x-4 min-w-0">
                          <div className="bg-slate-800 text-emerald-500 p-2 border border-slate-700 shrink-0"><DocumentTextIcon className="w-5 h-5" /></div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-200">{form.title || 'Sans titre'}</h4>
                            <p className="text-xs text-slate-500 mt-1">{getLibraryPlainText(form.description)}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 border border-slate-700 uppercase">{form.fileName || (isAllowedLibraryUrl(form.fileUrl) ? 'Document associé' : 'Aucun fichier valide')}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 ${isAllowedLibraryUrl(form.fileUrl) ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-300'}`}>{isAllowedLibraryUrl(form.fileUrl) ? 'Prêt au téléchargement' : 'À réparer'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 shrink-0">
                          <button type="button" onClick={() => onEditForm(form)} className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400" title="Modifier" aria-label={`Modifier ${form.title}`}><PencilSquareIcon className="w-4 h-4" /></button>
                          <button type="button" onClick={() => askDelete('form', form.id, form.title || 'ce formulaire')} className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400" title="Supprimer" aria-label={`Supprimer ${form.title}`}><TrashIcon className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'guides' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div><h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Guides et tutoriels</h2><p className="text-xs text-slate-500 mt-1">Documentation d’aide et guides pratiques</p></div>
            <button type="button" onClick={onAddGuide} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 flex items-center"><PlusIcon className="w-4 h-4 mr-2" />Ajouter un guide</button>
          </div>
          {guides.length === 0 && <div className="bg-slate-900 border border-slate-800 p-10 text-center text-sm text-slate-400">Aucun guide enregistré.</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide) => {
              const Icon = getGuideIcon(guide.iconName);
              const points = Array.isArray(guide.points) ? guide.points.filter((point) => typeof point === 'string' && point.trim()) : [];
              return (
                <article key={guide.id} className="bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 border border-slate-700 ${getThemeClass(guide.colorTheme)}`}><Icon className="w-6 h-6" /></div>
                      <div className="flex space-x-2">
                        <button type="button" onClick={() => onEditGuide(guide)} className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400" title="Modifier" aria-label={`Modifier ${guide.title}`}><PencilSquareIcon className="w-4 h-4" /></button>
                        <button type="button" onClick={() => askDelete('guide', guide.id, guide.title || 'ce guide')} className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400" title="Supprimer" aria-label={`Supprimer ${guide.title}`}><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-2">{guide.title || 'Sans titre'}</h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{getLibraryPlainText(guide.description)}</p>
                    <div className="space-y-2">
                      {points.slice(0, 2).map((point, index) => <div key={`${guide.id}-${index}`} className="flex items-center text-[10px] uppercase tracking-wider text-slate-400"><CheckIcon className="w-3 h-3 text-emerald-500 mr-2 shrink-0" /><span className="truncate">{point}</span></div>)}
                      {points.length > 2 && <div className="text-[10px] font-mono text-slate-600 pl-5">+{points.length - 2} POINT(S)</div>}
                      {points.length === 0 && <span className="text-[10px] text-slate-500 italic">Aucun point clé défini</span>}
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-slate-800/50 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between items-center gap-3">
                    <span className="uppercase">THÈME : {guide.colorTheme || 'blue'}</span>
                    <span className="flex items-center uppercase truncate" title={guide.fileName || guide.fileUrl || ''}><ArrowRightOnRectangleIcon className="w-3 h-3 mr-1 shrink-0" />{isAllowedLibraryUrl(guide.fileUrl) ? guide.fileName || 'Téléchargement prêt' : 'Aucun document valide'}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true" aria-labelledby="library-delete-title">
          <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl">
            <h3 id="library-delete-title" className="p-5 border-b border-slate-100 font-bold text-slate-900">Supprimer définitivement ce document ?</h3>
            <p className="p-5 text-sm text-slate-700">{pendingDelete.title} sera retiré de la bibliothèque publique.</p>
            <div className="flex justify-end gap-3 p-5 border-t border-slate-100">
              <button type="button" disabled={isDeleting} onClick={() => setPendingDelete(null)} className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-50">Retour</button>
              <button type="button" disabled={isDeleting} onClick={() => void confirmDelete()} className="px-4 py-2 bg-red-700 text-xs font-bold text-white disabled:opacity-50">{isDeleting ? 'Suppression…' : 'Supprimer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFormsManager;
