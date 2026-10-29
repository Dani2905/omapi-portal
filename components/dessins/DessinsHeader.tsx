
import React from 'react';
import { SwatchIcon } from '../../components/Icons';

const DessinsHeader: React.FC = () => {
  return (
    <div className="bg-purple-700 text-white py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-purple-900/50"></div>
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm">
                  <SwatchIcon className="w-16 h-16 text-white" />
              </div>
              <div>
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">Dépôt de Dessin/Modèle</h1>
                  <p className="text-purple-100 text-lg max-w-2xl">
                      Protégez vos créations esthétiques. La protection de l'apparence de vos produits est valable pour 5 ans, renouvelable jusqu'à 25 ans.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DessinsHeader;
