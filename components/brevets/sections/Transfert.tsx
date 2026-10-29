
import React from 'react';

const Transfert: React.FC = () => {
  return (
    <section id="transfert" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">7</span>
            Transfert de Brevet
        </h2>
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-bold text-gray-800 mb-4">Documents nécessaires</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>• Formulaire de demande de transfert</li>
                        <li>• Acte de cession (contrat)</li>
                        <li>• Pièces d'identité (Cédant/Cessionnaire)</li>
                        <li>• Preuve de paiement</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-4">Tarifs</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                            <span className="text-sm">Transfert de brevet</span>
                            <span className="font-bold text-gray-900">200 000 Ar</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                            <span className="text-sm">Licence d'exploitation</span>
                            <span className="font-bold text-gray-900">150 000 Ar</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Transfert;
