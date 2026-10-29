import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types';
import { MegaphoneIcon } from '../admin/AdminIcons';
import { useCrud } from '../../hooks/useCrud';
import { DEFAULT_ANNOUNCEMENTS } from '../../constants';
import { AnimatePresence, motion } from 'motion/react';

const AnnouncementBar: React.FC = () => {
  const { items: announcements } = useCrud<Announcement>('omapi_announcements', DEFAULT_ANNOUNCEMENTS);

  // Filtrer uniquement les annonces actives
  const activeAnnouncements = announcements.filter(a => a.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  if (activeAnnouncements.length === 0) return null;

  // S'assurer que l'index est valide si le nombre d'annonces change
  const safeIndex = currentIndex % activeAnnouncements.length;

  return (
    <div className="bg-[#002B49] border-b border-[#003861] text-white relative z-20">
      <div className="container mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-between text-xs md:text-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="font-bold tracking-wider uppercase text-amber-300 shrink-0">
            Avis Officiel
          </span>
          <span className="text-white/40 shrink-0">|</span>
          <p className="font-medium text-stone-100 truncate">
            {activeAnnouncements[safeIndex]?.text}
          </p>
        </div>
        {activeAnnouncements.length > 1 && (
          <div className="hidden sm:flex items-center gap-2 shrink-0 text-white/60 text-xs">
            <span>{safeIndex + 1}/{activeAnnouncements.length}</span>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length)}
              className="hover:text-white p-1"
              aria-label="Annonce précédente"
            >
              &larr;
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length)}
              className="hover:text-white p-1"
              aria-label="Annonce suivante"
            >
              &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementBar;