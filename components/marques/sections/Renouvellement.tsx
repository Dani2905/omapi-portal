
import React from 'react';

const Renouvellement: React.FC = () => {
  return (
    <section id="renouvellement" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
            Renouvellement de Marque
        </h2>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-6">
            <p className="text-gray-600 mb-6">
                La protection d'une marque est valable pour 10 ans à compter de la date de dépôt. 
                Le renouvellement doit être demandé dans les 6 mois précédant l'expiration.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 border border-green-100 p-4 rounded-lg text-center">
                    <div className="text-green-800 font-bold mb-1">Période Normale</div>
                    <div className="text-sm text-green-600">6 mois avant expiration</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-center">
                    <div className="text-amber-800 font-bold mb-1">Période de Grâce</div>
                    <div className="text-sm text-amber-600">+6 mois après expiration</div>
                    <div className="text-xs text-amber-500 font-medium mt-1">(+ Frais de retard)</div>
                </div>
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-center">
                    <div className="text-red-800 font-bold mb-1">Radiation d'office</div>
                    <div className="text-sm text-red-600">Au-delà de la grâce</div>
                </div>
            </div>

            <h4 className="font-bold text-gray-800 mb-3">Documents pour le renouvellement</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
                <li>Demande de renouvellement de marque (Formulaire)</li>
                <li>Preuve du paiement des frais de renouvellement</li>
                <li>Justificatif de paiement des frais de retard (si période de grâce)</li>
                <li>Procuration (si mandataire)</li>
            </ul>
        </div>
    </section>
  );
};

export default Renouvellement;
