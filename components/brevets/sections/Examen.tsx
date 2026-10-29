
import React from 'react';

const Examen: React.FC = () => {
  return (
    <section id="examen" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
            Examen & Publication
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Examen formel</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Vérification complétude du dossier</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Conformité des formulaires</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Paiement des frais</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Classification de l'invention</li>
                </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Examen au fond</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Évaluation de la nouveauté</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Appréciation de l'activité inventive</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Vérification application industrielle</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span> Clarté des revendications</li>
                </ul>
            </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2">1. Rapport de recherche</h4>
                    <p className="text-sm text-gray-600">L'OMAPI établit un rapport citant les documents pertinents de l'état de la technique.</p>
                </div>
                <div className="hidden md:block w-px bg-gray-300"></div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2">2. Publication (18 mois)</h4>
                    <p className="text-sm text-gray-600">La demande est publiée au Bulletin Officiel (GOPI) 18 mois après le dépôt.</p>
                </div>
                <div className="hidden md:block w-px bg-gray-300"></div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-2">3. Opposition (3 mois)</h4>
                    <p className="text-sm text-gray-600">Toute personne peut former opposition dans un délai de 3 mois après publication.</p>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Examen;
