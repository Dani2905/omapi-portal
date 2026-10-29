
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { XMarkIcon, UsersIcon, EnvelopeIcon, KeyIcon, CheckIcon, PhotoIcon, EyeIcon, EyeSlashIcon } from './AdminIcons';
import {
  hasPasswordCredential,
  hasProfilePasswordChangeInput,
  normalizeEmail,
  normalizeName,
  validateProfilePasswordChange,
  validateUserDraft,
} from '../../utils/userAccounts';

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
}

const ProfileFormModal: React.FC<ProfileFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUser,
  existingUsers = [],
}) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountHasPassword = hasPasswordCredential(currentUser);

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
      });
      setPasswords({ current: '', new: '', confirm: '' });
      setError('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedProfile: Partial<User> = {
      id: currentUser.id,
      name: normalizeName(formData.name),
      email: normalizeEmail(formData.email),
      role: currentUser.role,
      status: currentUser.status,
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

    const wantsPasswordChange = hasProfilePasswordChangeInput({
      currentPassword: passwords.current,
      newPassword: passwords.new,
      confirmPassword: passwords.confirm,
    });
    const passwordError = validateProfilePasswordChange({
      currentPassword: passwords.current,
      newPassword: passwords.new,
      confirmPassword: passwords.confirm,
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
                    <button type="button" onClick={onClose} disabled={isSubmitting} className="text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm disabled:opacity-50">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center space-x-6 relative z-10">
                    {/* Avatar Circle */}
                    <div className="relative group cursor-pointer">
                        <div className="w-20 h-20 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center text-3xl font-bold text-white shadow-xl backdrop-blur-md">
                            {getInitials(formData.name || '')}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-blue-600 border-2 border-slate-900 rounded-full p-1.5 text-white shadow-lg group-hover:scale-110 transition-transform" title="Modifier la photo (Bientôt disponible)">
                            <PhotoIcon className="w-3 h-3" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Mon Profil</h3>
                        <p className="text-blue-200 text-sm mt-1 font-medium">Gérez vos informations personnelles et accès.</p>
                    </div>
                </div>

                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="p-8 space-y-8">
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

                        <div className="flex items-center mb-6 relative z-10">
                            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 mr-3 border border-slate-100">
                                <KeyIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Mot de passe</h4>
                                <p className="text-xs text-gray-500">
                                  {accountHasPassword
                                    ? 'Saisissez le mot de passe actuel pour en définir un nouveau. Laissez tous les champs vides pour ne pas modifier.'
                                    : "Aucun mot de passe n'est encore défini pour ce compte : vous pouvez en définir un maintenant."}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
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
                                        minLength={8}
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
                                <p className="text-[11px] text-gray-400">8 caractères minimum, différent de l'actuel.</p>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="profile-confirm-password" className="text-xs font-semibold text-gray-500">Confirmer</label>
                                <div className="relative">
                                    <input
                                        id="profile-confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        minLength={8}
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
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-between items-center rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors px-4 py-2 disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center"
                    >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default ProfileFormModal;
