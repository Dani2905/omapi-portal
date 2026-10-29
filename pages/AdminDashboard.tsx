
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import DashboardContent from '../components/admin/DashboardContent';
import DashboardModals from '../components/admin/DashboardModals';
import ToastNotifications from '../components/admin/ToastNotifications';
import ProfileFormModal from '../components/admin/ProfileFormModal';
import { useAdminData } from '../hooks/useAdminData';
import { describeCrudAction } from '../utils/notificationMessages';
import {
  createPasswordCredential,
  hasPasswordCredential,
  normalizeEmail,
  normalizeName,
  validateUserDraft,
  validateAccountDeletion,
  verifyPasswordCredential,
} from '../utils/userAccounts';

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

  // Une suppression ou désactivation faite dans un autre onglet doit
  // invalider cette session, et les changements de nom/e-mail doivent
  // aussi actualiser immédiatement les valeurs de session.
  useEffect(() => {
    if (!isAuthReady) return;

    const storedUser = adminData.users.find(
      (user) => String(user.id) === String(currentUserId),
    );

    if (!storedUser || storedUser.status !== 'Actif') {
      localStorage.removeItem('omapi_user_role');
      localStorage.removeItem('omapi_user_name');
      localStorage.removeItem('omapi_user_id');
      localStorage.removeItem('omapi_user_email');
      navigate('/login', { replace: true });
      return;
    }

    setUserRole(storedUser.role);
    setUserName(storedUser.name);
    localStorage.setItem('omapi_user_role', storedUser.role);
    localStorage.setItem('omapi_user_name', storedUser.name);
    localStorage.setItem('omapi_user_email', storedUser.email);
  }, [adminData.users, currentUserId, isAuthReady, navigate]);

  const handleDeleteUser = async (userId: number | string): Promise<boolean> => {
    let latestUsers = adminData.users;
    try {
      const stored = localStorage.getItem('omapi_users');
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) throw new Error('Les données des comptes sont illisibles.');
        latestUsers = parsed;
      }
    } catch {
      throw new Error('Suppression annulée : impossible de vérifier les comptes enregistrés. Rechargez le tableau de bord puis réessayez.');
    }

    const targetUser = latestUsers.find(
      (user: any) => String(user.id) === String(userId),
    );
    const validationError = validateAccountDeletion(
      latestUsers,
      targetUser,
      currentUserId ?? undefined,
    );

    if (validationError) throw new Error(validationError);

    const deleted = await adminData.deleteUser(userId, { notify: false });
    if (deleted === false) {
      throw new Error('La suppression a échoué. Le compte est toujours présent ; actualisez la page puis réessayez.');
    }

    adminData.addNotification(
      describeCrudAction('omapi_users', 'deleted', targetUser).message,
      'success',
    );
    return true;
  };

  const handleSaveProfile = async (updatedData: any): Promise<string | void> => {
      // 1. Préparer les données en préservant l'identité du compte.
      // L'ID, le rôle et le statut ne peuvent pas être modifiés depuis
      // le profil, même si le payload contenait d'autres valeurs.
      const { password, currentPassword, ...dataToSave } = updatedData;
      const newUserData: any = {
        ...currentUser,
        ...dataToSave,
        id: currentUser.id,
        name: normalizeName(dataToSave.name ?? currentUser.name),
        email: normalizeEmail(dataToSave.email ?? currentUser.email),
        role: currentUser.role,
        status: currentUser.status,
      };

      const profileErrors = validateUserDraft(
        newUserData,
        adminData.users,
        currentUser.id,
      );
      const firstProfileError = profileErrors.name || profileErrors.email;
      if (firstProfileError) return firstProfileError;

      // 2. Changement de mot de passe : vérifier l'actuel avant tout.
      // Le mot de passe n'est jamais enregistré en clair ; seule son
      // empreinte salée est persistée.
      if (password) {
        if (hasPasswordCredential(currentUser)) {
          if (!currentPassword) {
            return 'Saisissez votre mot de passe actuel pour le modifier.';
          }

          if (currentPassword === password) {
            return "Le nouveau mot de passe doit être différent de l'actuel.";
          }

          try {
            const currentIsValid = await verifyPasswordCredential(
              currentPassword,
              currentUser,
            );

            if (!currentIsValid) {
              return 'Le mot de passe actuel est incorrect.';
            }
          } catch {
            return 'La vérification du mot de passe actuel est impossible dans ce navigateur.';
          }
        }

        try {
          Object.assign(newUserData, await createPasswordCredential(password));
        } catch {
          return 'Impossible de sécuriser le nouveau mot de passe dans ce navigateur.';
        }
      }

      const profileSaved = await adminData.saveUser(newUserData, 'id', { notify: false });
      if (!profileSaved) {
        return "Le profil n'a pas été enregistré. Vos changements sont conservés dans cette fenêtre ; vérifiez l'espace disponible dans le navigateur puis réessayez.";
      }

      // 3. Mettre à jour la session locale (affichage immédiat)
      setUserName(newUserData.name);
      localStorage.setItem('omapi_user_name', newUserData.name);
      localStorage.setItem('omapi_user_email', newUserData.email);

      setIsProfileModalOpen(false);
      adminData.addNotification(`Votre profil (« ${newUserData.name} ») a été mis à jour. Le nouveau nom et la nouvelle adresse e-mail sont actifs immédiatement.`, 'success');
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
            currentUserId={currentUserId ?? undefined}
            onDeleteUser={handleDeleteUser}
          />
        </div>

        <DashboardModals 
          modalState={modalState} 
          closeModal={closeModal} 
          data={adminData}
          currentUserId={currentUserId ?? undefined}
        />

        <ProfileFormModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentUser={currentUser}
            existingUsers={adminData.users}
            onSave={handleSaveProfile}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
