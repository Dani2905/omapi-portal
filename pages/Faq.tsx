
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

// --- Heroicons ---
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const EnvelopeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);

const ChatBubbleLeftRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
  </svg>
);

// Données enrichies
const FAQ_DATA = [
  // Général
  {
    category: 'Général',
    question: "Qu'est-ce que la propriété industrielle ?",
    answer: "La propriété industrielle est une branche de la propriété intellectuelle qui protège les créations utilitaires et les signes distinctifs. Elle comprend les brevets d'invention, les marques, les dessins et modèles industriels, et les noms commerciaux."
  },
  {
    category: 'Général',
    question: "Quels sont les modes de paiement acceptés par l'OMAPI ?",
    answer: "L'OMAPI accepte les paiements en espèces (au siège), par chèque bancaire certifié, par virement bancaire, et désormais via Mobile Money (MVola, Orange Money) pour certains services comme la commande de GOPI."
  },
  {
    category: 'Général',
    question: "Où se trouve le siège de l'OMAPI ?",
    answer: "Nous sommes situés à l'Immeuble OMAPI, Rue Fernand Kasanga Tsimi Lebatsy, Antananarivo 101. Nos bureaux sont ouverts du lundi au vendredi de 08h00 à 16h00."
  },
  
  // Marques
  {
    category: 'Marques',
    question: "Combien de temps dure la protection d'une marque ?",
    answer: "La protection d'une marque est valable pour 10 ans à compter de la date de dépôt. Elle est renouvelable indéfiniment par périodes successives de 10 ans, moyennant le paiement de la taxe de renouvellement."
  },
  {
    category: 'Marques',
    question: "Puis-je déposer une marque sans être résident à Madagascar ?",
    answer: "Oui, mais si vous êtes domicilié à l'étranger, vous devez obligatoirement constituer un mandataire agréé résidant à Madagascar pour vous représenter devant l'OMAPI."
  },
  {
    category: 'Marques',
    question: "Qu'est-ce qu'une recherche d'antériorité ?",
    answer: "C'est une vérification effectuée dans la base de données de l'OMAPI pour s'assurer que le signe que vous souhaitez déposer n'est pas déjà enregistré ou utilisé par quelqu'un d'autre pour des produits ou services similaires."
  },

  // Brevets
  {
    category: 'Brevets',
    question: "Quelle est la durée de protection d'un brevet ?",
    answer: "Un brevet d'invention est protégé pour une durée maximale de 20 ans à compter de la date de dépôt, sous réserve du paiement annuel des taxes de maintien en vigueur (annuités)."
  },
  {
    category: 'Brevets',
    question: "Une invention divulguée au public peut-elle être brevetée ?",
    answer: "En principe, non. La nouveauté est un critère absolu. Si vous avez divulgué votre invention (publication, conférence, vente) avant le dépôt, elle perd son caractère de nouveauté et ne peut plus être brevetée."
  },
  
  // Dessins
  {
    category: 'Dessins & Modèles',
    question: "Quelle différence entre brevet et dessin/modèle ?",
    answer: "Le brevet protège les aspects techniques et fonctionnels d'une invention, tandis que le dessin ou modèle protège l'apparence esthétique, ornementale et visuelle d'un produit."
  },
  {
    category: 'Dessins & Modèles',
    question: "Quelle est la durée de protection d'un dessin ou modèle ?",
    answer: "La protection est accordée pour une durée initiale de 5 ans, renouvelable deux fois, pour une durée maximale totale de 15 ans (selon le texte actuel, à vérifier selon les dernières mises à jour)."
  }
];

const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');

  const categories = ['Tous', 'Général', 'Marques', 'Brevets', 'Dessins & Modèles'];

  const filteredFaq = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Tous' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Centre d\'aide & FAQ' }]} />

      {/* Hero Search Section */}
      <div className="bg-primary pt-16 pb-24 px-4 text-center relative overflow-hidden">
          {/* Motif géométrique CSS pur au lieu d'une image externe */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ 
                   backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', 
                   backgroundSize: '24px 24px' 
               }}>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 container mx-auto max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Comment pouvons-nous vous aider ?</h1>
              <p className="text-blue-100 mb-8 text-lg">Trouvez rapidement des réponses concernant les marques, brevets et procédures.</p>
              
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-4 rounded-xl shadow-lg border-none outline-none focus:ring-4 focus:ring-blue-300 bg-white text-gray-800 placeholder-gray-400 font-medium"
                      placeholder="Rechercher une question (ex: renouvellement marque, paiement...)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-10 relative z-20">
        
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all transform hover:-translate-y-0.5 ${
                        activeCategory === cat 
                        ? 'bg-white text-primary ring-2 ring-primary' 
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
            {filteredFaq.length > 0 ? (
                filteredFaq.map((item, index) => (
                    <div 
                        key={index} 
                        className={`bg-white rounded-xl border transition-all duration-300 ${openIndex === index ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-gray-200 hover:border-blue-300 shadow-sm'}`}
                    >
                        <button
                            onClick={() => toggleFaq(index)}
                            className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                        >
                            <div className="flex items-center gap-3">
                                {activeCategory === 'Tous' && (
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded bg-gray-100 text-gray-600`}>
                                        {item.category}
                                    </span>
                                )}
                                <span className={`font-bold text-lg ${openIndex === index ? 'text-primary' : 'text-gray-800'}`}>
                                    {item.question}
                                </span>
                            </div>
                            <span className={`bg-gray-50 p-1.5 rounded-full transition-transform duration-300 ${openIndex === index ? 'rotate-180 bg-blue-50 text-primary' : 'text-gray-400'}`}>
                                <ChevronDownIcon className="w-5 h-5" />
                            </span>
                        </button>
                        <div 
                            className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                            <div className="overflow-hidden">
                                <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50 mt-2">
                                    <div className="h-4"></div>
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-800">Aucun résultat trouvé</h3>
                    <p className="text-gray-500">Essayez de reformuler votre recherche ou parcourez les catégories.</p>
                    <button 
                        onClick={() => {setSearchTerm(''); setActiveCategory('Tous');}}
                        className="mt-4 text-primary font-bold hover:underline"
                    >
                        Tout afficher
                    </button>
                </div>
            )}
        </div>

        {/* Contact Banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-900 to-primary rounded-2xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Vous ne trouvez pas votre réponse ?</h2>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                    Nos experts sont là pour vous accompagner dans vos démarches de protection intellectuelle.
                    N'hésitez pas à nous contacter directement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                        to="/contact" 
                        className="inline-flex items-center justify-center bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors shadow-lg"
                    >
                        <EnvelopeIcon className="w-5 h-5 mr-2" />
                        Envoyer un message
                    </Link>
                    <a 
                        href="tel:+261202220013"
                        className="inline-flex items-center justify-center bg-primary-dark/30 border border-white/30 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors"
                    >
                        Appeler le service client
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
