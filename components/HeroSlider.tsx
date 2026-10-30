
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsItem, Slide } from '../types';
import { LATEST_NEWS } from '../data/mocks/news';
import { SLIDES } from '../constants';
import { useCrud } from '../hooks/useCrud';
import { buildEditorialSlides } from '../utils/editorialLogic';

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { items: newsItems } = useCrud<NewsItem>('omapi_news', LATEST_NEWS);
  const { items: managedSlides } = useCrud<Slide>('omapi_slides', SLIDES);
  
  // Les actualités à la une sont générées une seule fois depuis leur fiche.
  const slides = buildEditorialSlides(managedSlides, newsItems);

  useEffect(() => {
    if (slides.length === 0) {
      setCurrentSlide(0);
      return undefined;
    }
    setCurrentSlide((current) => current % slides.length);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);

  if (slides.length === 0) {
    return <div className="h-[400px] bg-gray-100 flex items-center justify-center text-gray-500 font-bold">Aucun contenu à afficher</div>;
  }

  const safeCurrentSlide = currentSlide % slides.length;
  const activeSlide = slides[safeCurrentSlide];

  return (
    <div className="relative h-[500px] lg:h-[600px] w-full bg-gray-100 group font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.newsId !== undefined ? `news-${activeSlide.newsId}` : `slide-${activeSlide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          className="absolute inset-0"
        >
          {/* Background Image Container */}
          <div className="absolute inset-0 right-0 lg:left-1/3 overflow-hidden">
             {activeSlide.image ? (
                 <motion.img
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 7, ease: "easeOut" }}
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover"
                 />
             ) : (
                 <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                     <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">Image non disponible</span>
                 </div>
             )}
          </div>
          
          {/* Solid Color Content Block - Curatorial / Institutional */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-[48%] bg-[#002B49]/95 lg:bg-[#002B49] z-20 flex flex-col justify-center px-8 md:px-14 lg:px-16 border-r border-white/10">
            <motion.div 
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
                {/* Clean unboxed kicker */}
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-300">
                  <span>République de Madagascar</span>
                  <span aria-hidden="true" className="text-white/40">·</span>
                  <span>OMAPI</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-semibold text-white mb-6 leading-[1.15] tracking-tight">
                  {activeSlide.title}
                </h1>
                
                <p className="text-base sm:text-lg text-stone-200 font-normal leading-relaxed mb-8 max-w-xl">
                  {activeSlide.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to={activeSlide.ctaLink}
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-[#D3273E] hover:bg-[#b01e32] transition-colors rounded-none tracking-wide"
                    >
                      <span>{activeSlide.ctaText || "En savoir plus"}</span>
                      <span className="ml-2 font-bold" aria-hidden="true">&rarr;</span>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/gopi"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white/90 border border-white/30 hover:bg-white/10 hover:text-white transition-colors tracking-wide"
                    >
                      Consulter le GOPI
                    </Link>
                  </motion.div>
                </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicators (Flat boxes) */}
      <div className="absolute bottom-6 left-8 md:left-16 z-30 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 transition-all duration-300 ${
              index === safeCurrentSlide ? 'bg-white w-12' : 'bg-white/40 w-8 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Navigation Arrows */}
      <button 
        onClick={() => setCurrentSlide((current) => (current - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-16 bg-black/40 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <i className="fas fa-chevron-left fa-lg"></i>
      </button>
      <button 
        onClick={() => setCurrentSlide((current) => (current + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-16 bg-black/40 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <i className="fas fa-chevron-right fa-lg"></i>
      </button>
    </div>
  );
};

export default HeroSlider;
