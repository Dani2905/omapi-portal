
import React from 'react';
import SlideFormModal from './SlideFormModal';
import NewsFormModal from './NewsFormModal';
import FormFormModal from './FormFormModal';
import FormationFormModal from './FormationFormModal';
import UserFormModal from './UserFormModal';
import GopiFormModal from './GopiFormModal';
import EventFormModal from './EventFormModal';
import LegislationFormModal from './LegislationFormModal';
import JobFormModal from './JobFormModal';
import { validateAccountModification } from '../../utils/userAccounts';
import { describeCrudAction } from '../../utils/notificationMessages';

interface DashboardModalsProps {
  modalState: { type: string | null; data: any };
  closeModal: () => void;
  data: any;
  currentUserId?: number | string;
}

const DashboardModals: React.FC<DashboardModalsProps> = ({ modalState, closeModal, data, currentUserId }) => {
  
  const handleSaveAndClose = (saveFn: (item: any) => unknown) => async (formData: any) => {
    try {
      const saved = await saveFn(formData);
      // Les sauvegardes localStorage renvoient false quand elles échouent ;
      // garder alors la fenêtre ouverte pour ne pas perdre la saisie.
      if (saved === false) return false;
      closeModal();
      return true;
    } catch (error) {
      data.addNotification(
        error instanceof Error
          ? `Enregistrement interrompu : ${error.message}`
          : 'Enregistrement interrompu : une erreur inattendue est survenue. Vos changements restent dans le formulaire.',
        'error',
      );
      return false;
    }
  };

  const handleSaveUserWrapper = async (userData: any) => {
    const isExistingAccount = modalState.data?.id !== undefined && modalState.data?.id !== null;
    if (isExistingAccount) {
      const stillExists = Array.isArray(data.users)
        && data.users.some((user: any) => String(user.id) === String(modalState.data.id));

      if (!stillExists) {
        throw new Error("Ce compte n'existe plus. Il a peut-être été supprimé dans une autre fenêtre.");
      }
    }

    const originalUser = isExistingAccount
      ? data.users.find((user: any) => String(user.id) === String(modalState.data.id))
      : undefined;

    if (isExistingAccount) {
      const error = validateAccountModification(
        data.users,
        originalUser,
        userData,
        currentUserId,
      );
      if (error) throw new Error(error);
    }

    const dbData: any = {
      id: originalUser?.id ?? Date.now(),
      name: userData.name,
      email: userData.email,
      role: userData.role ?? originalUser?.role ?? 'Éditeur',
      status: userData.status ?? originalUser?.status ?? 'Actif'
    };

    // Le formulaire ne transmet jamais de mot de passe en clair :
    // uniquement son empreinte salée, lorsqu'un nouveau mot de passe
    // a été défini. En édition sans changement, les champs absents
    // laissent l'empreinte existante intacte (fusion dans useCrud).
    if (userData.passwordSalt && userData.passwordHash) {
      dbData.passwordSalt = userData.passwordSalt;
      dbData.passwordHash = userData.passwordHash;
      dbData.passwordUpdatedAt = userData.passwordUpdatedAt;
    }

    const saved = await data.saveUser(dbData, 'id', { notify: false });
    if (saved === false) {
      throw new Error("Le compte n'a pas été enregistré. Vérifiez l'espace disponible dans le navigateur puis réessayez.");
    }
    const userDescription = describeCrudAction(
      'omapi_users',
      isExistingAccount ? 'updated' : 'created',
      dbData,
    );
    data.addNotification(userDescription.message, 'success');
    closeModal();
    return true;
  };

  const handleSaveNewsWrapper = async (newsData: any) => {
      const saved = await data.handleSaveNews(newsData);
      if (saved) closeModal();
      return saved;
  }

  return (
    <>
      <SlideFormModal 
        isOpen={modalState.type === 'slide'} 
        onClose={closeModal} 
        onSave={handleSaveAndClose(data.saveSlide)} 
        initialData={modalState.data} 
      />

      <NewsFormModal 
        isOpen={modalState.type === 'news'} 
        onClose={closeModal} 
        onSave={handleSaveNewsWrapper} 
        initialData={modalState.data} 
      />

      <EventFormModal
        isOpen={modalState.type === 'event'}
        onClose={closeModal}
        onSave={handleSaveAndClose(data.saveEvent)}
        initialData={modalState.data}
      />

      <FormFormModal
        isOpen={modalState.type === 'form' || modalState.type === 'guide'}
        onClose={closeModal}
        onSave={async (formData) => {
            try {
              const saved = modalState.type === 'form'
                ? await data.saveForm(formData)
                : await data.saveGuide(formData);
              if (saved === false) return false;
              closeModal();
              return true;
            } catch (error) {
              data.addNotification(
                error instanceof Error
                  ? `Enregistrement interrompu : ${error.message}`
                  : 'Enregistrement interrompu : une erreur inattendue est survenue.',
                'error',
              );
              return false;
            }
        }}
        initialData={modalState.data}
        mode={modalState.type === 'form' ? 'form' : 'guide'}
      />

      <FormationFormModal
        isOpen={modalState.type === 'formation'}
        onClose={closeModal}
        onSave={handleSaveAndClose(data.saveFormation)}
        initialData={modalState.data}
      />

      <GopiFormModal
        isOpen={modalState.type === 'gopi'}
        onClose={closeModal}
        onSave={handleSaveAndClose(data.saveGopi)}
        initialData={modalState.data}
      />

      {modalState.type === 'job' && (
        <JobFormModal
          isOpen={true}
          onClose={closeModal}
          onSave={handleSaveAndClose(data.saveJob)}
          job={modalState.data}
        />
      )}

      <LegislationFormModal
        isOpen={modalState.type === 'legislation'}
        onClose={closeModal}
        onSave={handleSaveAndClose(data.saveLegislation)}
        initialData={modalState.data}
      />

      <UserFormModal
        isOpen={modalState.type === 'user'}
        onClose={closeModal}
        onSave={handleSaveUserWrapper}
        initialData={modalState.data}
        existingUsers={data.users}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default DashboardModals;
