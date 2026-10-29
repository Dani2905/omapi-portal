
import React from 'react';
import { BREVETS_CONDITIONS } from '../../../data/brevetsData';
import { SparklesIcon, LightBulbIcon, WrenchScrewdriverIcon } from '../../../components/Icons';

const Definition: React.FC = () => {
  return (
    <section id="definition" className="scroll-mt-24">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                Conditions de brevetabilité
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
                Le brevet protège les inventions nouvelles, impliquant une activité inventive et susceptibles d'application industrielle. La protection est valable pour 20 ans à compter de la date de dépôt.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
                {BREVETS_CONDITIONS.map((cond, idx) => (
                    <div key={idx} className={`bg-${cond.color}-50 p-6 rounded-xl border border-${cond.color}-100 hover:shadow-md transition-shadow`}>
                        <div className={`w-12 h-12 bg-white text-${cond.color}-500 rounded-full flex items-center justify-center mb-4 shadow-sm mx-auto`}>
                            {cond.icon === 'sparkles' && <SparklesIcon className="w-6 h-6" />}
                            {cond.icon === 'bulb' && <LightBulbIcon className="w-6 h-6" />}
                            {cond.icon === 'wrench' && <WrenchScrewdriverIcon className="w-6 h-6" />}
                        </div>
                        <h3 className="font-bold text-gray-800 text-center mb-2">{cond.title}</h3>
                        <p className="text-sm text-gray-600 text-center">{cond.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
};

export default Definition;
