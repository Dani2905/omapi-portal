import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

// Icônes SVG Heroicons
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const CheckBadgeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
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

const StorefrontIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.593l6.002-4.5c.827-.478.966-1.583.428-2.282l-9.58-9.58A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
);

const GlobeAltIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 2.944a11.955 11.955 0 0 1-8.63 8.988 8.92 8.92 0 0 0 6.525 6.38" />
    </svg>
);

const ScaleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
    </svg>
);

const UserGroupIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
);

const HandThumbUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.287 9.483 4.111 8.975 5 8.975h.909c.445 0 .72.498.523.898a9.62 9.62 0 0 0-.27.602m0 9.75V9.75" />
    </svg>
);

const Presentation: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: "L'Office" }, { label: 'Présentation' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">À propos de l'OMAPI</h1>
            <p className="text-xl text-secondary font-medium">Promouvoir l'innovation et la Créativité</p>
            <div className="w-24 h-1.5 bg-primary rounded-full mt-4"></div>
        </div>

        {/* Introduction */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">L'Office Malgache de la Propriété Industrielle</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                    Après leur indépendance, Madagascar et douze autres États africains ont signé l'Accord de Libreville du
                    13 septembre 1962 instituant un régime uniforme de protection de la propriété industrielle et créant
                    l'Office Africain et Malgache de la Propriété Industrielle (OAMPI).
                </p>
                <p>
                    Suite à la dénonciation de cet Accord par Madagascar le 31 janvier 1974 qui a pris effet le 31 décembre
                    1976, un vide juridique et administratif existait en la matière. Or, les dispositions de la Convention de Paris stipulent que chaque pays de l'Union s'engage à établir un service spécial de la propriété industrielle.
                </p>
                <p>
                    C'est ainsi qu'a été promulguée <strong>l'ordonnance n° 89-019 du 31 juillet 1989</strong> instituant un régime pour la protection de la
                    propriété industrielle à Madagascar.
                </p>
            </div>
        </section>

        {/* Historique */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Historique</h2>
            <div className="space-y-6">
                {[
                    { year: '1962', title: 'Accord de Libreville', desc: "Institution d'un régime uniforme et création de l'OAMPI." },
                    { year: '1974-1976', title: 'Dénonciation de l\'Accord', desc: "Madagascar quitte l'OAMPI, créant un vide juridique transitoire." },
                    { year: '1989', title: 'Ordonnance n° 89-019', desc: "Institution du régime national de protection de la Propriété Industrielle." },
                    { year: '1992', title: 'Création de l\'OMAPI', desc: "Décrets n° 92-993 et 92-994 portant application de l'ordonnance et organisation de l'office." },
                    { year: '1994', title: 'Opérationnel', desc: "L'OMAPI devient opérationnel depuis le 1er avril 1994." },
                ].map((item, index) => (
                    <div key={index} className="flex items-start group">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 mb-1">{item.year} - {item.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Attributions */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Attributions</h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
                L'OMAPI est chargé de l'administration de la propriété industrielle et de la promotion de l'activité
                inventive à Madagascar. À cet effet, il délivre les titres de propriété industrielle suivants :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
                    <div className="bg-white p-3 rounded-lg text-primary shadow-sm">
                        <LightBulbIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1">Brevets d'inventions</h3>
                        <p className="text-sm text-gray-600">Protection des inventions techniques.</p>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
                    <div className="bg-white p-3 rounded-lg text-primary shadow-sm">
                        <TagIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1">Marques</h3>
                        <p className="text-sm text-gray-600">Produits ou services.</p>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
                    <div className="bg-white p-3 rounded-lg text-primary shadow-sm">
                        <SwatchIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1">Dessins & Modèles</h3>
                        <p className="text-sm text-gray-600">Créations esthétiques industrielles.</p>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
                    <div className="bg-white p-3 rounded-lg text-primary shadow-sm">
                        <StorefrontIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1">Noms Commerciaux</h3>
                        <p className="text-sm text-gray-600">Dénominations commerciales.</p>
                    </div>
                </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-blue-900 leading-relaxed">
                    Les titres octroyés sont publiés à la <strong>Gazette Officielle de la Propriété Industrielle (GOPI)</strong>. 
                    L'OMAPI met également à disposition du public une documentation complète (brevets, législations, traités).
                </p>
            </div>
        </section>

        {/* Nos Valeurs */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Nos Valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
                {[
                    { title: 'Intégrité', icon: <CheckBadgeIcon className="w-8 h-8" />, desc: 'Honnêteté et transparence.' },
                    { title: 'Innovation', icon: <LightBulbIcon className="w-8 h-8" />, desc: 'Soutien à la créativité.' },
                    { title: 'Service', icon: <UserGroupIcon className="w-8 h-8" />, desc: 'Accompagnement de qualité.' },
                    { title: 'Équité', icon: <ScaleIcon className="w-8 h-8" />, desc: 'Traitement juste et impartial.' },
                    { title: 'Progrès', icon: <HandThumbUpIcon className="w-8 h-8" />, desc: 'Contribution au développement.' },
                ].map((val, idx) => (
                    <div key={idx} className="p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="mx-auto w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                            {val.icon}
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">{val.title}</h3>
                        <p className="text-xs text-gray-500">{val.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Partenariats */}
        <section className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
                <GlobeAltIcon className="w-8 h-8 mr-3 opacity-80" />
                Partenariats Internationaux
            </h2>
            <p className="mb-6 text-blue-100">
                Opérationnel depuis 1994, l'OMAPI entretient des relations privilégiées avec les grandes instances mondiales :
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium">
                <li className="flex items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    OMPI (Organisation Mondiale de la Propriété Intellectuelle)
                </li>
                <li className="flex items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    INPI (Institut National de la Propriété Industrielle - France)
                </li>
                <li className="flex items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    USPTO (Office des brevets et des marques des États-Unis)
                </li>
                <li className="flex items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    OEB (Office Européen des Brevets)
                </li>
                <li className="flex items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    OAPI (Organisation Africaine de la Propriété Intellectuelle)
                </li>
            </ul>
        </section>

        {/* CTA */}
        <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Protégez votre innovation</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Découvrez comment l'OMAPI peut vous aider à protéger vos créations et à sécuriser vos droits de propriété intellectuelle.
            </p>
            <Link to="/contact" className="inline-block bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform transform hover:-translate-y-1">
                Déposer une demande
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Presentation;
