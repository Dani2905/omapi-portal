
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { XMarkIcon, UsersIcon, EnvelopeIcon, KeyIcon, CheckIcon, PhotoIcon, EyeIcon, EyeSlashIcon } from './AdminIcons';

interface ProfileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<User> & { password?: string }) => void;
  currentUser: Partial<User>;
}

const ProfileFormModal: React.FC<ProfileFormModalProps> = ({ isOpen, onClose, onSave, currentUser }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(currentUser);
      setPasswords({ current: '', new: '', confirm: '' });
      setError('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let newPassword = undefined;

    // Validation mot de passe
    if (passwords.new || passwords.confirm) {
        if (passwords.new !== passwords.confirm) {
            setError('Les nouveaux mots de passe ne correspondent pas.');
            return;
        }
        if (passwords.new.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }
        
        newPassword = passwords.new;
    }

    onSave({ ...formData, password: newPassword });
  };

  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map(n => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'U';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn my-auto">
            
            {/* Header Pro */}
            <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-8">
                <div className="absolute top-4 right-4">
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm">
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
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Nom complet</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UsersIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full pl-10 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium placeholder-gray-400"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email professionnel</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    </div>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full pl-10 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium placeholder-gray-400"
                                        value={formData.email || ''}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
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
                                <p className="text-xs text-gray-500">Laissez les champs vides pour ne pas modifier.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-5 bg-red-50 text-red-600 text-xs font-medium p-3 rounded-lg border border-red-100 flex items-center animate-fadeIn">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500">Nouveau mot de passe</label>
                                <div className="relative">
                                    <input 
                                        type={showNewPassword ? "text" : "password"}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-700 placeholder-gray-300 pr-10"
                                        placeholder="••••••••"
                                        value={passwords.new}
                                        onChange={e => setPasswords({...passwords, new: e.target.value})}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showNewPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500">Confirmer</label>
                                <div className="relative">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 outline-none transition-all text-gray-700 placeholder-gray-300 pr-10 ${
                                            passwords.confirm && passwords.new !== passwords.confirm 
                                            ? 'border-red-300 focus:ring-red-100 focus:border-red-400' 
                                            : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                                        }`}
                                        placeholder="••••••••"
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-between items-center rounded-b-2xl">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors px-4 py-2"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center"
                    >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Enregistrer les modifications
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default ProfileFormModal;
