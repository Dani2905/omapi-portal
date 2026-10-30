import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpenCheck, Lightbulb, ShieldCheck, Target, Workflow } from 'lucide-react';
const IPStrategySection: React.FC = () => {

  return (
    <section className="container mx-auto mb-16 max-w-7xl px-4 font-sans lg:px-8" aria-labelledby="pi-strategy-section-title">
      <div className="mb-8 border-b border-stone-200 pb-4">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D3273E]"><Target className="h-4 w-4" />Stratégie de PI</div>
        <h2 id="pi-strategy-section-title" className="text-2xl font-serif font-bold text-[#002B49] md:text-3xl">Comprendre, gérer et valoriser sa propriété industrielle</h2>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-stone-600 md:text-base">Une stratégie utile relie les inventions, marques, dessins ou modèles, noms commerciaux et savoir-faire industriels aux objectifs de chaque acteur : innover, développer une activité, protéger une identité ou valoriser un produit local.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.4 }} className="flex flex-col justify-between bg-[#002B49] p-7 text-white md:p-9 lg:col-span-3">
          <div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10"><Workflow className="h-6 w-6 text-amber-300" /></div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Un système pour tous les acteurs de la PI</p>
            <h3 className="mt-2 text-2xl font-serif font-bold md:text-3xl">Passez de l’idée à un plan de gestion concret</h3>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-blue-100">Faites le point sur vos actifs, votre rôle, vos objectifs, les droits de propriété, les risques et les possibilités de valorisation. Construisez un plan d’action évolutif et tenez un registre local de vos actifs PI.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-semibold text-blue-50 sm:grid-cols-4">
              {['Inventorier', 'Décider', 'Sécuriser', 'Valoriser'].map((item, index) => <div key={item} className="rounded-lg border border-white/15 bg-white/5 p-3"><span className="mb-1 block text-amber-300">0{index + 1}</span>{item}</div>)}
            </div>
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/strategie-pi" className="inline-flex items-center justify-center gap-2 bg-white px-5 py-3 text-sm font-bold text-[#002B49] transition-colors hover:bg-blue-50">Construire ma stratégie <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/guides" className="inline-flex items-center justify-center gap-2 border border-white/30 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"><BookOpenCheck className="h-4 w-4" />Lire les guides</Link>
          </div>
        </motion.article>

        <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.4, delay: 0.1 }} className="flex flex-col justify-between border border-blue-100 bg-blue-50 p-7 md:p-9 lg:col-span-2">
          <div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#002B49]"><Lightbulb className="h-6 w-6" /></div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#D3273E]">Outil d’orientation</p>
            <h3 className="mt-2 text-2xl font-serif font-bold text-[#002B49]">Vous ne savez pas quel droit regarder ?</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-700">Repérez si votre actif pourrait relever d’un brevet, d’une marque, d’un dessin ou modèle, d’un nom commercial ou d’un autre régime.</p>
          </div>
          <Link to="/identifier-pi" className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-[#D3273E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-800">Identifier mes actifs PI <ArrowRight className="h-4 w-4" /></Link>
        </motion.article>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Principle icon={Target} title="Partir de vos objectifs" text="La PI soutient une stratégie : elle ne se résume pas à accumuler des dépôts." />
        <Principle icon={ShieldCheck} title="Relier droit et gestion" text="Clarifiez la titularité, les contrats, les territoires, le budget, les échéances et les responsabilités." />
        <Principle icon={Workflow} title="Réviser dans le temps" text="Les actifs et les marchés évoluent : suivez vos droits, les usages, les risques et les occasions de valorisation." />
      </div>

    </section>
  );
};

function Principle({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return <article className="flex items-start gap-3 border border-stone-200 bg-white p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center bg-slate-100 text-[#002B49]"><Icon className="h-4 w-4" /></span><div><h3 className="text-sm font-bold text-[#002B49]">{title}</h3><p className="mt-1 text-xs leading-relaxed text-stone-600">{text}</p></div></article>;
}

export default IPStrategySection;
