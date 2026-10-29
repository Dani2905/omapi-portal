
import React from 'react';
import { ExclamationTriangleIcon } from '../../Icons';

const Radiation: React.FC = () => {
  return (
    <section id="radiation" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">6</span>
            Radiation du Droit
        </h2>
        
        <div className="bg-red-50 rounded-xl p-8 border border-red-100">
            <div className="flex items-start mb-6">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-500 mr-4 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-bold text-red-800">Perte définitive des droits</h3>
                    <p className="text-red-700 text-sm">
                        La radiation entraîne la chute de la marque dans le domaine public. Elle peut être volontaire ou subie.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Motifs principaux</h4>
                    <ul className="text-sm space-y-2">
                        <li className="flex justify-between bg-white p-2 rounded border border-red-100">
                            <span>Déchéance (Non-usage 5 ans)</span>
                        </li>
                        <li className="flex justify-between bg-white p-2 rounded border border-red-100">
                            <span>Renonciation volontaire</span>
                        </li>
                        <li className="flex justify-between bg-white p-2 rounded border border-red-100">
                            <span>Nullité (Vice de dépôt)</span>
                        </li>
                        <li className="flex justify-between bg-white p-2 rounded border border-red-100">
                            <span>Extinction (Décès sans héritier)</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Conséquences</h4>
                    <div className="bg-white p-4 rounded border border-red-100 h-full">
                        <p className="text-sm font-bold mb-2">Immédiates :</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside mb-4">
                            <li>Perte du droit exclusif</li>
                            <li>Tout le monde peut l'utiliser</li>
                        </ul>
                        <p className="text-sm font-bold mb-2">À long terme :</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside">
                            <li>Impossible de redéposer</li>
                            <li>Perte de valeur commerciale</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Radiation;
