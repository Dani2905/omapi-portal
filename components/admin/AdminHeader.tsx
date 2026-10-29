
import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, CheckIcon, ShoppingCartIcon, UserIcon, InformationCircleIcon } from './AdminIcons';
import { SystemNotification } from '../../types';

interface AdminHeaderProps {
  activeTab: string;
  userName: string;
  userRole: string;
  onProfileClick?: () => void;
  systemNotifications?: SystemNotification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
    activeTab, userName, userRole, onProfileClick,
    systemNotifications = [], onMarkAsRead, onMarkAllAsRead, toggleSidebar
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const getTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Vue d\'ensemble';
      case 'hero': return 'Gestion du Carrousel';
      case 'announcement': return 'Bandeau d\'information';
      case 'news': return 'Gestion des Actualités';
      case 'gopi': return 'Gazette Officielle (GOPI)';
      case 'forms': return 'Gestion Documentaire';
      case 'formations': return 'Catalogue de Formations';
      case 'users': return 'Gestion des Utilisateurs';
      case 'home-scam': return 'Alerte Arnaques (Accueil)';
      case 'home-resources': return 'Ressources Vedettes (Accueil)';
      default: return 'Tableau de bord';
    }
  };

  const unreadCount = systemNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
      switch (type) {
          case 'order': return <ShoppingCartIcon className="w-4 h-4 text-orange-500" />;
          case 'info': return <UserIcon className="w-4 h-4 text-blue-500" />;
          case 'success': return <CheckIcon className="w-4 h-4 text-green-500" />;
          default: return <InformationCircleIcon className="w-4 h-4 text-gray-500" />;
      }
  };

  const getNotificationBg = (type: string) => {
      switch (type) {
          case 'order': return 'bg-orange-50';
          case 'info': return 'bg-blue-50';
          case 'success': return 'bg-green-50';
          default: return 'bg-gray-50';
      }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 flex-shrink-0 z-30 relative shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
            <span className="text-xl">☰</span>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
          {getTitle()}
        </h1>
        <div className="h-5 w-px bg-gray-200 hidden sm:block mx-2"></div>
        <div className="text-sm text-gray-500 font-medium hidden sm:block">
          Admin / <span className="text-gray-400 capitalize">{activeTab}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-5">
        {/* Notifications Bell */}
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full focus:outline-none relative transition-colors"
            >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>

            {/* Dropdown Notifications */}
            {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl border border-gray-100 rounded-2xl overflow-hidden z-50">
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <span className="text-sm font-semibold text-gray-900">Notifications</span>
                        {unreadCount > 0 && onMarkAllAsRead && (
                            <button 
                                onClick={onMarkAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {systemNotifications.length > 0 ? (
                            systemNotifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => onMarkAsRead && onMarkAsRead(notif.id)}
                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-start gap-3 transition-colors ${notif.read ? 'opacity-60' : 'bg-white'}`}
                                >
                                    <div className={`p-2 rounded-xl flex-shrink-0 ${getNotificationBg(notif.type)}`}>
                                        {getNotificationIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${notif.read ? 'text-gray-600 font-medium' : 'text-gray-900 font-semibold'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{notif.time}</p>
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm font-medium">
                                Aucune notification
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Profile */}
        <button 
            onClick={onProfileClick}
            className="flex items-center space-x-3 p-1.5 rounded-xl border border-transparent hover:bg-gray-50 transition-colors group focus:outline-none"
            title="Modifier mon profil"
        >
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-semibold text-gray-900 leading-none">{userName}</span>
              <span className="block text-xs text-gray-500 font-medium mt-1">{userRole}</span>
            </div>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm ${userRole === 'Admin' ? 'bg-gray-900' : 'bg-blue-600'}`}>
              {userName.charAt(0)}
            </div>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
