import React, { useMemo, useState } from 'react';
import { Banknote, BookOpen, Check, Download, FileText, Globe2, Info, Lightbulb, Palette, Search, Tag, X } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { useApiLibrary } from '../hooks/useApiLibrary';
import { getLibraryPlainText, isAllowedLibraryUrl } from '../utils/documentLibraryLogic';

const Guides: React.FC = () => {
  const { guides, loading, error } = useApiLibrary(undefined, 'guides');
  const [query, setQuery] = useState('');

  const filteredGuides = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    if (!term) return guides;
    return guides.filter((guide) => [
      guide.title,
      guide.fileName,
      getLibraryPlainText(guide.description),
      ...(Array.isArray(guide.points) ? guide.points : []),
    ].some((value) => String(value || '').toLocaleLowerCase('fr').includes(term)));
  }, [guides, query]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Guides pratiques' }]} />
      <header className="bg-[#002B49] text-white">
        <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Centre de ressources OMAPI</p>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">Guides pratiques</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-blue-100 md:text-lg">Des explications et des repères pour mieux comprendre les démarches de propriété industrielle.</p>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex md:items-center md:justify-between md:gap-8 md:p-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-bold text-[#002B49]">Parcourir les guides</h2>
            <p className="mt-1 text-sm text-slate-600">Recherchez un sujet, un mot-clé ou le titre d’un document.</p>
          </div>
          <label className="flex w-full items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 md:max-w-xl">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="sr-only">Rechercher dans les guides pratiques</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex. marque, brevet, dépôt…" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Effacer la recherche" className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><X className="h-4 w-4" /></button>}
          </label>
        </section>

        {error && <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Les guides sont temporairement indisponibles. Réessayez dans quelques instants.</div>}
        {loading && guides.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Chargement des guides…</div>
        ) : !error && guides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><BookOpen className="mx-auto h-9 w-9 text-slate-400" /><h2 className="mt-3 font-bold text-slate-800">Aucun guide publié pour le moment</h2><p className="mt-1 text-sm text-slate-500">Les guides apparaîtront ici dès leur publication.</p></div>
        ) : filteredGuides.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><Search className="mx-auto h-8 w-8 text-slate-400" /><h2 className="mt-3 font-bold text-slate-800">Aucun guide ne correspond à votre recherche</h2><p className="mt-1 text-sm text-slate-500">Essayez un autre mot-clé.</p><button type="button" onClick={() => setQuery('')} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-[#002B49] hover:bg-slate-50">Effacer la recherche</button></div>
        ) : (
          <section aria-label="Guides disponibles">
            <div className="mb-4 flex items-center justify-between px-1"><p className="text-sm font-semibold text-slate-600">{filteredGuides.length} guide{filteredGuides.length === 1 ? '' : 's'}</p><span className="text-xs text-slate-500">Sélectionnez un document pour le télécharger</span></div>
            <div className="space-y-4">
              {filteredGuides.map((guide) => {
                const Icon = getIcon(guide.iconName);
                const points = Array.isArray(guide.points) ? guide.points.filter((point) => typeof point === 'string' && point.trim()) : [];
                const canDownload = isAllowedLibraryUrl(guide.fileUrl);
                const downloadName = guide.fileName || `${(guide.title || 'guide').trim().replace(/[^\p{L}\p{N}_-]+/gu, '_')}`;
                const theme = getThemeClasses(guide.colorTheme);
                return (
                  <article key={guide.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
                    <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${theme.accent}`} />
                    <div className="flex flex-col gap-5 p-5 pl-7 sm:flex-row sm:items-start sm:justify-between md:p-6 md:pl-8">
                      <div className="flex min-w-0 gap-4">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${theme.icon}`}><Icon className="h-6 w-6" /></span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Guide pratique</p>
                          <h2 className="mt-1 text-lg font-extrabold text-[#002B49] md:text-xl">{guide.title || 'Guide sans titre'}</h2>
                          {getLibraryPlainText(guide.description) && <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{getLibraryPlainText(guide.description)}</p>}
                          {points.length > 0 && <div className="mt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Ce que vous y trouverez</p><ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">{points.slice(0, 4).map((point, index) => <li key={`${guide.id}-${index}`} className="flex items-start gap-2 text-sm text-slate-700"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${theme.check}`} /><span>{point}</span></li>)}</ul>{points.length > 4 && <p className="mt-2 text-xs text-slate-500">Et {points.length - 4} autre{points.length - 4 === 1 ? '' : 's'} point{points.length - 4 === 1 ? '' : 's'} dans le guide.</p>}</div>}
                        </div>
                      </div>
                      {canDownload ? (
                        <a href={guide.fileUrl} target={guide.fileUrl?.startsWith('/') || guide.fileUrl?.startsWith('data:') ? undefined : '_blank'} rel="noopener noreferrer" download={guide.fileUrl?.startsWith('data:') ? downloadName : undefined} aria-label={`Télécharger ${downloadName}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#002B49] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#004f87] sm:min-w-44"><Download className="h-4 w-4" />Télécharger</a>
                      ) : <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 sm:min-w-44"><Info className="h-4 w-4" />Document à venir</span>}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

function getIcon(name: string) {
  switch (name) {
    case 'tag': return Tag;
    case 'bulb': return Lightbulb;
    case 'swatch': return Palette;
    case 'book': return BookOpen;
    case 'globe': return Globe2;
    case 'banknotes': return Banknote;
    default: return FileText;
  }
}

function getThemeClasses(theme: string) {
  switch (theme) {
    case 'amber': return { accent: 'bg-amber-500', icon: 'bg-amber-50 text-amber-700', check: 'text-amber-700' };
    case 'purple': return { accent: 'bg-purple-600', icon: 'bg-purple-50 text-purple-700', check: 'text-purple-700' };
    case 'emerald': return { accent: 'bg-emerald-600', icon: 'bg-emerald-50 text-emerald-700', check: 'text-emerald-700' };
    case 'orange': return { accent: 'bg-orange-600', icon: 'bg-orange-50 text-orange-700', check: 'text-orange-700' };
    case 'gray': return { accent: 'bg-gray-700', icon: 'bg-gray-100 text-gray-700', check: 'text-gray-700' };
    case 'blue':
    default: return { accent: 'bg-blue-600', icon: 'bg-blue-50 text-blue-700', check: 'text-blue-700' };
  }
}

export default Guides;
