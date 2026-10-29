
import React from 'react';
import { ArrowRightIcon } from '../../../components/Icons';

const Delivrance: React.FC = () => {
  return (
    <section id="delivrance" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
            Délivrance & Droits
        </h2>
        <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-8 border border-amber-100 shadow-sm">
            <p className="text-gray-700 mb-6 font-medium">
                Après examen favorable et absence d'opposition, l'OMAPI délivre le brevet qui confère un droit exclusif d'exploitation pour 20 ans.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-amber-800 font-bold mb-3 flex items-center">
                        <span className="bg-amber-200 p-1 rounded mr-2"><ArrowRightIcon className="w-3 h-3" /></span>
                        Droits conférés
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Interdire l'exploitation par un tiers</li>
                        <li>• Autoriser l'exploitation par licence</li>
                        <li>• Engager des actions en contrefaçon</li>
                        <li>• Céder ou transmettre le brevet</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-gray-800 font-bold mb-3 flex items-center">
                        <span className="bg-gray-200 p-1 rounded mr-2"><ArrowRightIcon className="w-3 h-3" /></span>
                        Limitations
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Recherche expérimentale</li>
                        <li>• Préparations de médicaments (Bolar)</li>
                        <li>• Usage à titre privé et non commercial</li>
                        <li>• Droit de procédure antérieure</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Delivrance;
