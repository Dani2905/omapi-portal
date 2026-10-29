
import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { DEFAULT_GUIDES } from '../constants';
import { Guide } from '../types';
import { useCrud } from '../hooks/useCrud';

// --- Heroicons ---
const ArrowDownTrayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.593l6.002-4.5c.827-.478.966-1.583.428-2.282l-9.58-9.58A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
);

const LightBulbIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const SwatchIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
    </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
);

const GlobeAltIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 2.944a11.955 11.955 0 0 1-8.63 8.988 8.92 8.92 0 0 0 6.525 6.38" />
    </svg>
);

const BanknotesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);


const Guides: React.FC = () => {
  const { items: guides } = useCrud<Guide>('omapi_guides', DEFAULT_GUIDES);

  // Helpers pour le rendu dynamique
  const getIcon = (name: string, className?: string) => {
    switch(name) {
      case 'tag': return <TagIcon className={className} />;
      case 'bulb': return <LightBulbIcon className={className} />;
      case 'swatch': return <SwatchIcon className={className} />;
      case 'book': return <BookOpenIcon className={className} />;
      case 'globe': return <GlobeAltIcon className={className} />;
      case 'banknotes': return <BanknotesIcon className={className} />;
      default: return <DocumentIcon className={className} />;
    }
  };

  const getGradient = (theme: string) => {
    switch(theme) {
      case 'blue': return "from-blue-600 to-blue-400";
      case 'amber': return "from-amber-500 to-amber-300";
      case 'purple': return "from-purple-600 to-purple-400";
      case 'emerald': return "from-emerald-600 to-emerald-400";
      case 'orange': return "from-orange-600 to-orange-400";
      case 'gray': return "from-gray-700 to-gray-500";
      default: return "from-blue-600 to-blue-400";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Guides' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Guides Pratiques</h1>
            <p className="text-xl text-secondary font-medium">Documentation pour vous accompagner dans vos démarches</p>
            <div className="w-24 h-1.5 bg-primary rounded-full mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
                <div key={guide.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
                    <div className={`bg-gradient-to-r ${getGradient(guide.colorTheme)} p-6 text-white flex items-center justify-center`}>
                        <div className="text-center">
                            <div className="bg-white/20 p-3 rounded-full inline-block mb-3 backdrop-blur-sm">
                                {getIcon(guide.iconName, "w-10 h-10")}
                            </div>
                            <h3 className="text-xl font-bold">{guide.title}</h3>
                        </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed break-words line-clamp-3">
                            {guide.description ? guide.description.replace(/<[^>]*>?/gm, '') : ''}
                        </p>
                        <ul className="space-y-2 text-sm text-gray-500 mb-6 flex-1">
                            {guide.points.map((point, i) => (
                                <li key={i} className="flex items-start">
                                    <CheckIcon className="w-4 h-4 text-primary mr-2 mt-0.5" />
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                        <a 
                            href={guide.fileUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            download={guide.fileUrl?.startsWith('data:') ? 'guide_omapi' : undefined}
                            className="w-full bg-gray-50 hover:bg-primary hover:text-white text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center mt-auto border border-gray-100"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                            Télécharger
                        </a>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Guides;