
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import DashboardContent from '../components/admin/DashboardContent';
import DashboardModals from '../components/admin/DashboardModals';
import ToastNotifications from '../components/admin/ToastNotifications';
import ProfileFormModal from '../components/admin/ProfileFormModal';
import { useAdminData } from '../hooks/useAdminData';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // User Session
  const [userRole, setUserRole] = useState<string>('Admin');
  const [userName, setUserName] = useState<string>('Daniel Razanajaona');
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Logic Hook
  const adminData = useAdminData();

  useEffect(() => {
    const localRole = localStorage.getItem('omapi_user_role');
    const localEmail = localStorage.getItem('omapi_user_email');
    const localName = localStorage.getItem('omapi_user_name');

    if (localEmail && (localRole === 'Admin' || localRole === 'Éditeur')) {
      setUserRole(localRole);
      setUserName(localName || 'Daniel Razanajaona');
      setIsAuthReady(true);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem('omapi_user_role');
    localStorage.removeItem('omapi_user_name');
    localStorage.removeItem('omapi_user_id');
    localStorage.removeItem('omapi_user_email');
    navigate('/');
  };

  // Modals State
  const [modalState, setModalState] = useState<{
    type: 'slide' | 'news' | 'form' | 'guide' | 'formation' | 'user' | 'gopi' | 'event' | 'legislation' | 'job' | null;
    data: any;
  }>({ type: null, data: {} });

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const closeModal = () => setModalState({ type: null, data: {} });
  const openModal = (type: typeof modalState.type, data: any = {}) => setModalState({ type, data });

  // --- Profile Management Logic ---
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('omapi_user_id') || '1');
  
  useEffect(() => {
    setCurrentUserId(localStorage.getItem('omapi_user_id') || '1');
  }, []);

  const currentUser = adminData.users.find(u => String(u.id) === String(currentUserId)) || {
      id: currentUserId || 1,
      name: userName,
      email: localStorage.getItem('omapi_user_email') || 'daniel.razanajaona@gmail.com',
      role: userRole as any,
      status: 'Actif' as any
  };

  const handleSaveProfile = async (updatedData: any) => {
      if (updatedData.password) {
        adminData.addNotification('Mot de passe mis à jour.', 'success');
      }

      // 1. Mettre à jour la liste des utilisateurs (persistance globale)
      // On s'assure de garder l'ID et le rôle original pour ne pas casser la session
      const { password, ...dataToSave } = updatedData;
      const newUserData = { ...currentUser, ...dataToSave };
      adminData.saveUser(newUserData);
      
      // 2. Mettre à jour la session locale (affichage immédiat)
      if (updatedData.name) {
          setUserName(updatedData.name);
          localStorage.setItem('omapi_user_name', updatedData.name);
      }
      if (updatedData.email) {
          localStorage.setItem('omapi_user_email', updatedData.email);
      }
      
      setIsProfileModalOpen(false);
      adminData.addNotification('Votre profil a été mis à jour avec succès.', 'success');
  };

  if (!isAuthReady) {
    return <div className="h-screen flex items-center justify-center bg-gray-100">Chargement...</div>;
  }

  return (
    <div className="h-screen bg-[#f8fafc] flex overflow-hidden font-sans">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} userRole={userRole} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <AdminHeader 
            activeTab={activeTab} 
            userName={userName} 
            userRole={userRole} 
            onProfileClick={() => setIsProfileModalOpen(true)}
            systemNotifications={adminData.systemNotifications}
            onMarkAsRead={adminData.markNotificationAsRead}
            onMarkAllAsRead={adminData.markAllNotificationsAsRead}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Notifications Container */}
        <ToastNotifications 
            notifications={adminData.notifications} 
            removeNotification={adminData.removeNotification} 
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <DashboardContent 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            userRole={userRole} 
            data={adminData} 
            openModal={openModal} 
          />
        </div>

        <DashboardModals 
          modalState={modalState} 
          closeModal={closeModal} 
          data={adminData} 
        />

        <ProfileFormModal 
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentUser={currentUser}
            onSave={handleSaveProfile}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
