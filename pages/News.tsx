
import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { LATEST_NEWS } from '../data/mocks/news';
import { NewsItem } from '../types';
import { useCrud } from '../hooks/useCrud';
import { sortNewsItems } from '../utils/editorialLogic';

const News: React.FC = () => {
  const { items: newsList } = useCrud<NewsItem>('omapi_news', LATEST_NEWS);
  const orderedNewsList = sortNewsItems(newsList);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Actualités' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
            <h1 className="text-4xl font-bold text-primary mb-2">Toutes les Actualités</h1>
            <p className="text-xl text-gray-600">Restez informé des dernières nouvelles et événements</p>
            <div className="w-24 h-1.5 bg-primary rounded-full mt-4"></div>
        </div>

        {newsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {orderedNewsList.map((actu) => (
                    <article key={actu.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                        <Link to={`/news/${actu.id}`} className="relative h-48 overflow-hidden block bg-slate-100">
                            {actu.image ? (
                                <img
                                    src={actu.image}
                                    alt={actu.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-widest text-slate-400">Image non disponible</div>
                            )}
                            <span className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-md text-xs font-semibold">
                                {actu.category}
                            </span>
                        </Link>
                        <div className="p-6 flex-1 flex flex-col">
                            <span className="text-gray-500 text-sm mb-2 block">
                                <i className="far fa-calendar-alt mr-1"></i> {actu.date}
                            </span>
                            <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                                <Link to={`/news/${actu.id}`}>{actu.title}</Link>
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                                {actu.description}
                            </p>
                            <Link to={`/news/${actu.id}`} className="text-primary font-semibold text-sm hover:underline inline-flex items-center mt-auto">
                                Lire la suite <i className="fas fa-arrow-right ml-1 text-xs"></i>
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-gray-500 text-lg">Aucune actualité disponible pour le moment.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default News;
