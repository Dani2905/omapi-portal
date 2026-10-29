
import React from 'react';
import { BREVETS_PRICES } from '../../../data/brevetsData';

const Tarifs: React.FC = () => {
  return (
    <section id="tarifs" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
            Tarifs de dépôt
        </h2>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4 text-right">Standard (MGA)</th>
                        <th className="px-6 py-4 text-right text-amber-700">Réduit (Résidents)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {BREVETS_PRICES.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 font-medium text-gray-800">{row.name}</td>
                            <td className="px-6 py-3 text-right text-gray-600">{row.std}</td>
                            <td className="px-6 py-3 text-right font-bold text-amber-700">{row.red}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </section>
  );
};

export default Tarifs;
