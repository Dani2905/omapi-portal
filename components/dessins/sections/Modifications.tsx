
import React from 'react';

const Modifications: React.FC = () => {
  return (
    <section id="modifications" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">5</span>
            Modifications
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-1">Correction d'erreurs</h4>
                <p className="text-xs text-gray-500 mb-3">Erreurs matérielles description/représentation</p>
                <span className="font-bold text-purple-700 bg-white px-2 py-1 rounded border text-sm">50 000 Ar</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-1">Division demande</h4>
                <p className="text-xs text-gray-500 mb-3">Séparation de modèles déposés ensemble</p>
                <span className="font-bold text-purple-700 bg-white px-2 py-1 rounded border text-sm">75 000 Ar</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-1">Limitation</h4>
                <p className="text-xs text-gray-500 mb-3">Réduction de l'étendue de protection</p>
                <span className="font-bold text-purple-700 bg-white px-2 py-1 rounded border text-sm">60 000 Ar</span>
            </div>
        </div>
    </section>
  );
};

export default Modifications;
