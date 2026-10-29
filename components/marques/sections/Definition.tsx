
import React from 'react';
import { LightBulbIcon, PhotoIcon, TagIcon, CheckCircleIcon } from '../../Icons';

const Definition: React.FC = () => {
  return (
    <section id="notion" className="scroll-mt-24">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <LightBulbIcon className="w-8 h-8 text-primary mr-3" />
                Qu'est-ce qu'une marque ?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                La marque de produits ou de services est un <strong>signe</strong> susceptible de représentation graphique servant à <strong>distinguer</strong> les produits ou services d'une personne physique ou morale de ceux d'autres personnes.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="mx-auto w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-3 font-serif font-bold text-xl">
                        Aa
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">Nominative</h3>
                    <p className="text-sm text-gray-600">Un mot, un nom, un slogan, des chiffres ou des lettres.</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="mx-auto w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                        <PhotoIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">Figurative</h3>
                    <p className="text-sm text-gray-600">Un dessin, un logo, une étiquette ou une forme particulière.</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                        <TagIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">Mixte</h3>
                    <p className="text-sm text-gray-600">Une combinaison d'éléments verbaux et figuratifs.</p>
                </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-primary">
                <h3 className="font-bold text-blue-900 mb-3">Conditions de validité</h3>
                <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                        <span><strong>Distinctive :</strong> Elle ne doit pas être la désignation générique ou usuelle du produit (ex: "Pomme" pour des fruits).</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                        <span><strong>Licite :</strong> Elle ne doit pas être contraire à l'ordre public ou aux bonnes mœurs.</span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                        <span><strong>Disponible :</strong> Elle ne doit pas reproduire ou imiter une marque déjà enregistrée pour des produits similaires.</span>
                    </li>
                </ul>
            </div>
        </div>
    </section>
  );
};

export default Definition;
