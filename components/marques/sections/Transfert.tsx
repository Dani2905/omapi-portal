
import React from 'react';

const Transfert: React.FC = () => {
  return (
    <section id="transfert" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">5</span>
            Transfert de Marque
        </h2>
        
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Conditions</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>• La marque doit être enregistrée et valide</li>
                        <li>• Accord écrit entre cédant et cessionnaire</li>
                        <li>• Transfert sur la totalité des produits/services</li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">Documents</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Formulaire de demande de transfert</li>
                        <li>• Acte de cession (contrat original)</li>
                        <li>• Pièces d'identité des deux parties</li>
                        <li>• Preuve de paiement</li>
                    </ul>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-red-600 mb-2">Pour le cédant</h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                        <li>Perte du droit exclusif</li>
                        <li>Interdiction d'utiliser la marque</li>
                        <li>Garantie d'éviction</li>
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-green-600 mb-2">Pour le cessionnaire</h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                        <li>Acquisition des droits</li>
                        <li>Droit d'interdire l'usage</li>
                        <li>Obligation d'exploitation</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Transfert;
