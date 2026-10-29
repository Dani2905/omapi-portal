
import React from 'react';
import { UserIcon, BuildingOfficeIcon } from '../../Icons';

const DepotProcedure: React.FC = () => {
  return (
    <section id="depot" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
            Dépôt Initial & Procédure
        </h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Étapes du dépôt</h3>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                {[
                    { step: 1, title: "Recherche d'antériorité", desc: "Vérifiez que votre marque n'est pas déjà déposée ou enregistrée par un tiers." },
                    { step: 2, title: "Préparation du dossier", desc: "Rassemblez tous les documents nécessaires et complétez le formulaire de dépôt." },
                    { step: 3, title: "Dépôt à l'OMAPI", desc: "Soumettez votre dossier complet à l'OMAPI et payez les frais de dépôt." },
                    { step: 4, title: "Examen et publication", desc: "L'OMAPI examine votre demande et publie la marque au Bulletin Officiel." },
                    { step: 5, title: "Délivrance du certificat", desc: "Après la période d'opposition, le certificat d'enregistrement vous est délivré." }
                ].map((s) => (
                    <div key={s.step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10 font-bold">
                            {s.step}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="font-bold text-gray-900 mb-1">{s.title}</div>
                            <div className="text-gray-600 text-sm">{s.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center mb-4 text-blue-800 font-bold">
                    <UserIcon className="w-5 h-5 mr-2" />
                    Personnes Physiques
                </div>
                <ul className="space-y-2 text-sm text-blue-900">
                    <li className="flex items-start"><span className="mr-2">•</span> Formulaire de dépôt de marque</li>
                    <li className="flex items-start"><span className="mr-2">•</span> Copie de la pièce d'identité</li>
                    <li className="flex items-start"><span className="mr-2">•</span> Représentation graphique de la marque</li>
                    <li className="flex items-start"><span className="mr-2">•</span> Liste des produits/services visés</li>
                </ul>
            </div>
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                <div className="flex items-center mb-4 text-indigo-800 font-bold">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                    Personnes Morales
                </div>
                <ul className="space-y-2 text-sm text-indigo-900">
                    <li className="flex items-start"><span className="mr-2">•</span> Formulaire de dépôt de marque</li>
                    <li className="flex items-start"><span className="mr-2">•</span> Extrait du registre de commerce</li>
                    <li className="flex items-start"><span className="mr-2">•</span> Statuts de l'entreprise</li>
                    <li className="flex items-start"><span className="mr-2">•</span> Pouvoir du représentant légal</li>
                    <li className="flex items-start"><span className="mr-2">•</span> Procuration si nécessaire</li>
                </ul>
            </div>
        </div>
    </section>
  );
};

export default DepotProcedure;
