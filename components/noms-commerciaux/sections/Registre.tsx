
import React from 'react';
import { CheckCircleIcon } from '../../Icons';

const Registre: React.FC = () => {
  return (
    <section id="registre" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
            Inscription au Registre
        </h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="p-8">
                <p className="text-gray-600 mb-6">
                    Toute modification affectant les droits sur un nom commercial doit faire l'objet d'une inscription au registre pour être opposable aux tiers.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold text-gray-800 mb-3">Cas d'inscription obligatoire</h4>
                        <ul className="space-y-2">
                            {[
                                "Transfert de propriété", 
                                "Changement de nom ou d'adresse", 
                                "Modification de la forme juridique", 
                                "Fusion ou scission d'entreprise", 
                                "Gage ou saisie"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-3">Procédure</h4>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start"><span className="font-bold text-emerald-600 mr-2">1.</span> Demande d'inscription (Formulaire)</li>
                            <li className="flex items-start"><span className="font-bold text-emerald-600 mr-2">2.</span> Pièces justificatives (Actes)</li>
                            <li className="flex items-start"><span className="font-bold text-emerald-600 mr-2">3.</span> Examen de conformité</li>
                            <li className="flex items-start"><span className="font-bold text-emerald-600 mr-2">4.</span> Mise à jour du registre</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-700">Taxe d'inscription ou de radiation :</span>
                <span className="font-bold text-emerald-700 text-lg">10 000 Ar / dossier</span>
            </div>
        </div>
    </section>
  );
};

export default Registre;
