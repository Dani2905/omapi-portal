
import React from 'react';
import { ScaleIcon, CheckCircleIcon, ExclamationTriangleIcon } from '../../Icons';

const Definition: React.FC = () => {
  return (
    <section id="definition" className="scroll-mt-24">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                Dépôt Initial & Conditions
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
                Le nom commercial est la dénomination sous laquelle une personne physique ou morale exerce son activité commerciale, industrielle, artisanale ou libérale. Son enregistrement protège cette dénomination et la rend opposable aux tiers.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 text-center">
                    <div className="w-12 h-12 bg-white text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-sm mx-auto">
                        <ScaleIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Activité légale</h3>
                    <p className="text-xs text-gray-600">
                        Activité commerciale, industrielle, artisanale ou libérale.
                    </p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                    <div className="w-12 h-12 bg-white text-blue-500 rounded-full flex items-center justify-center mb-4 shadow-sm mx-auto">
                        <CheckCircleIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Distinctif</h3>
                    <p className="text-xs text-gray-600">
                        Suffisamment distinctif pour identifier l'entreprise.
                    </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-center">
                    <div className="w-12 h-12 bg-white text-purple-500 rounded-full flex items-center justify-center mb-4 shadow-sm mx-auto">
                        <ExclamationTriangleIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Ordre public</h3>
                    <p className="text-xs text-gray-600">
                        Conforme à l'ordre public et aux bonnes mœurs.
                    </p>
                </div>
            </div>
        </div>
    </section>
  );
};

export default Definition;
