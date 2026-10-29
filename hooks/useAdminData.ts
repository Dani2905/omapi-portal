
import { useState, useEffect } from 'react';
import { useCrud, useObjectStorage } from './useCrud';
import { SLIDES, DEFAULT_ANNOUNCEMENTS, DEFAULT_FORMS, DEFAULT_GUIDES, DEFAULT_FORMATIONS, DEFAULT_FORMATION_REGISTRATIONS, DEFAULT_USERS, DEFAULT_GOPI, DEFAULT_GOPI_ORDERS, DEFAULT_EVENTS, DEFAULT_EVENT_REGISTRATIONS, DEFAULT_LEGISLATION, DEFAULT_JOBS } from '../constants';
import { LATEST_NEWS } from '../data/mocks/news';
import { Slide, NewsItem, Announcement, Formulaire, Guide, Formation, FormationRegistration, User, JobOffer, JobApplication, GopiItem, GopiOrder, Event, EventRegistration, LegislationItem, Notification, SystemNotification, SiteConfig, HomeScamConfig, HomeResourcesConfig, ActivityLog } from '../types';

export const useAdminData = () => {
  // --- Notification System (Toasts) ---
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- CRUD Hooks with Notification Callback ---
  
  // 1. Hero Slides
  const {
    items: slides,
    setItems: setSlides,
    saveItem: saveSlide,
    deleteItem: deleteSlide
  } = useCrud<Slide>('omapi_slides', SLIDES, addNotification);

  // 2. News
  const {
    items: newsItems,
    saveItem: saveNewsBase,
    deleteItemWithCallback: deleteNews
  } = useCrud<NewsItem>('omapi_news', LATEST_NEWS, addNotification);

  // 3. Announcements (now CRUD)
  const { 
    items: announcements, 
    saveItem: saveAnnouncement, 
    deleteItem: deleteAnnouncement 
  } = useCrud<Announcement>('omapi_announcements', DEFAULT_ANNOUNCEMENTS, addNotification);

  // 4. Forms & Guides
  const { items: forms, saveItem: saveForm, deleteItem: deleteForm } = useCrud<Formulaire>('omapi_forms', DEFAULT_FORMS, addNotification);
  const { items: guides, saveItem: saveGuide, deleteItem: deleteGuide } = useCrud<Guide>('omapi_guides', DEFAULT_GUIDES, addNotification);

  // 5. Formations
  const { items: formations, saveItem: saveFormation, deleteItem: deleteFormation } = useCrud<Formation>('omapi_formations', DEFAULT_FORMATIONS, addNotification);
  const { items: formationRegistrations, saveItem: saveFormationRegistration, deleteItem: deleteFormationRegistration } = useCrud<FormationRegistration>('omapi_formation_registrations', DEFAULT_FORMATION_REGISTRATIONS, addNotification);

  // 6. GOPI & Orders
  const { items: gopiItems, saveItem: saveGopi, deleteItem: deleteGopi } = useCrud<GopiItem>('omapi_gopi', DEFAULT_GOPI, addNotification);
  const { items: gopiOrders, saveItem: saveGopiOrder, deleteItem: deleteGopiOrder } = useCrud<GopiOrder>('omapi_gopi_orders', DEFAULT_GOPI_ORDERS, addNotification);

  // 7. Users
  const { items: users, saveItem: saveUser, deleteItem: deleteUser } = useCrud<User>('omapi_users', DEFAULT_USERS, addNotification);

  // 7b. Jobs
  const { items: jobs, saveItem: saveJob, deleteItem: deleteJob } = useCrud<JobOffer>('omapi_jobs', DEFAULT_JOBS, addNotification);
  const { items: jobApplications, saveItem: saveJobApplication, deleteItem: deleteJobApplication } = useCrud<JobApplication>('omapi_job_applications', [], addNotification);

  // 8. Events & Registrations
  const { items: events, saveItem: saveEvent, deleteItem: deleteEvent } = useCrud<Event>('omapi_events', DEFAULT_EVENTS, addNotification);
  const { items: eventRegistrations, saveItem: saveEventRegistration, deleteItem: deleteEventRegistration } = useCrud<EventRegistration>('omapi_event_registrations', DEFAULT_EVENT_REGISTRATIONS, addNotification);

  // 9. Legislation
  const { items: legislationItems, saveItem: saveLegislation, deleteItem: deleteLegislation } = useCrud<LegislationItem>('omapi_legislation', DEFAULT_LEGISLATION, addNotification);

  // 10. Site Configs
  const [siteConfig, saveSiteConfig] = useObjectStorage<SiteConfig>('omapi_site_config', {}, addNotification);

  // 12. Home Page Configs (New)
  const defaultScamConfig: HomeScamConfig = {
      title: "Les arnaques augmentent",
      subtitle: "Signes courants des escroqueries aux marques et brevets",
      description: "Des entités non officielles envoient des factures trompeuses aux déposants de brevets et de marques. Apprenez à repérer ces fraudes et protégez vos droits de propriété intellectuelle."
  };
  const [homeScamConfig, saveHomeScamConfig] = useObjectStorage<HomeScamConfig>('omapi_home_scam', defaultScamConfig, addNotification);

  const defaultResourcesConfig: HomeResourcesConfig = {
      omapiHourTitle: "L'Heure OMAPI",
      omapiHourDesc: "Rejoignez-nous mensuellement pour partager nos priorités et discuter des avancées de la propriété industrielle à Madagascar.",
      omapiHourThumbnail: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      videoTitle: "Comment vérifier le statut de votre demande",
      videoDesc: "Un guide vidéo rapide pour naviguer dans notre portail et suivre l'avancement de vos dépôts de marques en temps réel.",
      videoThumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      videoDuration: "02:45"
  };
  const [homeResourcesConfig, saveHomeResourcesConfig] = useObjectStorage<HomeResourcesConfig>('omapi_home_resources', defaultResourcesConfig, addNotification);


  // Custom News Save to sync with Slides
  const handleSaveNews = (newsData: Partial<NewsItem>) => {
    // 1. Save News (will trigger default notification)
    saveNewsBase(newsData);

    // 2. Sync with Slides logic
    const savedId = newsData.id || Date.now(); 

    setSlides(currentSlides => {
        // If not featured, remove related slide
        if (newsData.featured === false) {
            return currentSlides.filter(s => s.newsId !== savedId);
        }
        // If featured, add or update slide
        if (newsData.featured === true) {
            const existingIndex = currentSlides.findIndex(s => s.newsId === savedId);
            const slideData: Slide = {
                id: existingIndex !== -1 ? currentSlides[existingIndex].id : Date.now() + 10,
                image: newsData.image || '',
                title: newsData.title || '',
                subtitle: (newsData.description && newsData.description.length > 150)
                    ? newsData.description.substring(0, 147) + '...'
                    : newsData.description || '',
                ctaText: 'Lire l\'actualité',
                ctaLink: '/news',
                newsId: savedId
            };

            if (existingIndex !== -1) {
                const newSlides = [...currentSlides];
                newSlides[existingIndex] = slideData;
                return newSlides;
            }
            return [...currentSlides, slideData];
        }
        return currentSlides;
    });
  };

  const handleDeleteNews = (id: number) => {
      deleteNews(id, (deletedId) => {
          setSlides(prev => prev.filter(s => s.newsId !== deletedId));
      });
  };

  // 13. System Activity Logs
  const { items: activityLogs } = useCrud<ActivityLog>('omapi_activities', [], () => {});

  // --- System Notifications Logic (Bell Icon) ---
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('omapi_read_notifications');
          return saved ? JSON.parse(saved) : ['sys-1']; // sys-1 est lu par défaut
      } catch {
          return ['sys-1'];
      }
  });

  useEffect(() => {
      // Générer des notifications dynamiques basées sur les données réelles
      const notifs: SystemNotification[] = [];

      // 1. Commandes GOPI en attente
      gopiOrders.forEach(order => {
          if (order.status === 'En attente') {
              const notifId = `order-${order.id}`;
              notifs.push({
                  id: notifId,
                  title: 'Nouvelle commande GOPI',
                  message: `${order.customerName} a commandé ${order.gopiTitle}`,
                  time: order.date,
                  read: readNotifIds.includes(notifId),
                  type: 'order'
              });
          }
      });

      // 2. Inscriptions récentes aux formations (simulé: les 3 dernières)
      formationRegistrations.slice(-3).forEach(reg => {
          const notifId = `formation-${reg.id}`;
          notifs.push({
              id: notifId,
              title: 'Inscription Formation',
              message: `${reg.name} s'est inscrit à une formation`,
              time: reg.registrationDate,
              read: readNotifIds.includes(notifId),
              type: 'info'
          });
      });

      // 3. Activity Logs (actions des comptes)
      activityLogs.slice(-10).forEach(log => {
          const notifId = `log-${log.id}`;
          notifs.push({
              id: notifId,
              title: log.action,
              message: log.details,
              time: log.timestamp,
              read: readNotifIds.includes(notifId),
              type: 'info'
          });
      });

      // 4. Notification système fictive
      notifs.push({
          id: 'sys-1',
          title: 'Système à jour',
          message: 'La maintenance automatique a été effectuée avec succès.',
          time: 'Aujourd\'hui',
          read: readNotifIds.includes('sys-1'),
          type: 'success'
      });

      // Trie par ID (ou time) pour avoir les plus récents en premier
      notifs.sort((a, b) => b.id.localeCompare(a.id));
      
      setSystemNotifications(notifs);
  }, [gopiOrders, formationRegistrations, activityLogs, readNotifIds]);

  const markNotificationAsRead = (id: string) => {
      setReadNotifIds(prev => {
          if (prev.includes(id)) return prev;
          const newReads = [...prev, id];
          localStorage.setItem('omapi_read_notifications', JSON.stringify(newReads));
          return newReads;
      });
  };

  const markAllNotificationsAsRead = () => {
      setReadNotifIds(prev => {
          const newReads = [...prev];
          systemNotifications.forEach(n => {
              if (!newReads.includes(n.id)) {
                  newReads.push(n.id);
              }
          });
          localStorage.setItem('omapi_read_notifications', JSON.stringify(newReads));
          return newReads;
      });
  };

  return {
    // Data & Actions
    slides, saveSlide, deleteSlide,
    newsItems, handleSaveNews, handleDeleteNews,
    announcements, saveAnnouncement, deleteAnnouncement,
    forms, saveForm, deleteForm,
    guides, saveGuide, deleteGuide,
    formations, saveFormation, deleteFormation,
    formationRegistrations, saveFormationRegistration, deleteFormationRegistration,
    gopiItems, saveGopi, deleteGopi,
    gopiOrders, saveGopiOrder, deleteGopiOrder,
    users, saveUser, deleteUser,
    jobs, saveJob, deleteJob,
    jobApplications, saveJobApplication, deleteJobApplication,
    events, saveEvent, deleteEvent,
    eventRegistrations, saveEventRegistration, deleteEventRegistration,
    legislationItems, saveLegislation, deleteLegislation,
    siteConfig, saveSiteConfig,
    homeScamConfig, saveHomeScamConfig,
    homeResourcesConfig, saveHomeResourcesConfig,
    
    // Notifications System (Toasts)
    notifications,
    removeNotification,
    addNotification,

    // System Notifications (Bell)
    systemNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  };
};
