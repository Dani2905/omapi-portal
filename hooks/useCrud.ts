
import { useState, useEffect } from 'react';
import { describeConfigurationSave, describeCrudAction, getNotificationItemLabel } from '../utils/notificationMessages';

type NotifyFunction = (message: string, type: 'success' | 'error' | 'info') => void;

const STORAGE_SYNC_EVENT = 'omapi-storage-sync';

function dispatchStorageSync(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT, { detail: { key } }));
  }
}

// Historique local des actions : description lisible et propriétés
// alignées sur ActivityLog (les anciennes entrées restent compatibles).
const logActivity = (action: string, details: string, key: string, entityId?: number | string) => {
  if (!key || key === 'omapi_activities') return;

  try {
    const userId = localStorage.getItem('omapi_user_email') || undefined;
    const userName = localStorage.getItem('omapi_user_name') || 'Visiteur';
    const newLog = {
      id: Date.now() + Math.random(),
      action,
      details,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      entityKey: key,
      entityId,
    };

    const existingRaw = localStorage.getItem('omapi_activities');
    const parsed = existingRaw ? JSON.parse(existingRaw) : [];
    const existing = Array.isArray(parsed) ? parsed : [];
    const updated = [newLog, ...existing].slice(0, 100);
    localStorage.setItem('omapi_activities', JSON.stringify(updated));
    dispatchStorageSync('omapi_activities');
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'activité", error);
  }
};

/**
 * Hook générique pour gérer une liste d'objets avec persistance locale (localStorage)
 */
export function useCrud<T extends { id: number | string }>(key: string, initialData: T[], notify?: NotifyFunction) {
  const readFromStorage = (): T[] => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        // Une liste enregistrée vide est un état valide : elle signifie
        // que tous les éléments ont été supprimés. La réensemencer ici
        // ferait réapparaître les données par défaut après suppression.
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      if (initialData.length > 0) {
        localStorage.setItem(key, JSON.stringify(initialData));
      }
      return initialData;
    } catch (error) {
      console.error(`Erreur lecture localStorage pour ${key}:`, error);
      return initialData;
    }
  };

  const [items, setItemsState] = useState<T[]>(() => readFromStorage());
  const [loading, setLoading] = useState<boolean>(false);

  const setItems = (newItems: T[] | ((prev: T[]) => T[])): boolean => {
    // Relire le stockage sert de source commune si un autre onglet ou
    // une autre instance du hook vient de modifier la même liste.
    const currentItems = readFromStorage();
    const resolved = typeof newItems === 'function'
      ? (newItems as (p: T[]) => T[])(currentItems)
      : newItems;

    try {
      localStorage.setItem(key, JSON.stringify(resolved));
    } catch (error) {
      console.error(`Erreur écriture localStorage pour ${key}:`, error);
      return false;
    }

    setItemsState(resolved);
    dispatchStorageSync(key);
    return true;
  };

  useEffect(() => {
    setItemsState(readFromStorage());
    setLoading(false);

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      if (customEvent.detail?.key === key) {
        setItemsState(readFromStorage());
      }
    };

    const handleWindowStorage = (e: StorageEvent) => {
      if (e.key === key) {
        setItemsState(readFromStorage());
      }
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleWindowStorage);
    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleWindowStorage);
    };
  }, [key]);

  // Ajouter ou mettre à jour un élément avec messages nominatifs.
  const saveItem = async (
    item: Partial<T>,
    idField: keyof T = 'id' as keyof T,
    options: { notify?: boolean } = {},
  ): Promise<boolean> => {
    const currentItems = readFromStorage();
    const hasId = item[idField] !== undefined && item[idField] !== null && item[idField] !== '';
    const itemId = hasId ? item[idField] : Date.now();
    const index = hasId
      ? currentItems.findIndex((existing) => String(existing[idField]) === String(item[idField]))
      : -1;

    // Certains parcours (formulaires publics, actualité/carrousel) créent
    // eux-mêmes leur identifiant. Un identifiant absent de la liste est donc
    // traité comme une création, pas comme une modification.
    const action = index >= 0 ? 'updated' : 'created';
    const newItems = [...currentItems];
    const savedItem = { ...item, [idField]: itemId } as T;
    if (index >= 0) {
      newItems[index] = { ...newItems[index], ...savedItem } as T;
    } else {
      newItems.unshift(savedItem);
    }

    if (!setItems(newItems)) {
      const label = getNotificationItemLabel(key, savedItem);
      const actionText = action === 'created' ? "d’ajouter" : 'de mettre à jour';
      if (options.notify !== false && notify) {
        notify(`Échec de la sauvegarde : impossible ${actionText} « ${label} ». Vos modifications ne sont pas enregistrées. Vérifiez l'espace disponible dans ce navigateur puis réessayez.`, 'error');
      }
      return false;
    }

    const description = describeCrudAction(key, action, savedItem);
    logActivity(description.title, description.message, key, savedItem.id);
    if (options.notify !== false && notify) notify(description.message, 'success');
    return true;
  };

  const deleteFromStorage = async (
    id: number | string,
    callback?: (id: number | string) => boolean | void,
    options: { notify?: boolean } = {},
  ): Promise<boolean> => {
    const currentItems = readFromStorage();
    const deletedItem = currentItems.find((item) => String(item.id) === String(id));
    if (!deletedItem) {
      if (options.notify !== false && notify) notify(`Suppression impossible : aucun élément de cette liste ne porte l'identifiant ${id}. Actualisez la page puis réessayez.`, 'error');
      return false;
    }

    const newItems = currentItems.filter((item) => String(item.id) !== String(id));
    if (!setItems(newItems)) {
      const label = getNotificationItemLabel(key, deletedItem);
      if (options.notify !== false && notify) notify(`Échec de la suppression : « ${label} » est toujours enregistré. Vérifiez l'espace disponible dans ce navigateur puis réessayez.`, 'error');
      return false;
    }

    let relatedUpdateFailed = false;
    if (callback) {
      try {
        relatedUpdateFailed = callback(id) === false;
      } catch (error) {
        console.error('Erreur lors de la mise à jour des données liées à la suppression :', error);
        relatedUpdateFailed = true;
      }
    }

    const description = describeCrudAction(key, 'deleted', deletedItem);
    logActivity(description.title, description.message, key, deletedItem.id);
    if (relatedUpdateFailed) {
      const extra = key === 'omapi_news'
        ? ' Toutefois, la synchronisation avec le carrousel a échoué : vérifiez la page « Carrousel Accueil ». '
        : ' Toutefois, une mise à jour liée a échoué.';
      if (options.notify !== false && notify) notify(`${description.message}${extra}`, 'error');
    } else if (options.notify !== false && notify) {
      notify(description.message, 'success');
    }
    return true;
  };

  const deleteItem = (
    id: number | string,
    options: { notify?: boolean } = {},
  ): Promise<boolean> => deleteFromStorage(id, undefined, options);

  const deleteItemWithCallback = (
    id: number | string,
    callback?: (id: number | string) => boolean | void,
    options: { notify?: boolean } = {},
  ): Promise<boolean> => deleteFromStorage(id, callback, options);

  return {
    items,
    loading,
    setItems,
    saveItem,
    deleteItem,
    deleteItemWithCallback
  };
}

/**
 * Hook pour gérer un objet unique de configuration (ex: Annonce, Design, etc.) avec localStorage
 */
export function useObjectStorage<T>(key: string, initialData: T, notify?: NotifyFunction) {
  const readConfig = (): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved) as T;
      }
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    } catch (e) {
      return initialData;
    }
  };

  const [data, setData] = useState<T>(() => readConfig());

  useEffect(() => {
    setData(readConfig());

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      if (customEvent.detail?.key === key) {
        setData(readConfig());
      }
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleSync);
    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, handleSync);
    };
  }, [key]);

  const saveData = async (newData: T): Promise<boolean> => {
    try {
      localStorage.setItem(key, JSON.stringify(newData));
    } catch (error) {
      console.error(`Erreur sauvegarde config ${key}:`, error);
      if (notify) notify(`${describeConfigurationSave(key).error} Vos modifications restent dans le formulaire. Vérifiez l'espace disponible dans ce navigateur puis réessayez.`, 'error');
      return false;
    }

    setData(newData);
    dispatchStorageSync(key);
    if (notify) notify(describeConfigurationSave(key).success, 'success');
    return true;
  };

  return [data, saveData] as const;
}

