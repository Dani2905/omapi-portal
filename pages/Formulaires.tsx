
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { DEFAULT_FORMS } from '../constants';
import { Formulaire } from '../types';
import { useCrud } from '../hooks/useCrud';

// --- Heroicons ---
const DocumentArrowDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const InformationCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
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

const FolderIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
);

const Formulaires: React.FC = () => {
  const { items: forms } = useCrud<Formulaire>('omapi_forms', DEFAULT_FORMS);

  // Filtrer les formulaires par catégorie
  const marquesForms = forms.filter(f => f.category === 'Marques');
  const brevetsForms = forms.filter(f => f.category === 'Brevets');
  const dessinsForms = forms.filter(f => f.category === 'Dessins');
  const autresForms = forms.filter(f => f.category === 'Autres');

  const renderSection = (title: string, icon: React.ReactNode, formsList: Formulaire[]) => {
    if (formsList.length === 0) return null;
    return (
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
            <div className="flex items-center mb-6">
                <div className="bg-primary text-white p-3 rounded-lg mr-4">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Formulaires {title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formsList.map((item) => (
                    <a 
                        key={item.id} 
                        href={item.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        download={item.fileUrl?.startsWith('data:') ? (item.fileName || 'formulaire') : undefined}
                        className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all duration-300 group"
                    >
                        <div className="flex items-start space-x-3">
                            <DocumentTextIcon className="w-8 h-8 text-red-500 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="text-sm text-gray-600 mb-1 break-words line-clamp-2">{item.description ? item.description.replace(/<[^>]*>?/gm, '') : ''}</p>
                                {item.fileName && (
                                    <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                        {item.fileName}
                                    </span>
                                )}
                            </div>
                        </div>
                        <DocumentArrowDownIcon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
                    </a>
                ))}
            </div>
        </section>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Formulaires' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Formulaires</h1>
            <p className="text-xl text-secondary font-medium">Téléchargez les formulaires nécessaires pour vos démarches</p>
            <div className="w-24 h-1.5 bg-primary rounded-full mt-4"></div>
        </div>

        {renderSection('Marques', <TagIcon className="w-8 h-8" />, marquesForms)}
        {renderSection('Brevets', <LightBulbIcon className="w-8 h-8" />, brevetsForms)}
        {renderSection('Dessins et Modèles', <SwatchIcon className="w-8 h-8" />, dessinsForms)}
        
        {/* Autres / Divers */}
        {renderSection('Divers', <FolderIcon className="w-8 h-8" />, autresForms)}

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-primary rounded-lg p-6 flex items-start">
            <InformationCircleIcon className="w-8 h-8 text-primary mr-4 flex-shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-gray-800 mb-2">Information importante</h3>
                <p className="text-gray-700 text-sm">
                    Tous les formulaires doivent être remplis en français et signés. Pour toute assistance dans le
                    remplissage des formulaires, n'hésitez pas à <Link to="/contact" className="text-primary font-bold hover:underline">nous contacter</Link>.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Formulaires;