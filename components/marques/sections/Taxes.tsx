
import React from 'react';

const Taxes: React.FC = () => {
  return (
    <section id="taxes" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
            Taxes en matière de marques
        </h2>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Nature de la taxe</th>
                            <th className="px-6 py-4 text-right">Montant (Ariary)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {[
                            { name: "Taxe de dépôt pour trois classes", price: "180 000" },
                            { name: "Taxes par classe supplémentaire au-delà de la troisième", price: "20 000" },
                            { name: "Taxe de revendication de priorité, par priorité", price: "30 000" },
                            { name: "Taxe de régularisation ou de correction d'erreurs", price: "10 000" },
                            { name: "Taxe de renouvellement pour dix ans", price: "200 000" },
                            { name: "Surtaxe pour renouvellement tardif", price: "40 000" },
                            { name: "Taxe de recherche d'antériorité", price: "30 000" },
                            { name: "Taxe supp. par élément trouvé (recherche spéciale)", price: "4 000" },
                            { name: "Délivrance copie officielle d'un titre", price: "10 000" },
                            { name: "Taxe d'inscription ou radiation (par marque)", price: "30 000" },
                            { name: "État des inscriptions au registre (par marque)", price: "10 000" },
                            { name: "Restauration d'un droit à agir", price: "40 000" },
                            { name: "Taxe de certification, par cas", price: "4 000" },
                            { name: "Délivrance d'une attestation", price: "10 000" },
                            { name: "Attestation de dépôt (avec reproduction couleur)", price: "15 000" },
                        ].map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-3 font-medium text-gray-800">{row.name}</td>
                                <td className="px-6 py-3 text-right font-bold text-primary">{row.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
  );
};

export default Taxes;
