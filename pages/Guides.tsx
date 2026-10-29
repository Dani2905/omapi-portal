import React from 'react';
import { Banknote, BookOpen, Download, FileText, Globe2, Lightbulb, Palette, Tag, Check, Info } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { DEFAULT_GUIDES } from '../constants';
import { Guide } from '../types';
import { useCrud } from '../hooks/useCrud';
import { getLibraryPlainText, isAllowedLibraryUrl } from '../utils/documentLibraryLogic';

const Guides: React.FC = () => {
  const { items: guides } = useCrud<Guide>('omapi_guides', DEFAULT_GUIDES);

  const getIcon = (name: string) => {
    switch (name) {
      case 'tag': return Tag;
      case 'bulb': return Lightbulb;
      case 'swatch': return Palette;
      case 'book': return BookOpen;
      case 'globe': return Globe2;
      case 'banknotes': return Banknote;
      default: return FileText;
    }
  };

  const getGradient = (theme: string) => {
    switch (theme) {
      case 'amber': return 'from-amber-500 to-amber-300';
      case 'purple': return 'from-purple-600 to-purple-400';
      case 'emerald': return 'from-emerald-600 to-emerald-400';
      case 'orange': return 'from-orange-600 to-orange-400';
      case 'gray': return 'from-gray-700 to-gray-500';
      case 'blue':
      default: return 'from-blue-600 to-blue-400';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Guides' }]} />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Guides Pratiques</h1>
          <p className="text-xl text-secondary font-medium">Documentation pour vous accompagner dans vos démarches</p>
          <div className="w-24 h-1.5 bg-primary rounded-full mt-4" />
        </div>

        {guides.length === 0 && <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">Aucun guide n’est actuellement publié.</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => {
            const Icon = getIcon(guide.iconName);
            const points = Array.isArray(guide.points) ? guide.points.filter((point) => typeof point === 'string' && point.trim()) : [];
            const canDownload = isAllowedLibraryUrl(guide.fileUrl);
            const downloadName = guide.fileName || `${(guide.title || 'guide').trim().replace(/[^\p{L}\p{N}_-]+/gu, '_')}`;
            return (
              <article key={guide.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
                <div className={`bg-gradient-to-r ${getGradient(guide.colorTheme)} p-6 text-white flex items-center justify-center`}>
                  <div className="text-center">
                    <div className="bg-white/20 p-3 rounded-full inline-block mb-3 backdrop-blur-sm"><Icon className="w-10 h-10" /></div>
                    <h3 className="text-xl font-bold">{guide.title || 'Guide sans titre'}</h3>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed break-words line-clamp-4">{getLibraryPlainText(guide.description)}</p>
                  <ul className="space-y-2 text-sm text-gray-500 mb-6 flex-1">
                    {points.map((point, index) => <li key={`${guide.id}-${index}`} className="flex items-start"><Check className="w-4 h-4 text-primary mr-2 mt-0.5 shrink-0" /><span>{point}</span></li>)}
                  </ul>
                  {canDownload ? (
                    <a href={guide.fileUrl} target={guide.fileUrl?.startsWith('/') || guide.fileUrl?.startsWith('data:') ? undefined : '_blank'} rel="noopener noreferrer" download={guide.fileUrl?.startsWith('data:') ? downloadName : undefined} className="w-full bg-gray-50 hover:bg-primary hover:text-white text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center mt-auto border border-gray-100">
                      <Download className="w-5 h-5 mr-2" />Télécharger {guide.fileName ? `— ${guide.fileName}` : 'le guide'}
                    </a>
                  ) : <div className="w-full mt-auto rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800"><Info className="w-4 h-4 inline mr-2" />Document indisponible pour le moment</div>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Guides;
