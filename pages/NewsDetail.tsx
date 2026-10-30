
import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { LATEST_NEWS } from '../data/mocks/news';
import { NewsItem } from '../types';
import { useCrud } from '../hooks/useCrud';
import { sanitizeNewsHtml, sortNewsItems } from '../utils/editorialLogic';

// --- Heroicons ---
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.593l6.002-4.5c.827-.478.966-1.583.428-2.282l-9.58-9.58A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
);

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  const { items: allNews, loading: crudLoading } = useCrud<NewsItem>('omapi_news', LATEST_NEWS);
  const numericId = Number(id);
  const newsItem = Number.isSafeInteger(numericId)
    ? allNews.find((item) => String(item.id) === String(numericId))
    : undefined;
  const relatedNews = newsItem
    ? sortNewsItems(allNews).filter((item) => String(item.id) !== String(newsItem.id)).slice(0, 3)
    : [];

  if (crudLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Chargement...</div>;
  }

  if (!newsItem) {
    return <Navigate to="/news" replace />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[
          { label: 'Ressources' }, 
          { label: 'Actualités', path: '/news' },
          { label: newsItem.title.length > 30 ? `${newsItem.title.slice(0, 30)}…` : newsItem.title }
      ]} />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2 min-w-0 break-words">
                <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="relative h-64 md:h-96 w-full bg-slate-200">
                        {newsItem.image ? (
                            <img
                                src={newsItem.image}
                                alt={newsItem.title}
                                className="w-full h-full object-cover"
                                onError={(event) => { event.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-widest text-slate-500">Image non disponible</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
                            <div className="flex flex-wrap gap-3 mb-3">
                                <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    {newsItem.category}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-bold leading-tight text-white mb-2 shadow-sm">
                                {newsItem.title}
                            </h1>
                            <div className="flex items-center text-sm text-gray-200">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {newsItem.date}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-10">
                        {/* Intro / Lead */}
                        <p className="text-xl font-medium text-gray-800 leading-relaxed mb-8 border-l-4 border-primary pl-4 italic">
                            {newsItem.description}
                        </p>

                        {/* Body Content - Rich Text Rendering */}
                        <div className="prose prose-lg text-gray-600 max-w-none break-words">
                            {/* 
                                Style manuel pour les éléments HTML injectés car nous n'avons pas le plugin @tailwindcss/typography
                                configuré dans index.html pour la classe 'prose' standard.
                            */}
                            <style>{`
                                .rich-content { 
                                    word-wrap: break-word; 
                                    overflow-wrap: break-word; 
                                }
                                .rich-content * { max-width: 100%; }
                                .rich-content h2 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-top: 2rem; margin-bottom: 1rem; }
                                .rich-content h3 { font-size: 1.25rem; font-weight: 600; color: #374151; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                                .rich-content p { margin-bottom: 1rem; line-height: 1.75; white-space: normal; }
                                .rich-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                                .rich-content li { margin-bottom: 0.5rem; }
                                .rich-content strong { font-weight: 700; color: #111827; }
                                .rich-content a { color: #2563eb; text-decoration: underline; }
                                .rich-content a:hover { color: #1d4ed8; }
                            `}</style>
                            
                            {newsItem.content ? (
                                <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeNewsHtml(newsItem.content) }} />
                            ) : (
                                <p className="italic text-gray-500">Aucun contenu supplémentaire disponible pour cet article.</p>
                            )}
                        </div>

                        {/* Share Section */}
                        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="font-bold text-gray-700 flex items-center">
                                <ShareIcon className="w-5 h-5 mr-2 text-primary" /> Partager cet article
                            </span>
                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'noopener,noreferrer')}
                                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition w-10 h-10 flex items-center justify-center"
                                >
                                    <i className="fab fa-facebook-f"></i>
                                </button>
                                <button 
                                    onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(newsItem.title)}`, '_blank', 'noopener,noreferrer')}
                                    className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition w-10 h-10 flex items-center justify-center"
                                >
                                    <i className="fab fa-linkedin-in"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
                {/* Related News */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center border-b border-gray-100 pb-2">
                        <TagIcon className="w-5 h-5 mr-2 text-primary" />
                        Autres actualités
                    </h3>
                    <div className="space-y-6">
                        {relatedNews.map(item => (
                            <Link key={item.id} to={`/news/${item.id}`} className="flex gap-4 group">
                                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            onError={(event) => { event.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-center text-[8px] uppercase text-gray-400">Image<br />indisponible</div>
                                    )}
                                </div>
                                <div>
                                    <span className="text-xs text-primary font-semibold block mb-1">{item.category}</span>
                                    <h4 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h4>
                                    <span className="text-xs text-gray-400 mt-1 block">{item.date}</span>
                                </div>
                            </Link>
                        ))}
                        {relatedNews.length === 0 && (
                            <p className="text-sm text-gray-500">Aucune autre actualité récente.</p>
                        )}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <Link to="/news" className="block w-full py-2 text-center text-sm font-bold text-primary hover:bg-blue-50 rounded-lg transition-colors">
                            Voir toutes les actualités
                        </Link>
                    </div>
                </div>

                {/* Newsletter Box (Visual Only) */}
                <div className="bg-gradient-to-br from-gray-900 to-primary text-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold mb-2">Restez informé</h3>
                    <p className="text-sm text-gray-300 mb-4">Recevez les dernières nouvelles de l'OMAPI directement dans votre boîte mail.</p>
                    <div className="space-y-2">
                        <input type="email" placeholder="Votre email" className="w-full px-4 py-2 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        <button className="w-full bg-white text-primary font-bold py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                            S'abonner
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
