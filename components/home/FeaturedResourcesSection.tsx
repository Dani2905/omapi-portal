
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, PlayCircleIcon } from '../admin/AdminIcons';
import { HomeResourcesConfig } from '../../types';
import { useObjectStorage } from '../../hooks/useCrud';

const FeaturedResourcesSection: React.FC = () => {
  const [storedConfig] = useObjectStorage<HomeResourcesConfig>('omapi_home_resources', {
      omapiHourTitle: "L'Heure OMAPI & Ateliers Pratiques",
      omapiHourDesc: "Rejoignez mensuellement les juristes et examinateurs de l'Office pour comprendre les critères de brevetabilité et de dépôt de marques.",
      omapiHourThumbnail: "/src/assets/images/omapi_headquarters_hero_1791815108089.jpg",
      videoTitle: "Instruction et suivi d'un dossier en ligne",
      videoDesc: "Le guide pas-à-pas pour vérifier le statut de votre demande, répondre aux notifications d'examen et consulter la publication au GOPI.",
      videoThumbnail: "/src/assets/images/omapi_patent_innovation_1791815120217.jpg",
      videoDuration: "04:15"
  });

  const config = storedConfig || {
      omapiHourTitle: "L'Heure OMAPI & Ateliers Pratiques",
      omapiHourDesc: "Rejoignez mensuellement les juristes et examinateurs de l'Office pour comprendre les critères de brevetabilité et de dépôt de marques.",
      omapiHourThumbnail: "/src/assets/images/omapi_headquarters_hero_1791815108089.jpg",
      videoTitle: "Instruction et suivi d'un dossier en ligne",
      videoDesc: "Le guide pas-à-pas pour vérifier le statut de votre demande, répondre aux notifications d'examen et consulter la publication au GOPI.",
      videoThumbnail: "/src/assets/images/omapi_patent_innovation_1791815120217.jpg",
      videoDuration: "04:15"
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 mb-20 font-sans">
      <section className="bg-white">
        <div className="border-b border-stone-200 pb-4 mb-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">
            Documentation & Pédagogie
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#002B49]">
            Ressources Clés & Formations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* OMAPI Hour - Archival Card */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
              className="flex flex-col bg-stone-50 border border-stone-200"
            >
                <div className="w-full aspect-video bg-stone-900 relative group overflow-hidden border-b border-stone-200">
                    <img 
                        src={config.omapiHourThumbnail || "/src/assets/images/omapi_headquarters_hero_1791815108089.jpg"}
                        alt={config.omapiHourTitle} 
                        className="w-full h-full object-cover opacity-85 group-hover:scale-103 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-14 h-14 bg-[#002B49] text-white flex items-center justify-center shadow-md">
                            <ClockIcon className="w-7 h-7" />
                        </div>
                    </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#0081C6] mb-2">
                    Rencontres Régulières
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#002B49] mb-3">{config.omapiHourTitle}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-8 flex-grow">
                      {config.omapiHourDesc}
                  </p>
                  <Link to="/events" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#D3273E] hover:text-[#002B49] transition-colors">
                      <span>Consulter les prochaines sessions</span>
                      <span className="ml-2" aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
            </motion.div>

            {/* Video Thumbnail - Archival Card */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col bg-stone-50 border border-stone-200"
            >
                <div className="w-full aspect-video bg-stone-900 relative group overflow-hidden border-b border-stone-200">
                    <img 
                        src={config.videoThumbnail || "/src/assets/images/omapi_patent_innovation_1791815120217.jpg"}
                        alt={config.videoTitle} 
                        className="w-full h-full object-cover opacity-85 group-hover:scale-103 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-14 h-14 bg-[#D3273E] text-white flex items-center justify-center pl-0.5 shadow-md">
                            <PlayCircleIcon className="w-7 h-7" />
                        </div>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-stone-900/90 text-stone-100 px-2.5 py-1 text-xs font-mono tabular-nums">
                        {config.videoDuration || "04:15"}
                    </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#0081C6] mb-2">
                    Guide Numérique
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#002B49] mb-3">{config.videoTitle}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-8 flex-grow">
                      {config.videoDesc}
                  </p>
                  <Link to="/guides" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#D3273E] hover:text-[#002B49] transition-colors">
                      <span>Explorer la documentation complète</span>
                      <span className="ml-2" aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
            </motion.div>

        </div>
      </section>
    </div>
  );
};

export default FeaturedResourcesSection;
