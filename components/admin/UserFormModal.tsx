
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { XMarkIcon, UsersIcon, EnvelopeIcon, KeyIcon, CheckIcon, EyeIcon, EyeSlashIcon } from './AdminIcons';
import {
  createPasswordCredential,
  generateTemporaryPassword,
  isPrincipalAdminAccount,
  normalizeEmail,
  normalizeName,
  validateAccountModification,
  validatePasswordSelection,
  validateUserDraft,
  type UserDraftErrors,
} from '../../utils/userAccounts';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => void | boolean | Promise<void | boolean>;
  initialData: Partial<User>;
  existingUsers?: User[];
  currentUserId?: User['id'];
}

type PasswordMode = 'none' | 'auto' | 'manual';

const makeTemporaryPassword = (): string => {
  try {
    return generateTemporaryPassword();
  } catch {
    return '';
  }
};

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingUsers = [],
  currentUserId,
}) => {
  const [formData, setFormData] = useState<Partial<User>>({});

  // Gestion du mot de passe et de la validation.
  const [passwordMode, setPasswordMode] = useState<PasswordMode>('none');
  const [manualPassword, setManualPassword] = useState('');
  const [autoPassword, setAutoPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [autoPasswordCopied, setAutoPasswordCopied] = useState(false);
  const [formErrors, setFormErrors] = useState<UserDraftErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(initialData?.id);
  const isPrincipalAccount = isEditMode && isPrincipalAdminAccount(initialData);
  const isSelfAccount = isEditMode
    && currentUserId !== undefined
    && String(currentUserId) === String(initialData.id);
  const lockRoleAndStatus = isPrincipalAccount || isSelfAccount;

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      setPasswordMode(initialData?.id ? 'none' : 'auto');
      setManualPassword('');
      setAutoPassword(initialData?.id ? '' : makeTemporaryPassword());
      setShowPassword(false);
      setAutoPasswordCopied(false);
      setFormErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handlePasswordModeChange = (mode: PasswordMode) => {
    setPasswordMode(mode);
    setFormErrors((prev) => ({ ...prev, password: undefined }));

    if (mode === 'auto' && !autoPassword) {
      setAutoPassword(makeTemporaryPassword());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedDraft: Partial<User> = {
      ...formData,
      name: normalizeName(formData.name),
      email: normalizeEmail(formData.email),
      role: formData.role || 'Éditeur',
      status: formData.status || 'Actif',
    };

    const errors = validateUserDraft(normalizedDraft, existingUsers, initialData?.id);

    if (isEditMode) {
      const originalUser = existingUsers.find(
        (user) => String(user.id) === String(initialData.id),
      );
      const modificationError = validateAccountModification(
        existingUsers,
        originalUser,
        normalizedDraft,
        currentUserId,
      );
      if (modificationError) errors.form = modificationError;
    }

    const passwordError = validatePasswordSelection(passwordMode, manualPassword);
    if (passwordError) errors.password = passwordError;

    if (passwordMode === 'auto' && !autoPassword) {
      errors.password = 'Impossible de générer un mot de passe temporaire. Cliquez sur « Régénérer ».';
    } else if (passwordMode === 'auto' && !autoPasswordCopied) {
      errors.password = 'Copiez le mot de passe temporaire, puis cochez la confirmation avant de continuer.';
    }

    if (Object.values(errors).some(Boolean)) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      let payload: Partial<User> = normalizedDraft;

      if (passwordMode !== 'none') {
        const passwordToSet = passwordMode === 'manual' ? manualPassword : autoPassword;
        const credential = await createPasswordCredential(passwordToSet);
        payload = { ...payload, ...credential };
      }

      await onSave(payload);
    } catch (error) {
      setFormErrors({
        form: error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant l'enregistrement de l'utilisateur.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const fieldErrorClass = 'mt-1 text-[11px] font-medium text-red-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 overflow-y-auto">
        <div className="bg-white border border-slate-200 w-full max-w-2xl overflow-hidden my-auto">

            {/* Header Pro */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        {isEditMode ? 'Modifier le profil utilisateur' : 'Créer un nouvel utilisateur'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">
                        {isEditMode
                            ? 'Mise à jour des informations et droits d\'accès'
                            : 'Ajout d\'un collaborateur pour le portail OMAPI'}
                    </p>
                </div>
                <button type="button" onClick={onClose} className="text-slate-400 hover:text-red-600 p-1 border border-slate-200 bg-white">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate={false}>
                {formErrors.form && (
                  <div className="bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-700" role="alert">
                    {formErrors.form}
                  </div>
                )}

                {/* Section 1: Identité */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center">
                        <UsersIcon className="w-3 h-3 mr-2" /> Identité & Contact
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="user-name" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Nom complet</label>
                            <input
                                id="user-name"
                                type="text"
                                required
                                autoComplete="name"
                                className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400"
                                value={formData.name || ''}
                                onChange={e => {
                                  setFormData({...formData, name: e.target.value});
                                  if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                                }}
                                placeholder="Ex: Jean Dupont"
                            />
                            {formErrors.name && <p className={fieldErrorClass}>{formErrors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="user-email" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Adresse Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                                <input
                                    id="user-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    disabled={isPrincipalAccount}
                                    title={isPrincipalAccount ? "L'e-mail du compte administrateur principal ne peut pas être modifié" : undefined}
                                    className="w-full pl-9 px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
                                    value={formData.email || ''}
                                    onChange={e => {
                                      setFormData({...formData, email: e.target.value});
                                      if (formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }));
                                    }}
                                    placeholder="jean@omapi.mg"
                                />
                            </div>
                            {formErrors.email && <p className={fieldErrorClass}>{formErrors.email}</p>}
                        </div>
                    </div>
                </div>

                {/* Section 2: Droits d'accès */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center">
                        <KeyIcon className="w-3 h-3 mr-2" /> Droits d'accès
                    </h4>
                    {(isPrincipalAccount || isSelfAccount) && (
                      <div className="bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] font-medium text-amber-800">
                        {isPrincipalAccount
                          ? 'Compte administrateur principal protégé : e-mail, rôle et statut verrouillés. Le nom et le mot de passe restent modifiables.'
                          : 'Votre propre compte : le rôle et le statut sont verrouillés pour éviter de vous retirer vos accès par erreur.'}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200">
                        <div>
                            <label htmlFor="user-role" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Rôle système</label>
                            <select
                                id="user-role"
                                required
                                disabled={lockRoleAndStatus}
                                className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                value={formData.role || 'Éditeur'}
                                onChange={e => setFormData({...formData, role: e.target.value as 'Admin' | 'Éditeur'})}
                            >
                                <option value="Éditeur">Éditeur (Contenu uniquement)</option>
                                <option value="Admin">Administrateur (Accès complet)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Statut du compte</label>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    disabled={lockRoleAndStatus}
                                    onClick={() => setFormData({...formData, status: 'Actif'})}
                                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${formData.status === 'Actif' || !formData.status ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Actif
                                </button>
                                <button
                                    type="button"
                                    disabled={lockRoleAndStatus}
                                    onClick={() => setFormData({...formData, status: 'Inactif'})}
                                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed ${formData.status === 'Inactif' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Inactif
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Sécurité (Mot de passe) */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center">
                        <KeyIcon className="w-3 h-3 mr-2" /> {isEditMode ? 'Modifier le mot de passe (optionnel)' : 'Initialisation du mot de passe'}
                    </h4>

                    <div className="flex items-center space-x-6 mb-2">
                        {isEditMode && (
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="pwdMode"
                                    className="w-3 h-3 text-slate-900 focus:ring-slate-900"
                                    checked={passwordMode === 'none'}
                                    onChange={() => handlePasswordModeChange('none')}
                                />
                                <span className="ml-2 text-[11px] font-bold text-slate-700 uppercase tracking-wide">Ne pas modifier</span>
                            </label>
                        )}
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="pwdMode"
                                className="w-3 h-3 text-slate-900 focus:ring-slate-900"
                                checked={passwordMode === 'auto'}
                                onChange={() => handlePasswordModeChange('auto')}
                            />
                            <span className="ml-2 text-[11px] font-bold text-slate-700 uppercase tracking-wide">Auto-généré</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="pwdMode"
                                className="w-3 h-3 text-slate-900 focus:ring-slate-900"
                                checked={passwordMode === 'manual'}
                                onChange={() => handlePasswordModeChange('manual')}
                            />
                            <span className="ml-2 text-[11px] font-bold text-slate-700 uppercase tracking-wide">Manuel</span>
                        </label>
                    </div>

                    {passwordMode === 'none' ? null : passwordMode === 'auto' ? (
                        <div className="bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600">
                            <div className="flex items-start">
                              <EnvelopeIcon className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0 text-slate-400" />
                              <div className="flex-1">
                                  <p className="font-bold uppercase tracking-tight">Mot de passe temporaire unique</p>
                                  <p className="mt-1 text-slate-500">
                                    Aucun e-mail automatique n'existe encore dans ce prototype : copiez ce mot de passe
                                    et transmettez-le à l'utilisateur par un canal sûr. Seule son empreinte sera enregistrée.
                                  </p>
                                  <div className="mt-3 flex gap-2">
                                    <input
                                      type="text"
                                      readOnly
                                      value={autoPassword}
                                      className="flex-1 px-3 py-2 border border-slate-300 bg-white font-mono text-xs text-slate-800"
                                      aria-label="Mot de passe temporaire généré"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAutoPassword(makeTemporaryPassword());
                                        setAutoPasswordCopied(false);
                                      }}
                                      className="px-3 py-2 border border-slate-300 bg-white text-[10px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-100"
                                    >
                                      Régénérer
                                    </button>
                                  </div>
                                  <label className="mt-3 flex items-center cursor-pointer text-[11px] font-medium text-slate-700">
                                    <input
                                      type="checkbox"
                                      checked={autoPasswordCopied}
                                      onChange={(e) => {
                                        setAutoPasswordCopied(e.target.checked);
                                        if (e.target.checked) {
                                          setFormErrors(prev => ({ ...prev, password: undefined }));
                                        }
                                      }}
                                      className="mr-2 h-3.5 w-3.5"
                                    />
                                    J'ai copié ce mot de passe temporaire en lieu sûr.
                                  </label>
                              </div>
                            </div>
                            {formErrors.password && <p className={fieldErrorClass}>{formErrors.password}</p>}
                        </div>
                    ) : (
                        <div className="relative">
                            <label htmlFor="user-password" className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 tracking-wide">Nouveau mot de passe</label>
                            <div className="relative">
                                <input
                                    id="user-password"
                                    type={showPassword ? "text" : "password"}
                                    required={passwordMode === 'manual'}
                                    minLength={8}
                                    autoComplete="new-password"
                                    className="w-full px-3 py-2 border border-slate-300 focus:border-slate-900 outline-none text-xs text-slate-600 bg-white"
                                    placeholder={isEditMode ? "Saisir le nouveau mot de passe..." : "Saisir le mot de passe..."}
                                    value={manualPassword}
                                    onChange={(e) => {
                                      setManualPassword(e.target.value);
                                      if (formErrors.password) setFormErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-900"
                                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                </button>
                            </div>
                            {formErrors.password ? (
                              <p className={fieldErrorClass}>{formErrors.password}</p>
                            ) : (
                              <p className="text-[10px] text-slate-500 mt-2 flex items-center uppercase tracking-tight">
                                  <CheckIcon className="w-3 h-3 mr-1 text-slate-400" />
                                  8 caractères minimum requis
                              </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="pt-6 flex justify-end space-x-3 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-60"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-60 flex items-center"
                    >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Enregistrement…' : (isEditMode ? 'Enregistrer' : 'Créer')}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default UserFormModal;
