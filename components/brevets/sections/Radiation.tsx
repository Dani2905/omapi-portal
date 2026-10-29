
import React from 'react';
import { ExclamationTriangleIcon } from '../../../components/Icons';

const Radiation: React.FC = () => {
  return (
    <section id="radiation" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">8</span>
            Radiation du Droit
        </h2>
        <div className="bg-red-50 rounded-xl p-8 border border-red-100">
            <div className="flex items-start mb-6">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-500 mr-4 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-bold text-red-800">Perte définitive</h3>
                    <p className="text-red-700 text-sm">
                        L'invention tombe dans le domaine public et peut être exploitée librement par tous.
                    </p>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Motifs</h4>
                    <ul className="space-y-1 text-gray-700 list-disc list-inside">
                        <li>Déchéance (Non-paiement annuités)</li>
                        <li>Renonciation volontaire</li>
                        <li>Nullité (Absence de brevetabilité)</li>
                        <li>Abandon (Retrait de demande)</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Conséquences</h4>
                    <ul className="space-y-1 text-gray-700 list-disc list-inside">
                        <li>Perte du monopole</li>
                        <li>Impossibilité de restauration</li>
                        <li>Perte de valeur commerciale</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Radiation;
