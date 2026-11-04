
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import DashboardContent from '../components/admin/DashboardContent';
import DashboardModals from '../components/admin/DashboardModals';
import ToastNotifications from '../components/admin/ToastNotifications';
import ProfileFormModal from '../components/admin/ProfileFormModal';
import { useAdminData } from '../hooks/useAdminData';
import { useApiUsers } from '../hooks/useApiUsers';
import { apiRequest, clearApiSession, getApiToken, saveApiSession, type ApiAuthUser } from '../utils/apiAuth';
import { describeCrudAction } from '../utils/notificationMessages';
import {
  normalizeEmail,
  normalizeName,
  validateUserDraft,
  validateAccountDeletion,
} from '../utils/userAccounts';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // User Session
  const [userRole, setUserRole] = useState<string>('Éditeur');
  const [userName, setUserName] = useState<string>('');
  const [authenticatedUser, setAuthenticatedUser] = useState<ApiAuthUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Logic Hook
  const adminData = useAdminData();
  const apiUsers = useApiUsers(isAuthReady && userRole === 'Admin');
  const dashboardData = {
    ...adminData,
    users: apiUsers.users,
    usersLoading: apiUsers.loading,
    usersError: apiUsers.error,
    refreshUsers: apiUsers.refresh,
    saveUser: apiUsers.saveUser,
  };
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem('omapi_user_id'));

  useEffect(() => {
    const token = getApiToken();
    if (!token) {
      clearApiSession();
      navigate('/login', { replace: true });
      return;
    }

    let active = true;
    apiRequest('/api/auth/me', {}, token)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!active) return;
        if (!response.ok || !payload.user || !['Admin', 'Éditeur'].includes(payload.user.role)) {
          clearApiSession();
          navigate('/login', { replace: true });
          return;
        }
        const user = payload.user as ApiAuthUser;
        saveApiSession(token, user);
        setAuthenticatedUser(user);
        setCurrentUserId(String(user.id));
        setUserRole(user.role);
        setUserName(user.name);
        setIsAuthReady(true);
      })
      .catch(() => {
        if (active) setAuthError('Impossible de vérifier la session auprès de l’API. Vérifiez la connexion puis réessayez.');
      });

    return () => { active = false; };
  }, [navigate]);

  const handleLogout = async () => {
    const token = getApiToken();
    try {
      if (token) await apiRequest('/api/auth/logout', { method: 'POST' }, token);
    } catch {
      // Le jeton local est supprimé même si l'API est momentanément indisponible.
    } finally {
      clearApiSession();
      navigate('/', { replace: true });
    }
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
  const localCurrentUser = apiUsers.users.find(u => String(u.id) === String(currentUserId));
  const currentUser = authenticatedUser ? {
      ...localCurrentUser,
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role as any,
      status: authenticatedUser.status || 'Actif',
      avatar: authenticatedUser.avatar || null,
  } : localCurrentUser || {
      id: currentUserId || 1,
      name: userName,
      email: localStorage.getItem('omapi_user_email') || '',
      role: userRole as any,
      status: 'Actif' as any,
  };

  const handleDeleteUser = async (userId: number | string): Promise<boolean> => {
    const targetUser = apiUsers.users.find((user) => String(user.id) === String(userId));
    const validationError = validateAccountDeletion(
      apiUsers.users,
      targetUser,
      currentUserId ?? undefined,
    );
    if (validationError) throw new Error(validationError);

    try {
      await apiUsers.deleteUser(userId);
      adminData.addNotification(
        describeCrudAction('omapi_users', 'deleted', targetUser).message,
        'success',
      );
      return true;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('La suppression a échoué. Actualisez la liste puis réessayez.');
    }
  };

  const handleSaveProfile = async (updatedData: any): Promise<string | void> => {
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

    const profileErrors = validateUserDraft(newUserData, apiUsers.users, currentUser.id);
    const firstProfileError = profileErrors.name || profileErrors.email;
    if (firstProfileError) return firstProfileError;
    if (password && password.length < 12) return 'Le nouveau mot de passe doit contenir au moins 12 caractères.';
    if (password && currentPassword === password) return "Le nouveau mot de passe doit être différent de l'actuel.";

    const token = getApiToken();
    if (!token) return 'Votre session a expiré. Reconnectez-vous puis réessayez.';

    try {
      const response = await apiRequest('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserData.name,
          email: newUserData.email,
          avatar: newUserData.avatar ?? null,
          ...(password ? { currentPassword, password } : {}),
        }),
      }, token);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) return 'Votre session a expiré. Reconnectez-vous puis réessayez.';
        if (response.status === 409) return 'Cette adresse e-mail est déjà utilisée par un autre compte.';
        if (response.status === 400 && /current password/i.test(payload.error || '')) return 'Le mot de passe actuel est incorrect.';
        if (response.status === 400 && /12 characters/i.test(payload.error || '')) return 'Le nouveau mot de passe doit contenir au moins 12 caractères.';
        if (response.status === 400 && /profile photo/i.test(payload.error || '')) return 'La photo est invalide ou dépasse 320 Ko. Choisissez une autre image.';
        return payload.error || "La mise à jour du profil via l'API a échoué.";
      }
      if (!payload.user) return "Réponse invalide de l'API lors de la mise à jour du profil.";

      const updatedUser = payload.user as ApiAuthUser;
      setAuthenticatedUser(updatedUser);
      setUserName(updatedUser.name);
      setUserRole(updatedUser.role);
      setCurrentUserId(String(updatedUser.id));
      saveApiSession(token, updatedUser);

      if (updatedUser.role === 'Admin') await apiUsers.refresh();

      setIsProfileModalOpen(false);
      adminData.addNotification(`Votre profil (« ${updatedUser.name} ») a été mis à jour dans l'API.`, 'success');
    } catch {
      return "Impossible de joindre l'API OMAPI. Vérifiez la connexion puis réessayez.";
    }
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="max-w-md rounded-xl bg-white p-6 text-center shadow">
          <p className="text-gray-700">{authError || 'Vérification de la session…'}</p>
          {authError && <button className="mt-4 rounded bg-blue-700 px-4 py-2 text-white" onClick={() => navigate('/login', { replace: true })}>Retour à la connexion</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f8fafc] flex overflow-hidden font-sans">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} userRole={userRole} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <AdminHeader 
            activeTab={activeTab} 
            userName={userName} 
            userRole={userRole}
            userAvatar={authenticatedUser?.avatar}
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
            data={dashboardData}
            openModal={openModal}
            currentUserId={currentUserId ?? undefined}
            onDeleteUser={handleDeleteUser}
          />
        </div>

        <DashboardModals 
          modalState={modalState} 
          closeModal={closeModal} 
          data={dashboardData}
          currentUserId={currentUserId ?? undefined}
        />

        <ProfileFormModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentUser={currentUser}
            existingUsers={apiUsers.users}
            requiresCurrentPassword={true}
            onSave={handleSaveProfile}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
