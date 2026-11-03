import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, CheckCircle2, FileText, Lightbulb, LockKeyhole, Palette, Plus, RotateCcw, ShieldCheck, Tag, Trash2 } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

type Actor = 'business' | 'research' | 'industrialDesigner' | 'producer' | 'support' | 'investor';
type Stage = 'idea' | 'development' | 'market' | 'growth';
type Goal = 'protect' | 'market' | 'collaborate' | 'export' | 'license' | 'finance' | 'public-good';
type AssetKind = 'patent' | 'mark' | 'design' | 'trade-name' | 'secret' | 'gi' | 'other';
type AssetStatus = 'to-assess' | 'preparation' | 'filed' | 'registered' | 'in-use' | 'licensed';
type Priority = 'high' | 'medium' | 'low';

interface ManagedAsset {
  id: string;
  code: string;
  kind: AssetKind;
  status: AssetStatus;
  priority: Priority;
  ownerConfirmed: boolean;
  market: 'madagascar' | 'international' | 'both';
}

interface StrategyState {
  actor: Actor;
  stage: Stage;
  goals: Goal[];
  assets: ManagedAsset[];
  completed: string[];
}

interface SimpleTask {
  id: string;
  title: string;
  explanation: string;
}

const STORAGE_KEY = 'omapi_ip_strategy_v2';
const initialState: StrategyState = { actor: 'business', stage: 'idea', goals: [], assets: [], completed: [] };
const TASKS: SimpleTask[] = [
  { id: 'inventory', title: 'Repérer ce que j’ai créé ou que j’utilise', explanation: 'Notez simplement un code ou un titre court : une invention, un nom, un logo, un dessin, un produit ou un savoir-faire.' },
  { id: 'ownership', title: 'Vérifier qui a participé à la création', explanation: 'Si d’autres personnes ou organisations ont contribué, relisez les accords avant de décider qui peut déposer ou utiliser l’actif.' },
  { id: 'disclosure', title: 'Me renseigner avant de rendre une invention publique', explanation: 'Une publication ou une démonstration peut avoir des conséquences sur la possibilité de protéger une invention. Demandez conseil avant de la divulguer.' },
  { id: 'route', title: 'Demander quelle démarche correspond à mon besoin', explanation: 'L’OMAPI peut vous orienter vers la démarche adaptée. Le bon choix dépend de ce que vous souhaitez protéger et de votre projet.' },
];

const ASSET_TYPES: Array<{ value: AssetKind; label: string }> = [
  { value: 'patent', label: 'Invention technique' },
  { value: 'mark', label: 'Nom ou logo (marque)' },
  { value: 'trade-name', label: 'Nom commercial' },
  { value: 'design', label: 'Apparence d’un produit (dessin ou modèle)' },
  { value: 'secret', label: 'Savoir-faire à garder confidentiel' },
  { value: 'gi', label: 'Nom lié à l’origine d’un produit' },
  { value: 'other', label: 'Autre' },
];
const ASSET_STATUSES: Array<{ value: AssetStatus; label: string }> = [
  { value: 'to-assess', label: 'Je dois me renseigner' },
  { value: 'preparation', label: 'Je prépare la démarche' },
  { value: 'filed', label: 'La demande est déposée' },
  { value: 'registered', label: 'Le droit est accordé' },
  { value: 'in-use', label: 'J’utilise cet actif' },
  { value: 'licensed', label: 'Une autorisation ou licence existe' },
];

function loadState(): StrategyState {
  if (typeof window === 'undefined') return initialState;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;
    const parsed = JSON.parse(stored) as Partial<StrategyState>;
    return {
      actor: parsed.actor || initialState.actor,
      stage: parsed.stage || initialState.stage,
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
    };
  } catch {
    return initialState;
  }
}

const IPStrategy: React.FC = () => {
  const [data, setData] = useState<StrategyState>(loadState);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSavedMessage('');
    } catch {
      setSavedMessage('La sauvegarde locale est indisponible. Téléchargez votre plan pour le conserver.');
    }
  }, [data]);

  const completedCount = TASKS.filter((task) => data.completed.includes(task.id)).length;
  const progress = Math.round((completedCount / TASKS.length) * 100);
  const assets = useMemo(() => data.assets, [data.assets]);

  const toggleTask = (id: string) => setData((current) => ({
    ...current,
    completed: current.completed.includes(id)
      ? current.completed.filter((taskId) => taskId !== id)
      : [...current.completed, id],
  }));

  const updateAsset = <K extends keyof ManagedAsset>(id: string, field: K, value: ManagedAsset[K]) => {
    setData((current) => ({ ...current, assets: current.assets.map((asset) => asset.id === id ? { ...asset, [field]: value } : asset) }));
  };

  const addAsset = () => setData((current) => ({
    ...current,
    assets: [...current.assets, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      code: '',
      kind: 'other',
      status: 'to-assess',
      priority: 'medium',
      ownerConfirmed: false,
      market: 'madagascar',
    }],
  }));

  const removeAsset = (id: string) => setData((current) => ({ ...current, assets: current.assets.filter((asset) => asset.id !== id) }));

  const downloadPlan = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      firstSteps: TASKS.map((task) => ({ ...task, completed: data.completed.includes(task.id) })),
      assetList: data.assets.map(({ id: _id, ...asset }) => asset),
      notice: 'Outil d’information générale, pas un avis juridique. Confirmez les démarches auprès de l’OMAPI ou d’un professionnel compétent.',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'mon-premier-plan-pi.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const resetAll = () => {
    if (window.confirm('Effacer les actions cochées et les actifs enregistrés dans ce navigateur ?')) {
      window.localStorage.removeItem(STORAGE_KEY);
      setData(initialState);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 text-slate-800">
      <Breadcrumb items={[{ label: 'Ressources', path: '/ressources' }, { label: 'Stratégie de PI' }]} />
      <header className="bg-[#002B49] text-white">
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100"><Lightbulb className="h-4 w-4" /> Guide pour débuter</span>
          <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight md:text-5xl">Protéger mes idées : les premiers repères</h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-blue-100 md:text-lg">La propriété industrielle, ou PI, aide à protéger certains éléments créés ou utilisés dans une activité. Voici quelques repères simples pour commencer.</p>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4">
        <section className="-mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg md:p-8" aria-labelledby="basics-title">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#D3273E]">En quelques mots</p>
            <h2 id="basics-title" className="mt-1 text-2xl font-extrabold text-[#002B49]">Quel type de création ai-je ?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Chaque outil protège quelque chose de différent. Il ne faut pas forcément tout déposer : commencez par identifier votre besoin.</p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <BasicsCard icon={<Lightbulb className="h-5 w-5" />} title="Une invention" text="Une solution technique peut, sous certaines conditions, être protégée par un brevet." />
            <BasicsCard icon={<Tag className="h-5 w-5" />} title="Un nom ou un logo" text="Une marque aide à distinguer les produits ou services d’une entreprise." />
            <BasicsCard icon={<Palette className="h-5 w-5" />} title="L’apparence d’un produit" text="Un dessin ou modèle peut protéger son apparence, selon les conditions prévues." />
            <BasicsCard icon={<ShieldCheck className="h-5 w-5" />} title="Un savoir-faire" text="Une information utile peut rester secrète si vous prenez des mesures pour la garder confidentielle." />
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]" aria-labelledby="steps-title">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-widest text-[#D3273E]">Mon parcours simple</p><h2 id="steps-title" className="mt-1 text-2xl font-extrabold text-[#002B49]">Quatre premiers pas</h2><p className="mt-2 text-sm text-slate-600">Cochez les actions réalisées. Votre progression est enregistrée dans ce navigateur.</p></div>
              <div className="min-w-40 rounded-xl bg-blue-50 p-4"><div className="flex justify-between gap-3 text-xs font-bold text-[#002B49]"><span>Progression</span><span>{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs text-slate-600">{completedCount} sur {TASKS.length}</p></div>
            </div>
            {savedMessage && <p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{savedMessage}</p>}
            <div className="mt-5 space-y-3">
              {TASKS.map((task, index) => {
                const done = data.completed.includes(task.id);
                return <label key={task.id} className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors ${done ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 hover:border-blue-200'}`}>
                  <input type="checkbox" checked={done} onChange={() => toggleTask(task.id)} className="mt-1 h-4 w-4 shrink-0 accent-emerald-700" />
                  <span className="flex gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${done ? 'bg-emerald-700 text-white' : 'bg-blue-50 text-[#002B49]'}`}>{done ? <CheckCircle2 className="h-5 w-5" /> : index + 1}</span><span><span className={`block font-bold ${done ? 'text-emerald-900' : 'text-[#002B49]'}`}>{task.title}</span><span className="mt-1 block text-sm leading-relaxed text-slate-600">{task.explanation}</span></span></span>
                </label>;
              })}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-amber-200 bg-amber-50 p-5 md:p-6">
            <div className="flex items-start gap-3"><InfoIcon /><div><h2 className="font-extrabold text-amber-950">À retenir</h2><p className="mt-2 text-sm leading-relaxed text-amber-900">Une idée seule n’est pas toujours protégée. Les règles dépendent du type de création et des démarches effectuées.</p><p className="mt-3 text-sm leading-relaxed text-amber-900">Avant de publier une invention, de signer un accord ou de payer un dépôt, demandez des informations adaptées à votre situation.</p><Link to="/contact" className="mt-4 inline-flex rounded-lg bg-[#002B49] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#004f87]">Demander des informations</Link></div></div>
          </aside>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-8" aria-labelledby="asset-list-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-widest text-[#D3273E]">Outil facultatif</p><h2 id="asset-list-title" className="mt-1 text-2xl font-extrabold text-[#002B49]">Ma petite liste de créations</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">Utilisez un code ou un titre court. N’inscrivez pas ici le contenu d’une invention non publiée, un secret ou des données personnelles.</p></div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={downloadPlan} className="inline-flex items-center gap-2 rounded-lg bg-[#002B49] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#004f87]"><ArrowDownToLine className="h-4 w-4" />Télécharger ma liste</button>
              <button type="button" onClick={resetAll} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><RotateCcw className="h-4 w-4" />Effacer</button>
            </div>
          </div>

          {assets.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center"><FileText className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-2 font-semibold text-slate-700">Aucune création ajoutée.</p><p className="mt-1 text-sm text-slate-500">Vous pouvez commencer avec un code simple, par exemple « ACTIF-01 ».</p></div>
          ) : (
            <div className="mt-5 space-y-3">
              {assets.map((asset, index) => <article key={asset.id} className="rounded-xl border border-slate-200 p-4 md:p-5">
                <div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-[#002B49]">Création {index + 1}</h3><button type="button" onClick={() => removeAsset(asset.id)} aria-label={`Supprimer la création ${index + 1}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Supprimer</button></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="text-xs font-bold text-slate-600">Code ou titre court<input value={asset.code} onChange={(event) => updateAsset(asset.id, 'code', event.target.value)} maxLength={40} placeholder="ACTIF-01" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-[#002B49] focus:outline-none" /></label>
                  <label className="text-xs font-bold text-slate-600">De quel type s’agit-il ?<select value={asset.kind} onChange={(event) => updateAsset(asset.id, 'kind', event.target.value as AssetKind)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-800">{ASSET_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                  <label className="text-xs font-bold text-slate-600 sm:col-span-2">Où en êtes-vous ?<select value={asset.status} onChange={(event) => updateAsset(asset.id, 'status', event.target.value as AssetStatus)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-normal text-slate-800">{ASSET_STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                </div>
              </article>)}
            </div>
          )}
          <button type="button" onClick={addAsset} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-[#002B49] px-4 py-2.5 text-sm font-bold text-[#002B49] hover:bg-blue-50"><Plus className="h-4 w-4" />Ajouter une création</button>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />Cette liste reste enregistrée uniquement dans le stockage de ce navigateur. Elle n’est pas transmise à l’OMAPI. Téléchargez une copie si vous souhaitez la garder ailleurs.</p>
        </section>

        <p className="mt-8 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600">Ce guide donne des informations générales et ne remplace pas un conseil juridique. Les conditions, tarifs et démarches peuvent évoluer : vérifiez les informations auprès de l’OMAPI avant d’agir.</p>
      </main>
    </div>
  );
};

function BasicsCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-[#002B49]">{icon}</span><h3 className="mt-3 font-bold text-[#002B49]">{title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p></article>;
}

function InfoIcon() {
  return <span aria-hidden="true" className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900">i</span>;
}

export default IPStrategy;
