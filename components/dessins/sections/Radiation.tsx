
import React from 'react';
import { ExclamationTriangleIcon } from '../../Icons';

const Radiation: React.FC = () => {
  return (
    <section id="radiation" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">7</span>
            Radiation
        </h2>
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 h-full">
            <div className="flex items-center mb-4 text-red-800">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                <span className="font-bold">Perte définitive</span>
            </div>
            <p className="text-xs text-red-700 mb-4">
                Le modèle tombe dans le domaine public. Tout le monde peut l'utiliser librement.
            </p>
            <h4 className="font-bold text-gray-800 text-sm mb-2">Motifs fréquents :</h4>
            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                <li>Non-renouvellement (après 5 ans)</li>
                <li>Renonciation volontaire</li>
                <li>Nullité (défaut de nouveauté)</li>
            </ul>
        </div>
    </section>
  );
};

export default Radiation;
