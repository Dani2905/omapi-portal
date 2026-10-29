
import React from 'react';
import { SparklesIcon, EyeIcon, WrenchIcon, PhotoIcon, CubeIcon } from '../../Icons';

const Definition: React.FC = () => {
  return (
    <section id="definition" className="scroll-mt-24">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                Conditions de protection
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
                Le dessin ou modèle industriel protège l'apparence esthétique d'un produit, caractérisée par ses lignes, contours, couleurs, forme, texture ou matériaux.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 bg-white text-purple-500 rounded-full flex items-center justify-center mb-4 shadow-sm mx-auto">
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Nouveauté</h3>
                    <p className="text-xs text-gray-600">
                        Pas de divulgation au public avant la date de dépôt.
                    </p>
                </div>
                <div className="bg-pink-50 p-6 rounded-xl border border-pink-100 hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 bg-white text-pink-500 rounded-full flex items-center justify-center mb-4 shadow-sm mx-auto">
                        <EyeIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Originalité</h3>
                    <p className="text-xs text-gray-600">
                        L'impression visuelle doit différer des créations antérieures.
                    </p>
                </div>
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 hover:shadow-md transition-shadow text-center">
                    <div className="w-12 h-12 bg-white text-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-sm mx-auto">
                        <WrenchIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Application</h3>
                    <p className="text-xs text-gray-600">
                        Doit pouvoir servir de modèle pour la fabrication d'un produit.
                    </p>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center mb-4 text-purple-700">
                    <PhotoIcon className="w-6 h-6 mr-3" />
                    <h3 className="text-lg font-bold">Dessins Industriels (2D)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Représentation en deux dimensions définissant l'apparence.
                </p>
                <ul className="text-sm text-gray-700 space-y-2 mt-auto">
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>Plans techniques</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>Schémas de construction</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>Vues orthogonales</li>
                </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center mb-4 text-purple-700">
                    <CubeIcon className="w-6 h-6 mr-3" />
                    <h3 className="text-lg font-bold">Modèles Industriels (3D)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Représentation en trois dimensions montrant forme et volume.
                </p>
                <ul className="text-sm text-gray-700 space-y-2 mt-auto">
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>Formes tridimensionnelles</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>Prototypes et maquettes</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>Emballages</li>
                </ul>
            </div>
        </div>
    </section>
  );
};

export default Definition;
