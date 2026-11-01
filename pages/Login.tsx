
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL, apiRequest, clearApiSession, getApiToken, saveApiSession, type ApiAuthUser } from '../utils/apiAuth';

// --- Heroicons Local Components for Login ---
const LockClosedIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeSlashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);



const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = getApiToken();
    if (!token) {
      clearApiSession();
      return;
    }

    let active = true;
    apiRequest('/api/auth/me', {}, token)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok || !payload.user || !payload.user.role) {
          clearApiSession();
          return;
        }
        saveApiSession(token, payload.user as ApiAuthUser);
        navigate('/admin', { replace: true });
      })
      .catch(() => {
        if (active) setError("Impossible de vérifier la session auprès de l’API. Réessayez.");
      });

    return () => { active = false; };
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      }, null);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) setError('Adresse e-mail ou mot de passe incorrect.');
        else if (response.status === 429) setError('Trop de tentatives. Réessayez plus tard.');
        else setError(payload.error || 'Le service de connexion est momentanément indisponible.');
        return;
      }

      if (typeof payload.token !== 'string' || !payload.user || !['Admin', 'Éditeur'].includes(payload.user.role)) {
        setError('Réponse de connexion invalide. Réessayez.');
        return;
      }

      saveApiSession(payload.token, payload.user as ApiAuthUser);
      setFormData({ email: '', password: '' });
      navigate('/admin', { replace: true });
    } catch {
      setError(`Impossible de joindre l’API OMAPI (${API_BASE_URL}). Vérifiez la connexion puis réessayez.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                alt="Office Background" 
                className="w-full h-full object-cover mix-blend-overlay opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-primary/90 to-blue-800/90 mix-blend-multiply"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-16 text-white h-full flex flex-col justify-between">
            <div>
                <h1 className="text-4xl font-extrabold mb-6 leading-tight">
                    Protection de la <br/> 
                    <span className="text-blue-200">Propriété Industrielle</span>
                </h1>
                <p className="text-blue-100 text-lg max-w-md leading-relaxed font-light">
                    Gérez efficacement les demandes, les publications et les ressources de l'office via ce portail d'administration sécurisé.
                </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-blue-200/80">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-white/20"></div>
                    ))}
                </div>
                <p>Espace réservé au personnel autorisé.</p>
            </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -right-24 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl"></div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-16 xl:px-24 bg-gray-50/50">
        
        <div className="absolute top-6 left-6 lg:left-auto lg:right-12">
            <Link to="/" className="group flex items-center text-gray-500 hover:text-primary transition-colors font-medium text-sm">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2 shadow-sm group-hover:border-primary group-hover:text-primary transition-colors">
                    <ArrowLeftIcon className="w-4 h-4" />
                </div>
                Retour au site public
            </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
            {/* Mobile Logo (Visible only on small screens) */}
            <div className="lg:hidden text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
            </div>

            <div className="mb-10">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Connexion</h2>
                <p className="mt-3 text-gray-500 text-sm">
                    Bienvenue. Veuillez vous connecter pour accéder au tableau de bord.
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-fadeIn">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Adresse Email
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm sm:text-sm"
                                placeholder="nom@omapi.mg"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Mot de passe
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-11 pr-12 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm sm:text-sm"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Session sécurisée, expiration automatique après 12 heures.</p>
                    <div className="text-sm">
                        <button
                            type="button"
                            onClick={() => setError("La réinitialisation par e-mail n'est pas encore disponible. Contactez un administrateur pour réinitialiser votre accès.")}
                            className="font-semibold text-primary hover:text-blue-700 transition-colors"
                        >
                            Mot de passe oublié ?
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Authentification...
                        </>
                    ) : (
                        'Se connecter'
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">
                    © {new Date().getFullYear()} Office Malgache de la Propriété Industrielle. <br/> Tous droits réservés. <br/>
                    <span className="text-gray-300 font-medium mt-2 inline-block">Développé par Daniel's Dev</span>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
