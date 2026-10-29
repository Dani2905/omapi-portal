
import React from 'react';
import { ClockIcon } from '../../Icons';

const Renouvellement: React.FC = () => {
  return (
    <section id="renouvellement" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
            Renouvellement
        </h2>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-start mb-6">
                <div className="bg-blue-50 p-3 rounded-lg mr-4">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800">Délais</h4>
                    <p className="text-sm text-gray-600">Le renouvellement doit être demandé dans les 6 mois précédant l'expiration. Une période de grâce de 6 mois est accordée ensuite.</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-right">Tarif (MGA)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-4 py-3">Renouvellement simple (5 ans)</td>
                            <td className="px-4 py-3 text-right font-bold">10 000</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3">Renouvellement double</td>
                            <td className="px-4 py-3 text-right font-bold">16 000</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3">Renouvellement triple</td>
                            <td className="px-4 py-3 text-right font-bold">18 000</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
  );
};

export default Renouvellement;
