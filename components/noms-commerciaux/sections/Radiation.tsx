
import React from 'react';
import { ExclamationTriangleIcon } from '../../Icons';

const Radiation: React.FC = () => {
  return (
    <section id="radiation" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">7</span>
            Radiation du Nom Commercial
        </h2>
        <div className="bg-red-50 rounded-xl p-8 border border-red-100">
            <div className="flex items-start mb-6">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-500 mr-4 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-bold text-red-800">Perte des droits</h3>
                    <p className="text-red-700 text-sm">
                        La radiation entraîne la suppression du registre. Le nom devient disponible pour d'autres et perd son opposabilité.
                    </p>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Motifs</h4>
                    <ul className="space-y-1 text-gray-700 list-disc list-inside">
                        <li>Cessation d'activité</li>
                        <li>Décès sans succession</li>
                        <li>Faillite / Liquidation</li>
                        <li>Nullité (Vice initial)</li>
                        <li>Renonciation volontaire</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Conséquences</h4>
                    <ul className="space-y-1 text-gray-700 list-disc list-inside">
                        <li>Perte des droits sur le nom</li>
                        <li>Nom disponible pour tiers</li>
                        <li>Perte de clientèle attachée au nom</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Radiation;
