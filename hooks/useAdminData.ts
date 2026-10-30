
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCrud, useObjectStorage } from './useCrud';
import { SLIDES, DEFAULT_ANNOUNCEMENTS, DEFAULT_FORMS, DEFAULT_GUIDES, DEFAULT_FORMATIONS, DEFAULT_FORMATION_REGISTRATIONS, DEFAULT_USERS, DEFAULT_GOPI, DEFAULT_GOPI_ORDERS, DEFAULT_EVENTS, DEFAULT_EVENT_REGISTRATIONS, DEFAULT_LEGISLATION, DEFAULT_JOBS } from '../constants';
import { LATEST_NEWS } from '../data/mocks/news';
import { describeCrudAction } from '../utils/notificationMessages';
import { canTransitionGopiOrder, GOPI_PAYMENT_METHODS } from '../utils/gopiLogic';
import { normalizeAnnouncementDraft, validateAnnouncementText } from '../utils/announcementLogic';
import { normalizeNewsDraft, validateNewsDraft } from '../utils/editorialLogic';
import { JOB_STATUSES, normalizeJobOfferDraft, validateJobOfferDraft } from '../utils/jobLogic';
import { normalizeEventDraft, normalizeEventRegistrationDraft, validateEventDraft, validateEventRegistrationDraft } from '../utils/eventLogic';
import { DEFAULT_HOME_RESOURCES_CONFIG } from '../data/homeResources';
import { Slide, NewsItem, Announcement, Formulaire, Guide, Formation, FormationRegistration, User, JobOffer, JobApplication, GopiItem, GopiOrder, Event, EventRegistration, LegislationItem, Notification, SystemNotification, SiteConfig, HomeResourcesConfig, ActivityLog } from '../types';

const READ_NOTIFICATIONS_KEY = 'omapi_read_notifications';

const readNotificationIds = (): string[] => {
  try {
    const saved = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

const getNotificationSortValue = (id: number | string, date?: string): number => {
  const parsedDate = date ? new Date(date).getTime() : Number.NaN;
  if (Number.isFinite(parsedDate)) return parsedDate;
  const numericId = Number(id);
  return Number.isFinite(numericId) ? numericId : 0;
};

export const useAdminData = () => {
  // --- Notifications temporaires (toasts) ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationTimers = useRef(new Map<number, number>());

  const removeNotification = useCallback((id: number) => {
    const timer = notificationTimers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      notificationTimers.current.delete(id);
    }
    setNotifications((previous) => previous.filter((notification) => notification.id !== id));
  }, []);

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    const id = Date.now() + Math.random();
    const duration = type === 'error' ? 8000 : type === 'info' ? 6000 : 5000;
    setNotifications((previous) => [...previous, { id, message: cleanMessage, type }].slice(-4));

    const timer = window.setTimeout(() => {
      notificationTimers.current.delete(id);
      setNotifications((previous) => previous.filter((notification) => notification.id !== id));
    }, duration);
    notificationTimers.current.set(id, timer);
  }, []);

  useEffect(() => () => {
    notificationTimers.current.forEach((timer) => window.clearTimeout(timer));
    notificationTimers.current.clear();
  }, []);

  // --- CRUD Hooks with Notification Callback ---
  
  // 1. Hero Slides
  const {
    items: slides,
    setItems: setSlides,
    saveItem: saveSlide,
    deleteItem: deleteSlide
  } = useCrud<Slide>('omapi_slides', SLIDES, addNotification);

  // Nettoyer les anciennes copies de slides liées aux actualités : elles sont
  // désormais générées directement depuis les articles à la une.
  useEffect(() => {
    if (!slides.some((slide) => slide.newsId !== undefined)) return;
    setSlides((currentSlides) => currentSlides.filter((slide) => slide.newsId === undefined));
  }, [slides, setSlides]);

  // 2. News
  const {
    items: newsItems,
    saveItem: saveNewsBase,
    deleteItemWithCallback: deleteNews
  } = useCrud<NewsItem>('omapi_news', LATEST_NEWS, addNotification);

  // 3. Announcements (now CRUD)
  const {
    items: announcements,
    saveItem: saveAnnouncementBase,
    deleteItem: deleteAnnouncement,
  } = useCrud<Announcement>('omapi_announcements', DEFAULT_ANNOUNCEMENTS, addNotification);

  const saveAnnouncement = async (draft: Partial<Announcement>): Promise<boolean> => {
    const normalized = normalizeAnnouncementDraft(draft);
    const textError = validateAnnouncementText(normalized.text);
    if (textError) {
      addNotification(textError, 'error');
      return false;
    }
    if (typeof normalized.isActive !== 'boolean') {
      addNotification('Choisissez si le message doit être actif ou inactif.', 'error');
      return false;
    }
    return saveAnnouncementBase(normalized);
  };

  // 4. Forms & Guides
  const { items: forms, saveItem: saveForm, deleteItem: deleteForm } = useCrud<Formulaire>('omapi_forms', DEFAULT_FORMS, addNotification);
  const { items: guides, saveItem: saveGuide, deleteItem: deleteGuide } = useCrud<Guide>('omapi_guides', DEFAULT_GUIDES, addNotification);

  // 5. Formations
  const { items: formations, saveItem: saveFormation, deleteItem: deleteFormationBase } = useCrud<Formation>('omapi_formations', DEFAULT_FORMATIONS, addNotification);
  const { items: formationRegistrations, saveItem: saveFormationRegistration, deleteItem: deleteFormationRegistration } = useCrud<FormationRegistration>('omapi_formation_registrations', DEFAULT_FORMATION_REGISTRATIONS, addNotification);

  const deleteFormation = async (id: number): Promise<boolean | string> => {
    let latestFormations = formations;
    let latestRegistrations = formationRegistrations;
    try {
      const savedFormations = localStorage.getItem('omapi_formations');
      const savedRegistrations = localStorage.getItem('omapi_formation_registrations');
      if (savedFormations !== null) {
        const parsed = JSON.parse(savedFormations);
        if (!Array.isArray(parsed)) throw new Error('Catalogue illisible');
        latestFormations = parsed;
      }
      if (savedRegistrations !== null) {
        const parsed = JSON.parse(savedRegistrations);
        if (!Array.isArray(parsed)) throw new Error('Inscriptions illisibles');
        latestRegistrations = parsed;
      }
    } catch {
      return 'Suppression annulée : impossible de vérifier les inscriptions liées. Rechargez le module puis réessayez.';
    }

    const formation = latestFormations.find((item) => String(item.id) === String(id));
    if (!formation) {
      return 'Cette formation n’existe plus dans le catalogue. Actualisez la page puis réessayez.';
    }

    const registrationCount = latestRegistrations.filter(
      (registration) => String(registration.formationId) === String(formation.id),
    ).length;
    if (registrationCount > 0) {
      return `Suppression refusée : « ${formation.title} » compte ${registrationCount} inscription${registrationCount > 1 ? 's' : ''}. Ouvrez « Voir les inscrits » et supprimez ou gérez ces demandes avant de retirer la formation.`;
    }

    return deleteFormationBase(id);
  };

  // 6. GOPI & Orders
  const { items: gopiItems, saveItem: saveGopi, deleteItem: deleteGopiBase } = useCrud<GopiItem>('omapi_gopi', DEFAULT_GOPI, addNotification);
  const { items: gopiOrders, saveItem: saveGopiOrder, deleteItem: deleteGopiOrder } = useCrud<GopiOrder>('omapi_gopi_orders', DEFAULT_GOPI_ORDERS, addNotification);

  const readGopiList = <T,>(key: string, fallback: T[]): T[] => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Liste illisible');
      return parsed as T[];
    } catch {
      throw new Error('Les données GOPI sont illisibles. Rechargez le module et réessayez.');
    }
  };

  const deleteGopi = async (id: number): Promise<boolean | string> => {
    let latestItems: GopiItem[];
    let latestOrders: GopiOrder[];
    try {
      latestItems = readGopiList('omapi_gopi', gopiItems);
      latestOrders = readGopiList('omapi_gopi_orders', gopiOrders);
    } catch (error) {
      return error instanceof Error ? error.message : 'Suppression annulée : impossible de vérifier les commandes GOPI.';
    }
    const publication = latestItems.find((item) => String(item.id) === String(id));
    if (!publication) return 'Cette publication n’existe plus. Actualisez la page puis réessayez.';
    const openOrders = latestOrders.filter((order) => String(order.gopiId) === String(id)
      && (order.status === 'En attente' || order.status === 'Paiement confirmé'));
    if (openOrders.length) {
      return `Suppression refusée : « ${publication.title} » est liée à ${openOrders.length} demande${openOrders.length > 1 ? 's' : ''} encore à traiter. Annulez ou finalisez ces commandes avant de retirer la publication.`;
    }
    return deleteGopiBase(id);
  };

  const updateGopiOrder = async (patch: Partial<GopiOrder>): Promise<boolean> => {
    if (patch.id === undefined || !patch.status) {
      addNotification('Mise à jour refusée : la commande ou son nouveau statut est manquant.', 'error');
      return false;
    }
    let latestOrders: GopiOrder[];
    try {
      latestOrders = readGopiList('omapi_gopi_orders', gopiOrders);
    } catch (error) {
      addNotification(error instanceof Error ? error.message : 'Impossible de lire les commandes GOPI.', 'error');
      return false;
    }
    const current = latestOrders.find((order) => String(order.id) === String(patch.id));
    if (!current) {
      addNotification('Cette commande n’existe plus. Actualisez la page puis réessayez.', 'error');
      return false;
    }
    if (!canTransitionGopiOrder(current.status, patch.status)) {
      addNotification(`Transition refusée : une commande « ${current.status} » ne peut pas devenir « ${patch.status} ».`, 'error');
      return false;
    }
    if (patch.status === 'Paiement confirmé') {
      const paymentMethod = String(patch.paymentMethod || '').trim();
      const transactionRef = String(patch.transactionRef || '').trim();
      if (!GOPI_PAYMENT_METHODS.includes(paymentMethod as typeof GOPI_PAYMENT_METHODS[number])) {
        addNotification('Confirmation refusée : choisissez un moyen de paiement reconnu.', 'error');
        return false;
      }
      if (paymentMethod !== 'Espèces' && paymentMethod !== 'Chèque' && transactionRef.length < 3) {
        addNotification('Confirmation refusée : la référence de transaction est obligatoire.', 'error');
        return false;
      }
    }
    return saveGopiOrder({ ...patch, id: current.id }, 'id');
  };

  // 7. Users
  const { items: users, saveItem: saveUser, deleteItem: deleteUser } = useCrud<User>('omapi_users', DEFAULT_USERS, addNotification);

  // 7b. Jobs
  const { items: jobs, saveItem: persistJob, deleteItem: deleteJobRecord } = useCrud<JobOffer>('omapi_jobs', DEFAULT_JOBS, addNotification);
  const { items: jobApplications, saveItem: persistJobApplication, deleteItem: deleteJobApplication } = useCrud<JobApplication>('omapi_job_applications', [], addNotification);

  const saveJob = async (draft: Partial<JobOffer>) => {
    const validationError = validateJobOfferDraft(draft);
    if (validationError) {
      addNotification(`Offre non enregistrée : ${validationError}`, 'error');
      return false;
    }
    return persistJob(normalizeJobOfferDraft(draft));
  };

  const deleteJob = async (id: number | string) => {
    try {
      const rawApplications = localStorage.getItem('omapi_job_applications');
      const currentApplications: JobApplication[] = rawApplications ? JSON.parse(rawApplications) : jobApplications;
      const linkedCount = Array.isArray(currentApplications)
        ? currentApplications.filter((application) => String(application.jobId) === String(id)).length
        : 0;
      if (linkedCount > 0) {
        addNotification(`Suppression refusée : ${linkedCount} candidature(s) sont liées à cette offre. Fermez plutôt l’offre afin de préserver l’historique.`, 'error');
        return false;
      }
    } catch {
      addNotification('Suppression refusée : impossible de vérifier les candidatures liées à cette offre.', 'error');
      return false;
    }
    return deleteJobRecord(id);
  };

  const saveJobApplication = async (application: Partial<JobApplication>) => {
    if (application.id === undefined || application.id === null || application.status === undefined) {
      addNotification('Mise à jour refusée : la candidature ou son nouveau statut est manquant.', 'error');
      return false;
    }
    if (!['Nouvelle', 'En cours', 'Rejetée', 'Acceptée'].includes(application.status)) {
      addNotification('Statut de candidature invalide : sélectionnez un statut reconnu.', 'error');
      return false;
    }

    let currentApplications: unknown = jobApplications;
    try {
      const stored = localStorage.getItem('omapi_job_applications');
      if (stored !== null) currentApplications = JSON.parse(stored);
    } catch {
      addNotification('Mise à jour refusée : impossible de vérifier la candidature enregistrée.', 'error');
      return false;
    }
    if (!Array.isArray(currentApplications) || !currentApplications.some((item) => item && String(item.id) === String(application.id))) {
      addNotification('Mise à jour refusée : cette candidature a été supprimée ou n’existe plus. Actualisez la liste.', 'error');
      return false;
    }
    return persistJobApplication(application);
  };

  // 8. Events & Registrations
  const { items: events, saveItem: persistEvent, deleteItem: deleteEventRecord } = useCrud<Event>('omapi_events', DEFAULT_EVENTS, addNotification);
  const { items: eventRegistrations, saveItem: persistEventRegistration, deleteItem: deleteEventRegistration } = useCrud<EventRegistration>('omapi_event_registrations', DEFAULT_EVENT_REGISTRATIONS, addNotification);

  const saveEvent = async (draft: Partial<Event>) => {
    const validationError = validateEventDraft(draft);
    if (validationError) {
      addNotification(`Événement non enregistré : ${validationError}`, 'error');
      return false;
    }
    return persistEvent(normalizeEventDraft(draft));
  };

  const deleteEvent = async (id: number | string) => {
    try {
      const rawRegistrations = localStorage.getItem('omapi_event_registrations');
      const currentRegistrations: unknown = rawRegistrations === null ? eventRegistrations : JSON.parse(rawRegistrations);
      if (!Array.isArray(currentRegistrations)) throw new Error('Invalid registration data');
      const linkedCount = currentRegistrations.filter((registration) => registration && String(registration.eventId) === String(id)).length;
      if (linkedCount > 0) {
        addNotification(`Suppression refusée : ${linkedCount} inscription(s) sont liées à cet événement. Annulez l’événement ou supprimez d’abord ses participants afin de préserver l’historique.`, 'error');
        return false;
      }
    } catch {
      addNotification('Suppression refusée : impossible de vérifier les inscriptions liées à cet événement.', 'error');
      return false;
    }
    return deleteEventRecord(id);
  };

  const saveEventRegistration = async (draft: Partial<EventRegistration>) => {
    if (draft.eventId === undefined || draft.eventId === null) {
      addNotification('Inscription refusée : événement manquant.', 'error');
      return false;
    }
    const event = events.find((item) => String(item.id) === String(draft.eventId));
    if (!event) {
      addNotification('Inscription refusée : cet événement n’existe plus.', 'error');
      return false;
    }
    const normalized = normalizeEventRegistrationDraft(draft);
    const comparableRegistrations = eventRegistrations.filter((item) => String(item.id) !== String(draft.id));
    const validationError = validateEventRegistrationDraft(normalized, event, comparableRegistrations);
    if (validationError) {
      addNotification(`Inscription refusée : ${validationError}`, 'error');
      return false;
    }
    return persistEventRegistration(normalized);
  };

  // 9. Legislation
  const { items: legislationItems, saveItem: saveLegislation, deleteItem: deleteLegislation } = useCrud<LegislationItem>('omapi_legislation', DEFAULT_LEGISLATION, addNotification);

  // 10. Site Configs
  const [siteConfig, saveSiteConfig] = useObjectStorage<SiteConfig>('omapi_site_config', {}, addNotification);

  const [homeResourcesConfig, saveHomeResourcesConfig] = useObjectStorage<HomeResourcesConfig>('omapi_home_resources', DEFAULT_HOME_RESOURCES_CONFIG, addNotification);


  // Les actualités à la une génèrent leurs slides directement depuis leur fiche.
  // Les slides manuels restent dans le gestionnaire du carrousel, sans copie liée.
  const handleSaveNews = async (newsData: Partial<NewsItem>): Promise<boolean> => {
    const validationError = validateNewsDraft(newsData);
    if (validationError) {
      addNotification(validationError, 'error');
      return false;
    }

    const normalized = normalizeNewsDraft(newsData);
    const isNew = newsData.id === undefined || newsData.id === null;
    const savedId = newsData.id ?? Date.now();
    const dataToSave: Partial<NewsItem> = { ...normalized, id: savedId };
    const saved = await saveNewsBase(dataToSave, 'id', { notify: false });

    if (!saved) {
      addNotification('Échec de la sauvegarde : l’actualité n’a pas été enregistrée. Vos changements restent dans le formulaire ; libérez de l’espace dans le navigateur puis réessayez.', 'error');
      return false;
    }

    const description = describeCrudAction('omapi_news', isNew ? 'created' : 'updated', dataToSave);
    addNotification(description.message, 'success');
    return true;
  };

  const handleDeleteNews = (id: number) => {
    return deleteNews(id, (deletedId) => (
      setSlides((previousSlides) => previousSlides.filter((slide) => String(slide.newsId) !== String(deletedId)))
    ));
  };

  // 13. System Activity Logs
  const { items: activityLogs } = useCrud<ActivityLog>('omapi_activities', [], () => {});

  // --- Notifications persistantes (cloche) : commandes, inscriptions et actions réelles ---
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<string[]>(readNotificationIds);

  useEffect(() => {
    const syncReadNotifications = (event: StorageEvent) => {
      if (event.key === READ_NOTIFICATIONS_KEY) {
        setReadNotifIds(readNotificationIds());
      }
    };
    window.addEventListener('storage', syncReadNotifications);
    return () => window.removeEventListener('storage', syncReadNotifications);
  }, []);

  useEffect(() => {
    const candidates: Array<{ notification: SystemNotification; sortValue: number }> = [];

    // Les commandes réellement en attente, des plus récentes aux plus anciennes.
    [...gopiOrders]
      .filter((order) => order.status === 'En attente')
      .sort((a, b) => getNotificationSortValue(b.id, b.date) - getNotificationSortValue(a.id, a.date))
      .slice(0, 25)
      .forEach((order) => {
        const id = `order-${order.id}`;
        candidates.push({
          sortValue: getNotificationSortValue(order.id, order.date),
          notification: {
            id,
            title: 'Commande GOPI à traiter',
            message: `${order.customerName} a commandé « ${order.gopiTitle} ». Vérifiez la commande et mettez son statut à jour.`,
            time: order.date,
            read: readNotifIds.includes(id),
            type: 'order',
          },
        });
      });

    // Les dernières inscriptions réelles, en évitant l'ancien slice(-3)
    // qui sélectionnait les entrées les plus anciennes lorsque les données
    // étaient enregistrées du plus récent au plus ancien.
    [...formationRegistrations]
      .sort((a, b) => getNotificationSortValue(b.id, b.registrationDate) - getNotificationSortValue(a.id, a.registrationDate))
      .slice(0, 5)
      .forEach((registration) => {
        const id = `formation-${registration.id}`;
        candidates.push({
          sortValue: getNotificationSortValue(registration.id, registration.registrationDate),
          notification: {
            id,
            title: 'Nouvelle inscription à une formation',
            message: `${registration.name} s’est inscrit à une formation. Consultez ses coordonnées et confirmez la prise en charge.`,
            time: registration.registrationDate,
            read: readNotifIds.includes(id),
            type: 'info',
          },
        });
      });

    const collections: Record<string, Array<{ id: number | string }>> = {
      omapi_slides: slides,
      omapi_news: newsItems,
      omapi_announcements: announcements,
      omapi_forms: forms,
      omapi_guides: guides,
      omapi_formations: formations,
      omapi_formation_registrations: formationRegistrations,
      omapi_gopi: gopiItems,
      omapi_gopi_orders: gopiOrders,
      omapi_users: users,
      omapi_jobs: jobs,
      omapi_job_applications: jobApplications,
      omapi_events: events,
      omapi_event_registrations: eventRegistrations,
      omapi_legislation: legislationItems,
    };

    // Les activités sont stockées du plus récent au plus ancien : on prend
    // le début du tableau, puis on affiche les descriptions détaillées.
    activityLogs.slice(0, 10).forEach((log) => {
      let title = log.action || 'Action effectuée';
      let message = log.details || 'Une action a été effectuée dans le tableau de bord.';
      const legacyActor = (log as ActivityLog & { username?: string }).username;
      const actor = log.userName || legacyActor;
      const sortValue = getNotificationSortValue(log.id, log.timestamp);

      // Rendre aussi les anciennes activités (qui n’avaient que « ID dans news »)
      // lisibles à l’aide de l’identifiant de la collection et de l’élément.
      const legacy = log.details.match(/^Élément (ajouté|mis à jour|supprimé) \(ID: (.*?)\) dans (.+)$/);
      const legacyKey = log.entityKey || (legacy ? `omapi_${legacy[3]}` : undefined);
      if (legacyKey) {
        const action = legacy?.[1] === 'ajouté'
          ? 'created'
          : legacy?.[1] === 'supprimé' ? 'deleted' : legacy ? 'updated' : undefined;
        if (action) {
          const rawId = legacy?.[2];
          const item = collections[legacyKey]?.find((entry) => String(entry.id) === String(rawId));
          const description = describeCrudAction(legacyKey, action, item ?? { id: rawId ?? log.id });
          title = description.title;
          message = description.message;
        }
      }

      const entityId = log.entityId;
      const representedByDedicatedNotification = entityId !== undefined && log.action?.startsWith('Ajout effectué') && (
        (legacyKey === 'omapi_formation_registrations' && formationRegistrations.some((registration) => String(registration.id) === String(entityId)))
        || (legacyKey === 'omapi_gopi_orders' && gopiOrders.some((order) => String(order.id) === String(entityId) && order.status === 'En attente'))
      );
      if (representedByDedicatedNotification) return;

      if (actor && actor !== 'Visiteur') message = `${actor} : ${message}`;

      const id = `log-${log.id}`;
      candidates.push({
        sortValue,
        notification: {
          id,
          title,
          message,
          time: log.timestamp,
          read: readNotifIds.includes(id),
          type: 'info',
        },
      });
    });

    candidates.sort((a, b) => b.sortValue - a.sortValue);
    const visible = candidates.slice(0, 40).map((candidate) => candidate.notification);
    const visibleIds = new Set(visible.map((notification) => notification.id));
    const validReadIds = readNotifIds.filter((id) => visibleIds.has(id));

    if (validReadIds.length !== readNotifIds.length) {
      setReadNotifIds(validReadIds);
      try {
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(validReadIds));
      } catch (error) {
        console.error('Impossible de nettoyer les notifications lues :', error);
      }
    }

    const validReadSet = new Set(validReadIds);
    setSystemNotifications(visible.map((notification) => ({
      ...notification,
      read: validReadSet.has(notification.id),
    })));
  }, [
    announcements, activityLogs, formationRegistrations, formations, gopiItems,
    gopiOrders, guides, forms, jobApplications, jobs, legislationItems,
    newsItems, readNotifIds, slides, users, events, eventRegistrations,
  ]);

  const persistReadNotificationIds = (ids: string[]) => {
    try {
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(ids));
      setReadNotifIds(ids);
    } catch (error) {
      console.error('Impossible d’enregistrer les notifications lues :', error);
      addNotification('Impossible d’enregistrer votre lecture des notifications dans ce navigateur. Vérifiez son espace de stockage puis réessayez.', 'error');
    }
  };

  const markNotificationAsRead = (id: string) => {
    if (!systemNotifications.some((notification) => notification.id === id)) return;
    if (readNotifIds.includes(id)) return;
    persistReadNotificationIds([...readNotifIds, id]);
  };

  const markAllNotificationsAsRead = () => {
    const nextReadIds = [...new Set([
      ...readNotifIds,
      ...systemNotifications.map((notification) => notification.id),
    ])];
    if (nextReadIds.length !== readNotifIds.length) persistReadNotificationIds(nextReadIds);
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
    gopiOrders, saveGopiOrder, updateGopiOrder, deleteGopiOrder,
    users, saveUser, deleteUser,
    jobs, saveJob, deleteJob,
    jobApplications, saveJobApplication, deleteJobApplication,
    events, saveEvent, deleteEvent,
    eventRegistrations, saveEventRegistration, deleteEventRegistration,
    legislationItems, saveLegislation, deleteLegislation,
    siteConfig, saveSiteConfig,
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
