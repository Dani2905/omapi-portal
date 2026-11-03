import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Folder, Info, Lightbulb, Palette, Search, Tag, X } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { useApiLibrary } from '../hooks/useApiLibrary';
import { FORM_CATEGORIES, getLibraryPlainText, isAllowedLibraryUrl } from '../utils/documentLibraryLogic';

const CATEGORY_LABELS: Record<string, string> = {
  Marques: 'Marques',
  Brevets: 'Brevets',
  Dessins: 'Dessins et modèles',
  Autres: 'Autres démarches',
};
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Marques: <Tag className="h-5 w-5" />,
  Brevets: <Lightbulb className="h-5 w-5" />,
  Dessins: <Palette className="h-5 w-5" />,
  Autres: <Folder className="h-5 w-5" />,
};
const ALL_CATEGORIES = 'all';
interface FormCategory { id: string; label: string; icon: React.ReactNode; count: number }

const Formulaires: React.FC = () => {
  const { forms, loading, error } = useApiLibrary(undefined, 'forms');
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [query, setQuery] = useState('');

  const categories = useMemo<FormCategory[]>(() => {
    const available = new Set(forms.map((form) => String(form.category || '').trim()).filter(Boolean));
    const known: FormCategory[] = FORM_CATEGORIES.filter((category) => available.has(category)).map((id) => ({
      id,
      label: CATEGORY_LABELS[id] || id,
      icon: CATEGORY_ICONS[id] || <Folder className="h-5 w-5" />,
      count: forms.filter((form) => String(form.category || '').trim() === id).length,
    }));
    const unknown: FormCategory[] = Array.from(available)
      .filter((category) => !FORM_CATEGORIES.includes(category as typeof FORM_CATEGORIES[number]))
      .sort((a, b) => a.localeCompare(b, 'fr'))
      .map((id) => ({
        id,
        label: id,
        icon: <Folder className="h-5 w-5" />,
        count: forms.filter((form) => String(form.category || '').trim() === id).length,
      }));
    return [...known, ...unknown];
  }, [forms]);

  const filteredForms = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr');
    return forms.filter((form) => {
      const categoryMatches = activeCategory === ALL_CATEGORIES || String(form.category || '').trim() === activeCategory;
      const searchableText = [form.title, form.fileName, getLibraryPlainText(form.description)]
        .map((value) => String(value || '').toLocaleLowerCase('fr'));
      return categoryMatches && (!normalizedQuery || searchableText.some((value) => value.includes(normalizedQuery)));
    });
  }, [activeCategory, forms, query]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Formulaires' }]} />
      <div className="bg-[#002B49] text-white">
        <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Documents pratiques</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Formulaires</h1>
            <p className="mt-4 text-base leading-relaxed text-blue-100 md:text-lg">Trouvez le document correspondant à votre démarche, puis téléchargez-le directement.</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <h2 className="text-lg font-bold text-[#002B49]">Parcourir les documents</h2>
            <p className="mt-1 text-sm text-slate-600">Choisissez une catégorie ou recherchez un mot dans le titre et la description.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-[#002B49]">
            <FileText className="h-5 w-5" />
            <span>{forms.length} document{forms.length === 1 ? '' : 's'} disponible{forms.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {error && <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Les formulaires sont temporairement indisponibles. Réessayez dans quelques instants.</div>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Filtrer les formulaires par catégorie">
            <h2 className="px-2 pb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Catégories</h2>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              <CategoryButton active={activeCategory === ALL_CATEGORIES} icon={<FileText className="h-5 w-5" />} label="Tous les formulaires" count={forms.length} onClick={() => setActiveCategory(ALL_CATEGORIES)} />
              {categories.map((category) => (
                <CategoryButton key={category.id} active={activeCategory === category.id} icon={category.icon} label={category.label} count={category.count} onClick={() => setActiveCategory(category.id)} />
              ))}
            </div>
          </aside>

          <section className="min-w-0" aria-label="Liste des formulaires">
            <label className="mb-4 flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <span className="sr-only">Rechercher un formulaire</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Ex. marque, brevet, renouvellement…" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="Effacer la recherche" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>}
            </label>

            {loading && forms.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Chargement des formulaires…</div>
            ) : !error && forms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Folder className="mx-auto h-9 w-9 text-slate-400" />
                <h3 className="mt-3 font-bold text-slate-800">Aucun formulaire publié pour le moment</h3>
                <p className="mt-1 text-sm text-slate-500">Les documents apparaîtront ici dès leur publication.</p>
              </div>
            ) : filteredForms.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <Search className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-3 font-bold text-slate-800">Aucun document ne correspond</h3>
                <p className="mt-1 text-sm text-slate-500">Essayez une autre recherche ou sélectionnez une autre catégorie.</p>
                <button type="button" onClick={() => { setQuery(''); setActiveCategory(ALL_CATEGORIES); }} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-[#002B49] hover:bg-slate-50">Effacer les filtres</button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="px-1 text-sm text-slate-500">{filteredForms.length} résultat{filteredForms.length === 1 ? '' : 's'}</p>
                {filteredForms.map((item) => {
                  const canDownload = isAllowedLibraryUrl(item.fileUrl);
                  const category = categories.find((entry) => entry.id === String(item.category || '').trim());
                  const label = item.fileName || item.title || 'Télécharger le formulaire';
                  return (
                    <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between md:p-6">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#002B49]">{category?.icon || <FileText className="h-5 w-5" />}</div>
                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">{category?.label || CATEGORY_LABELS[String(item.category || '')] || 'Formulaire'}</span>
                            {item.fileName && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">{item.fileName}</span>}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 md:text-lg">{item.title || 'Document sans titre'}</h3>
                          {getLibraryPlainText(item.description) && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{getLibraryPlainText(item.description)}</p>}
                        </div>
                      </div>
                      {canDownload ? (
                        <a href={item.fileUrl} target={item.fileUrl?.startsWith('/') || item.fileUrl?.startsWith('data:') ? undefined : '_blank'} rel="noopener noreferrer" download={item.fileUrl?.startsWith('data:') ? label : undefined} aria-label={`Télécharger ${label}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#002B49] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#004f87]">
                          <Download className="h-4 w-4" /> Télécharger
                        </a>
                      ) : <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"><Info className="h-4 w-4" />Fichier indisponible</span>}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div className="flex items-start gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0 text-[#002B49]" /><div><h2 className="font-bold text-[#002B49]">Besoin d’aide ?</h2><p className="mt-1 text-sm text-slate-700">Pour toute question sur un document, contactez l’équipe OMAPI.</p></div></div>
          <Link to="/contact" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#002B49] px-4 py-2.5 text-sm font-bold text-[#002B49] hover:bg-white">Nous contacter</Link>
        </div>
      </main>
    </div>
  );
};

function CategoryButton({ active, icon, label, count, onClick }: { active: boolean; icon: React.ReactNode; label: string; count: number; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors lg:w-full ${active ? 'bg-[#002B49] text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1 whitespace-nowrap text-sm font-semibold">{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'}`}>{count}</span>
    </button>
  );
}

export default Formulaires;
