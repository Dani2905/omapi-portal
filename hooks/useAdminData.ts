
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiEditorial } from './useApiEditorial';
import { useApiLibrary } from './useApiLibrary';
import { useApiSiteSettings } from './useApiSiteSettings';
import { useApiProgrammes } from './useApiProgrammes';
import { useApiRemainingModules } from './useApiRemainingModules';
import { useApiActivity } from './useApiActivity';
import { describeCrudAction } from '../utils/notificationMessages';
import { normalizeAnnouncementDraft, validateAnnouncementText } from '../utils/announcementLogic';
import { normalizeNewsDraft, validateNewsDraft } from '../utils/editorialLogic';


import { Slide, NewsItem, Announcement, Formation, FormationRegistration, JobOffer, JobApplication, GopiItem, Event, Notification, SystemNotification, ActivityLog } from '../types';

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

  // --- Editorial content is API-backed; the retired local copies are cleared
  // only after the API has returned successfully. Other modules remain local. ---
  const editorial = useApiEditorial(addNotification);
  const { slides, newsItems, announcements } = editorial;
  const library = useApiLibrary(addNotification);
  const { forms, guides, legislationItems, saveForm, saveGuide, saveLegislation, deleteForm, deleteGuide, deleteLegislation } = library;
  const siteSettings = useApiSiteSettings(addNotification);
  const { siteConfig, homeResourcesConfig, saveSiteConfig, saveHomeResourcesConfig } = siteSettings;
  const saveSlide = async (draft: Partial<Slide>): Promise<boolean> => Boolean(await editorial.saveSlide(draft));
  const deleteSlide = editorial.deleteSlide;
  const deleteAnnouncement = editorial.deleteAnnouncement;

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
    return Boolean(await editorial.saveAnnouncement(normalized));
  };

  // 4. Formulaires et guides : API OMAPI; les anciennes copies localStorage restent intactes.

  // 5. Formations et événements : catalogues publics, opérations d’administration
  // authentifiées et inscriptions conservées privées côté API.
  const programmes = useApiProgrammes(addNotification, 'all', true);
  const { formations, formationRegistrations, events, eventRegistrations, loading: programmesLoading } = programmes;
  const saveFormation = async (draft: Partial<Formation>): Promise<boolean> => Boolean(await programmes.saveFormation(draft));
  const saveFormationRegistration = programmes.saveFormationRegistration;
  const deleteFormationRegistration = programmes.deleteFormationRegistration;
  const deleteFormation = async (id: number | string): Promise<boolean | string> => {
    const formation = formations.find((item) => String(item.id) === String(id));
    if (!formation) return 'Cette formation n’existe plus dans le catalogue. Actualisez la page puis réessayez.';
    const linkedCount = formationRegistrations.filter((registration) => String(registration.formationId) === String(id)).length;
    if (linkedCount > 0) {
      return `Suppression refusée : « ${formation.title} » compte ${linkedCount} inscription${linkedCount > 1 ? 's' : ''}. Ouvrez « Voir les inscrits » et supprimez ou gérez ces demandes avant de retirer la formation.`;
    }
    return programmes.deleteFormation(id);
  };

  // 6. GOPI & commandes : catalogue public, données clients et actions de gestion
  // accessibles uniquement via les routes authentifiées de l’API.
  const commerce = useApiRemainingModules(addNotification, 'all', true);
  const { gopiItems, gopiOrders, jobs, jobApplications, loading: commerceLoading } = commerce;
  const saveGopi = async (draft: Partial<GopiItem>): Promise<boolean> => Boolean(await commerce.saveGopi(draft));
  const deleteGopi = async (id: number): Promise<boolean | string> => {
    const publication = gopiItems.find((item) => String(item.id) === String(id));
    if (!publication) return 'Cette publication n’existe plus. Actualisez la page puis réessayez.';
    const openOrders = gopiOrders.filter((order) => String(order.gopiId) === String(id)
      && (order.status === 'En attente' || order.status === 'Paiement confirmé'));
    if (openOrders.length) {
      return `Suppression refusée : « ${publication.title} » est liée à ${openOrders.length} demande${openOrders.length > 1 ? 's' : ''} encore à traiter. Annulez ou finalisez ces commandes avant de retirer la publication.`;
    }
    return commerce.deleteGopi(id);
  };
  const updateGopiOrder = commerce.updateGopiOrder;
  const deleteGopiOrder = commerce.deleteGopiOrder;

  // 7b. Offres d’emploi et candidatures. Les formulaires de candidature sont
  // publics, mais leurs dossiers et pièces jointes ne sont lus que par l’API admin.
  const saveJob = async (draft: Partial<JobOffer>): Promise<boolean> => Boolean(await commerce.saveJob(draft));
  const deleteJob = async (id: number | string): Promise<boolean> => commerce.deleteJob(id);
  const saveJobApplication = async (application: Partial<JobApplication>): Promise<boolean> => {
    if (application.id === undefined || application.status === undefined) {
      addNotification('Mise à jour refusée : la candidature ou son nouveau statut est manquant.', 'error');
      return false;
    }
    return commerce.updateJobApplicationStatus({ id: application.id }, application.status);
  };
  const deleteJobApplication = commerce.deleteJobApplication;

  // 8. Événements et inscriptions : même API centralisée que les formations.
  const saveEvent = async (draft: Partial<Event>): Promise<boolean> => Boolean(await programmes.saveEvent(draft));
  const saveEventRegistration = programmes.saveEventRegistration;
  const deleteEventRegistration = programmes.deleteEventRegistration;
  const deleteEvent = async (id: number | string): Promise<boolean> => {
    const linkedCount = eventRegistrations.filter((registration) => String(registration.eventId) === String(id)).length;
    if (linkedCount > 0) {
      addNotification(`Suppression refusée : ${linkedCount} inscription(s) sont liées à cet événement. Supprimez d’abord les inscriptions afin de préserver l’historique.`, 'error');
      return false;
    }
    return programmes.deleteEvent(id);
  };

  // 9. Législation et réglages du site : API OMAPI; aucune copie locale n'est effacée ni importée.


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
    const dataToSave: Partial<NewsItem> = { ...normalized, ...(newsData.id == null ? {} : { id: newsData.id }) };
    const savedItem = await editorial.saveNews(dataToSave);
    if (!savedItem) return false;

    const description = describeCrudAction('omapi_news', isNew ? 'created' : 'updated', savedItem);
    addNotification(description.message, 'success');
    return true;
  };

  const handleDeleteNews = (id: number) => editorial.deleteNews(id);

  // 13. Journal d’activité et état lu/non lu : lecture/sauvegarde API, par compte.
  const activityApi = useApiActivity(addNotification);
  const { activityLogs, readNotificationIds: readNotifIds, saveReadNotificationIds, loading: activityLoading } = activityApi;

  // --- Notifications persistantes (cloche), données privées admin uniquement ---
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
    if (activityLoading || programmesLoading || commerceLoading) return;
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

    [...eventRegistrations]
      .sort((a, b) => getNotificationSortValue(b.id, b.registrationDate) - getNotificationSortValue(a.id, a.registrationDate))
      .slice(0, 5)
      .forEach((registration) => {
        const id = `event-${registration.id}`;
        const event = events.find((item) => String(item.id) === String(registration.eventId));
        candidates.push({
          sortValue: getNotificationSortValue(registration.id, registration.registrationDate),
          notification: {
            id,
            title: 'Nouvelle inscription à un événement',
            message: `${registration.name} s’est inscrit${event ? ` à « ${event.title} »` : ' à un événement'}. Consultez ses coordonnées dans le tableau de bord.`,
            time: registration.registrationDate,
            read: readNotifIds.includes(id),
            type: 'info',
          },
        });
      });

    [...jobApplications]
      .sort((a, b) => getNotificationSortValue(b.id, b.applicationDate) - getNotificationSortValue(a.id, a.applicationDate))
      .slice(0, 5)
      .forEach((application) => {
        const id = `job-${application.id}`;
        candidates.push({
          sortValue: getNotificationSortValue(application.id, application.applicationDate),
          notification: {
            id,
            title: 'Nouvelle candidature reçue',
            message: `${application.firstName} ${application.lastName} a envoyé une candidature${application.jobTitle ? ` pour « ${application.jobTitle} »` : ' spontanée'}.`,
            time: application.applicationDate,
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
    const readSet = new Set(readNotifIds);
    setSystemNotifications(visible.map((notification) => ({
      ...notification,
      read: readSet.has(notification.id),
    })));
  }, [
    announcements, activityLogs, activityLoading, commerceLoading, programmesLoading,
    formationRegistrations, formations, gopiItems, gopiOrders, guides, forms,
    jobApplications, jobs, legislationItems, newsItems, readNotifIds, slides,
    events, eventRegistrations,
  ]);

  const persistReadNotificationIds = async (ids: string[]) => saveReadNotificationIds(ids);

  const markNotificationAsRead = (id: string) => {
    if (!systemNotifications.some((notification) => notification.id === id)) return;
    if (readNotifIds.includes(id)) return;
    void persistReadNotificationIds([...readNotifIds, id]);
  };

  const markAllNotificationsAsRead = () => {
    const nextReadIds = [...new Set([
      ...readNotifIds,
      ...systemNotifications.map((notification) => notification.id),
    ])];
    if (nextReadIds.length !== readNotifIds.length) void persistReadNotificationIds(nextReadIds);
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
    gopiOrders, updateGopiOrder, deleteGopiOrder,
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
