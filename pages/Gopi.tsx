
import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { DEFAULT_GOPI, DEFAULT_GOPI_ORDERS } from '../constants';
import { GopiItem, GopiOrder } from '../types';
import { useCrud } from '../hooks/useCrud';
import { GOPI_CATEGORIES, GOPI_PRICE_MGA, hasGopiPdf, normalizeGopiOrder, validateGopiOrder } from '../utils/gopiLogic';

// --- Heroicons ---
const NewspaperIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
  </svg>
);

const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
);

const BanknotesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
);

const ShoppingCartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-7.665 6.024c.268.966.697 1.885 1.25 2.749a23.475 23.475 0 0 1 5.955-4.124 23.475 23.475 0 0 1 5.955 4.124c.554-.864.982-1.783 1.25-2.749a23.475 23.475 0 0 1-5.955-4.124 23.475 23.475 0 0 1-5.955 4.124Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c4.97 0 9 1.643 9 4.05 0 4.185-3.033 7.755-6.046 9.387-.58.312-1.22.463-1.854.463s-1.273-.15-1.854-.463C4.033 14.055 1 10.485 1 6.3 1 3.893 5.03 2.25 10 2.25Z" />
    </svg>
);

const Gopi: React.FC = () => {
  const { items: gopiList } = useCrud<GopiItem>('omapi_gopi', DEFAULT_GOPI);
  const { saveItem: saveOrder } = useCrud<GopiOrder>('omapi_gopi_orders', DEFAULT_GOPI_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Gazette Officielle');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGopi, setSelectedGopi] = useState<GopiItem | null>(null);
  const [orderForm, setOrderForm] = useState({ 
      name: '', 
      email: '', 
      phone: '', 
      paymentMethod: 'MVola',
      transactionRef: ''
  });
  const [hasAgreed, setHasAgreed] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const UNCATEGORIZED_GOPI_TAB = '__gopi_sans_categorie__';
  const knownTabs = [
    { id: 'Gazette Officielle', label: 'Gazette Officielle (Dépôts)' },
    { id: 'Inscription au Registre', label: 'Inscriptions au Registre' },
    { id: 'Renouvellement', label: 'Renouvellements' },
    { id: 'GOPI spéciale GMD', label: 'GOPI Spéciale (Marques Int.)' },
    { id: 'GOPI spéciale GDM', label: 'GOPI Spéciale (Dessins Int.)' },
  ];
  // Afficher aussi les catégories inattendues des anciennes données afin qu’aucun numéro ne disparaisse.
  const hasUncategorizedGopi = gopiList.some((item) => !String(item.category || '').trim());
  const tabs = [
    ...knownTabs,
    ...(hasUncategorizedGopi ? [{ id: UNCATEGORIZED_GOPI_TAB, label: 'Catégorie non définie' }] : []),
    ...Array.from(new Set(gopiList.map((item) => typeof item.category === 'string' ? item.category.trim() : '').filter(Boolean)))
      .filter((category) => !GOPI_CATEGORIES.includes(category as typeof GOPI_CATEGORIES[number]))
      .map((category) => ({ id: category, label: `Autre : ${category}` })),
  ];

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('fr');
  const filteredGopi = gopiList.filter((gopi) => {
    const searchable = [gopi.title, gopi.date, gopi.description]
      .filter((value): value is string => typeof value === 'string')
      .join(' ')
      .toLocaleLowerCase('fr');
    const category = String(gopi.category || '').trim();
    const matchesCategory = activeCategory === UNCATEGORIZED_GOPI_TAB ? !category : category === activeCategory;
    return searchable.includes(normalizedSearch) && matchesCategory;
  });

  const getCategoryBadgeClass = (category: string) => {
      switch(category) {
          case 'Gazette Officielle': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'Inscription au Registre': return 'bg-amber-100 text-amber-800 border-amber-200';
          case 'Renouvellement': return 'bg-green-100 text-green-800 border-green-200';
          case 'GOPI spéciale GMD': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
          case 'GOPI spéciale GDM': return 'bg-pink-100 text-pink-800 border-pink-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
  };

  const handleOrderClick = (gopi: GopiItem) => {
      setSelectedGopi(gopi);
      setOrderForm({ name: '', email: '', phone: '', paymentMethod: 'MVola', transactionRef: '' });
      setHasAgreed(false);
      setOrderError(null);
      setOrderSuccess(null);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      if (isSubmittingOrder) return;
      setIsModalOpen(false);
      setOrderForm({ name: '', email: '', phone: '', paymentMethod: 'MVola', transactionRef: '' });
      setSelectedGopi(null);
      setHasAgreed(false);
      setOrderError(null);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmittingOrder) return;
      if (!hasAgreed) {
        setOrderError('Veuillez accepter les conditions avant de continuer.');
        return;
      }

      const currentPublication = selectedGopi
        ? gopiList.find((item) => String(item.id) === String(selectedGopi.id))
        : undefined;
      const normalized = normalizeGopiOrder({
        customerName: orderForm.name,
        customerEmail: orderForm.email,
        customerPhone: orderForm.phone,
        paymentMethod: orderForm.paymentMethod,
        transactionRef: orderForm.transactionRef,
      });
      const validationError = validateGopiOrder(normalized, currentPublication);
      if (validationError) {
        setOrderError(validationError);
        return;
      }

      setOrderError(null);
      setIsSubmittingOrder(true);
      try {
        const newOrder: GopiOrder = {
          id: Date.now(),
          gopiId: currentPublication!.id,
          gopiTitle: currentPublication!.title,
          customerName: normalized.customerName,
          customerEmail: normalized.customerEmail,
          customerPhone: normalized.customerPhone,
          date: new Date().toISOString(),
          amountMGA: GOPI_PRICE_MGA,
          status: 'En attente',
          paymentMethod: normalized.paymentMethod,
          transactionRef: normalized.transactionRef,
        };

        const saved = await saveOrder(newOrder);
        if (!saved) {
          setOrderError('La demande n’a pas pu être enregistrée dans cette démonstration locale. Vos informations restent dans le formulaire ; réessayez.');
          return;
        }

        setOrderSuccess(`Merci ${normalized.customerName}. Votre demande pour « ${currentPublication!.title} » a été enregistrée dans le stockage local de ce navigateur. Le paiement doit être vérifié par l’OMAPI ; aucun e-mail ni PDF n’est envoyé automatiquement.`);
        setIsModalOpen(false);
        setSelectedGopi(null);
        setOrderForm({ name: '', email: '', phone: '', paymentMethod: 'MVola', transactionRef: '' });
        setHasAgreed(false);
      } catch {
        setOrderError('Une erreur a empêché l’enregistrement. Vos informations restent dans le formulaire ; réessayez.');
      } finally {
        setIsSubmittingOrder(false);
      }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Gazette Officielle (GOPI)' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">Gazette Officielle</h1>
            <p className="text-gray-600 max-w-3xl">
                La Gazette Officielle de la Propriété Industrielle (GOPI) recense tous les titres de propriété industrielle délivrés et les actes affectant leur existence.
            </p>
        </div>

        {orderSuccess && <p role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">{orderSuccess}</p>}

        {/* Section Recherche */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <NewspaperIcon className="w-5 h-5 mr-2 text-primary" />
                    Archives et Publications
                </h2>
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
                        placeholder="Rechercher par numéro, année..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Système d'Onglets */}
        <div className="mb-6 border-b border-gray-200 overflow-x-auto">
            <div className="flex flex-nowrap md:flex-wrap -mb-px space-x-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveCategory(tab.id)}
                        className={`group inline-flex items-center py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                            activeCategory === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {tab.label}
                        <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                            activeCategory === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}>
                            {gopiList.filter((g) => tab.id === UNCATEGORIZED_GOPI_TAB ? !String(g.category || '').trim() : String(g.category || '').trim() === tab.id).length}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        {/* Tableau Style Officiel */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden min-h-[300px]">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-primary text-white uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th scope="col" className="px-6 py-4 rounded-tl-lg">Titre de la publication</th>
                            <th scope="col" className="px-6 py-4">Période / Date</th>
                            <th scope="col" className="px-6 py-4">Type</th>
                            <th scope="col" className="px-6 py-4 text-center">Prix</th>
                            <th scope="col" className="px-6 py-4 text-center rounded-tr-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredGopi.length > 0 ? (
                            filteredGopi.map((gopi, index) => (
                                <tr key={gopi.id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">{gopi.title}</div>
                                        {gopi.description && (
                                            <div className="text-xs text-gray-500 mt-1">{gopi.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                        <div className="flex items-center">
                                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            {gopi.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded border ${getCategoryBadgeClass(gopi.category)}`}>
                                            {String(gopi.category || '').trim() || 'Catégorie non définie'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700 font-bold">
{GOPI_PRICE_MGA.toLocaleString('fr-FR')} Ar
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button 
                                            type="button"
                                            onClick={() => handleOrderClick(gopi)}
                                            disabled={!hasGopiPdf(gopi)}
                                            title={hasGopiPdf(gopi) ? 'Commander le PDF' : 'Commande indisponible : PDF non joint'}
                                            className="inline-flex items-center justify-center px-4 py-1.5 bg-primary border border-transparent hover:bg-secondary text-white rounded shadow-sm hover:shadow transition-all text-xs font-bold uppercase tracking-wide disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
                                        >
                                            <ShoppingCartIcon className="w-4 h-4 mr-2" />
                                            {hasGopiPdf(gopi) ? 'Commander' : 'PDF indisponible'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-gray-500 bg-white">
                                    <div className="flex flex-col items-center justify-center">
                                        <NewspaperIcon className="w-12 h-12 text-gray-300 mb-3" />
                                        <p className="font-medium text-gray-900">Aucune publication trouvée</p>
                                        <p className="text-sm mt-1">Il n'y a pas de gazette pour cette catégorie ou votre recherche.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-6 text-center text-sm text-gray-500 flex justify-center items-center gap-2">
            <BanknotesIcon className="w-5 h-5 text-gray-400" />
            <p>Cette démonstration enregistre la demande dans ce navigateur uniquement : paiement et envoi du PDF nécessitent un traitement manuel par l’OMAPI.</p>
        </div>
      </div>

      {/* Modal Commande */}
      {isModalOpen && selectedGopi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp max-h-[95vh] overflow-y-auto">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                      <h3 className="text-lg font-bold text-gray-800">Commander une publication</h3>
                      <button type="button" onClick={handleCloseModal} disabled={isSubmittingOrder} aria-label="Fermer" className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
                          <XMarkIcon className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <form onSubmit={handleOrderSubmit} className="p-6">
                      <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                          <p className="text-sm text-blue-800 font-medium mb-1">Vous souhaitez commander :</p>
                          <p className="text-lg font-bold text-primary">{selectedGopi.title}</p>
                          <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                              <span>Date : {selectedGopi.date}</span>
                              <span className="font-bold text-gray-800">Prix : {GOPI_PRICE_MGA.toLocaleString('fr-FR')} Ar</span>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                              <input 
                                  type="text" 
                                  required
                                  minLength={2}
                                  maxLength={120}
                                  autoComplete="name"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-gray-800 bg-gray-50 focus:bg-white"
                                  placeholder="Votre nom"
                                  value={orderForm.name}
                                  onChange={e => { setOrderForm((current) => ({...current, name: e.target.value})); setOrderError(null); }}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input 
                                  type="email" 
                                  required
                                  maxLength={254}
                                  autoComplete="email"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-gray-800 bg-gray-50 focus:bg-white"
                                  placeholder="votre@email.com"
                                  value={orderForm.email}
                                  onChange={e => { setOrderForm((current) => ({...current, email: e.target.value})); setOrderError(null); }}
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                              <input 
                                  type="tel" 
                                  required
                                  maxLength={30}
                                  autoComplete="tel"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-gray-800 bg-gray-50 focus:bg-white"
                                  placeholder="034…"
                                  value={orderForm.phone}
                                  onChange={e => { setOrderForm((current) => ({...current, phone: e.target.value})); setOrderError(null); }}
                              />
                          </div>

                          <div className="pt-2 border-t border-gray-100 mt-2">
                              <p className="text-xs text-gray-500 mb-2 italic">
                                Utilisez uniquement les coordonnées officielles de paiement communiquées par l’OMAPI. Cette démonstration n’encaisse aucun paiement.
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Moyen de paiement</label>
                                    <select 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-gray-50 focus:bg-white text-gray-800 transition-colors"
                                        value={orderForm.paymentMethod}
                                        onChange={e => { setOrderForm((current) => ({...current, paymentMethod: e.target.value})); setOrderError(null); }}
                                    >
                                        <option value="MVola">MVola</option>
                                        <option value="Orange Money">Orange Money</option>
                                        <option value="Airtel Money">Airtel Money</option>
                                        <option value="Virement Bancaire">Virement Bancaire</option>
                                        <option value="Chèque">Chèque certifié</option>
                                        <option value="Espèces">Espèces (au siège)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Réf. Transaction</label>
                                    <input 
                                        type="text" 
                                        required={orderForm.paymentMethod !== 'Espèces' && orderForm.paymentMethod !== 'Chèque'}
                                        minLength={3}
                                        maxLength={100}
                                        autoComplete="off"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-gray-800 bg-gray-50 focus:bg-white"
                                        placeholder="Ex. : référence de transaction"
                                        value={orderForm.transactionRef}
                                        onChange={e => { setOrderForm((current) => ({...current, transactionRef: e.target.value})); setOrderError(null); }}
                                    />
                                </div>
                              </div>
                          </div>
                      </div>

                      {/* Conditions de vente Scrollable */}
                      <div className="mt-6 mb-4">
                          <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center">
                              <ShieldCheckIcon className="w-4 h-4 mr-1 text-primary" />
                              Conditions Générales
                          </label>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 h-24 overflow-y-auto leading-relaxed">
                              <p className="font-bold mb-1">1. Tarification</p>
                              <p className="mb-2">Le prix de la publication est fixé à {GOPI_PRICE_MGA.toLocaleString('fr-FR')} Ariary par numéro. Ce tarif est unique et non négociable.</p>
                              
                              <p className="font-bold mb-1">2. Modalités de paiement</p>
                              <p className="mb-2">Le paiement doit être effectué intégralement avant l'envoi du fichier. Les modes acceptés sont : MVola, Orange Money, Airtel Money, Virement bancaire ou Espèces au siège de l'OMAPI.</p>
                              
                              <p className="font-bold mb-1">3. Livraison</p>
                              <p className="mb-2">Après vérification du paiement, l’OMAPI organisera la remise du fichier PDF. Cette démonstration ne déclenche pas d’envoi automatique par e-mail.</p>
                              
                              <p className="font-bold mb-1">4. Usage et Droits</p>
                              <p>Le document fourni est destiné à un usage personnel ou professionnel interne. Toute rediffusion, revente ou publication non autorisée est strictement interdite et passible de poursuites.</p>
                          </div>
                      </div>

                      {/* Checkbox Acceptation */}
                      <div className="mb-6">
                          <label className="flex items-start space-x-3 cursor-pointer group">
                              <input 
                                  type="checkbox" 
                                  required
                                  className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary mt-0.5 cursor-pointer"
                                  checked={hasAgreed}
                                  onChange={(e) => setHasAgreed(e.target.checked)}
                              />
                              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                  J'ai lu et j'accepte les conditions générales de vente ci-dessus. Je certifie l'exactitude des informations de paiement.
                              </span>
                          </label>
                      </div>

                      {orderError && <p role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{orderError}</p>}

                      <div className="flex space-x-3">
                          <button 
                              type="button" 
                              disabled={isSubmittingOrder}
                              onClick={handleCloseModal}
                              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                          >
                              Annuler
                          </button>
                          <button 
                              type="submit"
                              disabled={!hasAgreed || isSubmittingOrder}
                              className={`flex-1 py-2.5 rounded-lg font-bold shadow-md transition-all ${
                                  hasAgreed 
                                  ? 'bg-primary hover:bg-secondary text-white transform hover:-translate-y-0.5' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                          >
                              {isSubmittingOrder ? 'Enregistrement…' : 'Enregistrer la demande'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Gopi;
