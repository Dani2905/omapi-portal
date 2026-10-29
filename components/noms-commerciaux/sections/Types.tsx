
import React from 'react';
import { UserIcon, BuildingOfficeIcon } from '../../Icons';

const Types: React.FC = () => {
  return (
    <section id="types" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
            Types de noms commerciaux
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4 text-emerald-700">
                    <UserIcon className="w-6 h-6 mr-3" />
                    <h3 className="text-lg font-bold">Personnes Physiques</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Dénomination sous laquelle une personne physique exerce son activité professionnelle.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Nom patronyme complet</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Nom d'usage commercial</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Enseigne commerciale</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Nom de fantaisie</li>
                </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4 text-emerald-700">
                    <BuildingOfficeIcon className="w-6 h-6 mr-3" />
                    <h3 className="text-lg font-bold">Personnes Morales</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Dénomination sociale ou raison sociale des entreprises et sociétés.
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Raison sociale</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Nom abrégé</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Enseigne</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>Marque d'entreprise</li>
                </ul>
            </div>
        </div>
    </section>
  );
};

export default Types;
