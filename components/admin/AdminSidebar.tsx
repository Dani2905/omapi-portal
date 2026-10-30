
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  PhotoIcon, 
  NewspaperIcon, 
  UsersIcon, 
  EyeIcon, 
  ArrowRightOnRectangleIcon,
  MegaphoneIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarIcon,
  ScaleIcon,
  PaintBrushIcon,
  ExclamationTriangleIcon,
  PlayCircleIcon,
  BriefcaseIcon
} from './AdminIcons';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userRole: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, onLogout, userRole, isOpen, setIsOpen }) => {
  
  const navigationGroups = [
    {
      title: 'Principal',
      items: [
        { id: 'overview', label: 'Tableau de bord', icon: ChartBarIcon },
      ]
    },
    {
      title: 'Communication',
      items: [
        { id: 'news', label: 'Centre Éditorial', icon: NewspaperIcon },
        { id: 'events', label: 'Événements', icon: CalendarIcon },
        { id: 'jobs', label: 'Offres d\'emploi', icon: BriefcaseIcon },
        { id: 'job_applications', label: 'Candidatures web', icon: DocumentTextIcon },
        { id: 'home-resources', label: 'Ressources Accueil', icon: PlayCircleIcon },
        { id: 'hero', label: 'Carrousel Accueil', icon: PhotoIcon },
        { id: 'announcement', label: 'Bandeau Info', icon: MegaphoneIcon },
      ]
    },
    {
      title: 'Documents & Services',
      items: [
        { id: 'gopi', label: 'Gazette (GOPI)', icon: BookOpenIcon },
        { id: 'legislation', label: 'Législation', icon: ScaleIcon },
        { id: 'forms', label: 'Formulaires et Guides', icon: DocumentTextIcon },
        { id: 'formations', label: 'Formations', icon: AcademicCapIcon },
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'users', label: 'Utilisateurs', icon: UsersIcon, role: 'Admin' },
      ]
    }
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-gray-600 flex flex-col flex-shrink-0 h-full border-r border-gray-200 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-sm`}>
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-white justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm">
              OM
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-sm tracking-tight">OMAPI Admin</h1>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">v1.0.4</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">✕</button>
      </div>
      
      {/* Navigation Scrollable */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 px-3 space-y-6">
          {navigationGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {group.title && (
                <h3 className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  // Vérification du rôle si nécessaire
                  if (item.role && item.role !== userRole) return null;

                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button 
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                        className={`w-full flex items-center px-3 py-2.5 rounded-xl group transition-colors duration-150 ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        <span className={`flex-1 text-left text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="grid gap-2">
            <Link 
                to="/"
                className="flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors shadow-sm"
            >
                <EyeIcon className="w-4 h-4 mr-2" />
                Site Public
            </Link>
            <button 
                onClick={onLogout}
                className="flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-100 rounded-xl transition-colors"
            >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Déconnexion
            </button>
          </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
