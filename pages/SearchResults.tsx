import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useCrud } from '../hooks/useCrud';
import { getLibraryPlainText } from '../utils/documentLibraryLogic';
import { NewsItem, LegislationItem, Formulaire, Guide, Formation, Event, GopiItem } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import { LATEST_NEWS } from '../data/mocks/news';
import { 
  DEFAULT_LEGISLATION, 
  DEFAULT_FORMS, 
  DEFAULT_GUIDES, 
  DEFAULT_FORMATIONS, 
  DEFAULT_EVENTS, 
  DEFAULT_GOPI 
} from '../constants';

const SearchResults: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';
  const lowerQuery = query.toLowerCase();

  const { items: news } = useCrud<NewsItem>('omapi_news', LATEST_NEWS);
  const { items: legislation } = useCrud<LegislationItem>('omapi_legislation', DEFAULT_LEGISLATION);
  const { items: forms } = useCrud<Formulaire>('omapi_forms', DEFAULT_FORMS);
  const { items: guides } = useCrud<Guide>('omapi_guides', DEFAULT_GUIDES);
  const { items: formations } = useCrud<Formation>('omapi_formations', DEFAULT_FORMATIONS);
  const { items: events } = useCrud<Event>('omapi_events', DEFAULT_EVENTS);
  const { items: gopi } = useCrud<GopiItem>('omapi_gopi', DEFAULT_GOPI);

  const results = useMemo(() => {
    if (!lowerQuery) return [];

    const matchedNews = news.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.description.toLowerCase().includes(lowerQuery)
    ).map(item => ({ ...item, resultType: 'Actualité', link: `/news/${item.id}` }));

    const matchedLegislation = legislation.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.description.toLowerCase().includes(lowerQuery)
    ).map(item => ({ ...item, resultType: 'Législation', link: '/legislation' }));

    const matchedForms = forms.filter(item =>
      [item.title, getLibraryPlainText(item.description)].some((value) => String(value || '').toLocaleLowerCase('fr').includes(lowerQuery))
    ).map(item => ({ ...item, resultType: 'Formulaire', link: '/formulaires' }));

    const matchedGuides = guides.filter(item =>
      [item.title, getLibraryPlainText(item.description)].some((value) => String(value || '').toLocaleLowerCase('fr').includes(lowerQuery))
    ).map(item => ({ ...item, resultType: 'Guide', link: '/guides' }));

    const matchedFormations = formations.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      (item.description && item.description.toLowerCase().includes(lowerQuery))
    ).map(item => ({ ...item, resultType: 'Formation', link: '/formations' }));

    const matchedEvents = events.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      item.description.toLowerCase().includes(lowerQuery)
    ).map(item => ({ ...item, resultType: 'Événement', link: `/events/${item.id}` }));

    const matchedGopi = gopi.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) || 
      (item.description && item.description.toLowerCase().includes(lowerQuery))
    ).map(item => ({ ...item, resultType: 'GOPI', link: '/gopi' }));

    return [
      ...matchedNews,
      ...matchedLegislation,
      ...matchedForms,
      ...matchedGuides,
      ...matchedFormations,
      ...matchedEvents,
      ...matchedGopi
    ];
  }, [lowerQuery, news, legislation, forms, guides, formations, events, gopi]);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-blue-900 text-white py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Résultats de recherche</h1>
          <p className="text-blue-100 text-lg">
            {query ? `Résultats pour "${query}"` : "Veuillez entrer un terme de recherche"}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Breadcrumb items={[{ label: 'Recherche' }]} />

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 md:p-8">
          {query ? (
            results.length > 0 ? (
              <div className="space-y-6">
                <p className="text-gray-600 mb-6">{results.length} résultat(s) trouvé(s)</p>
                {results.map((result, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {result.resultType}
                      </span>
                    </div>
                    <Link to={result.link} className="block group">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">
                        {result.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2">
                        {result.description ? result.description.replace(/<[^>]*>?/gm, '') : ''}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-600">
                  Nous n'avons trouvé aucun résultat pour "{query}". Essayez avec d'autres mots-clés.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Utilisez la barre de recherche en haut de la page pour trouver des informations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
