
import React from 'react';
import { BREVETS_ANNUITIES } from '../../../data/brevetsData';

const Annuites: React.FC = () => {
  return (
    <section id="annuites" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">5</span>
            Annuités & Maintien en vigueur
        </h2>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <p className="text-gray-700 text-sm">
                    Pour maintenir un brevet, le titulaire doit payer des annuités annuelles à partir de la 2ème année.
                </p>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-700 uppercase font-semibold border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">Année</th>
                        <th className="px-6 py-4 text-right">Standard (MGA)</th>
                        <th className="px-6 py-4 text-right text-amber-700">Réduit (Résidents)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {BREVETS_ANNUITIES.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-medium text-gray-800">{row.year}</td>
                            <td className="px-6 py-3 text-right text-gray-600">{row.std}</td>
                            <td className="px-6 py-3 text-right font-bold text-amber-700">{row.red}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-100 p-4 rounded-lg text-center">
                <div className="text-green-800 font-bold mb-1">Période Normale</div>
                <div className="text-sm text-green-600">3 mois avant l'échéance</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-center">
                <div className="text-amber-800 font-bold mb-1">Période de Grâce</div>
                <div className="text-sm text-amber-600">6 mois après (+50% frais)</div>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-center">
                <div className="text-red-800 font-bold mb-1">Déchéance</div>
                <div className="text-sm text-red-600">Au-delà de la grâce</div>
            </div>
        </div>
    </section>
  );
};

export default Annuites;
