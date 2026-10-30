
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { DEFAULT_LEGISLATION } from '../constants';
import { LegislationItem } from '../types';
import { useCrud } from '../hooks/useCrud';
import { isAllowedLegislationUrl } from '../utils/legislationLogic';

// --- Icons ---
const ScaleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const ArrowDownTrayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

const Legislation: React.FC = () => {
  const { items: legislationItems } = useCrud<LegislationItem>('omapi_legislation', DEFAULT_LEGISLATION);

  const fundamentalTexts = legislationItems.filter(item => item.category === 'Fondamental');
  const applicationTexts = legislationItems.filter(item => item.category === 'Application');
  const otherTexts = legislationItems.filter(item => item.category === 'Autre');

  const renderTextItem = (item: LegislationItem) => (
    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 text-primary p-2 rounded-lg">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-semibold uppercase tracking-wide">
              {item.type}
            </span>
            <span className="text-gray-400 text-xs ml-2">{item.date}</span>
          </div>
        </div>
        <span className="text-gray-400 font-bold text-xs uppercase bg-gray-50 px-2 py-1 rounded border border-gray-100">PDF</span>
      </div>
      
      <h3 className="font-bold text-gray-800 mb-3 text-lg leading-snug">
        {item.title}
      </h3>
      
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
        {item.description}
      </p>
      
      {isAllowedLegislationUrl(item.fileUrl) ? (
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={item.fileUrl?.startsWith('data:') ? item.fileName || 'document-legislation.pdf' : undefined}
          className="inline-flex items-center text-primary font-bold text-sm hover:underline"
        >
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Télécharger le PDF
        </a>
      ) : (
        <span className="text-sm text-slate-400">Document non disponible</span>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Législation' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Législation</h1>
            <p className="text-xl text-secondary font-medium">Textes juridiques régissant la propriété industrielle à Madagascar</p>
            <div className="w-24 h-1.5 bg-primary rounded-full mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Intro */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <ScaleIcon className="w-8 h-8 text-primary mr-3" />
                Cadre juridique
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                La propriété industrielle à Madagascar est régie par un ensemble de textes juridiques nationaux. L'Office Malgache de la Propriété Industrielle (OMAPI) met à votre disposition ces textes pour vous permettre de mieux comprendre vos droits et obligations.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Cette page regroupe les lois, ordonnances, décrets et arrêtés qui constituent le cadre légal de la propriété industrielle à Madagascar.
              </p>
            </section>

            {/* Textes Fondamentaux */}
            {fundamentalTexts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Textes Fondamentaux</h2>
                <div className="grid gap-6">
                  {fundamentalTexts.map(renderTextItem)}
                </div>
              </section>
            )}

            {/* Textes d'Application */}
            {applicationTexts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Textes d'Application</h2>
                <div className="grid gap-6">
                  {applicationTexts.map(renderTextItem)}
                </div>
              </section>
            )}

            {otherTexts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">Autres textes</h2>
                <div className="grid gap-6">
                  {otherTexts.map(renderTextItem)}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Gazette Box */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-blue-900 p-6 text-white">
                <div className="flex items-center mb-2">
                  <BookOpenIcon className="w-6 h-6 mr-3 text-blue-300" />
                  <h3 className="font-bold text-lg">Gazettes Officielles</h3>
                </div>
                <p className="text-blue-200 text-sm">Consultez les publications officielles.</p>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-gray-800 mb-2">Gazette Officielle de la Propriété Industrielle (GOPI)</h4>
                <p className="text-gray-600 text-sm mb-6">
                  Publication officielle de l'OMAPI contenant les dépôts, délivrances, renouvellements et autres actes relatifs à la propriété industrielle.
                </p>
                <Link 
                  to="/gopi" 
                  className="block w-full bg-blue-50 text-primary font-bold text-center py-3 rounded-lg hover:bg-primary hover:text-white transition-colors border border-blue-100"
                >
                  Accéder à la GOPI
                </Link>
              </div>
            </div>

            {/* Legal Service CTA */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-3">Besoin d'informations juridiques complémentaires ?</h3>
              <p className="text-gray-600 text-sm mb-6">
                Notre service juridique est à votre disposition pour répondre à vos questions sur la législation en vigueur.
              </p>
              <Link 
                to="/contact" 
                className="flex items-center justify-center w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-secondary transition-colors shadow-sm"
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Contacter le service
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Legislation;