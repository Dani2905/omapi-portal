
import React from 'react';
import { BREVETS_MODIFICATIONS } from '../../../data/brevetsData';

const Modifications: React.FC = () => {
  return (
    <section id="modifications" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">6</span>
            Modifications du Brevet
        </h2>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="space-y-4">
                {BREVETS_MODIFICATIONS.map((mod, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0">
                        <div>
                            <h4 className="font-bold text-gray-800">{mod.title}</h4>
                            <p className="text-xs text-gray-500">{mod.desc}</p>
                        </div>
                        <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded">{mod.price}</span>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
};

export default Modifications;
