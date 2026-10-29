import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import {
  ACCOUNT_DELETE_CONFIRMATION,
  isPrincipalAdminAccount,
  validateAccountDeletion,
} from '../../utils/userAccounts';
import { PencilSquareIcon, TrashIcon, UserPlusIcon, XMarkIcon } from './AdminIcons';

interface AdminUsersManagerProps {
  users: User[];
  currentUserId?: User['id'];
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (id: User['id']) => Promise<boolean | void> | boolean | void;
}

const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({
  users,
  currentUserId,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const closeConfirmation = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setConfirmationInput('');
    setDeleteError(null);
  };

  useEffect(() => {
    if (!deleteTarget) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeConfirmation();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteTarget, isDeleting]);

  const requestDeletion = (user: User) => {
    const error = validateAccountDeletion(users, user, currentUserId);
    if (error) return;
    setDeleteTarget(user);
    setConfirmationInput('');
    setDeleteError(null);
  };

  const confirmDeletion = async () => {
    if (!deleteTarget || isDeleting) return;
    const target = users.find((user) => String(user.id) === String(deleteTarget.id));
    const validationError = validateAccountDeletion(users, target, currentUserId);
    if (validationError) {
      setDeleteError(validationError);
      return;
    }
    if (confirmationInput !== ACCOUNT_DELETE_CONFIRMATION) {
      setDeleteError(`Saisissez exactement « ${ACCOUNT_DELETE_CONFIRMATION} » pour confirmer.`);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await onDelete(target!.id);
      if (result === false) {
        setDeleteError("La suppression n'a pas pu être effectuée. Le compte a peut-être déjà été supprimé.");
        return;
      }
      setDeleteTarget(null);
      setConfirmationInput('');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'La suppression a échoué. Veuillez réessayer.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Gestion des utilisateurs</h2>
        <button
          type="button"
          onClick={onAdd}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-sm border border-slate-900 flex items-center"
        >
          <UserPlusIcon className="w-4 h-4 mr-2 text-blue-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Ajouter un utilisateur</span>
        </button>
      </div>

      <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Utilisateur</th>
                <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rôle</th>
                <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statut</th>
                <th scope="col" className="px-6 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {users.map((user) => {
                const isPrincipal = isPrincipalAdminAccount(user);
                const isSelf = currentUserId !== undefined && String(currentUserId) === String(user.id);
                const deletionError = validateAccountDeletion(users, user, currentUserId);
                const displayName = user.name || 'Utilisateur';

                return (
                  <tr key={user.id} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-9 w-9">
                          <div className="h-9 w-9 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-900 uppercase tracking-tight">
                            {displayName}
                            {(isPrincipal || isSelf) && (
                              <span className="text-[9px] text-slate-500 border border-slate-200 px-1 py-0.5">
                                {isPrincipal ? 'Principal' : 'Votre compte'}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-[9px] font-bold uppercase tracking-widest rounded-sm border ${user.role === 'Admin' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-[9px] font-bold uppercase tracking-widest rounded-sm border ${user.status === 'Actif' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        aria-label={`Modifier ${displayName}`}
                        onClick={() => onEdit(user)}
                        className="text-slate-400 hover:text-blue-600 mr-3"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={deletionError ? `Suppression impossible pour ${displayName}` : `Supprimer ${displayName}`}
                        title={deletionError || `Supprimer ${displayName}`}
                        disabled={Boolean(deletionError)}
                        onClick={() => requestDeletion(user)}
                        className="text-slate-400 hover:text-red-600 disabled:text-slate-300 disabled:cursor-not-allowed"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Aucun utilisateur</div>
        )}
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/70 p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeConfirmation(); }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="bg-white border border-slate-200 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-start justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
              <div>
                <h3 id="delete-account-title" className="text-xs font-bold text-slate-900 uppercase tracking-widest">Confirmer la suppression</h3>
                <p className="mt-1 text-[11px] text-slate-500">Cette action est définitive dans cette démo.</p>
              </div>
              <button type="button" aria-label="Fermer" disabled={isDeleting} onClick={closeConfirmation} className="text-slate-400 hover:text-red-600 disabled:opacity-50">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-900">{deleteTarget.name}</p>
                <p className="text-[11px] text-slate-500 font-mono break-all">{deleteTarget.email}</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le compte et son accès seront supprimés. Pour conserver l'historique, annulez puis rendez-le inactif.
              </p>
              <div>
                <label htmlFor="delete-confirmation-input" className="block text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2">
                  Saisissez « {ACCOUNT_DELETE_CONFIRMATION} » pour confirmer
                </label>
                <input
                  id="delete-confirmation-input"
                  type="text"
                  autoComplete="off"
                  value={confirmationInput}
                  disabled={isDeleting}
                  onChange={(event) => { setConfirmationInput(event.target.value); setDeleteError(null); }}
                  className="w-full px-3 py-2 border border-slate-300 focus:border-red-600 outline-none text-xs font-bold uppercase tracking-widest disabled:bg-slate-100"
                />
              </div>
              {deleteError && <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">{deleteError}</p>}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 bg-slate-50 border-t border-slate-200">
              <button type="button" disabled={isDeleting} onClick={closeConfirmation} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50">Annuler</button>
              <button
                type="button"
                disabled={confirmationInput !== ACCOUNT_DELETE_CONFIRMATION || isDeleting}
                onClick={confirmDeletion}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-red-700 hover:bg-red-800 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminUsersManager;
