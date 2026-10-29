
import React from 'react';

const Examen: React.FC = () => {
  return (
    <section id="examen" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
            Examen & Délivrance
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Motifs de rejet</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span> Défaut de nouveauté</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span> Caractère purement fonctionnel</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span> Contrariété à l'ordre public</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span> Représentations insuffisantes</li>
                </ul>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 shadow-sm">
                <h3 className="font-bold text-purple-900 mb-4 border-b border-purple-200 pb-2">Droits conférés</h3>
                <ul className="space-y-2 text-sm text-purple-800">
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span> Droit exclusif d'utilisation</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span> Droit d'interdire l'exploitation</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span> Droit de céder ou licencier</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span> Action en contrefaçon</li>
                </ul>
            </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-6 text-center md:text-left">
                <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">Durée Initiale</h4>
                    <p className="text-3xl font-bold text-purple-600">5 Ans</p>
                    <p className="text-xs text-gray-500 mt-1">À compter du dépôt</p>
                </div>
                <div className="hidden md:block w-px bg-gray-200"></div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">Renouvellements</h4>
                    <p className="text-3xl font-bold text-purple-600">4 fois</p>
                    <p className="text-xs text-gray-500 mt-1">Périodes de 5 ans</p>
                </div>
                <div className="hidden md:block w-px bg-gray-200"></div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">Durée Totale</h4>
                    <p className="text-3xl font-bold text-purple-600">25 Ans</p>
                    <p className="text-xs text-gray-500 mt-1">Maximum légal</p>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Examen;
