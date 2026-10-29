
import { useState, useEffect } from 'react';

type NotifyFunction = (message: string, type: 'success' | 'error') => void;

const STORAGE_SYNC_EVENT = 'omapi-storage-sync';

function dispatchStorageSync(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT, { detail: { key } }));
  }
}

// Helper to log activities locally
const logActivity = (action: string, key: string, itemId: string | number) => {
  if (!key || key === 'omapi_activities') return;

  try {
    const userEmail = localStorage.getItem('omapi_user_email') || 'daniel.razanajaona@gmail.com';
    const userName = localStorage.getItem('omapi_user_name') || 'Administrateur';
    const newLog = {
      id: Date.now(),
      action,
      details: `${action} (ID: ${itemId}) dans ${key.replace('omapi_', '')}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      userid: userEmail,
      username: userName,
    };

    const existingRaw = localStorage.getItem('omapi_activities');
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
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
        if (Array.isArray(parsed) && (parsed.length > 0 || initialData.length === 0)) {
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

  const setItems = (newItems: T[] | ((prev: T[]) => T[])) => {
    setItemsState(prev => {
      const resolved = typeof newItems === 'function' ? (newItems as (p: T[]) => T[])(prev) : newItems;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
        dispatchStorageSync(key);
      } catch (e) {
        console.error(`Erreur écriture localStorage pour ${key}:`, e);
      }
      return resolved;
    });
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

  // Ajouter ou Mettre à jour un élément
  const saveItem = async (item: Partial<T>, idField: keyof T = 'id' as keyof T) => {
    let action = 'ajouté';
    let newItems = [...items];
    let savedItem = { ...item };

    const tempId = item[idField] ? item[idField] : Date.now();

    if (item[idField]) {
      const index = newItems.findIndex(i => String(i[idField]) === String(item[idField]));
      if (index !== -1) {
        newItems[index] = { ...newItems[index], ...item } as T;
        savedItem = { ...newItems[index], [idField]: tempId } as any;
        action = 'mis à jour';
      } else {
        savedItem = { ...item, [idField]: tempId } as any;
        newItems = [savedItem as T, ...newItems];
      }
    } else {
      savedItem = { ...item, [idField]: tempId } as any;
      newItems = [savedItem as T, ...newItems];
    }

    setItems(newItems);
    logActivity(`Élément ${action}`, key, tempId as string | number);
    if (notify) notify(`Élément ${action} avec succès`, 'success');
  };

  // Supprimer un élément
  const deleteItem = async (id: number | string) => {
    const newItems = items.filter(i => String(i.id) !== String(id));
    setItems(newItems);
    logActivity('Élément supprimé', key, id);
    if (notify) notify('Élément supprimé avec succès', 'success');
  };

  const deleteItemWithCallback = async (id: number | string, callback?: (id: number | string) => void) => {
    const newItems = items.filter(i => String(i.id) !== String(id));
    setItems(newItems);
    logActivity('Élément supprimé', key, id);
    if (callback) callback(id);
    if (notify) notify('Élément supprimé avec succès', 'success');
  };

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

  const saveData = async (newData: T) => {
    setData(newData);
    try {
      localStorage.setItem(key, JSON.stringify(newData));
      dispatchStorageSync(key);
    } catch (error) {
      console.error(`Erreur sauvegarde config ${key}:`, error);
    }
    if (notify) notify('Configuration enregistrée', 'success');
  };

  return [data, saveData] as const;
}

