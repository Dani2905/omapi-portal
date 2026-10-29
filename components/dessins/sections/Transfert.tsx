
import React from 'react';

const Transfert: React.FC = () => {
  return (
    <section id="transfert" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">6</span>
            Transfert
        </h2>
        <div className="bg-white p-6 rounded-xl border border-gray-200 h-full">
            <ul className="space-y-3 text-sm text-gray-700 mb-6">
                <li className="flex items-start"><span className="mr-2">•</span> Contrat de cession écrit obligatoire</li>
                <li className="flex items-start"><span className="mr-2">•</span> Inscription au registre nécessaire</li>
                <li className="flex items-start"><span className="mr-2">•</span> Paiement des droits</li>
            </ul>
            <div className="space-y-2">
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-sm">Transfert</span>
                    <span className="font-bold text-gray-900">70 000 Ar</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-sm">Licence</span>
                    <span className="font-bold text-gray-900">50 000 Ar</span>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Transfert;
