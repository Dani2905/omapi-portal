
import React from 'react';
import { TagIcon } from '../../components/Icons';

const MarquesHeader: React.FC = () => {
  return (
    <div className="bg-primary text-white py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-900/50"></div>
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm">
                  <TagIcon className="w-16 h-16 text-white" />
              </div>
              <div>
                  <h1 className="text-3xl md:text-5xl font-bold mb-4">Dépôt de Marque</h1>
                  <p className="text-blue-100 text-lg max-w-2xl">
                      Protégez votre signe distinctif et obtenez un monopole d'exploitation sur le territoire malgache. 
                      La protection est valable pour 10 ans renouvelable indéfiniment.
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default MarquesHeader;
