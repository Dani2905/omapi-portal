import { useEffect, useState } from 'react';
import { getNextAnnouncementIndex, getSafeAnnouncementIndex } from '../utils/announcementLogic';

export const ANNOUNCEMENT_ROTATION_MS = 5000;

export function useAnnouncementRotation(count: number) {
  const [index, setIndex] = useState(0);
  const safeIndex = getSafeAnnouncementIndex(index, count);

  useEffect(() => {
    setIndex((current) => getSafeAnnouncementIndex(current, count));
    if (count <= 1) return undefined;

    const interval = window.setInterval(() => {
      setIndex((current) => getNextAnnouncementIndex(current, count));
    }, ANNOUNCEMENT_ROTATION_MS);

    return () => window.clearInterval(interval);
  }, [count]);

  return {
    index: safeIndex,
    previous: () => setIndex((current) => getNextAnnouncementIndex(current, count, -1)),
    next: () => setIndex((current) => getNextAnnouncementIndex(current, count)),
  };
}
