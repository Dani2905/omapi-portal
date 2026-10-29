
import React from 'react';

const Modifications: React.FC = () => {
  return (
    <section id="modifications" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">5</span>
            Modifications
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <h4 className="font-bold text-gray-800 mb-1">Dénomination</h4>
                <p className="text-xs text-gray-500 mb-3 flex-1">Rebranding ou stratégie</p>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border text-sm text-center">50 000 Ar</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <h4 className="font-bold text-gray-800 mb-1">Adresse</h4>
                <p className="text-xs text-gray-500 mb-3 flex-1">Siège social ou établissement</p>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border text-sm text-center">25 000 Ar</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <h4 className="font-bold text-gray-800 mb-1">Forme Juridique</h4>
                <p className="text-xs text-gray-500 mb-3 flex-1">Transformation (SARL, SA...)</p>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border text-sm text-center">60 000 Ar</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <h4 className="font-bold text-gray-800 mb-1">Fusion/Scission</h4>
                <p className="text-xs text-gray-500 mb-3 flex-1">Opérations de restructuration</p>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border text-sm text-center">80 000 Ar</span>
            </div>
        </div>
    </section>
  );
};

export default Modifications;
