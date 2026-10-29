
import React from 'react';
import { CheckCircleIcon } from '../../Icons';

const Registre: React.FC = () => {
  return (
    <section id="registre" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
            Inscription au Registre
        </h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="p-8">
                <p className="text-gray-600 mb-6">
                    Le Registre National des Marques recense toutes les marques enregistrées à Madagascar. 
                    Toute modification affectant les droits doit être inscrite pour être opposable aux tiers.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold text-gray-800 mb-3">Cas d'inscription obligatoire</h4>
                        <ul className="space-y-2">
                            {[
                                "Transfert de propriété", 
                                "Changement de nom/adresse du titulaire", 
                                "Constitution de droits réels", 
                                "Licence d'exploitation", 
                                "Gage ou saisie"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-3">Procédure simplifiée</h4>
                        <ol className="relative border-l border-gray-200 ml-3 space-y-4">
                            <li className="mb-2 ml-4">
                                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                <h5 className="font-semibold text-gray-900 text-sm">Demande d'inscription</h5>
                                <p className="text-xs text-gray-500">Formulaire spécifique</p>
                            </li>
                            <li className="mb-2 ml-4">
                                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                <h5 className="font-semibold text-gray-900 text-sm">Pièces justificatives</h5>
                                <p className="text-xs text-gray-500">Acte officiel de modification</p>
                            </li>
                            <li className="mb-2 ml-4">
                                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                <h5 className="font-semibold text-gray-900 text-sm">Examen OMAPI</h5>
                                <p className="text-xs text-gray-500">Vérification conformité</p>
                            </li>
                            <li className="ml-4">
                                <div className="absolute w-3 h-3 bg-primary rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                <h5 className="font-semibold text-gray-900 text-sm">Inscription</h5>
                                <p className="text-xs text-gray-500">Mise à jour du registre</p>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex flex-wrap gap-4 justify-between items-center">
                <span className="font-bold text-gray-700">Tarifs d'inscription :</span>
                <div className="flex gap-4">
                    <span className="bg-white px-3 py-1 rounded border shadow-sm text-sm"><span className="font-bold">80 000 Ar</span> Transfert</span>
                    <span className="bg-white px-3 py-1 rounded border shadow-sm text-sm"><span className="font-bold">40 000 Ar</span> Changement Nom/Adresse</span>
                    <span className="bg-white px-3 py-1 rounded border shadow-sm text-sm"><span className="font-bold">60 000 Ar</span> Licence/Gage</span>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Registre;
