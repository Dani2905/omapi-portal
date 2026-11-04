import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

// Icônes SVG Heroicons
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const CheckBadgeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
  </svg>
);

const LightBulbIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const SwatchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
  </svg>
);

const StorefrontIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.593l6.002-4.5c.827-.478.966-1.583.428-2.282l-9.58-9.58A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
);

const GlobeAltIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 2.944a11.955 11.955 0 0 1-8.63 8.988 8.92 8.92 0 0 0 6.525 6.38" />
    </svg>
);

const ScaleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
    </svg>
);

const UserGroupIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
);

const HandThumbUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.287 9.483 4.111 8.975 5 8.975h.909c.445 0 .72.498.523.898a9.62 9.62 0 0 0-.27.602m0 9.75V9.75" />
    </svg>
);

const Presentation: React.FC = () => {
  const milestones = [
    { year: '1962', title: 'Accord de Libreville', desc: "Un régime uniforme de protection est institué et l'OAMPI est créé." },
    { year: '1974–1976', title: "Fin de l'accord", desc: "Madagascar dénonce l'accord; son retrait prend effet le 31 décembre 1976." },
    { year: '1989', title: 'Ordonnance n° 89-019', desc: 'Un régime national de protection de la propriété industrielle est institué.' },
    { year: '1992', title: 'Organisation de l’OMAPI', desc: "Les décrets n° 92-993 et 92-994 appliquent l'ordonnance et organisent l'Office." },
    { year: '1994', title: 'Mise en activité', desc: "L'OMAPI devient opérationnel le 1er avril." },
  ];

  const titles = [
    { title: "Brevets d'invention", desc: 'Protection des inventions techniques.', icon: <LightBulbIcon className="h-6 w-6" />, color: 'bg-amber-50 text-amber-700' },
    { title: 'Marques', desc: 'Signes distinctifs pour les produits et services.', icon: <TagIcon className="h-6 w-6" />, color: 'bg-blue-50 text-blue-700' },
    { title: 'Dessins & modèles', desc: 'Protection des créations esthétiques industrielles.', icon: <SwatchIcon className="h-6 w-6" />, color: 'bg-violet-50 text-violet-700' },
    { title: 'Noms commerciaux', desc: 'Protection des dénominations commerciales.', icon: <StorefrontIcon className="h-6 w-6" />, color: 'bg-emerald-50 text-emerald-700' },
  ];

  const values = [
    { title: 'Intégrité', desc: 'Honnêteté et transparence.', icon: <CheckBadgeIcon className="h-6 w-6" /> },
    { title: 'Innovation', desc: 'Soutien à la créativité.', icon: <LightBulbIcon className="h-6 w-6" /> },
    { title: 'Service', desc: 'Accompagnement de qualité.', icon: <UserGroupIcon className="h-6 w-6" /> },
    { title: 'Équité', desc: 'Traitement juste et impartial.', icon: <ScaleIcon className="h-6 w-6" /> },
    { title: 'Progrès', desc: 'Contribution au développement.', icon: <HandThumbUpIcon className="h-6 w-6" /> },
  ];

  const partners = [
    { acronym: 'OMPI', name: 'Organisation Mondiale de la Propriété Intellectuelle' },
    { acronym: 'INPI', name: 'Institut National de la Propriété Industrielle — France' },
    { acronym: 'USPTO', name: 'Office des brevets et des marques des États-Unis' },
    { acronym: 'OEB', name: 'Office Européen des Brevets' },
    { acronym: 'OAPI', name: 'Organisation Africaine de la Propriété Intellectuelle' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-20">
      <Breadcrumb items={[{ label: "L'Office" }, { label: 'Présentation' }]} />

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <section className="relative isolate overflow-hidden rounded-[28px] bg-[#102746] px-6 py-10 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -right-24 -top-40 h-[30rem] w-[30rem] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-4 -top-20 h-[23rem] w-[23rem] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute right-20 top-10 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold tracking-[0.12em] text-blue-100">
                <span className="h-2 w-2 rounded-full bg-cyan-300" /> L'OFFICE
              </span>
              <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
                La propriété industrielle au service des idées<span className="text-cyan-300">.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-blue-100/85 sm:text-lg">
                Découvrez l'Office Malgache de la Propriété Industrielle, son histoire et son rôle dans la protection des créations à Madagascar.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#missions" className="inline-flex items-center rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-[#102746] shadow-lg shadow-cyan-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-200">
                  Nos missions <span className="ml-2">↓</span>
                </a>
                <Link to="/contact" className="inline-flex items-center rounded-xl border border-white/20 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Nous contacter
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm lg:ml-auto lg:mr-0">
              <div className="absolute -inset-5 rounded-[32px] bg-gradient-to-br from-cyan-300/20 via-blue-400/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.03] p-6 backdrop-blur-sm sm:p-7">
                <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border border-white/10" />
                <div className="absolute -right-1 -top-5 h-28 w-28 rounded-full border border-white/10" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-[#102746] shadow-lg shadow-cyan-950/20">
                  <GlobeAltIcon className="h-7 w-7" />
                </div>
                <p className="relative mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Depuis 1994</p>
                <p className="relative mt-2 text-2xl font-semibold leading-snug text-white">Un office dédié à la propriété industrielle à Madagascar.</p>
                <div className="relative mt-6 flex items-center gap-3 border-t border-white/15 pt-5">
                  <span className="text-3xl font-bold text-cyan-200">4</span>
                  <span className="text-sm leading-5 text-blue-100">grandes catégories de titres<br />de propriété industrielle</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Qui sommes-nous ?</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">L'Office Malgache de la Propriété Industrielle</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
              <p>
                Après leur indépendance, Madagascar et douze autres États africains ont signé l'Accord de Libreville du 13 septembre 1962, instituant un régime uniforme de protection de la propriété industrielle et créant l'Office Africain et Malgache de la Propriété Industrielle (OAMPI).
              </p>
              <p>
                À la suite de la dénonciation de cet accord par Madagascar le 31 janvier 1974, effective le 31 décembre 1976, un vide juridique et administratif existait en la matière. Or, la Convention de Paris prévoit que chaque pays de l'Union établisse un service spécial de la propriété industrielle.
              </p>
              <p>
                C'est dans ce contexte qu'a été promulguée <strong className="font-semibold text-slate-800">l'ordonnance n° 89-019 du 31 juillet 1989</strong>, instituant un régime de protection de la propriété industrielle à Madagascar.
              </p>
            </div>
          </div>
          <aside className="relative overflow-hidden rounded-[24px] bg-[#eaf0f8] p-6 sm:p-8 lg:p-9">
            <div className="absolute -right-12 -top-14 h-48 w-48 rounded-full border border-blue-200/70" />
            <div className="absolute -right-3 -top-5 h-32 w-32 rounded-full border border-blue-200/70" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
              <ScaleIcon className="h-6 w-6" />
            </div>
            <p className="relative mt-7 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Notre rôle</p>
            <h3 className="relative mt-2 text-2xl font-bold leading-snug text-slate-900">Administrer et promouvoir la propriété industrielle.</h3>
            <p className="relative mt-4 text-sm leading-6 text-slate-600">L'OMAPI accompagne la reconnaissance des droits et la promotion de l'activité inventive à Madagascar.</p>
            <a href="#reperes" className="relative mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-800 hover:text-blue-950">
              Parcourir notre histoire <span aria-hidden="true">↓</span>
            </a>
          </aside>
        </section>

        <section id="reperes" className="mt-14 scroll-mt-24">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Repères historiques</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Les étapes qui nous ont construits</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">De l'accord régional à la mise en activité de l'Office national.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {milestones.map((item) => (
              <article key={item.year} className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold tracking-tight text-blue-800">{item.year}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white"><CalendarIcon className="h-5 w-5" /></span>
                </div>
                <h3 className="mt-5 font-bold leading-snug text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="missions" className="mt-14 scroll-mt-24">
          <div className="mb-7 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Ce que nous faisons</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Nos attributions</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">L'OMAPI est chargé de l'administration de la propriété industrielle et de la promotion de l'activité inventive à Madagascar. À cet effet, il délivre plusieurs titres de propriété industrielle.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {titles.map((item) => (
              <article key={item.title} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} transition group-hover:scale-105`}>{item.icon}</div>
                <h3 className="mt-5 font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex gap-4 rounded-2xl border border-blue-100 bg-blue-50/80 p-5 sm:p-6">
            <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm sm:flex"><GlobeAltIcon className="h-5 w-5" /></span>
            <p className="text-sm leading-6 text-blue-950">Les titres octroyés sont publiés à la <strong>Gazette Officielle de la Propriété Industrielle (GOPI)</strong>. L'OMAPI met également à la disposition du public une documentation complète : brevets, législations et traités.</p>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-7 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Nos engagements</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Les valeurs qui nous guident</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">{item.icon}</div>
                <h3 className="mt-4 font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="relative mt-14 overflow-hidden rounded-[26px] bg-[#102746] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-40 h-[25rem] w-[25rem] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-blue-400/15 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-[#102746]"><GlobeAltIcon className="h-6 w-6" /></div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Coopération</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Partenariats internationaux</h2>
              <p className="mt-3 text-sm leading-6 text-blue-100/85">Opérationnel depuis 1994, l'OMAPI entretient des relations avec plusieurs instances de propriété intellectuelle.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {partners.map((partner) => (
                <div key={partner.acronym} className="flex min-h-[76px] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                  <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-white/10 px-2 text-xs font-extrabold tracking-wide text-cyan-200">{partner.acronym}</span>
                  <span className="text-sm leading-5 text-white/90">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 flex flex-col items-start justify-between gap-5 rounded-[24px] border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-6 sm:p-8 md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Un projet à protéger ?</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Faites le premier pas avec l'OMAPI.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Découvrez les démarches ou contactez notre équipe pour obtenir une orientation.</p>
          </div>
          <Link to="/contact" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#102746] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-blue-800">
            Nous contacter <span className="ml-2">→</span>
          </Link>
        </section>
      </main>
    </div>
  );
};

export default Presentation;
