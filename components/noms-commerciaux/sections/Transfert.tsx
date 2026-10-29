
import React from 'react';
import { DocumentTextIcon } from '../../Icons';

const Transfert: React.FC = () => {
  return (
    <section id="transfert" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">6</span>
            Transfert de Nom Commercial
        </h2>
        
        <div className="bg-emerald-50 rounded-xl p-8 border border-emerald-100">
            <div className="flex items-start mb-6">
                <DocumentTextIcon className="w-10 h-10 text-emerald-600 mr-4 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-bold text-emerald-900">Cession de fonds de commerce</h3>
                    <p className="text-emerald-800 text-sm">
                        Le transfert de nom commercial accompagne généralement la cession du fonds de commerce. Il doit être inscrit au Registre National.
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Conditions</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Nom commercial enregistré et en vigueur</li>
                        <li>Accord écrit (Cédant/Cessionnaire)</li>
                        <li>Transfert du fonds de commerce complet</li>
                        <li>Capacité commerciale du cessionnaire</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-2">Documents</h4>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Formulaire de demande de transfert</li>
                        <li>Acte de cession du fonds</li>
                        <li>Pièces d'identité des parties</li>
                        <li>Preuve de paiement</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Transfert;
