
import React from 'react';
import AdminOverview from './AdminOverview';
import AdminHeroManager from './AdminHeroManager';
import AdminNewsManager from './AdminNewsManager';
import AdminAnnouncementManager from './AdminAnnouncementManager';
import AdminFormsManager from './AdminFormsManager';
import AdminFormationsManager from './AdminFormationsManager';
import AdminUsersManager from './AdminUsersManager';
import AdminGopiManager from './AdminGopiManager';
import AdminEventsManager from './AdminEventsManager';
import AdminLegislationManager from './AdminLegislationManager';
import AdminDesignManager from './AdminDesignManager';
import AdminScamManager from './AdminScamManager';
import AdminResourcesManager from './AdminResourcesManager';
import AdminJobsManager from './AdminJobsManager';
import AdminJobApplicationsManager from './AdminJobApplicationsManager';
import { Cog6ToothIcon } from './AdminIcons';

interface DashboardContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  data: any; 
  openModal: (type: any, data?: any) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ activeTab, setActiveTab, userRole, data, openModal }) => {
  switch (activeTab) {
    case 'overview':
      return <AdminOverview data={data} openModal={openModal} setActiveTab={setActiveTab} />;
    case 'hero':
      return (
        <AdminHeroManager
          slides={data.slides}
          onAdd={() => openModal('slide', {
            title: '', subtitle: '', ctaText: 'En savoir plus', ctaLink: '/',
            image: 'https://picsum.photos/1920/800?random=' + Math.floor(Math.random() * 100)
          })}
          onEdit={(item) => openModal('slide', item)}
          onDelete={data.deleteSlide}
        />
      );
    case 'announcement':
      return (
        <AdminAnnouncementManager
          announcements={data.announcements}
          onSave={data.saveAnnouncement}
          onDelete={data.deleteAnnouncement}
        />
      );
    case 'news':
      return (
        <AdminNewsManager
          newsItems={data.newsItems}
          onAdd={() => openModal('news', {
            title: '', description: '', category: 'Annonce', featured: false,
            date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
            image: 'https://picsum.photos/800/600?random=' + Math.floor(Math.random() * 100)
          })}
          onEdit={(item) => openModal('news', item)}
          onDelete={data.handleDeleteNews}
        />
      );
    case 'design':
      return (
        <AdminDesignManager
          config={data.siteConfig}
          onSave={data.saveSiteConfig}
        />
      );
    case 'home-scam':
      return (
        <AdminScamManager
          config={data.homeScamConfig}
          onSave={data.saveHomeScamConfig}
        />
      );
    case 'home-resources':
      return (
        <AdminResourcesManager
          config={data.homeResourcesConfig}
          onSave={data.saveHomeResourcesConfig}
        />
      );
    case 'jobs':
      return (
        <AdminJobsManager
          jobs={data.jobs}
          onAdd={() => openModal('job', { title: '', department: '', location: '', type: 'CDI', experience: '', description: '', status: 'Ouvert', publishDate: new Date().toISOString().split('T')[0] })}
          onEdit={(item) => openModal('job', item)}
          onDelete={data.deleteJob}
        />
      );
    case 'job_applications':
      return (
        <AdminJobApplicationsManager
          applications={data.jobApplications}
          onUpdateStatus={(app, status) => data.saveJobApplication({...app, status})}
          onDelete={data.deleteJobApplication}
        />
      );
    case 'events':
      return (
        <AdminEventsManager
          events={data.events}
          registrations={data.eventRegistrations}
          onAdd={() => openModal('event', {
            title: '', date: '', time: '', location: '', description: '', status: 'À venir', places: 'Sur inscription',
            image: 'https://picsum.photos/800/600?random=' + Math.floor(Math.random() * 100)
          })}
          onEdit={(item) => openModal('event', item)}
          onDelete={data.deleteEvent}
          onDeleteRegistration={data.deleteEventRegistration}
        />
      );
    case 'gopi':
      return (
        <AdminGopiManager
          gopiItems={data.gopiItems}
          gopiOrders={data.gopiOrders}
          onAdd={() => openModal('gopi', { title: '', date: '', description: '', fileUrl: '#' })}
          onEdit={(item) => openModal('gopi', item)}
          onDelete={data.deleteGopi}
          onUpdateOrder={data.saveGopiOrder}
          onDeleteOrder={data.deleteGopiOrder}
        />
      );
    case 'legislation':
      return (
        <AdminLegislationManager
          items={data.legislationItems}
          onAdd={() => openModal('legislation', { title: '', type: 'Loi', category: 'Fondamental', date: '', description: '', fileUrl: '#' })}
          onEdit={(item) => openModal('legislation', item)}
          onDelete={data.deleteLegislation}
        />
      );
    case 'forms':
      return (
        <AdminFormsManager
          forms={data.forms}
          guides={data.guides}
          onAddForm={() => openModal('form', { title: '', description: '', category: 'Autres', fileUrl: '#', fileName: '' })}
          onEditForm={(item) => openModal('form', item)}
          onDeleteForm={data.deleteForm}
          onAddGuide={() => openModal('guide', { title: '', description: '', iconName: 'book', points: [], colorTheme: 'blue', fileUrl: '#' })}
          onEditGuide={(item) => openModal('guide', item)}
          onDeleteGuide={data.deleteGuide}
        />
      );
    case 'formations':
      return (
        <AdminFormationsManager
          formations={data.formations}
          registrations={data.formationRegistrations}
          onAdd={() => openModal('formation', { title: '', category: 'Base' })}
          onEdit={(item) => openModal('formation', item)}
          onDelete={data.deleteFormation}
          onDeleteRegistration={data.deleteFormationRegistration}
        />
      );
    case 'users':
      return userRole === 'Admin' ? (
        <AdminUsersManager
          users={data.users}
          onAdd={() => openModal('user', { name: '', email: '', role: 'Éditeur', status: 'Actif' })}
          onEdit={(item) => openModal('user', item)}
          onDelete={data.deleteUser}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <Cog6ToothIcon className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Accès Refusé</h3>
          <p className="text-xs text-red-500 mt-2 font-mono font-medium">ERROR_CODE: 403_UNAUTHORIZED_ACCESS</p>
          <div className="mt-6 h-px w-24 bg-gray-200 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-6 max-w-xs leading-relaxed">
            Vous n'avez pas les privilèges administratifs requis pour accéder à ce module système.
          </p>
        </div>
      );
    default:
      return null;
  }
};

export default DashboardContent;
