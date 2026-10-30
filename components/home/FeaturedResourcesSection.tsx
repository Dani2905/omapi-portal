import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, PlayCircleIcon } from '../admin/AdminIcons';
import { HomeResourcesConfig } from '../../types';
import { useObjectStorage } from '../../hooks/useCrud';
import { DEFAULT_HOME_RESOURCES_CONFIG, normalizeHomeResourcesConfig, normalizeResourceUrl } from '../../data/homeResources';

const FeaturedResourcesSection: React.FC = () => {
  const [storedConfig] = useObjectStorage<HomeResourcesConfig>('omapi_home_resources', DEFAULT_HOME_RESOURCES_CONFIG);
  const config = normalizeHomeResourcesConfig(storedConfig);
  const videoHref = normalizeResourceUrl(config.videoUrl, '/guides');
  const isVideoLinkConfigured = Boolean(config.videoUrl?.trim());

  return (
    <div className="container mx-auto mb-20 max-w-7xl px-4 font-sans lg:px-8">
      <section className="bg-white" aria-labelledby="featured-resources-title">
        <div className="mb-8 border-b border-stone-200 pb-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-stone-500">Documentation & pédagogie</div>
          <h2 id="featured-resources-title" className="text-2xl font-serif font-bold text-[#002B49] md:text-3xl">Ressources clés & formations</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600">Rencontres de l’OMAPI et ressources pratiques pour mieux comprendre la propriété industrielle à Madagascar.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.4 }} className="flex flex-col border border-stone-200 bg-stone-50">
            <ResourceLink href={config.omapiHourUrl || '/events'} fallback="/events" className="group relative block aspect-video w-full overflow-hidden border-b border-stone-200 bg-stone-900" ariaLabel="Consulter les rencontres OMAPI">
              <ResourceImage src={config.omapiHourThumbnail || ''} fallback={DEFAULT_HOME_RESOURCES_CONFIG.omapiHourThumbnail || ''} alt={config.omapiHourTitle} />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20"><div className="flex h-14 w-14 items-center justify-center bg-[#002B49] text-white shadow-md"><ClockIcon className="h-7 w-7" /></div></div>
            </ResourceLink>
            <div className="flex flex-grow flex-col p-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#0081C6]">Rencontres régulières</p>
              <h3 className="mb-3 text-2xl font-serif font-bold text-[#002B49]">{config.omapiHourTitle}</h3>
              <p className="mb-8 flex-grow text-sm leading-relaxed text-stone-600">{config.omapiHourDesc}</p>
              <ResourceLink href={config.omapiHourUrl || '/events'} fallback="/events" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#D3273E] transition-colors hover:text-[#002B49]" ariaLabel="Consulter les rencontres OMAPI">
                Consulter les prochaines sessions <span className="ml-2" aria-hidden="true">→</span>
              </ResourceLink>
            </div>
          </motion.article>

          <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.4, delay: 0.1 }} className="flex flex-col border border-stone-200 bg-stone-50">
            <ResourceLink href={videoHref} fallback="/guides" className="group relative block aspect-video w-full overflow-hidden border-b border-stone-200 bg-stone-900" ariaLabel={isVideoLinkConfigured ? 'Ouvrir le tutoriel vidéo' : 'Explorer les guides pratiques'}>
              <ResourceImage src={config.videoThumbnail} fallback={DEFAULT_HOME_RESOURCES_CONFIG.videoThumbnail} alt={config.videoTitle} />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20"><div className="flex h-14 w-14 items-center justify-center bg-[#D3273E] pl-0.5 text-white shadow-md">{isVideoLinkConfigured ? <PlayCircleIcon className="h-7 w-7" /> : <ClockIcon className="h-7 w-7" />}</div></div>
              {config.videoDuration?.trim() && <div className="absolute bottom-3 right-3 rounded bg-stone-900/90 px-2.5 py-1 font-mono text-xs tabular-nums text-stone-100">{config.videoDuration}</div>}
            </ResourceLink>
            <div className="flex flex-grow flex-col p-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#0081C6]">{isVideoLinkConfigured ? 'Vidéo / tutoriel' : 'Guide numérique'}</p>
              <h3 className="mb-3 text-2xl font-serif font-bold text-[#002B49]">{config.videoTitle}</h3>
              <p className="mb-8 flex-grow text-sm leading-relaxed text-stone-600">{config.videoDesc}</p>
              <ResourceLink href={videoHref} fallback="/guides" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#D3273E] transition-colors hover:text-[#002B49]" ariaLabel={isVideoLinkConfigured ? 'Ouvrir le tutoriel vidéo' : 'Explorer les guides pratiques'}>
                {isVideoLinkConfigured ? 'Regarder le tutoriel' : 'Explorer les guides pratiques'} <span className="ml-2" aria-hidden="true">→</span>
              </ResourceLink>
            </div>
          </motion.article>
        </div>
      </section>
    </div>
  );
};

function ResourceImage({ src, fallback, alt }: { src: string; fallback: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src, fallback]);
  return <img src={!failed && src ? src : fallback} onError={() => setFailed(true)} alt={alt} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />;
}

function ResourceLink({ href, fallback, className, ariaLabel, children }: { href: string; fallback: string; className: string; ariaLabel: string; children: React.ReactNode }) {
  const safeHref = normalizeResourceUrl(href, fallback);
  if (/^https?:\/\//i.test(safeHref)) {
    return <a href={safeHref} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={className}>{children}</a>;
  }
  return <Link to={safeHref} aria-label={ariaLabel} className={className}>{children}</Link>;
}

export default FeaturedResourcesSection;
