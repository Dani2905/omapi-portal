import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

// Icônes SVG Heroicons
const AcademicCapIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.499 5.258 50.55 50.55 0 0 0-2.658.813m-15.482 0A50.55 50.55 0 0 1 12 13.489a50.55 50.55 0 0 1 6.74-2.505M16 10.866c-.675.05-1.353.08-2.03.09h-3.94c-.677-.01-1.355-.04-2.03-.09M16 10.866c.219.82.41 1.65.572 2.49M7.97 10.866c-.161.84-.353 1.67-.572 2.49" />
  </svg>
);

const LightBulbIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.593l6.002-4.5c.827-.478.966-1.583.428-2.282l-9.58-9.58A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
);

const SwatchIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
    </svg>
);

const StorefrontIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
    </svg>
);

const NewspaperIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-7.665 6.024c.268.966.697 1.885 1.25 2.749a23.475 23.475 0 0 1 5.955-4.124 23.475 23.475 0 0 1 5.955 4.124c.554-.864.982-1.783 1.25-2.749a23.475 23.475 0 0 1-5.955-4.124 23.475 23.475 0 0 1-5.955 4.124Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c4.97 0 9 1.643 9 4.05 0 4.185-3.033 7.755-6.046 9.387-.58.312-1.22.463-1.854.463s-1.273-.15-1.854-.463C4.033 14.055 1 10.485 1 6.3 1 3.893 5.03 2.25 10 2.25Z" />
    </svg>
); // Using ShieldCheck as similar to ShieldAlt

const CogIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);


const Missions: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: "L'Office" }, { label: 'Missions' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Nos Missions</h1>
            <p className="text-xl text-secondary font-medium">Administration de la propriété industrielle et promotion de l'innovation</p>
            <div className="w-24 h-1.5 bg-primary rounded-full mt-4"></div>
        </div>

        {/* Introduction */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Notre Mission Principale</h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
                <p>
                    L'OMAPI est chargé de l'administration de la propriété industrielle et de la promotion de l'activité
                    inventive à Madagascar. Notre mission fondamentale est de fournir un cadre juridique sécurisé pour la
                    protection des droits de propriété intellectuelle, tout en encourageant l'innovation et la créativité au
                    sein de l'écosystème malgache.
                </p>
                <p>
                    À cet effet, nous délivrons, à la demande des intéressés, des titres de propriété industrielle qui
                    protègent leurs créations et inventions, contribuant ainsi au développement économique et technologique
                    du pays.
                </p>
            </div>
        </section>

        {/* Titres délivrés */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Titres de Propriété Industrielle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start">
                        <div className="bg-primary text-white p-3 rounded-xl mr-4 flex-shrink-0">
                            <LightBulbIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Brevets d'inventions</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Protection des inventions techniques nouvelles, impliquant une activité inventive et
                                susceptibles d'application industrielle.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start">
                        <div className="bg-primary text-white p-3 rounded-xl mr-4 flex-shrink-0">
                            <TagIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Marques</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Protection des signes distinctifs permettant d'identifier les produits ou services d'une
                                entreprise et de les différencier.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start">
                        <div className="bg-primary text-white p-3 rounded-xl mr-4 flex-shrink-0">
                            <SwatchIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Dessins & Modèles</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Protection des créations d'aspect ornemental ou esthétique d'un produit ou d'un ensemble
                                de lignes et couleurs.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start">
                        <div className="bg-primary text-white p-3 rounded-xl mr-4 flex-shrink-0">
                            <StorefrontIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Noms commerciaux</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Protection des dénominations sous lesquelles s'exerce une activité commerciale,
                                industrielle ou artisanale.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Publication */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Publication et Documentation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <div className="text-primary mb-4">
                        <NewspaperIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Gazette Officielle (GOPI)</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Tous les titres octroyés par l'OMAPI sont publiés à la Gazette Officielle de la Propriété
                        Industrielle, assurant ainsi la publicité légale des droits de propriété industrielle.
                    </p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <div className="text-secondary mb-4">
                        <BookOpenIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Documentation publique</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        L'OMAPI met à la disposition du public une documentation complète : documents de brevets, 
                        législations nationales et internationales, traités multilatéraux.
                    </p>
                </div>
            </div>
        </section>

        {/* Organisation */}
        <section className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg p-6 md:p-8 text-white mb-12">
            <h2 className="text-2xl font-bold mb-6">Organisation et Indépendance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-bold mb-3 border-b border-white/20 pb-2">Tutelle et Autonomie</h3>
                    <p className="mb-4 text-sm text-blue-100">
                        Placé sous la tutelle technique du Ministère chargé de l'Industrie, l'OMAPI bénéficie d'une
                        autonomie administrative et financière qui lui permet d'agir avec efficacité.
                    </p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 mr-2" /> Autonomie administrative</li>
                        <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 mr-2" /> Autonomie financière</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-3 border-b border-white/20 pb-2">Indépendance Technique</h3>
                    <p className="mb-4 text-sm text-blue-100">
                        L'OMAPI jouit de l'indépendance technique pour l'exécution de sa mission, garantissant
                        l'impartialité et la qualité des décisions.
                    </p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 mr-2" /> Conseil d'Administration</li>
                        <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 mr-2" /> Direction Générale</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* Objectifs */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nos Objectifs Stratégiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { icon: <ShieldCheckIcon className="w-6 h-6" />, title: 'Protection efficace', desc: 'Garantir une protection robuste des droits.' },
                    { icon: <AcademicCapIcon className="w-6 h-6" />, title: 'Sensibilisation', desc: 'Promouvoir la culture de la PI par la formation.' },
                    { icon: <CheckCircleIcon className="w-6 h-6" />, title: 'Coopération', desc: 'Renforcer les liens internationaux.' },
                    { icon: <CogIcon className="w-6 h-6" />, title: 'Modernisation', desc: 'Développer des services innovants.' },
                ].map((obj, i) => (
                    <div key={i} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="bg-primary text-white p-2 rounded-full mt-1 flex-shrink-0">
                            {obj.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 mb-1">{obj.title}</h3>
                            <p className="text-gray-600 text-sm">{obj.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
};

export default Missions;
