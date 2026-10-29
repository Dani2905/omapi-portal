
import React from 'react';
import { UserIcon, BuildingOfficeIcon } from '../../Icons';

const DepotProcedure: React.FC = () => {
  return (
    <section id="depot" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
            Procédure de dépôt
        </h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                {[
                    { step: 1, title: "Préparation des représentations", desc: "Dessins ou photos claires sous tous les angles." },
                    { step: 2, title: "Rédaction de la description", desc: "Description des caractéristiques esthétiques." },
                    { step: 3, title: "Classement de Locarno", desc: "Indication de la classe internationale du produit." },
                    { step: 4, title: "Dépôt à l'OMAPI", desc: "Soumission du dossier complet et paiement." },
                    { step: 5, title: "Examen formel", desc: "Vérification de la conformité par l'OMAPI." }
                ].map((s) => (
                    <div key={s.step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-purple-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10 font-bold">
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
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4 text-gray-800 font-bold">
                    <UserIcon className="w-5 h-5 mr-2" />
                    Personnes Physiques
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Formulaire de demande</li>
                    <li>• Représentations graphiques/photos</li>
                    <li>• Description du modèle</li>
                    <li>• Indication classement Locarno</li>
                    <li>• Copie pièce d'identité</li>
                </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4 text-gray-800 font-bold">
                    <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                    Personnes Morales
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Tous les documents techniques</li>
                    <li>• Extrait du registre de commerce</li>
                    <li>• Statuts de l'entreprise</li>
                    <li>• Pouvoir du représentant</li>
                </ul>
            </div>
        </div>
    </section>
  );
};

export default DepotProcedure;
