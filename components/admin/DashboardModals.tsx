
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

interface DashboardModalsProps {
  modalState: { type: string | null; data: any };
  closeModal: () => void;
  data: any;
}

const DashboardModals: React.FC<DashboardModalsProps> = ({ modalState, closeModal, data }) => {
  
  const handleSaveAndClose = (saveFn: (item: any) => void) => (formData: any) => {
    saveFn(formData);
    closeModal();
  };

  const handleSaveUserWrapper = async (userData: any) => {
    const dbData: any = {
      id: userData.id || Date.now(),
      name: userData.name,
      email: userData.email,
      role: userData.role || 'Éditeur',
      status: userData.status || 'Actif'
    };

    await data.saveUser(dbData);
    closeModal();
  };

  const handleSaveNewsWrapper = (newsData: any) => {
      data.handleSaveNews(newsData);
      closeModal();
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
        onSave={(formData) => {
            if (modalState.type === 'form') data.saveForm(formData);
            else data.saveGuide(formData);
            closeModal();
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
      />
    </>
  );
};

export default DashboardModals;
