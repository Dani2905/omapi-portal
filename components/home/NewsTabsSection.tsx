
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon, NewspaperIcon, ChatBubbleLeftRightIcon, DocumentTextIcon } from '../admin/AdminIcons';
import { useCrud } from '../../hooks/useCrud';
import { NewsItem } from '../../types';
import { LATEST_NEWS } from '../../data/mocks/news';

const NewsTabsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'blog' | 'remarks'>('news');
  const { items: newsItems } = useCrud<NewsItem>('omapi_news', LATEST_NEWS);

  // Filter news items for the tabs
  const newsTabItems = newsItems
    .filter(n => !n.category || n.category === 'Annonce' || n.category === 'Événement' || n.category === 'Actualité')
    .slice(0, 4)
    .map(n => ({ 
      title: n.title, 
      date: n.date, 
      link: `/news/${n.id}`,
      image: n.image,
      description: n.description
    }));

  const blogTabItems = newsItems
    .filter(n => n.category === 'Blog')
    .slice(0, 4)
    .map(n => ({ 
      title: n.title, 
      date: n.date, 
      link: `/news/${n.id}`,
      image: n.image,
      description: n.description
    }));

  const remarksTabItems = newsItems
    .filter(n => n.category === 'Déclaration')
    .slice(0, 4)
    .map(n => ({ 
      title: n.title, 
      date: n.date, 
      link: `/news/${n.id}`,
      image: n.image,
      description: n.description
    }));

  const content = {
    news: newsTabItems,
    blog: blogTabItems,
    remarks: remarksTabItems
  };

  const renderList = (items: typeof content.news) => (
    <AnimatePresence mode="wait">
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {items.length > 0 ? items.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Link to={item.link} className="group block flex flex-col items-start">
              {item.image ? (
                <div className="w-full aspect-video overflow-hidden border border-stone-200 mb-4 bg-stone-100">
                   <img
                     src={item.image}
                     alt={item.title}
                     className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500"
                     referrerPolicy="no-referrer"
                   />
                </div>
              ) : (
                <div className="w-full aspect-video bg-stone-100 flex items-center justify-center border border-stone-200 mb-4">
                    <NewspaperIcon className="w-10 h-10 text-stone-400" />
                </div>
              )}
              <div className="flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                  <span className="font-semibold text-[#002B49] uppercase tracking-wider">OMAPI</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.date}</span>
                </div>
                <h3 className="text-[#002B49] font-serif font-bold text-lg mb-2 leading-snug group-hover:text-[#0081C6] transition-colors">
                  {item.title}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </Link>
          </motion.div>
        )) : (
          <div className="col-span-full py-12 text-center text-stone-500 italic bg-stone-50 border border-stone-200">
            Aucune publication disponible dans cette section.
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 lg:px-8 mb-16 font-sans mt-8">
      <section className="bg-white">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1">
              Publications Officielles
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#002B49]">
              Actualités & Communiqués
            </h2>
          </div>
          
          {/* Tabs as clean segmented button controls */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 border border-stone-200 mt-4 md:mt-0">
            <button 
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2 font-medium text-xs tracking-wide transition-colors ${activeTab === 'news' ? 'bg-[#002B49] text-white shadow-xs' : 'text-stone-700 hover:text-[#002B49]'}`}
            >
              Dernières nouvelles
            </button>
            <button 
              onClick={() => setActiveTab('blog')}
              className={`px-4 py-2 font-medium text-xs tracking-wide transition-colors ${activeTab === 'blog' ? 'bg-[#002B49] text-white shadow-xs' : 'text-stone-700 hover:text-[#002B49]'}`}
            >
              Dossiers & Analyses
            </button>
            <button 
              onClick={() => setActiveTab('remarks')}
              className={`px-4 py-2 font-medium text-xs tracking-wide transition-colors ${activeTab === 'remarks' ? 'bg-[#002B49] text-white shadow-xs' : 'text-stone-700 hover:text-[#002B49]'}`}
            >
              Déclarations
            </button>
          </div>
        </div>

        {/* Content Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 min-h-[400px]">
            {activeTab === 'news' && renderList(content.news)}
            {activeTab === 'blog' && renderList(content.blog)}
            {activeTab === 'remarks' && renderList(content.remarks)}
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#002B49] text-white p-8 relative overflow-hidden border border-[#003861]">
              <div className="text-xs font-semibold uppercase tracking-widest text-amber-300 mb-2">
                Veille Réglementaire
              </div>
              <h3 className="text-2xl font-serif font-bold mb-3">Lettre d'information</h3>
              <p className="mb-8 text-stone-200 text-sm leading-relaxed">
                Recevez directement les alertes officielles, les convocations d'ateliers et les résumés du Bulletin GOPI.
              </p>
              <Link to="/contact" className="inline-block bg-white text-[#002B49] font-semibold text-xs uppercase tracking-wider py-3 px-6 hover:bg-stone-100 transition-colors">
                S'abonner aux avis
              </Link>
            </div>
            
            <Link to="/news" className="group flex items-center justify-between p-5 border border-stone-300 text-[#002B49] font-medium hover:border-[#002B49] transition-colors bg-stone-50">
              <span className="text-sm font-semibold">{activeTab === 'news' ? 'Toutes les actualités' : activeTab === 'blog' ? "Tous les dossiers" : 'Toutes les déclarations'}</span>
              <ArrowRightIcon className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
};

export default NewsTabsSection;
