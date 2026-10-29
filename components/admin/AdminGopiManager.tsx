
import React, { useState } from 'react';
import { GopiItem, GopiOrder } from '../../types';
import { GOPI_PAYMENT_METHODS, GOPI_PRICE_MGA, getGopiOrderStatusLabel, hasGopiPdf } from '../../utils/gopiLogic';
import { PlusIcon, PencilSquareIcon, TrashIcon, BookOpenIcon, CheckIcon, ShoppingCartIcon, EnvelopeIcon, XMarkIcon, BanknotesIcon } from './AdminIcons';

interface AdminGopiManagerProps {
  gopiItems: GopiItem[];
  gopiOrders: GopiOrder[];
  onAdd: () => void;
  onEdit: (item: GopiItem) => void;
  onDelete: (id: number) => Promise<boolean | string> | boolean | string;
  onUpdateOrder: (order: Partial<GopiOrder>) => Promise<boolean> | boolean;
  onDeleteOrder: (id: number) => Promise<boolean> | boolean;
}

const AdminGopiManager: React.FC<AdminGopiManagerProps> = ({ 
    gopiItems, gopiOrders, 
    onAdd, onEdit, onDelete,
    onUpdateOrder, onDeleteOrder 
}) => {
  const [activeTab, setActiveTab] = useState<'publications' | 'orders'>('publications');
  
  const [validationModal, setValidationModal] = useState<{ open: boolean; order: GopiOrder | null }>({ open: false, order: null });
  const [validationData, setValidationData] = useState({ transactionRef: '', paymentMethod: 'MVola' });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{ title: string; message: string; confirmLabel: string; run: () => Promise<void> } | null>(null);
  const [isRunningConfirmation, setIsRunningConfirmation] = useState(false);

  const handleOpenValidation = (order: GopiOrder) => {
      if (order.status !== 'En attente') return;
      setValidationModal({ open: true, order });
      setValidationError(null);
      setActionError(null);
      setValidationData({ transactionRef: order.transactionRef || '', paymentMethod: order.paymentMethod || 'MVola' });
  };

  const handleCloseValidation = () => {
      if (isSavingOrder) return;
      setValidationModal({ open: false, order: null });
      setValidationError(null);
  };

  const handleConfirmValidation = async (e: React.FormEvent) => {
      e.preventDefault();
      const order = validationModal.order;
      if (!order || isSavingOrder) return;
      const paymentMethod = validationData.paymentMethod.trim();
      const transactionRef = validationData.transactionRef.trim();
      if (!GOPI_PAYMENT_METHODS.includes(paymentMethod as typeof GOPI_PAYMENT_METHODS[number])) {
          setValidationError('Sélectionnez un moyen de paiement reconnu.');
          return;
      }
      if (paymentMethod !== 'Espèces' && paymentMethod !== 'Chèque' && transactionRef.length < 3) {
          setValidationError('Indiquez une référence de transaction valide pour confirmer le paiement.');
          return;
      }

      setIsSavingOrder(true);
      setValidationError(null);
      try {
          const saved = await onUpdateOrder({
              id: order.id,
              status: 'Paiement confirmé',
              transactionRef,
              paymentMethod,
              paymentConfirmedAt: new Date().toISOString(),
          });
          if (!saved) {
              setValidationError('La commande n’a pas été mise à jour. Elle reste en attente ; réessayez.');
              return;
          }
          setValidationModal({ open: false, order: null });
          setValidationError(null);
      } catch {
          setValidationError('Une erreur a empêché la confirmation. La commande reste inchangée ; réessayez.');
      } finally {
          setIsSavingOrder(false);
      }
  };

  const requestConfirmation = (title: string, message: string, confirmLabel: string, run: () => Promise<void>) => {
      setActionError(null);
      setPendingConfirmation({ title, message, confirmLabel, run });
  };

  const runPendingConfirmation = async () => {
      if (!pendingConfirmation || isRunningConfirmation) return;
      setIsRunningConfirmation(true);
      try {
          await pendingConfirmation.run();
          setPendingConfirmation(null);
      } finally {
          setIsRunningConfirmation(false);
      }
  };

  const handleCancelOrder = (order: GopiOrder) => {
      if (order.status !== 'En attente') return;
      requestConfirmation(
          'Annuler la demande GOPI ?',
          `La demande de ${order.customerName} pour « ${order.gopiTitle} » passera au statut « Annulé ».`,
          'Confirmer l’annulation',
          async () => {
              try {
                  if (!await onUpdateOrder({ id: order.id, status: 'Annulé' })) setActionError('La demande n’a pas pu être annulée. Actualisez la page puis réessayez.');
              } catch {
                  setActionError('Une erreur a empêché l’annulation de la demande.');
              }
          },
      );
  };

  const handleMarkSent = (order: GopiOrder) => {
      if (order.status !== 'Paiement confirmé') return;
      requestConfirmation(
          'Confirmer l’envoi du PDF ?',
          `Confirmez uniquement après avoir transmis le PDF à ${order.customerEmail} par un canal externe. Aucun e-mail ne partira depuis le portail.`,
          'Confirmer que le PDF a été envoyé',
          async () => {
              try {
                  if (!await onUpdateOrder({ id: order.id, status: 'Envoyé', sentAt: new Date().toISOString() })) setActionError('Le statut n’a pas pu être modifié. Actualisez la page puis réessayez.');
              } catch {
                  setActionError('Une erreur a empêché la mise à jour du statut.');
              }
          },
      );
  };

  const handleDeletePublication = (item: GopiItem) => {
      requestConfirmation(
          'Supprimer la publication ?',
          `La publication « ${item.title} » sera retirée du catalogue. Les demandes encore en cours empêchent cette suppression.`,
          'Supprimer la publication',
          async () => {
              try {
                  const result = await onDelete(item.id);
                  if (typeof result === 'string') setActionError(result);
                  else if (!result) setActionError('La publication n’a pas pu être supprimée. Actualisez la page puis réessayez.');
              } catch {
                  setActionError('Une erreur a empêché la suppression de la publication.');
              }
          },
      );
  };

  const handleDeleteOrder = (order: GopiOrder) => {
      requestConfirmation(
          'Supprimer définitivement la demande ?',
          `La demande de ${order.customerName} pour « ${order.gopiTitle} » et son historique seront supprimés.`,
          'Supprimer la demande',
          async () => {
              try {
                  if (!await onDeleteOrder(order.id)) setActionError('La demande n’a pas pu être supprimée. Actualisez la page puis réessayez.');
              } catch {
                  setActionError('Une erreur a empêché la suppression de la demande.');
              }
          },
      );
  };

  return (
    <div className="space-y-6">
        <p className="rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Les demandes de la démonstration sont stockées uniquement dans ce navigateur. La confirmation de paiement et l’envoi du PDF doivent être faits manuellement ; aucune transaction ni aucun e-mail n’est automatisé.</p>
        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-200 p-1 rounded-sm w-fit">
            <button
                onClick={() => setActiveTab('publications')}
                className={`px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest ${
                    activeTab === 'publications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
                Publications ({gopiItems.length})
            </button>
            <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest ${
                    activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
                Commandes Clients ({gopiOrders.length})
            </button>
        </div>

        {actionError && <div role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-800">{actionError}</div>}

        {activeTab === 'publications' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Numéros publiés</h2>
                    <button 
                        onClick={onAdd}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-sm flex items-center border border-slate-900"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Ajouter un numéro</span>
                    </button>
                </div>

                <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Titre
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Catégorie
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Statut Fichier
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {gopiItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-slate-100 text-slate-600 rounded-sm border border-slate-200 flex items-center justify-center">
                                                    <BookOpenIcon className="w-4 h-4" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{item.title}</div>
                                                    <div className="text-[10px] text-slate-400 max-w-[200px] truncate font-bold uppercase tracking-tight">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[11px] text-slate-500 font-mono">
                                            {item.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 inline-flex text-[9px] font-bold uppercase tracking-widest rounded-sm border
                                                ${item.category === 'Gazette Officielle' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                                item.category === 'Inscription au Registre' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                item.category === 'Renouvellement' ? 'bg-green-50 text-green-700 border-green-100' :
                                                item.category === 'GOPI spéciale GMD' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                item.category === 'GOPI spéciale GDM' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                                                'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                                {String(item.category || '').trim() || 'À corriger'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[11px]">
                                            {hasGopiPdf(item) ? (
                                                <span className="flex max-w-[180px] items-center truncate text-green-600 font-bold uppercase tracking-tight text-[10px]" title={item.fileName || 'PDF associé'}>
                                                    <CheckIcon className="w-3 h-3 mr-1" /> {item.fileName || 'PDF disponible'}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-[10px] italic font-bold uppercase tracking-tight">Aucun fichier</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-[11px] font-bold">
                                            <button 
                                                onClick={() => onEdit(item)}
                                                className="text-slate-400 hover:text-slate-900 mr-4 p-1.5 hover:bg-slate-100 rounded-sm border border-transparent hover:border-slate-200"
                                                title="Modifier"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => void handleDeletePublication(item)}
                                                className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-slate-100 rounded-sm border border-transparent hover:border-slate-200"
                                                title="Supprimer"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {gopiItems.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            <BookOpenIcon className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                            <p className="text-[10px] font-bold uppercase tracking-widest italic">Aucune gazette publiée pour le moment.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'orders' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Demandes de GOPI</h2>
                </div>

                <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Client
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Publication demandée
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Statut & Paiement
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {gopiOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{order.customerName}</div>
                                            <div className="text-[10px] text-slate-500 flex flex-col mt-1 font-bold uppercase tracking-tight">
                                                <span className="flex items-center"><EnvelopeIcon className="w-3 h-3 mr-1 text-slate-400" /> {order.customerEmail}</span>
                                                <span className="text-slate-400 mt-0.5">{order.customerPhone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-[11px] text-slate-700 font-bold uppercase tracking-tight">
                                                <BookOpenIcon className="w-4 h-4 mr-2 text-slate-400" />
                                                {order.gopiTitle}
                                            </div>
                                            <span className="text-[10px] text-slate-400 ml-6 font-mono">{Number.isNaN(Date.parse(order.date)) ? order.date : new Date(order.date).toLocaleString('fr-FR')}</span>
                                            <span className="block text-[10px] text-slate-500 ml-6 font-bold">{(order.amountMGA ?? GOPI_PRICE_MGA).toLocaleString('fr-FR')} Ar</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 inline-flex text-[9px] font-bold uppercase tracking-widest rounded-sm border
                                                ${order.status === 'Envoyé' || order.status === 'Paiement confirmé' ? 'bg-green-50 text-green-700 border-green-100' :
                                                  order.status === 'Annulé' ? 'bg-red-50 text-red-700 border-red-100' :
                                                  'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                {getGopiOrderStatusLabel(order.status, order.sentAt)}
                                            </span>
                                            
                                            {/* Affichage Info Paiement */}
                                            {(order.paymentMethod || order.transactionRef) && (
                                                <div className="mt-2 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-sm border border-slate-100 font-bold uppercase tracking-tight">
                                                    {order.paymentMethod && (
                                                        <div className="flex items-center mb-0.5">
                                                            <BanknotesIcon className="w-3 h-3 mr-1 text-slate-400"/> {order.paymentMethod}
                                                        </div>
                                                    )}
                                                    {order.transactionRef && (
                                                        <div className="text-slate-400">Réf: <span className="font-mono text-slate-600">{order.transactionRef}</span></div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-[11px] font-bold">
                                            <div className="flex justify-end space-x-2">
                                                {order.status === 'En attente' && (
                                                    <>
                                                        <button type="button" onClick={() => handleOpenValidation(order)} className="bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-sm border border-green-100 text-[10px] font-bold uppercase tracking-widest flex items-center" title="Confirmer le paiement">
                                                            <CheckIcon className="w-3 h-3 mr-1" /> Confirmer paiement
                                                        </button>
                                                        <button type="button" onClick={() => void handleCancelOrder(order)} className="bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1.5 rounded-sm border border-red-100 text-[10px] font-bold uppercase tracking-widest" title="Annuler la demande">Annuler</button>
                                                    </>
                                                )}
                                                {order.status === 'Paiement confirmé' && (
                                                    <button type="button" onClick={() => void handleMarkSent(order)} className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-sm border border-blue-100 text-[10px] font-bold uppercase tracking-widest" title="Marquer le PDF comme transmis après envoi manuel">Marquer envoyé</button>
                                                )}
                                                <button type="button" onClick={() => void handleDeleteOrder(order)} className="bg-slate-50 text-slate-400 hover:text-red-600 p-1.5 rounded-sm border border-slate-200" title="Supprimer la commande">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {gopiOrders.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            <ShoppingCartIcon className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                            <p className="text-[10px] font-bold uppercase tracking-widest italic">Aucune commande pour le moment.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Modal Validation Commande */}
        {validationModal.open && validationModal.order && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-200">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Confirmer le paiement</h3>
                            <p className="mt-1 text-[10px] text-slate-500">Cette action ne transmet pas le PDF au client.</p>
                        </div>
                        <button type="button" onClick={handleCloseValidation} disabled={isSavingOrder} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleConfirmValidation} className="p-6">
                        {/* Infos Demandeur */}
                        <div className="mb-6">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Demandeur</p>
                            <div className="bg-slate-50 border-l-2 border-slate-900 p-3 rounded-sm">
                                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{validationModal.order.customerName}</p>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">{validationModal.order.customerEmail}</p>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">{validationModal.order.customerPhone}</p>
                            </div>
                        </div>

                        {/* Infos Déclarées par le client */}
                        <div className="mb-6">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 flex items-center">
                                <BanknotesIcon className="w-4 h-4 mr-1"/>
                                Informations de paiement déclarées
                            </p>
                            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-sm border border-slate-100">
                                <div>
                                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest">Moyen</span>
                                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">{validationModal.order.paymentMethod || 'Non spécifié'}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest">Référence</span>
                                    <span className="font-mono text-[10px] text-slate-900 bg-white px-1 rounded-sm border border-slate-200 inline-block font-bold">
                                        {validationModal.order.transactionRef || 'Aucune'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {validationError && <p role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">{validationError}</p>}
                        <hr className="border-slate-100 my-5" />

                        {/* Formulaire de validation */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Confirmer le paiement après vérification effective</h4>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Mode de paiement confirmé</label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 outline-none bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-tight"
                                    value={validationData.paymentMethod}
                                    onChange={(e) => { setValidationData((current) => ({...current, paymentMethod: e.target.value})); setValidationError(null); }}
                                    required
                                >
                                    <option value="MVola">MVola</option>
                                    <option value="Orange Money">Orange Money</option>
                                    <option value="Airtel Money">Airtel Money</option>
                                    <option value="Virement Bancaire">Virement Bancaire</option>
                                    <option value="Chèque">Chèque</option>
                                    <option value="Espèces">Espèces (Sur place)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Référence Transaction / Bordereau</label>
                                <input 
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:border-blue-500 outline-none text-slate-600 bg-slate-50 text-[11px] font-bold uppercase tracking-tight"
                                    placeholder="Ex: 123456789"
                                    value={validationData.transactionRef}
                                    onChange={(e) => { setValidationData((current) => ({...current, transactionRef: e.target.value})); setValidationError(null); }}
                                    required={validationData.paymentMethod !== 'Espèces' && validationData.paymentMethod !== 'Chèque'}
                                />
                                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">
                                    Validez ou corrigez la référence pour la comptabilité.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3">
                            <button 
                                type="button" 
                                onClick={handleCloseValidation}
                                disabled={isSavingOrder}
                                className="px-4 py-2 border border-slate-200 rounded-sm text-slate-700 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                disabled={isSavingOrder}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest border border-slate-900 flex items-center disabled:opacity-50"
                            >
                                <CheckIcon className="w-4 h-4 mr-2" />
                                {isSavingOrder ? 'Enregistrement…' : 'Confirmer le paiement'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {pendingConfirmation && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4" role="dialog" aria-modal="true" aria-labelledby="gopi-confirm-title">
                <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white shadow-2xl">
                    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                        <h3 id="gopi-confirm-title" className="text-sm font-bold text-slate-900">{pendingConfirmation.title}</h3>
                    </div>
                    <p className="px-5 py-5 text-sm leading-relaxed text-slate-700">{pendingConfirmation.message}</p>
                    <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
                        <button type="button" disabled={isRunningConfirmation} onClick={() => setPendingConfirmation(null)} className="rounded-sm border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Retour</button>
                        <button type="button" disabled={isRunningConfirmation} onClick={() => void runPendingConfirmation()} className="rounded-sm bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50">
                            {isRunningConfirmation ? 'Traitement…' : pendingConfirmation.confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminGopiManager;
