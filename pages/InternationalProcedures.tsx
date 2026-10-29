
import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

// --- Heroicons SVG Components ---

const GlobeAltIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 2.944a11.955 11.955 0 0 1-8.63 8.988 8.92 8.92 0 0 0 6.525 6.38" />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const Cog6ToothIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const ClipboardDocumentListIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
);

const ArrowDownTrayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const InternationalProcedures: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'International' }, { label: 'Procédures Internationales' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Procédures Internationales</h1>
            <p className="text-xl text-secondary font-medium">Étendez la protection de votre propriété intellectuelle au-delà des frontières</p>
            <div className="w-24 h-1.5 bg-primary rounded-full mt-4"></div>
        </div>

        {/* Section Traités et Accords */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <div className="flex items-center mb-6">
                <div className="bg-primary text-white p-3 rounded-lg mr-4 shadow-sm">
                    <GlobeAltIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Traités et Accords Internationaux</h2>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">
                Madagascar, à travers l'OMAPI, participe à plusieurs traités et accords internationaux facilitant la
                protection de la propriété intellectuelle à l'étranger. Ces accords simplifient les procédures pour
                les déposants souhaitant protéger leurs innovations, marques ou créations dans plusieurs pays
                simultanément.
            </p>

            <div className="space-y-6">
                <div className="flex items-start">
                    <div className="bg-blue-50 text-primary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                        <DocumentTextIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-1">Protocole de Madrid (Marques)</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Permet de déposer une marque dans plusieurs pays membres avec une seule demande internationale auprès de l'OMPI. Cela simplifie
                            considérablement les démarches, réduit les coûts et centralise la gestion de votre portefeuille de marques international.
                        </p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="bg-blue-50 text-primary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                        <DocumentTextIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-1">Traité de Coopération en matière de Brevets (PCT)</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Simplifie le dépôt de demandes de brevets dans de nombreux pays. Une seule demande PCT a l'effet d'une demande nationale dans tous les
                            pays désignés, offrant un délai prolongé pour décider où poursuivre la protection.
                        </p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="bg-blue-50 text-primary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4 mt-1">
                        <DocumentTextIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-1">Arrangement de La Haye (Dessins et Modèles Industriels)</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Permet l'enregistrement international de jusqu'à 100 dessins et modèles industriels dans plusieurs pays contractants par le dépôt d'une
                            seule demande auprès de l'OMPI. Cela offre une gestion simplifiée et des coûts réduits.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Section Étapes du dépôt */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <div className="flex items-center mb-6">
                <div className="bg-secondary text-white p-3 rounded-lg mr-4 shadow-sm">
                    <Cog6ToothIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Étapes Générales du Dépôt International</h2>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">
                Bien que chaque traité ait ses spécificités, les procédures internationales de dépôt de propriété
                intellectuelle suivent généralement des étapes communes.
            </p>

            <div className="relative border-l-2 border-gray-200 ml-4 pl-8 space-y-10">
                <div className="relative">
                    <div className="absolute -left-12 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">1</div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-2">Dépôt initial national (ou régional)</h4>
                        <p className="text-gray-600 text-sm">
                            Déposez votre demande (marque, brevet, dessin/modèle) auprès de l'OMAPI ou d'un office régional (ex: OAPI, ARIPO) pour établir une date de priorité.
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -left-12 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">2</div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-2">Demande internationale centralisée</h4>
                        <p className="text-gray-600 text-sm">
                            Dans un délai de 6 mois (marques/dessins) ou 12 mois (brevets) à compter du dépôt initial, déposez une demande internationale (Madrid, PCT,
                            La Haye) auprès de l'OMPI, désignant les pays où vous souhaitez étendre votre protection.
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -left-12 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">3</div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-2">Examen par les offices nationaux/régionaux</h4>
                        <p className="text-gray-600 text-sm">
                            Votre demande internationale est transmise aux offices de propriété intellectuelle des pays ou régions désignés pour examen, selon leurs
                            législations nationales.
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -left-12 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">4</div>
                    <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-2">Décision et enregistrement</h4>
                        <p className="text-gray-600 text-sm">
                            Une fois l'examen favorable, chaque office désigné accorde la protection selon ses règles. La protection est alors effective dans ces territoires.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Section Documents */}
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12">
            <div className="flex items-center mb-6">
                <div className="bg-accent text-white p-3 rounded-lg mr-4 shadow-sm">
                    <ClipboardDocumentListIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Documents Requis</h2>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">
                Les documents nécessaires varient en fonction du type de propriété intellectuelle (marque, brevet,
                dessin/modèle) et du traité international utilisé. Cependant, certains documents sont généralement
                requis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                        Documents courants
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start"><span className="mr-2 text-primary">•</span> Formulaire officiel de demande internationale</li>
                        <li className="flex items-start"><span className="mr-2 text-primary">•</span> Copie de la demande nationale initiale (priorité)</li>
                        <li className="flex items-start"><span className="mr-2 text-primary">•</span> Reproduction/Description de l'objet de la protection</li>
                        <li className="flex items-start"><span className="mr-2 text-primary">•</span> Pouvoir (si mandataire)</li>
                        <li className="flex items-start"><span className="mr-2 text-primary">•</span> Preuve du paiement des taxes internationales</li>
                        <li className="flex items-start"><span className="mr-2 text-primary">•</span> Traduction des documents (si nécessaire)</li>
                    </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                        Informations clés
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start"><span className="mr-2 text-primary">•</span> Identité complète du déposant</li>
                        <li className="flex items-start"><span className="mr-2 text-primary">•</span> Nationalité et résidence</li>
                        <li className="flex items-start"><span className="mr-2 text-primary">•</span> Liste des pays désignés</li>
                        <li className="flex items-start"><span className="mr-2 text-primary">•</span> Classification des produits/services</li>
                        <li className="flex items-start"><span className="mr-2 text-primary">•</span> Date et numéro du dépôt initial national</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* Section Contact */}
        <section className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Besoin d'aide pour vos procédures internationales ?</h2>
            <p className="mb-8 max-w-2xl mx-auto text-blue-100">
                Nos experts en propriété industrielle sont à votre disposition pour vous accompagner dans
                l'extension de la protection de votre propriété intellectuelle à l'étranger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="inline-flex items-center justify-center bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-300 shadow-md">
                    <PhoneIcon className="w-5 h-5 mr-2" /> Contacter un expert
                </Link>
                <Link to="/formulaires" className="inline-flex items-center justify-center border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-primary transition-colors duration-300">
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> Télécharger les formulaires
                </Link>
            </div>
        </section>
      </div>
    </div>
  );
};

export default InternationalProcedures;
