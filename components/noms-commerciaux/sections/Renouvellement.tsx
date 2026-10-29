
import React from 'react';

const Renouvellement: React.FC = () => {
  return (
    <section id="renouvellement" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">8</span>
            Renouvellement & Mise à jour
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 mb-4 text-sm">
                Contrairement aux marques, les noms commerciaux n'ont pas de durée limite stricte mais nécessitent des mises à jour pour rester effectifs, notamment lors de changements majeurs.
            </p>
            <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                    <h4 className="font-bold text-gray-800">Taxe de renouvellement (10 ans)</h4>
                    <p className="text-xs text-gray-500">Pour maintenir la protection active</p>
                </div>
                <span className="text-xl font-bold text-emerald-600">160 000 Ar</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                    <h4 className="font-bold text-gray-800">Restauration d'un droit à agir</h4>
                    <p className="text-xs text-gray-500">Par dossier</p>
                </div>
                <span className="text-xl font-bold text-emerald-600">20 000 Ar</span>
            </div>
        </div>
    </section>
  );
};

export default Renouvellement;
