import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

const RessourcesAccueil: React.FC = () => {
  const resourceCategories = [
    {
      title: 'Actualités',
      description: 'Découvrez les dernières informations et nouveautés concernant la propriété industrielle.',
      icon: 'fas fa-newspaper',
      path: '/news',
      color: 'bg-blue-600'
    },
    {
      title: 'Événements',
      description: 'Participez à nos prochains ateliers, séminaires et conférences.',
      icon: 'fas fa-calendar-alt',
      path: '/events',
      color: 'bg-purple-600'
    },
    {
      title: 'Législation',
      description: 'Consultez les textes de loi et réglementations relatifs à la propriété industrielle à Madagascar.',
      icon: 'fas fa-balance-scale',
      path: '/legislation',
      color: 'bg-indigo-600'
    },
    {
      title: 'Formations',
      description: 'Améliorez vos connaissances avec nos programmes de formation spécialisés.',
      icon: 'fas fa-graduation-cap',
      path: '/formations',
      color: 'bg-emerald-600'
    },
    {
      title: 'Formulaires',
      description: 'Téléchargez les différents formulaires nécessaires pour vos démarches.',
      icon: 'fas fa-file-alt',
      path: '/formulaires',
      color: 'bg-amber-600'
    },
    {
      title: 'Guides Pratiques',
      description: 'Accédez à nos guides pour vous accompagner dans vos dépôts et enregistrements.',
      icon: 'fas fa-book-open',
      path: '/guides',
      color: 'bg-red-600'
    },
    {
      title: 'FAQ',
      description: 'Trouvez rapidement des réponses aux questions les plus fréquemment posées.',
      icon: 'fas fa-question-circle',
      path: '/faq',
      color: 'bg-cyan-600'
    },
    {
      title: 'GOPI',
      description: 'Consultez ou commandez la Gazette Officielle de la Propriété Industrielle.',
      icon: 'fas fa-book',
      path: '/gopi',
      color: 'bg-blue-900'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-[#0b1e42] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.omapi.mg/images/bg-pattern.png')] opacity-10 bg-repeat mix-blend-overlay"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <Breadcrumb items={[{ label: 'Ressources' }]} className="mb-6 text-blue-200" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ressources et Documentation
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl leading-relaxed">
            Trouvez les informations, documents et actualités essentiels pour vous accompagner dans la protection et la gestion de vos droits de propriété intellectuelle.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 max-w-7xl -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resourceCategories.map((cat, index) => (
            <Link 
              key={index} 
              to={cat.path}
              className="bg-white rounded-xl shadow-md p-6 border flex flex-col items-start border-gray-200 hover:shadow-xl hover:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-white mb-6 shadow-sm ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                <i className={`${cat.icon} text-2xl`}></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                {cat.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                {cat.description}
              </p>
              <span className="text-blue-700 font-semibold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                Accéder <i className="fas fa-arrow-right ml-2 text-xs"></i>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RessourcesAccueil;
