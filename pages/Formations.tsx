

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { DEFAULT_FORMATIONS, DEFAULT_FORMATION_REGISTRATIONS } from '../constants';
import { Formation, FormationRegistration } from '../types';
import { useCrud } from '../hooks/useCrud';
import { normalizeFormationRegistration, validateFormationRegistration } from '../utils/formationLogic';

// --- Heroicons ---
const AcademicCapIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.499 5.258 50.55 50.55 0 0 0-2.658.813m-15.482 0A50.55 50.55 0 0 1 12 13.489a50.55 50.55 0 0 1 6.74-2.505M16 10.866c-.675.05-1.353.08-2.03.09h-3.94c-.677-.01-1.355-.04-2.03-.09M16 10.866c.219.82.41 1.65.572 2.49M7.97 10.866c-.161.84-.353 1.67-.572 2.49" />
  </svg>
);

const PresentationChartLineIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
  </svg>
);

const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
);

const BuildingOfficeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const CalendarDaysIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const ExclamationCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
  </svg>
);

const ArrowDownTrayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

const Formations: React.FC = () => {
  const { items: formations } = useCrud<Formation>('omapi_formations', DEFAULT_FORMATIONS);
  const { items: registrations, saveItem: saveRegistration } = useCrud<FormationRegistration>('omapi_formation_registrations', DEFAULT_FORMATION_REGISTRATIONS);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  
  // Form Data State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    message: ''
  });
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);

  const baseFormations = formations.filter(f => f.category === 'Base');
  const advancedFormations = formations.filter(f => f.category === 'Avancee');

  const handleRegisterClick = (formation: Formation) => {
    setSelectedFormation(formation);
    setFormData({
      name: '', email: '', phone: '', organization: '',
      message: `Je souhaite m'inscrire à la formation : ${formation.title}`,
    });
    setRegistrationError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmittingRegistration) return;
    setIsModalOpen(false);
    setSelectedFormation(null);
    setFormData({ name: '', email: '', phone: '', organization: '', message: '' });
    setRegistrationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRegistration) return;

    const normalized = normalizeFormationRegistration(formData);
    const validationError = validateFormationRegistration(normalized, selectedFormation, registrations);
    if (validationError) {
      setRegistrationError(validationError);
      return;
    }

    setRegistrationError(null);
    setIsSubmittingRegistration(true);
    try {
      const newRegistration: FormationRegistration = {
        ...normalized,
        id: Date.now(),
        formationId: selectedFormation!.id,
        name: normalized.name,
        email: normalized.email,
        phone: normalized.phone || '',
        organization: normalized.organization || '',
        message: normalized.message || '',
        registrationDate: new Date().toISOString(),
      };

      const saved = await saveRegistration(newRegistration);
      if (!saved) {
        setRegistrationError("L'inscription n'a pas pu être enregistrée dans cette démonstration locale. Vos informations restent dans le formulaire ; réessayez.");
        return;
      }

      alert(`Votre demande pour « ${selectedFormation!.title} » a été enregistrée dans la démonstration locale sur ce navigateur. L’envoi à l’OMAPI et la prise de contact ne sont pas encore automatisés.`);
      setIsModalOpen(false);
      setSelectedFormation(null);
      setFormData({ name: '', email: '', phone: '', organization: '', message: '' });
    } catch {
      setRegistrationError("Une erreur a empêché l'enregistrement. Vos informations restent dans le formulaire ; réessayez.");
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper function to map dynamic themes to Tailwind classes
  const getThemeClasses = (themeColor: string) => {
      switch(themeColor) {
          case 'blue': return { top: 'bg-blue-600', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700', icon: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' };
          case 'emerald': return { top: 'bg-emerald-600', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', icon: 'text-emerald-600', button: 'bg-emerald-600 hover:bg-emerald-700' };
          case 'amber': return { top: 'bg-amber-500', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', icon: 'text-amber-500', button: 'bg-amber-500 hover:bg-amber-600' };
          case 'rose': return { top: 'bg-rose-500', badgeBg: 'bg-rose-50', badgeText: 'text-rose-700', icon: 'text-rose-500', button: 'bg-rose-500 hover:bg-rose-600' };
          case 'indigo': return { top: 'bg-indigo-600', badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-700', icon: 'text-indigo-600', button: 'bg-indigo-600 hover:bg-indigo-700' };
          case 'purple': return { top: 'bg-purple-600', badgeBg: 'bg-purple-50', badgeText: 'text-purple-700', icon: 'text-purple-600', button: 'bg-purple-600 hover:bg-purple-700' };
          case 'cyan': return { top: 'bg-cyan-600', badgeBg: 'bg-cyan-50', badgeText: 'text-cyan-700', icon: 'text-cyan-600', button: 'bg-cyan-600 hover:bg-cyan-700' };
          default: return { top: 'bg-blue-600', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700', icon: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' };
      }
  };

  const renderFormationCard = (formation: Formation) => {
    // Déterminer la couleur par défaut si non définie (backward compatibility)
    const defaultColor = formation.category === 'Base' ? 'blue' : 'purple';
    const theme = getThemeClasses(formation.colorTheme || defaultColor);

    return (
        <div key={formation.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
            <div className={`h-2 w-full ${theme.top}`}></div>
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${theme.badgeBg} ${theme.badgeText}`}>
                        {formation.category === 'Base' ? 'Formation de Base' : 'Formation Avancée'}
                    </span>
                    {formation.category === 'Base' ? 
                        <PresentationChartLineIcon className={`w-6 h-6 text-gray-300 group-hover:${theme.icon} transition-colors`} /> : 
                        <AcademicCapIcon className={`w-6 h-6 text-gray-300 group-hover:${theme.icon} transition-colors`} />
                    }
                </div>
                
                <h3 className={`text-xl font-bold text-gray-800 mb-4 group-hover:${theme.icon} transition-colors`}>
                    {formation.title}
                </h3>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                        <CalendarDaysIcon className="w-5 h-5 mr-3 text-gray-400" />
                        <span>{formation.date || 'Date à définir'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-5 h-5 mr-3 text-gray-400" />
                        <span>{formation.time || 'Horaire à définir'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 sm:col-span-2">
                        <MapPinIcon className="w-5 h-5 mr-3 text-gray-400" />
                        <span>{formation.location || 'Lieu à définir'}</span>
                    </div>
                </div>

                {formation.description && (
                    <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed border-t border-gray-100 pt-4">
                        {formation.description}
                    </p>
                )}

                {formation.conditions && (
                    <div className="mt-auto mb-6 bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-start gap-2">
                        <ExclamationCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-800">{formation.conditions}</p>
                    </div>
                )}

                <div className="mt-auto space-y-2">
                    {/* Bouton de téléchargement de fichier si présent */}
                    {formation.fileUrl && (
                        <a 
                            href={formation.fileUrl} 
                            download={formation.fileName || 'document_formation'}
                            className="w-full flex items-center justify-center py-2.5 rounded-lg font-medium text-sm transition-all border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 group/dl"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-2 text-gray-400 group-hover/dl:text-gray-600" />
                            Télécharger le programme
                        </a>
                    )}

                    <button 
                        onClick={() => handleRegisterClick(formation)}
                        className={`w-full py-3 rounded-lg font-bold text-sm transition-all shadow-sm text-white ${theme.button}`}
                    >
                        S'inscrire à cette session
                    </button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Formations' }]} />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">Catalogue des Formations</h1>
            <p className="text-xl text-secondary font-medium">Développez vos compétences en propriété intellectuelle</p>
            <div className="w-24 h-1.5 bg-primary rounded-full mt-6 mx-auto md:mx-0"></div>
        </div>

        <div className="mb-16">
            <p className="text-gray-700 leading-relaxed mb-8 text-lg max-w-3xl">
                L'OMAPI organise régulièrement des sessions de formation et de sensibilisation destinées aux entreprises, inventeurs, créateurs et professionnels du droit.
                <br/>
                <span className="text-sm text-gray-500 italic">Cliquez sur "S'inscrire" pour réserver votre place.</span>
            </p>

            {/* Section Base */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                    <span className="bg-primary/10 p-2 rounded-lg mr-3">
                        <PresentationChartLineIcon className="w-6 h-6 text-primary" />
                    </span>
                    Formations Fondamentales
                </h2>
                {baseFormations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {baseFormations.map(renderFormationCard)}
                    </div>
                ) : (
                    <p className="text-gray-500 italic bg-white p-6 rounded-lg shadow-sm border border-gray-100">Aucune formation de base disponible pour le moment.</p>
                )}
            </div>

            {/* Section Avancée */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                    <span className="bg-secondary/10 p-2 rounded-lg mr-3">
                        <AcademicCapIcon className="w-6 h-6 text-secondary" />
                    </span>
                    Formations Avancées & Spécialisées
                </h2>
                {advancedFormations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {advancedFormations.map(renderFormationCard)}
                    </div>
                ) : (
                    <p className="text-gray-500 italic bg-white p-6 rounded-lg shadow-sm border border-gray-100">Aucune formation avancée disponible pour le moment.</p>
                )}
            </div>
        </div>

        {/* CTA Sur Mesure */}
        <div className="bg-gradient-to-r from-gray-900 to-primary rounded-2xl shadow-xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Besoin d'une formation sur mesure ?</h2>
                <p className="mb-8 text-blue-100 max-w-2xl mx-auto text-lg">
                    Nous concevons des programmes adaptés aux besoins spécifiques de votre entreprise ou de votre secteur d'activité.
                </p>
                <Link to="/contact"
                    className="inline-flex items-center bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <EnvelopeIcon className="w-5 h-5 mr-3" />
                    Demander un devis personnalisé
                </Link>
            </div>
            {/* Decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Modal d'inscription */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
                <div className="bg-primary px-6 py-4 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-white">Inscription Formation</h3>
                        <p className="text-blue-200 text-xs mt-1 truncate max-w-[300px]">{selectedFormation?.title}</p>
                    </div>
                    <button type="button" onClick={handleCloseModal} disabled={isSubmittingRegistration} className="text-white/70 hover:text-white transition-colors disabled:opacity-50">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {registrationError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{registrationError}</p>}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text"
                                    name="name"
                                    autoComplete="name"
                                    maxLength={120}
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-gray-900"
                                    placeholder="Votre nom"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    maxLength={254}
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-gray-900"
                                    placeholder="votre@email.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        type="tel"
                                        name="phone"
                                        autoComplete="tel"
                                        maxLength={40}
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-gray-900"
                                        placeholder="034..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organisme</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="organization"
                                        autoComplete="organization"
                                        maxLength={160}
                                        value={formData.organization}
                                        onChange={handleChange}
                                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-gray-900"
                                        placeholder="Société..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optionnel)</label>
                            <textarea 
                                rows={3}
                                maxLength={1500}
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none bg-white text-gray-900"
                                placeholder="Attentes particulières..."
                            />
                        </div>

                        <div className="pt-2 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSubmittingRegistration}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmittingRegistration}
                                className="px-6 py-2 bg-primary hover:bg-secondary text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-60"
                            >
                                {isSubmittingRegistration ? 'Enregistrement…' : 'Confirmer l’inscription'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Formations;