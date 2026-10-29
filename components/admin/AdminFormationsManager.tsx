import React, { useState } from 'react';
import { Formation, FormationRegistration } from '../../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, AcademicCapIcon, UsersIcon, ArrowDownTrayIcon, ExclamationTriangleIcon, XMarkIcon } from './AdminIcons';
import FormationParticipantsModal from './FormationParticipantsModal';

interface AdminFormationsManagerProps {
  formations: Formation[];
  registrations: FormationRegistration[];
  onAdd: () => void;
  onEdit: (formation: Formation) => void;
  onDelete: (id: number) => Promise<boolean | string> | boolean | string;
  onDeleteRegistration: (id: number) => Promise<boolean | void> | boolean | void;
}

type PendingDeletion =
  | { kind: 'formation'; formation: Formation; registrationCount: number }
  | { kind: 'registration'; registration: FormationRegistration; formationTitle?: string };

const AdminFormationsManager: React.FC<AdminFormationsManagerProps> = ({
  formations,
  registrations,
  onAdd,
  onEdit,
  onDelete,
  onDeleteRegistration,
}) => {
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getRegistrationCount = (formationId: number) => registrations.filter(
    (registration) => String(registration.formationId) === String(formationId),
  ).length;

  const baseFormations = formations.filter((formation) => formation.category === 'Base');
  const advancedFormations = formations.filter((formation) => formation.category === 'Avancee');
  const unclassifiedFormations = formations.filter(
    (formation) => formation.category !== 'Base' && formation.category !== 'Avancee',
  );
  const orphanRegistrations = registrations.filter((registration) =>
    !formations.some((formation) => String(formation.id) === String(registration.formationId)),
  );

  const requestFormationDeletion = (formation: Formation) => {
    setDeleteError(null);
    setPendingDeletion({
      kind: 'formation',
      formation,
      registrationCount: getRegistrationCount(formation.id),
    });
  };

  const requestRegistrationDeletion = (registration: FormationRegistration) => {
    const formation = formations.find((item) => String(item.id) === String(registration.formationId));
    setDeleteError(null);
    setPendingDeletion({
      kind: 'registration',
      registration,
      formationTitle: formation?.title,
    });
  };

  const closeDeleteDialog = () => {
    if (isDeleting) return;
    setPendingDeletion(null);
    setDeleteError(null);
  };

  const confirmDeletion = async () => {
    if (!pendingDeletion || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (pendingDeletion.kind === 'formation') {
        const currentCount = getRegistrationCount(pendingDeletion.formation.id);
        if (currentCount > 0) {
          setDeleteError(`La formation compte maintenant ${currentCount} inscription${currentCount > 1 ? 's' : ''}. Supprimez ou gérez d’abord ces demandes depuis « Voir les inscrits ».`);
          return;
        }

        const result = await onDelete(pendingDeletion.formation.id);
        if (typeof result === 'string') {
          setDeleteError(result);
          return;
        }
        if (result === false) {
          setDeleteError('La formation est toujours dans le catalogue. Actualisez la page puis réessayez.');
          return;
        }
        if (String(selectedFormation?.id) === String(pendingDeletion.formation.id)) {
          setSelectedFormation(null);
        }
      } else {
        const result = await onDeleteRegistration(pendingDeletion.registration.id);
        if (result === false) {
          setDeleteError('Cette inscription n’a pas été supprimée. Actualisez la liste puis réessayez.');
          return;
        }
      }

      setPendingDeletion(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'La suppression a échoué. Vos données n’ont pas été confirmées comme supprimées.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getThemeColor = (color?: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'emerald': return 'bg-emerald-500';
      case 'amber': return 'bg-amber-500';
      case 'rose': return 'bg-rose-500';
      case 'indigo': return 'bg-indigo-500';
      case 'purple': return 'bg-purple-500';
      case 'cyan': return 'bg-cyan-500';
      default: return 'bg-gray-400';
    }
  };

  const renderSection = (title: string, items: Formation[], iconColorClass: string) => (
    <section className="border border-slate-200 rounded-sm p-6 bg-slate-50/50">
      <div className="flex items-center mb-6">
        <div className={`w-10 h-10 rounded-sm flex items-center justify-center mr-3 shadow-sm ${iconColorClass}`}>
          <AcademicCapIcon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{title}</h3>
        <span className="ml-auto bg-white px-3 py-1 rounded-sm text-[10px] font-bold text-slate-600 border border-slate-200 uppercase tracking-widest">{items.length}</span>
      </div>

      <div className="space-y-3">
        {items.map((formation) => {
          const registrationCount = getRegistrationCount(formation.id);
          return (
            <div key={formation.id} className="bg-white p-3 rounded-sm border border-slate-100 flex justify-between items-center group shadow-sm">
              <div className="flex items-center space-x-3 truncate flex-1 min-w-0">
                <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${getThemeColor(formation.colorTheme)}`} title={`Thème : ${formation.colorTheme || 'Défaut'}`} />
                <div className="truncate flex-1 min-w-0">
                  <span className="text-slate-900 text-[11px] font-bold uppercase tracking-tight block truncate" title={formation.title}>
                    {formation.title}
                    {formation.fileUrl && <ArrowDownTrayIcon className="inline-block w-3 h-3 ml-2 text-slate-400" aria-label="Document joint" />}
                  </span>
                  <div className="text-[10px] text-slate-500 flex items-center mt-0.5 font-bold uppercase tracking-tight">
                    <UsersIcon className="w-3 h-3 mr-1" />
                    {registrationCount} inscrit{registrationCount > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="flex space-x-1 flex-shrink-0 ml-2">
                <button
                  type="button"
                  aria-label={`Voir les inscrits à ${formation.title}`}
                  onClick={() => setSelectedFormation(formation)}
                  className="p-1.5 rounded-sm hover:bg-blue-50 text-slate-400 hover:text-blue-600"
                  title="Voir les inscrits"
                ><UsersIcon className="w-4 h-4" /></button>
                <button
                  type="button"
                  aria-label={`Modifier ${formation.title}`}
                  onClick={() => onEdit(formation)}
                  className="p-1.5 rounded-sm hover:bg-slate-100 text-slate-400 hover:text-slate-900"
                  title="Modifier"
                ><PencilSquareIcon className="w-4 h-4" /></button>
                <button
                  type="button"
                  aria-label={`Supprimer ${formation.title}`}
                  onClick={() => requestFormationDeletion(formation)}
                  className="p-1.5 rounded-sm hover:bg-red-50 text-slate-400 hover:text-red-600"
                  title={registrationCount > 0 ? `Suppression bloquée : ${registrationCount} inscription(s) liée(s)` : 'Supprimer'}
                ><TrashIcon className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="text-center py-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Aucune formation dans cette catégorie.</div>
        )}
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Catalogue des formations</h2>
          <p className="mt-1 text-[11px] text-slate-500">Les demandes d’inscription restent associées à leur formation.</p>
        </div>
        <button type="button" onClick={onAdd} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-sm border border-slate-900 flex items-center">
          <PlusIcon className="w-4 h-4 mr-2 text-blue-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Ajouter une formation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {renderSection('Formations de base', baseFormations, 'bg-slate-900')}
        {renderSection('Formations avancées', advancedFormations, 'bg-slate-700')}
      </div>

      {unclassifiedFormations.length > 0 && (
        <section className="border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-xs font-bold text-amber-900 uppercase tracking-widest">Formations à vérifier ({unclassifiedFormations.length})</h3>
          <p className="text-xs text-amber-800 mt-1">Ces éléments ont une catégorie inconnue et ne sont pas affichés dans le catalogue public. Modifiez leur catégorie pour les rétablir.</p>
          <div className="mt-3 space-y-2">{unclassifiedFormations.map((formation) => (
            <button type="button" key={formation.id} onClick={() => onEdit(formation)} className="block text-left text-xs font-semibold underline text-amber-900">{formation.title || `Formation ID ${formation.id}`}</button>
          ))}</div>
        </section>
      )}

      {orphanRegistrations.length > 0 && (
        <section className="border border-amber-200 bg-amber-50 p-5" aria-labelledby="orphan-registrations-title">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-amber-700" />
            <h3 id="orphan-registrations-title" className="text-xs font-bold text-amber-900 uppercase tracking-widest">
              Inscriptions sans formation associée ({orphanRegistrations.length})
            </h3>
          </div>
          <p className="text-xs text-amber-800 mt-2">Ces demandes proviennent probablement d’une formation supprimée auparavant. Elles ne sont plus comptées dans le catalogue ; vérifiez-les puis supprimez-les si elles ne sont plus utiles.</p>
          <div className="mt-3 space-y-2">
            {orphanRegistrations.map((registration) => (
              <div key={registration.id} className="flex items-center justify-between gap-3 bg-white border border-amber-100 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{registration.name || 'Participant sans nom'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{registration.email} · formation ID {registration.formationId}</p>
                </div>
                <button type="button" onClick={() => requestRegistrationDeletion(registration)} className="shrink-0 text-[10px] font-bold uppercase text-red-700 hover:text-red-900 border border-red-200 px-2 py-1">
                  Supprimer l’inscription
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <FormationParticipantsModal
        isOpen={!!selectedFormation}
        onClose={() => setSelectedFormation(null)}
        formation={selectedFormation}
        registrations={registrations}
        onRequestDeleteRegistration={requestRegistrationDeletion}
      />

      {pendingDeletion && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !isDeleting) closeDeleteDialog(); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="formation-delete-title" className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-start gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-red-50 border border-red-200"><TrashIcon className="w-4 h-4 text-red-700" /></div>
                <div>
                  <h3 id="formation-delete-title" className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                    {pendingDeletion.kind === 'formation' ? 'Supprimer cette formation ?' : 'Supprimer cette inscription ?'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">Cette action est définitive dans cette démonstration.</p>
                </div>
              </div>
              <button type="button" aria-label="Fermer la confirmation" onClick={closeDeleteDialog} disabled={isDeleting} className="text-slate-400 hover:text-slate-900 disabled:opacity-50"><XMarkIcon className="w-4 h-4" /></button>
            </div>

            <div className="p-5 space-y-3">
              {pendingDeletion.kind === 'formation' ? (
                <>
                  <p className="text-sm font-bold text-slate-900">{pendingDeletion.formation.title}</p>
                  {pendingDeletion.registrationCount > 0 ? (
                    <div className="bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                      <p className="font-bold">Suppression bloquée : {pendingDeletion.registrationCount} inscription{pendingDeletion.registrationCount > 1 ? 's' : ''} est/sont associée(s).</p>
                      <p className="mt-1">Pour éviter de perdre des demandes, supprimez ou vérifiez d’abord ces inscriptions. Vous pourrez ensuite supprimer la formation.</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">La formation sera retirée du catalogue public. Aucune inscription n’est associée.</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-900">{pendingDeletion.registration.name || 'Participant sans nom'}</p>
                  <p className="text-xs text-slate-600">{pendingDeletion.registration.email} {pendingDeletion.formationTitle ? `· ${pendingDeletion.formationTitle}` : `· formation ID ${pendingDeletion.registration.formationId}`}</p>
                  <p className="text-xs text-slate-600">Cette demande d’inscription et les coordonnées associées seront supprimées.</p>
                </>
              )}
              {deleteError && <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">{deleteError}</p>}
            </div>

            <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={closeDeleteDialog} disabled={isDeleting} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-slate-300 text-slate-700 bg-white">{pendingDeletion.kind === 'formation' && pendingDeletion.registrationCount > 0 ? 'Fermer' : 'Annuler'}</button>
              {pendingDeletion.kind === 'formation' && pendingDeletion.registrationCount > 0 ? (
                <button type="button" onClick={() => { setSelectedFormation(pendingDeletion.formation); setPendingDeletion(null); }} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white">Voir les inscrits</button>
              ) : (
                <button type="button" onClick={confirmDeletion} disabled={isDeleting} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-700 hover:bg-red-800 text-white disabled:opacity-50">
                  {isDeleting ? 'Suppression…' : pendingDeletion.kind === 'formation' ? 'Supprimer la formation' : 'Supprimer l’inscription'}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminFormationsManager;
