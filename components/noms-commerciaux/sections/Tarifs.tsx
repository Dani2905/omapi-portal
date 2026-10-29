
import React from 'react';

const Tarifs: React.FC = () => {
  return (
    <section id="tarifs" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
            Tarifs et Services
        </h2>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4 text-right">Tarif (MGA)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {[
                        { name: "Taxe de dépôt d'un nom commercial", price: "160 000" },
                        { name: "Taxe de régularisation ou correction", price: "5 000" },
                        { name: "Taxe de recherche d'antériorité", price: "30 000" },
                        { name: "Copie officielle du nom enregistré", price: "6 000" },
                        { name: "Taxe de certification, par cas", price: "5 000" },
                    ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 font-medium text-gray-800">{row.name}</td>
                            <td className="px-6 py-3 text-right font-bold text-emerald-700">{row.price}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </section>
  );
};

export default Tarifs;
