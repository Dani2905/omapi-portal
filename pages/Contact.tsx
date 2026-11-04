import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';

type ContactIconName = 'pin' | 'phone' | 'mail' | 'clock' | 'arrow';

const ContactIcon: React.FC<{ name: ContactIconName; className?: string }> = ({ name, className = 'h-5 w-5' }) => {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    viewBox: '0 0 24 24',
    'aria-hidden': true as const,
  };

  const paths: Record<ContactIconName, React.ReactNode> = {
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <path d="M21 16.4v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 10.2 18a19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 1.9 3.2 2 2 0 0 1 3.9 1h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L7.8 9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 .9 2.5Z" />,
    mail: <><rect x="2.5" y="4.5" width="19" height="15" rx="2" /><path d="m3.5 6 8.5 6.5L20.5 6" /></>,
    clock: <><circle cx="12" cy="12" r="9.2" /><path d="M12 7v5l3.5 2" /></>,
    arrow: <><path d="M7 17 17 7M8 7h9v9" /></>,
  };

  return <svg {...common} className={className}>{paths[name]}</svg>;
};

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message envoyé avec succès ! (Simulation)');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10';

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-20">
      <Breadcrumb items={[{ label: 'Contact' }]} />

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <section className="relative isolate overflow-hidden rounded-[28px] bg-[#102746] px-6 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -right-20 -top-40 h-[28rem] w-[28rem] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-4 -top-24 h-[24rem] w-[24rem] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold tracking-wide text-blue-100">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(103,232,249,0.12)]" />
                OFFICE MALGACHE DE LA PROPRIÉTÉ INDUSTRIELLE
              </div>
              <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
                Contactez-nous<span className="text-cyan-300">.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-blue-100/85 sm:text-lg">
                Une question sur une marque, un brevet ou un dessin et modèle ? Notre équipe est à votre écoute.
              </p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {['Marques', 'Brevets', 'Dessins & modèles'].map((item) => (
                  <span key={item} className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-white/90">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm lg:ml-auto lg:mr-0">
              <div className="absolute -inset-5 rounded-[32px] bg-gradient-to-br from-cyan-300/20 via-blue-400/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.03] p-6 backdrop-blur-sm sm:p-7">
                <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border border-white/10" />
                <div className="absolute -right-3 -top-5 h-28 w-28 rounded-full border border-white/10" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-[#102746] shadow-lg shadow-cyan-950/20">
                  <ContactIcon name="mail" className="h-6 w-6" />
                </div>
                <p className="relative mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Restons en contact</p>
                <p className="relative mt-2 text-2xl font-semibold leading-snug text-white">Votre démarche commence par une question.</p>
                <a href="mailto:omapi@moov.mg" className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-cyan-200">
                  Écrire à l’OMAPI <ContactIcon name="arrow" className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid items-start gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:gap-9">
          <div className="space-y-5">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Nos coordonnées</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Nous sommes à votre écoute</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">Choisissez le moyen qui vous convient pour joindre notre équipe.</p>
            </div>

            <a href="tel:+261344315236" className="group flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                <ContactIcon name="phone" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Téléphone</span>
                <span className="mt-1 block text-lg font-bold text-slate-900">(+261 34) 43 152 36</span>
                <span className="mt-1 block text-xs text-slate-500">Appuyez pour appeler</span>
              </span>
              <ContactIcon name="arrow" className="mt-1 h-4 w-4 text-slate-400 transition group-hover:text-blue-700" />
            </a>

            <a href="mailto:omapi@moov.mg" className="group flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 transition group-hover:bg-cyan-600 group-hover:text-white">
                <ContactIcon name="mail" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Adresse e-mail</span>
                <span className="mt-1 block break-all text-lg font-bold text-slate-900">omapi@moov.mg</span>
                <span className="mt-1 block text-xs text-slate-500">Pour vos demandes d’information</span>
              </span>
              <ContactIcon name="arrow" className="mt-1 h-4 w-4 text-slate-400 transition group-hover:text-blue-700" />
            </a>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <ContactIcon name="pin" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notre adresse</p>
                  <p className="mt-1 font-bold text-slate-900">LOT VH 69</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Volosarika Ambanidia<br />Antananarivo 101, Madagascar</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl bg-[#eaf0f8] p-5 sm:p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <ContactIcon name="clock" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Horaires d’accueil</p>
                <p className="mt-1 font-bold text-slate-900">Lundi – vendredi, 08h00 – 16h00</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Fermé le week-end et les jours fériés</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-xl shadow-slate-900/[0.06]">
            <div className="border-b border-slate-100 px-6 py-6 sm:px-9 sm:py-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Écrivez-nous</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Parlons de votre projet</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Décrivez votre demande, nous vous orienterons.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500">Formulaire de contact</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-9 sm:py-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">Nom complet</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={fieldClass}
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Adresse e-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={fieldClass}
                    placeholder="vous@exemple.mg"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-slate-700">Sujet de votre demande</label>
                <select id="subject" name="subject" required value={formData.subject} onChange={handleChange} className={fieldClass}>
                  <option value="">Sélectionnez un sujet</option>
                  <option value="marque">Dépôt de marque</option>
                  <option value="brevet">Dépôt de brevet</option>
                  <option value="dessin">Dessin & modèle</option>
                  <option value="autre">Autre demande</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-semibold text-slate-700">Votre message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className={`${fieldClass} resize-y`}
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-xs leading-5 text-slate-500">Les champs marqués sont nécessaires pour préparer votre demande.</p>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102746] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20">
                  Envoyer le message <ContactIcon name="arrow" className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
