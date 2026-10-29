
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon } from '../admin/AdminIcons';
import { HomeScamConfig } from '../../types';
import { useObjectStorage } from '../../hooks/useCrud';

const ScamAndToolsSection: React.FC = () => {
  const [storedConfig] = useObjectStorage<HomeScamConfig>('omapi_home_scam', {
      title: "Les arnaques augmentent",
      subtitle: "Signes courants des escroqueries aux marques et brevets",
      description: "Des entités non officielles envoient des factures trompeuses aux déposants de brevets et de marques. Apprenez à repérer ces fraudes et protégez vos droits de propriété intellectuelle."
  });

  const config = storedConfig || {
      title: "Les arnaques augmentent",
      subtitle: "Signes courants des escroqueries aux marques et brevets",
      description: "Des entités non officielles envoient des factures trompeuses aux déposants de brevets et de marques. Apprenez à repérer ces fraudes et protégez vos droits de propriété intellectuelle."
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 mb-16 font-sans">
      <section className="bg-white">
        <div className="border-b border-stone-200 pb-4 mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">
            Sécurité & Orientation
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#002B49]">
            Avertissements & Outils Stratégiques
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Scam Warning Section - Clean Archival Styling */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="bg-[#FFFBF0] border border-amber-200 p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-1">
                      Alerte Usagers
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-[#002B49] leading-tight">
                      {config.title}
                    </h3>
                  </div>
                  <div className="text-amber-700 p-2 shrink-0">
                      <ExclamationTriangleIcon className="w-8 h-8" />
                  </div>
              </div>
              <p className="text-base font-semibold text-stone-800 mb-3">{config.subtitle}</p>
              <p className="text-sm text-stone-700 mb-8 leading-relaxed">
                  {config.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 border-t border-amber-200/80 pt-6">
                <Link to="/faq" className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#002B49] hover:text-[#0081C6] transition-colors">
                    <span>Escroqueries aux brevets</span>
                    <span aria-hidden="true" className="ml-1.5 font-bold">&rarr;</span>
                </Link>
                <span className="hidden sm:inline text-amber-300">·</span>
                <Link to="/faq" className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#002B49] hover:text-[#0081C6] transition-colors">
                    <span>Escroqueries aux marques</span>
                    <span aria-hidden="true" className="ml-1.5 font-bold">&rarr;</span>
                </Link>
            </div>
          </motion.div>

          {/* IP Identifier Tool Spotlight - High-contrast institutional */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-[#002B49] text-white p-8 border border-[#003861] flex flex-col items-center text-center justify-center"
          >
            <div className="mb-6 flex justify-center space-x-3">
                <div className="w-14 h-14 flex items-center justify-center bg-white text-[#002B49] border border-white/20">
                    <span className="text-2xl font-serif font-bold">P</span>
                </div>
                <div className="w-14 h-14 flex items-center justify-center bg-[#D3273E] text-white border border-[#D3273E]">
                    <span className="text-2xl font-serif font-bold">I</span>
                </div>
            </div>

            <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-amber-300 mb-2">
                  Diagnostic Rapide
                </div>
                <h3 className="text-2xl font-serif font-bold mb-3 text-white">
                  Identificateur de Propriété Industrielle
                </h3>
                <p className="text-stone-200 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                  Vous avez une invention, un design, une marque ou un nom commercial ? Déterminez le titre de protection adapté à votre actif immatériel.
                </p>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                  <Link to="/guides" className="inline-flex items-center px-6 py-3 bg-white text-[#002B49] text-xs font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors">
                      Commencer le diagnostic
                  </Link>
                </motion.div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
};

export default ScamAndToolsSection;
