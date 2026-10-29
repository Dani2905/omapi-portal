import React from 'react';
import Breadcrumb from '../components/Breadcrumb';

// Icônes SVG Heroicons
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

const GlobeAltIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 2.944a11.955 11.955 0 0 1-8.63 8.988 8.92 8.92 0 0 0 6.525 6.38" />
    </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
);

const CogIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const HandThumbUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.287 9.483 4.111 8.975 5 8.975h.909c.445 0 .72.498.523.898a9.62 9.62 0 0 0-.27.602m0 9.75V9.75" />
    </svg>
);

const CheckBadgeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
);


const Organisation: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: "L'Office" }, { label: 'Organisation' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Organisation de l'OMAPI</h1>
            <p className="text-xl text-secondary font-medium">Structure et Fonctionnement</p>
            <div className="w-24 h-1.5 bg-primary rounded-full mt-4"></div>
        </div>

        {/* Structure Org */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Structure Organisationnelle</h2>
            <div className="text-gray-700 leading-relaxed space-y-4 mb-8">
                <p>
                    L'Office Malgache de la Propriété Industrielle (OMAPI) est un établissement public doté d'une autonomie
                    administrative et financière. Placé sous la tutelle technique du Ministère chargé de l'Industrie,
                    l'OMAPI jouit de l'indépendance technique pour l'exécution de sa mission.
                </p>
                <p>
                    Notre organisation est structurée pour garantir l'efficacité, la transparence et la qualité dans
                    l'accomplissement de nos missions.
                </p>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">Gouvernance Structurée</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3 text-primary">
                        <ScaleIcon className="w-6 h-6 mr-2" />
                        <h4 className="font-bold text-lg">Conseil d'Administration</h4>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">
                        Organe délibérant qui définit la politique générale et contrôle la gestion.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Représentation public/privé</li>
                        <li>Orientations stratégiques</li>
                        <li>Budget et comptes</li>
                    </ul>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3 text-primary">
                        <CogIcon className="w-6 h-6 mr-2" />
                        <h4 className="font-bold text-lg">Direction Générale</h4>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">
                        Assure la gestion quotidienne et la mise en œuvre des décisions.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Exécution des décisions</li>
                        <li>Représentation légale</li>
                        <li>Gestion technique</li>
                    </ul>
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">Départements Techniques</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { title: 'Brevets', icon: <LightBulbIcon className="w-5 h-5" />, desc: 'Traitement des demandes et examen.' },
                    { title: 'Marques', icon: <TagIcon className="w-5 h-5" />, desc: 'Enregistrement et protection.' },
                    { title: 'Dessins & Modèles', icon: <SwatchIcon className="w-5 h-5" />, desc: 'Protection du design.' },
                    { title: 'Noms Commerciaux', icon: <StorefrontIcon className="w-5 h-5" />, desc: 'Enregistrement des dénominations.' },
                    { title: 'Documentation', icon: <BookOpenIcon className="w-5 h-5" />, desc: 'Gestion documentaire et GOPI.' },
                    { title: 'Relations Int.', icon: <GlobeAltIcon className="w-5 h-5" />, desc: 'Coopération et PCT.' },
                ].map((dept, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start">
                        <div className="text-blue-600 mr-3 mt-1">{dept.icon}</div>
                        <div>
                            <h4 className="font-semibold text-gray-800">{dept.title}</h4>
                            <p className="text-xs text-gray-600">{dept.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Valeurs & Effectifs */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Nos Valeurs & Ressources</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Valeurs Organisationnelles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { title: 'Intégrité', icon: <CheckBadgeIcon className="w-5 h-5" /> },
                            { title: 'Indépendance', icon: <LightBulbIcon className="w-5 h-5" /> },
                            { title: 'Collaboration', icon: <UserGroupIcon className="w-5 h-5" /> },
                            { title: 'Excellence', icon: <StarIcon className="w-5 h-5" /> },
                        ].map((v, i) => (
                            <div key={i} className="flex items-center p-3 bg-blue-50 rounded-lg text-primary">
                                <span className="mr-2">{v.icon}</span>
                                <span className="font-semibold">{v.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                     <h3 className="text-lg font-bold text-gray-700 mb-4">Nos Effectifs</h3>
                     <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="text-2xl font-bold text-green-700">50+</div>
                            <div className="text-xs text-gray-600 mt-1">Agents</div>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div className="text-2xl font-bold text-yellow-700">15</div>
                            <div className="text-xs text-gray-600 mt-1">Experts</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="text-2xl font-bold text-red-700">6</div>
                            <div className="text-xs text-gray-600 mt-1">Dpts</div>
                        </div>
                     </div>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
};

export default Organisation;
