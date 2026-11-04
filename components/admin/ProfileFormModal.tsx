
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { XMarkIcon, UsersIcon, EnvelopeIcon, KeyIcon, CheckIcon, PhotoIcon, EyeIcon, EyeSlashIcon } from './AdminIcons';
import {
  hasPasswordCredential,
  normalizeEmail,
  normalizeName,
  validateOptionalProfilePasswordChange,
  validateUserDraft,
} from '../../utils/userAccounts';
import { optimizeProfilePhoto } from '../../utils/profilePhoto';

export interface ProfileSaveData extends Partial<User> {
  password?: string;
  currentPassword?: string;
}

interface ProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileSaveData) => Promise<string | void> | string | void;
  currentUser: Partial<User>;
  existingUsers?: User[];
  requiresCurrentPassword?: boolean;
}

const ProfileFormModal: React.FC<ProfileFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUser,
  existingUsers = [],
  requiresCurrentPassword = false,
}) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isPasswordChangeEnabled, setIsPasswordChangeEnabled] = useState(false);
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const accountHasPassword = requiresCurrentPassword || hasPasswordCredential(currentUser);

  // N'initialise le formulaire qu'à l'ouverture de la fenêtre.
  // (Ne pas dépendre de l'objet currentUser recréé à chaque rendu du parent :
  // cela effacerait les champs, y compris les mots de passe, pendant la saisie.)
  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        status: currentUser.status,
        avatar: currentUser.avatar || null,
      });
      setPasswords({ current: '', new: '', confirm: '' });
      setIsPasswordChangeEnabled(false);
      setError('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setIsSubmitting(false);
      setIsProcessingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessingPhoto || isSubmitting) return;
    setError('');

    const normalizedProfile: Partial<User> = {
      id: currentUser.id,
      name: normalizeName(formData.name),
      email: normalizeEmail(formData.email),
      role: currentUser.role,
      status: currentUser.status,
      avatar: formData.avatar ?? null,
    };

    const profileErrors = validateUserDraft(
      normalizedProfile,
      existingUsers,
      currentUser.id,
    );
    const firstProfileError = profileErrors.name || profileErrors.email;
    if (firstProfileError) {
      setError(firstProfileError);
      return;
    }

    const passwordInput = {
      currentPassword: passwords.current,
      newPassword: passwords.new,
      confirmPassword: passwords.confirm,
    };
    // Un changement de mot de passe doit être demandé explicitement. Cela évite
    // que l'auto-remplissage du navigateur bloque une simple sauvegarde du profil.
    const wantsPasswordChange = isPasswordChangeEnabled;
    const passwordError = validateOptionalProfilePasswordChange(isPasswordChangeEnabled, {
      ...passwordInput,
      hasCurrentCredential: accountHasPassword,
    });

    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSave({
        ...normalizedProfile,
        password: wantsPasswordChange ? passwords.new : undefined,
        currentPassword: wantsPasswordChange ? passwords.current : undefined,
      });

      if (typeof result === 'string' && result) {
        setError(result);
      }
    } catch {
      setError("Une erreur est survenue pendant l'enregistrement du profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    setError('');
    setIsProcessingPhoto(true);
    try {
      const avatar = await optimizeProfilePhoto(file);
      setFormData((previous) => ({ ...previous, avatar }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de préparer cette photo.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const updatePasswordField = (
    field: keyof typeof passwords,
    value: string,
  ) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const getInitials = (name: string) => {
    return name
      ? name
          .trim()
          .split(/\s+/)
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'U';
  };

  if (!isOpen) return null;

  const passwordInputClass = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 placeholder-gray-300 pr-10';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn my-auto">

            {/* Header Pro */}
            <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-8">
                <div className="absolute top-4 right-4">
                    <button type="button" onClick={onClose} disabled={isSubmitting || isProcessingPhoto} className="text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm disabled:opacity-50">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative z-10 flex flex-col items-start gap-4 pr-8 sm:flex-row sm:items-center sm:gap-6 sm:pr-0">
                    <div className="flex shrink-0 flex-col items-center gap-2">
                        <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            disabled={isProcessingPhoto || isSubmitting}
                            aria-label={formData.avatar ? 'Changer la photo de profil' : 'Ajouter une photo de profil'}
                            className="group relative h-20 w-20 overflow-hidden rounded-full border-4 border-white/20 bg-white/10 text-3xl font-bold text-white shadow-xl outline-none transition hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-70"
                        >
                            {formData.avatar
                                ? <img src={formData.avatar} alt="Aperçu de la photo de profil" className="h-full w-full object-cover" />
                                : getInitials(formData.name || '')}
                            <span className="absolute bottom-0 right-0 rounded-full border-2 border-slate-900 bg-blue-600 p-1.5 text-white shadow-lg transition-transform group-hover:scale-110">
                                <PhotoIcon className="h-3 w-3" />
                            </span>
                        </button>
                        <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            onChange={handlePhotoChange}
                            aria-label="Choisir une photo de profil"
                        />
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={() => photoInputRef.current?.click()} disabled={isProcessingPhoto || isSubmitting} className="text-xs font-semibold text-blue-100 underline decoration-blue-300 underline-offset-2 hover:text-white disabled:opacity-60">
                                {isProcessingPhoto ? 'Optimisation…' : formData.avatar ? 'Changer' : 'Ajouter une photo'}
                            </button>
                            {formData.avatar && <button type="button" onClick={() => { setFormData((previous) => ({ ...previous, avatar: null })); setError(''); }} disabled={isProcessingPhoto || isSubmitting} className="text-xs font-semibold text-blue-100 underline decoration-blue-300 underline-offset-2 hover:text-white disabled:opacity-60">Retirer</button>}
                        </div>
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-2xl font-bold tracking-tight text-white">Mon Profil</h3>
                        <p className="mt-1 text-sm font-medium text-blue-200">Gérez vos informations personnelles et accès.</p>
                        <p className="mt-2 text-[11px] text-blue-100/80">JPG, PNG ou WebP · 8 Mo max. La photo est recadrée et optimisée automatiquement.</p>
                    </div>
                </div>

                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="space-y-6 p-5 sm:space-y-8 sm:p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-100 flex items-center animate-fadeIn" role="alert">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                            {error}
                        </div>
                    )}

                    {/* Informations de base */}
                    <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Informations générales</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                Rôle: {formData.role}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="profile-name" className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Nom complet</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UsersIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input
                                        id="profile-name"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        className="w-full pl-10 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium placeholder-gray-400"
                                        value={formData.name || ''}
                                        onChange={e => {
                                          setFormData({...formData, name: e.target.value});
                                          if (error) setError('');
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="profile-email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email professionnel</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input
                                        id="profile-email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        className="w-full pl-10 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium placeholder-gray-400"
                                        value={formData.email || ''}
                                        onChange={e => {
                                          setFormData({...formData, email: e.target.value});
                                          if (error) setError('');
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sécurité */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 relative overflow-hidden group hover:border-slate-200 transition-colors">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>

                        <div className="flex items-center mb-5 relative z-10">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 mr-3 border border-slate-100">
                                <KeyIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Mot de passe</h4>
                                <p className="text-xs text-gray-500">
                                  {isPasswordChangeEnabled
                                    ? accountHasPassword
                                      ? 'Saisissez le mot de passe actuel pour en définir un nouveau.'
                                      : 'Vous pouvez définir un mot de passe pour ce compte.'
                                    : 'Laissez cette option désactivée pour conserver votre mot de passe actuel.'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                          <label htmlFor="profile-change-password" className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                            <input
                              id="profile-change-password"
                              type="checkbox"
                              checked={isPasswordChangeEnabled}
                              onChange={(event) => {
                                const enabled = event.target.checked;
                                setIsPasswordChangeEnabled(enabled);
                                setPasswords({ current: '', new: '', confirm: '' });
                                setShowCurrentPassword(false);
                                setShowNewPassword(false);
                                setShowConfirmPassword(false);
                                if (error) setError('');
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Modifier également mon mot de passe
                          </label>

                          {isPasswordChangeEnabled && (
                            <div className="space-y-6">
                              {accountHasPassword && (
                                <div className="space-y-2 md:max-w-[calc(50%-0.75rem)]">
                                  <label htmlFor="profile-current-password" className="text-xs font-semibold text-gray-500">Mot de passe actuel</label>
                                  <div className="relative">
                                    <input
                                      id="profile-current-password"
                                      type={showCurrentPassword ? "text" : "password"}
                                      autoComplete="current-password"
                                      className={passwordInputClass}
                                      placeholder="••••••••"
                                      value={passwords.current}
                                      onChange={e => updatePasswordField('current', e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                      aria-label={showCurrentPassword ? 'Masquer le mot de passe actuel' : 'Afficher le mot de passe actuel'}
                                    >
                                      {showCurrentPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label htmlFor="profile-new-password" className="text-xs font-semibold text-gray-500">Nouveau mot de passe</label>
                                  <div className="relative">
                                    <input
                                      id="profile-new-password"
                                      type={showNewPassword ? "text" : "password"}
                                      autoComplete="new-password"
                                      minLength={12}
                                      className={passwordInputClass}
                                      placeholder="••••••••"
                                      value={passwords.new}
                                      onChange={e => updatePasswordField('new', e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowNewPassword(!showNewPassword)}
                                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                      aria-label={showNewPassword ? 'Masquer le nouveau mot de passe' : 'Afficher le nouveau mot de passe'}
                                    >
                                      {showNewPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-gray-400">12 caractères minimum, différent de l'actuel.</p>
                                </div>
                                <div className="space-y-2">
                                  <label htmlFor="profile-confirm-password" className="text-xs font-semibold text-gray-500">Confirmer</label>
                                  <div className="relative">
                                    <input
                                      id="profile-confirm-password"
                                      type={showConfirmPassword ? "text" : "password"}
                                      autoComplete="new-password"
                                      minLength={12}
                                      className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 outline-none transition-all text-gray-700 placeholder-gray-300 pr-10 ${
                                        passwords.confirm && passwords.new !== passwords.confirm
                                        ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                                        : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                                      }`}
                                      placeholder="••••••••"
                                      value={passwords.confirm}
                                      onChange={e => updatePasswordField('confirm', e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                      aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                                    >
                                      {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-gray-200 bg-gray-50 px-5 py-4 sm:px-8 sm:py-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting || isProcessingPhoto}
                        className="px-3 py-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-800 disabled:opacity-50 sm:px-4"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || isProcessingPhoto}
                        className="flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl disabled:opacity-60 sm:px-6 sm:text-sm"
                    >
                        <CheckIcon className="mr-2 h-4 w-4 shrink-0" />
                        {isProcessingPhoto ? 'Optimisation…' : isSubmitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default ProfileFormModal;
