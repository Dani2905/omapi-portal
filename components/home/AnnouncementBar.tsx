import React from 'react';
import { Announcement } from '../../types';
import { MegaphoneIcon } from '../admin/AdminIcons';
import { useCrud } from '../../hooks/useCrud';
import { DEFAULT_ANNOUNCEMENTS } from '../../constants';
import { getActiveAnnouncements } from '../../utils/announcementLogic';
import { useAnnouncementRotation } from '../../hooks/useAnnouncementRotation';

const AnnouncementBar: React.FC = () => {
  const { items } = useCrud<Announcement>('omapi_announcements', DEFAULT_ANNOUNCEMENTS);
  const activeAnnouncements = getActiveAnnouncements(items);
  const rotation = useAnnouncementRotation(activeAnnouncements.length);

  if (activeAnnouncements.length === 0) return null;

  const currentAnnouncement = activeAnnouncements[rotation.index];

  return (
    <div className="bg-[#002B49] border-b border-[#003861] text-white relative z-20">
      <div className="container mx-auto max-w-7xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs md:text-sm">
        <div className="flex min-w-0 items-center gap-3 overflow-hidden">
          <span className="font-bold tracking-wider uppercase text-amber-300 shrink-0">
            Avis officiel
          </span>
          <span className="text-white/40 shrink-0" aria-hidden="true">|</span>
          <p className="font-medium text-stone-100 truncate" aria-live="polite" aria-atomic="true">
            {currentAnnouncement?.text}
          </p>
        </div>
        {activeAnnouncements.length > 1 && (
          <div className="flex items-center gap-1 shrink-0 text-white/70 text-xs">
            <span aria-label={`Message ${rotation.index + 1} sur ${activeAnnouncements.length}`}>
              {rotation.index + 1}/{activeAnnouncements.length}
            </span>
            <button
              type="button"
              onClick={rotation.previous}
              className="hover:text-white p-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              aria-label="Annonce précédente"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={rotation.next}
              className="hover:text-white p-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
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
