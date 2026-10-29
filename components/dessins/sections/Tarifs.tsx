
import React from 'react';

const Tarifs: React.FC = () => {
  return (
    <section id="tarifs" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
            Tarifs de dépôt
        </h2>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4 text-right">Tarifs (MGA)</th>
                        <th className="px-6 py-4">Description</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {[
                        { name: "Dépôt simple (1 modèle)", price: "8 000", desc: "Protection 5 ans" },
                        { name: "Dépôt double", price: "14 000", desc: "2 modèles, même demande" },
                        { name: "Dépôt triple", price: "18 000", desc: "3 modèles" },
                        { name: "Revendication priorité", price: "6 000", desc: "Par priorité" },
                        { name: "Enregistrement + Pub", price: "4 000", desc: "Frais de publication" },
                    ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 font-medium text-gray-800">{row.name}</td>
                            <td className="px-6 py-3 text-right font-bold text-purple-700">{row.price}</td>
                            <td className="px-6 py-3 text-gray-500 text-xs">{row.desc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </section>
  );
};

export default Tarifs;
