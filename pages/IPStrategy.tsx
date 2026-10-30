import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  FileSearch,
  Handshake,
  Lightbulb,
  LockKeyhole,
  Palette,
  RotateCcw,
  Scale,
  Search,
  ShieldCheck,
  Sprout,
  Target,
  Users,
} from 'lucide-react';
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

interface PlanTask {
  id: string;
  horizon: 'now' | 'next' | 'ongoing';
  title: string;
  detail: string;
  tags?: string[];
}

const STORAGE_KEY = 'omapi_ip_strategy_v2';
const LEGACY_STORAGE_KEY = 'omapi_ip_strategy_v1';
const initialState: StrategyState = { actor: 'business', stage: 'idea', goals: [], assets: [], completed: [] };

const ACTORS: Array<{ key: Actor; title: string; description: string; icon: React.ElementType }> = [
  { key: 'business', title: 'Entreprise, TPE/PME ou startup', description: 'Développer une offre, une marque, un avantage concurrentiel ou de nouveaux revenus.', icon: BriefcaseBusiness },
  { key: 'research', title: 'Chercheur, université ou laboratoire', description: 'Gérer les résultats de recherche, les publications, les partenariats et le transfert technologique.', icon: Lightbulb },
  { key: 'industrialDesigner', title: 'Designer industriel ou artisan', description: 'Protéger l’apparence d’un produit, son emballage, ses signes distinctifs et les choix de fabrication.', icon: Palette },
  { key: 'producer', title: 'Artisan, agriculteur ou groupement', description: 'Valoriser des produits, des savoir-faire, une origine ou une identité collective.', icon: Sprout },
  { key: 'support', title: 'Conseiller, mandataire, incubateur ou institution', description: 'Outiller les porteurs de projet, structurer les pratiques et orienter vers les bons interlocuteurs.', icon: Users },
  { key: 'investor', title: 'Investisseur, financeur ou partenaire', description: 'Vérifier les droits, les risques, les contrats et les possibilités de valorisation.', icon: Building2 },
];

const GOALS: Array<{ key: Goal; label: string }> = [
  { key: 'protect', label: 'Protéger ou sécuriser mes actifs' },
  { key: 'market', label: 'Lancer ou différencier une offre' },
  { key: 'collaborate', label: 'Collaborer, sous-traiter ou faire de la recherche avec un partenaire' },
  { key: 'export', label: 'Accéder à des marchés hors de Madagascar' },
  { key: 'license', label: 'Concéder ou obtenir une licence / valoriser une technologie' },
  { key: 'finance', label: 'Préparer un financement, un investissement ou une transmission' },
  { key: 'public-good', label: 'Soutenir une mission culturelle, sociale ou de développement local' },
];

const TASKS: PlanTask[] = [
  { id: 'inventory', horizon: 'now', title: 'Faire l’inventaire des actifs de propriété industrielle', detail: 'Repérez les inventions, marques, noms commerciaux, dessins ou modèles, savoir-faire technique et autres actifs industriels utilisés ou en développement, ainsi que les droits obtenus de tiers.', tags: ['Tous profils'] },
  { id: 'ownership', horizon: 'now', title: 'Clarifier qui a développé, qui détient et qui peut utiliser chaque actif', detail: 'Vérifiez les contributions des inventeurs, salariés, étudiants, prestataires, partenaires et financeurs. Rassemblez les cessions, licences et accords pertinents.', tags: ['Titularité'] },
  { id: 'disclosure', horizon: 'now', title: 'Éviter une divulgation qui compromettrait un dépôt', detail: 'Avant une publication, un salon, un pitch ou une démonstration technique ou de design, vérifiez les conséquences pour la nouveauté. Limitez aussi l’accès au savoir-faire confidentiel.', tags: ['Nouveauté', 'Confidentialité'] },
  { id: 'route', horizon: 'next', title: 'Choisir une voie adaptée pour chaque actif industriel prioritaire', detail: 'Selon l’actif et les objectifs : brevet, marque, dessin ou modèle, nom commercial, secret d’affaires, licence ou combinaison. Le dépôt n’est pas toujours le meilleur choix.', tags: ['Protection'] },
  { id: 'search', horizon: 'next', title: 'Vérifier les droits antérieurs et les risques liés aux droits de tiers', detail: 'Faites des recherches adaptées avant le dépôt et avant la mise sur le marché. Une autorisation ou une licence peut être nécessaire pour des éléments appartenant à autrui.', tags: ['Recherche', 'Risque'] },
  { id: 'markets', horizon: 'next', title: 'Relier protection, territoires, calendrier et budget', detail: 'Priorisez les pays et les actifs qui soutiennent réellement votre projet. Les titres sont territoriaux ; vérifiez les délais, taxes et modalités actuels auprès des offices compétents.', tags: ['Territoires', 'Budget'] },
  { id: 'commercialize', horizon: 'next', title: 'Prévoir comment l’actif sera utilisé ou valorisé', detail: 'Choisissez le modèle pertinent : fabrication, vente, prestation, licence, transfert de technologie, partenariat, marque collective ou accès partagé.', tags: ['Exploitation'] },
  { id: 'contracts', horizon: 'next', title: 'Inscrire la PI dans les contrats et les procédures internes', detail: 'Préparez des clauses et processus adaptés aux contrats de travail, de commande, de recherche, de sous-traitance, de licence, de distribution et de partenariat.', tags: ['Gouvernance'] },
  { id: 'calendar', horizon: 'ongoing', title: 'Tenir un registre, un calendrier et des preuves à jour', detail: 'Suivez titulaires, territoires, numéros, statuts, échéances de renouvellement, licences, preuves d’usage, dépenses et responsables. N’inscrivez pas ici le contenu d’un secret.', tags: ['Gestion'] },
  { id: 'monitor', horizon: 'ongoing', title: 'Surveiller le marché, les concurrents et les atteintes', detail: 'Organisez une veille proportionnée. En cas de conflit, rassemblez les preuves et faites évaluer les options par un professionnel avant d’agir.', tags: ['Veille', 'Respect des droits'] },
  { id: 'review', horizon: 'ongoing', title: 'Réexaminer périodiquement la stratégie', detail: 'Retirez les dépenses qui ne servent plus vos objectifs, repérez les actifs sous-utilisés et réajustez le portefeuille lors d’un nouveau produit, marché, contrat ou financement.', tags: ['Amélioration continue'] },
];

const ROLE_TASKS: Record<Actor, PlanTask[]> = {
  business: [
    { id: 'business-brand', horizon: 'next', title: 'Aligner marques, noms de domaine, produits et marchés', detail: 'Avant le lancement, vérifiez la disponibilité des signes et définissez les produits/services et territoires visés.', tags: ['Entreprise'] },
    { id: 'business-freedom', horizon: 'next', title: 'Prévoir une vérification de liberté d’exploitation', detail: 'Évaluez si l’offre peut être commercialisée sans empiéter sur des droits de tiers, en particulier dans les marchés prioritaires.', tags: ['Entreprise', 'Risque'] },
  ],
  research: [
    { id: 'research-disclosure', horizon: 'now', title: 'Mettre en place un circuit de déclaration des résultats', detail: 'Avant article, thèse, conférence ou démonstration, signalez les résultats potentiellement protégeables à la structure compétente et aux co-titulaires.', tags: ['Recherche'] },
    { id: 'research-collab', horizon: 'next', title: 'Définir la PI antérieure et les résultats futurs dans chaque partenariat', detail: 'Précisez les apports de départ, la propriété des résultats, les droits d’accès, les coûts de protection et les conditions de publication/transfert.', tags: ['Recherche', 'Contrats'] },
  ],
  industrialDesigner: [
    { id: 'designer-appearance', horizon: 'now', title: 'Documenter la forme et l’apparence des produits', detail: 'Conservez des vues datées des modèles, prototypes et emballages, et séparez les caractéristiques esthétiques des caractéristiques purement techniques.', tags: ['Design industriel'] },
    { id: 'designer-rights', horizon: 'next', title: 'Clarifier les droits sur les designs réalisés avec des partenaires', detail: 'Précisez par écrit les livrables, droits d’usage, territoires, adaptations, confidentialité et autorisations de dépôt dans les contrats de commande ou de sous-traitance.', tags: ['Contrats', 'Titularité'] },
  ],
  producer: [
    { id: 'producer-rules', horizon: 'next', title: 'Établir des règles communes de qualité et d’usage du signe', detail: 'Pour une marque collective ou de certification, définissez les utilisateurs, critères, contrôles, sanctions et gouvernance avant de communiquer le signe.', tags: ['Producteurs'] },
    { id: 'producer-origin', horizon: 'next', title: 'Documenter le lien entre produit, savoir-faire et territoire', detail: 'Pour un produit de terroir, réunissez les acteurs et les preuves utiles puis demandez à l’OMAPI quelle procédure et quelle autorité s’appliquent à Madagascar.', tags: ['Producteurs', 'Origine'] },
  ],
  support: [
    { id: 'support-process', horizon: 'next', title: 'Créer un parcours d’orientation et de référencement', detail: 'Aidez les porteurs à inventorier, dater, identifier les inventeurs et contributeurs et signaler les divulgations ; orientez les questions juridiques vers les professionnels/organismes compétents.', tags: ['Accompagnement'] },
    { id: 'support-training', horizon: 'ongoing', title: 'Former les équipes et suivre des indicateurs de mise en œuvre', detail: 'Mesurez la qualité des inventaires, la couverture des contrats, les recherches effectuées, les délais respectés et les actifs effectivement valorisés.', tags: ['Accompagnement'] },
  ],
  investor: [
    { id: 'investor-diligence', horizon: 'now', title: 'Organiser une diligence PI proportionnée', detail: 'Vérifiez la chaîne de titularité, les territoires, la validité et les renouvellements, les licences, sûretés, litiges, droits de tiers et conformité aux contrats.', tags: ['Investissement'] },
    { id: 'investor-value', horizon: 'next', title: 'Relier les actifs aux revenus et aux scénarios de risque', detail: 'Évaluez les dépendances à des technologies tierces, l’importance des actifs pour l’activité, les coûts futurs et les solutions alternatives.', tags: ['Investissement', 'Valeur'] },
  ],
};

const GOAL_TASKS: Record<Goal, PlanTask[]> = {
  protect: [{ id: 'goal-protect', horizon: 'next', title: 'Prioriser les actifs dont la protection soutient un objectif concret', detail: 'Comparez l’avantage attendu, la possibilité de protection, le coût total, les délais et la capacité à surveiller ou faire respecter le droit.', tags: ['Objectif : protéger'] }],
  market: [{ id: 'goal-market', horizon: 'next', title: 'Relier chaque actif à l’offre qui sera réellement mise sur le marché', detail: 'Alignez les marques, noms commerciaux, emballages, dessins ou modèles et caractéristiques techniques avec les territoires de commercialisation.', tags: ['Objectif : marché'] }],
  collaborate: [{ id: 'goal-collaborate', horizon: 'now', title: 'Négocier les règles de PI avant de commencer la collaboration', detail: 'Définissez les apports préexistants, résultats futurs, droits d’accès, publication, coûts, exploitation, confidentialité et sort des actifs à la fin du projet.', tags: ['Objectif : collaboration'] }],
  export: [{ id: 'goal-export', horizon: 'next', title: 'Définir les pays prioritaires avant toute extension de protection', detail: 'Vérifiez les règles locales, les droits antérieurs, les coûts, les délais et la voie de dépôt disponible pour chaque type d’actif et chaque marché.', tags: ['Objectif : export'] }],
  license: [{ id: 'goal-license', horizon: 'next', title: 'Préparer les conditions d’une licence ou d’un transfert', detail: 'Délimitez droits, territoire, durée, exclusivité, usages, rémunération, qualité, sous-licences, rapports et conditions de fin avec un professionnel compétent.', tags: ['Objectif : licence'] }],
  finance: [{ id: 'goal-finance', horizon: 'now', title: 'Préparer un dossier de titularité et d’état du portefeuille', detail: 'Réunissez dépôts, enregistrements, contrats, échéances, autorisations, licences, litiges et informations de valorisation sans divulguer de secrets inutiles.', tags: ['Objectif : financement'] }],
  'public-good': [{ id: 'goal-public-good', horizon: 'next', title: 'Définir la gouvernance des actifs collectifs et des savoirs partagés', detail: 'Identifiez les communautés et détenteurs concernés, les règles de représentation, d’accès et de partage des bénéfices, et consultez les autorités compétentes.', tags: ['Objectif : intérêt collectif'] }],
};

const STAGE_ADVICE: Record<Stage, string> = {
  idea: 'Au stade de l’idée : gardez une trace datée des contributions, évitez les divulgations non maîtrisées et vérifiez tôt les droits antérieurs.',
  development: 'En développement : clarifiez les droits avec l’équipe et les partenaires, organisez les décisions de protection et vérifiez les risques avant les essais et démonstrations.',
  market: 'Au lancement : sécurisez les signes distinctifs, contrats et autorisations, suivez les territoires de vente et documentez l’usage des actifs.',
  growth: 'En croissance : réévaluez les marchés, licences, coûts, renouvellements, acquisitions de droits et risques de contrefaçon ou de dépendance.',
};

const KIND_LABELS: Record<AssetKind, string> = {
  patent: 'Invention / brevet', mark: 'Marque', design: 'Dessin ou modèle industriel', 'trade-name': 'Nom commercial', secret: 'Savoir-faire / secret d’affaires', gi: 'Origine / indication géographique (à vérifier)', other: 'Autre actif industriel',
};
const STATUS_LABELS: Record<AssetStatus, string> = { 'to-assess': 'À évaluer', preparation: 'En préparation', filed: 'Demande déposée', registered: 'Enregistré / obtenu', 'in-use': 'Utilisé / exploité', licensed: 'Concédé / sous licence' };

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
      setSavedMessage('Le navigateur ne permet pas de sauvegarder ce plan. Vous pouvez le télécharger pour le conserver.');
    }
  }, [data]);

  const tasks = useMemo(() => [...TASKS, ...ROLE_TASKS[data.actor], ...data.goals.flatMap((goal) => GOAL_TASKS[goal])], [data.actor, data.goals]);
  const completeCount = tasks.filter((task) => data.completed.includes(task.id)).length;
  const progress = Math.round((completeCount / tasks.length) * 100);

  const toggleGoal = (goal: Goal) => setData((current) => ({ ...current, goals: current.goals.includes(goal) ? current.goals.filter((item) => item !== goal) : [...current.goals, goal] }));
  const toggleTask = (id: string) => setData((current) => ({ ...current, completed: current.completed.includes(id) ? current.completed.filter((item) => item !== id) : [...current.completed, id] }));
  const updateAsset = <K extends keyof ManagedAsset>(id: string, field: K, value: ManagedAsset[K]) => setData((current) => ({ ...current, assets: current.assets.map((asset) => asset.id === id ? { ...asset, [field]: value } : asset) }));
  const addAsset = () => setData((current) => ({ ...current, assets: [...current.assets, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, code: '', kind: 'other', status: 'to-assess', priority: 'medium', ownerConfirmed: false, market: 'madagascar' }] }));
  const removeAsset = (id: string) => setData((current) => ({ ...current, assets: current.assets.filter((asset) => asset.id !== id) }));

  const downloadPlan = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: { actor: data.actor, stage: data.stage, goals: data.goals },
      actionPlan: tasks.map((task) => ({ ...task, completed: data.completed.includes(task.id) })),
      assetRegister: data.assets.map(({ id: _id, ...asset }) => asset),
      notice: 'Outil d’orientation non juridique. Vérifier les procédures et l’état des droits auprès des autorités/professionnels compétents.',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'mon-plan-strategie-pi.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const resetAll = () => {
    if (window.confirm('Effacer le plan et le registre PI enregistrés dans ce navigateur ?')) {
      window.localStorage.removeItem(STORAGE_KEY);
      setData(initialState);
    }
  };

  const actorInfo = ACTORS.find((actor) => actor.key === data.actor)!;

  return (
    <div className="min-h-screen bg-slate-50 pb-16 text-slate-800">
      <Breadcrumb items={[{ label: 'Ressources', path: '/ressources' }, { label: 'Stratégie de PI' }]} />
      <header className="bg-[#002B49] text-white">
        <div className="container mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100"><Target className="h-4 w-4" /> Stratégie & gestion de la PI</span>
            <h1 className="mt-5 text-3xl font-black leading-tight md:text-5xl">Faire de la propriété industrielle un levier d’action</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-blue-100">Un parcours pratique pour inventorier, protéger, gérer et valoriser les actifs de propriété industrielle — pour les entreprises, chercheurs, designers, producteurs, accompagnateurs et financeurs.</p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-white/90"><span className="rounded-full bg-white/10 px-3 py-1.5">1. Comprendre</span><span className="rounded-full bg-white/10 px-3 py-1.5">2. Inventorier</span><span className="rounded-full bg-white/10 px-3 py-1.5">3. Décider</span><span className="rounded-full bg-white/10 px-3 py-1.5">4. Gérer & valoriser</span></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-7xl px-4">
        <section className="-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg md:p-8" aria-labelledby="profile-title">
          <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 md:flex-row md:items-start md:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-widest text-[#D3273E]">Votre point de départ</p><h2 id="profile-title" className="mt-1 text-2xl font-extrabold text-[#002B49]">Construisez un plan adapté à votre rôle</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Choisissez votre profil, votre étape et vos objectifs. Le plan ci-dessous se met à jour et vos coches sont conservées dans ce navigateur.</p></div>
            <div className="min-w-44 rounded-xl bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">Progression du plan</span><span className="text-sm font-extrabold text-[#002B49]">{progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs text-slate-500">{completeCount} / {tasks.length} actions cochées</p></div>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 font-bold text-[#002B49]">1. Quel est votre rôle principal ?</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {ACTORS.map(({ key, title, description, icon: Icon }) => <button key={key} type="button" aria-pressed={data.actor === key} onClick={() => setData((current) => ({ ...current, actor: key }))} className={`rounded-xl border p-4 text-left transition-all ${data.actor === key ? 'border-[#002B49] bg-blue-50 ring-2 ring-[#002B49]/10' : 'border-slate-200 hover:border-blue-300'}`}><span className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${data.actor === key ? 'bg-[#002B49] text-white' : 'bg-slate-100 text-[#002B49]'}`}><Icon className="h-5 w-5" /></span><span className="font-bold text-[#002B49]">{title}</span></span><span className="mt-3 block text-xs leading-relaxed text-slate-600">{description}</span></button>)}
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <fieldset className="rounded-xl border border-slate-200 p-5"><legend className="px-2 font-bold text-[#002B49]">2. À quel stade en êtes-vous ?</legend><div className="mt-2 grid grid-cols-2 gap-2">{([{ key: 'idea', label: 'Idée / recherche' }, { key: 'development', label: 'Développement / prototype' }, { key: 'market', label: 'Lancement / activité' }, { key: 'growth', label: 'Croissance / export' }] as const).map(({ key, label }) => <button key={key} type="button" aria-pressed={data.stage === key} onClick={() => setData((current) => ({ ...current, stage: key }))} className={`rounded-lg border px-3 py-3 text-sm font-semibold ${data.stage === key ? 'border-[#002B49] bg-blue-50 text-[#002B49]' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>{label}</button>)}</div><p className="mt-3 text-sm leading-relaxed text-slate-600">{STAGE_ADVICE[data.stage]}</p></fieldset>
            <fieldset className="rounded-xl border border-slate-200 p-5"><legend className="px-2 font-bold text-[#002B49]">3. Quels sont vos objectifs ?</legend><div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">{GOALS.map(({ key, label }) => <label key={key} className="flex cursor-pointer items-start gap-2 rounded-lg p-2 text-sm text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={data.goals.includes(key)} onChange={() => toggleGoal(key)} className="mt-0.5 accent-[#002B49]" />{label}</label>)}</div></fieldset>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="actions-title">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#D3273E]">Plan d’action évolutif</p><h2 id="actions-title" className="mt-1 text-2xl font-extrabold text-[#002B49]">Vos actions prioritaires</h2><p className="mt-2 max-w-3xl text-sm text-slate-600">Un plan commence par la connaissance des actifs, la titularité et la maîtrise des risques — puis relie protection et objectifs de développement.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={downloadPlan} className="inline-flex items-center gap-2 rounded-lg bg-[#002B49] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#004f87]"><ArrowDownToLine className="h-4 w-4" />Télécharger mon plan</button><button type="button" onClick={resetAll} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-white"><RotateCcw className="h-4 w-4" />Effacer</button></div></div>
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950"><strong>Repère pour votre profil :</strong> {actorInfo.description} {data.goals.includes('export') && 'Pensez à sélectionner vos pays prioritaires et à vérifier chaque voie territoriale.'} {data.goals.includes('collaborate') && 'Avant de commencer, écrivez les apports, droits d’accès et droits sur les résultats futurs.'}</div>
          {savedMessage && <p role="status" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{savedMessage}</p>}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            {([
              ['now', 'À faire en premier', 'Clarifier ce que vous avez et qui en détient les droits.'],
              ['next', 'À organiser ensuite', 'Choisir une réponse cohérente avec le marché, le risque et les moyens.'],
              ['ongoing', 'À suivre régulièrement', 'Maintenir les droits utiles, exploiter les actifs et réviser les choix.'],
            ] as const).map(([horizon, title, subtitle]) => <div key={horizon} className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4"><h3 className="font-extrabold text-[#002B49]">{title}</h3><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div><div className="space-y-3">{tasks.filter((task) => task.horizon === horizon).map((task) => { const done = data.completed.includes(task.id); return <label key={task.id} className={`block cursor-pointer rounded-lg border p-4 transition-colors ${done ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 hover:border-blue-200'}`}><span className="flex items-start gap-3"><input type="checkbox" checked={done} onChange={() => toggleTask(task.id)} className="mt-1 h-4 w-4 accent-emerald-700" /><span><span className={`block text-sm font-bold ${done ? 'text-emerald-900 line-through decoration-emerald-700/50' : 'text-[#002B49]'}`}>{task.title}</span><span className="mt-1 block text-xs leading-relaxed text-slate-600">{task.detail}</span>{task.tags && <span className="mt-2 flex flex-wrap gap-1">{task.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{tag}</span>)}</span>}</span></span></label>; })}</div></div>)}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 md:p-8" aria-labelledby="register-title">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#D3273E]">Gestion du portefeuille</p><h2 id="register-title" className="mt-1 text-2xl font-extrabold text-[#002B49]">Registre simple de vos actifs de propriété industrielle</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">Suivez les éléments clés pour vous organiser. Utilisez un code interne plutôt qu’un nom sensible et ne saisissez jamais le contenu d’une invention non publiée ou d’un secret.</p></div><button type="button" onClick={addAsset} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#D3273E] px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800"><ClipboardList className="h-4 w-4" />Ajouter un actif</button></div>
          {data.assets.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><FileSearch className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-slate-700">Votre registre est vide.</p><p className="mt-1 text-sm text-slate-500">Ajoutez un code d’actif (par exemple ACTIF-01), son type, son statut et sa priorité.</p></div> : <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">{data.assets.map((asset, index) => <article key={asset.id} className="rounded-xl border border-slate-200 p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-[#002B49]">Actif {index + 1}</h3><button type="button" onClick={() => removeAsset(asset.id)} className="text-xs font-bold text-red-700 hover:underline">Supprimer</button></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">Code interne<input value={asset.code} onChange={(event) => updateAsset(asset.id, 'code', event.target.value)} maxLength={40} placeholder="ACTIF-01 (évitez les détails confidentiels)" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800 focus:border-[#002B49] focus:outline-none" /></label><label className="text-xs font-bold text-slate-600">Type d’actif<select value={asset.kind} onChange={(event) => updateAsset(asset.id, 'kind', event.target.value as AssetKind)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800">{Object.entries(KIND_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Statut<select value={asset.status} onChange={(event) => updateAsset(asset.id, 'status', event.target.value as AssetStatus)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800">{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="text-xs font-bold text-slate-600">Priorité<select value={asset.priority} onChange={(event) => updateAsset(asset.id, 'priority', event.target.value as Priority)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800"><option value="high">Haute</option><option value="medium">Moyenne</option><option value="low">Basse</option></select></label><label className="text-xs font-bold text-slate-600">Territoire ciblé<select value={asset.market} onChange={(event) => updateAsset(asset.id, 'market', event.target.value as ManagedAsset['market'])} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800"><option value="madagascar">Madagascar</option><option value="international">Hors Madagascar</option><option value="both">Madagascar et autres pays</option></select></label><label className="flex items-center gap-2 self-end rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-700"><input type="checkbox" checked={asset.ownerConfirmed} onChange={(event) => updateAsset(asset.id, 'ownerConfirmed', event.target.checked)} className="accent-[#002B49]" />Titularité vérifiée</label></div></article>)}</div>}
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />Le registre et les coches sont enregistrés uniquement dans le stockage local de ce navigateur. Ils ne sont pas transmis à l’OMAPI. Effacer les données du navigateur peut les supprimer ; téléchargez régulièrement une copie si nécessaire.</p>
        </section>

        <section className="mt-12" aria-labelledby="framework-title">
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-[#D3273E]">Cadre de décision</p><h2 id="framework-title" className="mt-1 text-2xl font-extrabold text-[#002B49]">Une bonne stratégie n’est pas « déposer partout »</h2><p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">Elle relie chaque actif à un objectif, choisit un moyen adapté et prévoit la gestion après la protection. Les réponses varient selon la loi, le secteur, les moyens et le marché.</p></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StrategyCard icon={Search} title="Connaître" body="Qu’est-ce qui est créé, utilisé, acheté, financé ou reçu d’un partenaire ? Quels droits antérieurs ou dépendances existent ?" />
            <StrategyCard icon={Scale} title="Décider" body="Quel actif est stratégique ? Qui en détient les droits ? Protection enregistrée, confidentialité, publication, accès sous licence ou combinaison ?" />
            <StrategyCard icon={ShieldCheck} title="Sécuriser" body="Quels territoires, échéances, accords, budgets, preuves, mesures de confidentialité et responsabilités faut-il prévoir ?" />
            <StrategyCard icon={Handshake} title="Valoriser & suivre" body="Comment l’actif contribue-t-il à une offre, un transfert, une licence, une collaboration, un objectif culturel ou un bien collectif ? Que faut-il réviser ?" />
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-blue-100 bg-blue-50 p-5"><h3 className="font-extrabold text-[#002B49]">Repères malgaches</h3><p className="mt-2 text-sm leading-relaxed text-slate-700">L’OMAPI administre les brevets, marques, dessins ou modèles industriels et noms commerciaux. À Madagascar, la stratégie de propriété industrielle doit donc tenir compte des secteurs, des utilisateurs, des marchés et des ressources disponibles. Les indications géographiques ou autres mécanismes peuvent demander une confirmation préalable auprès des autorités compétentes. Vérifiez toujours l’état actuel des lois et des services.</p><div className="mt-3 flex flex-wrap gap-4 text-sm font-bold"><Link to="/identifier-pi" className="inline-flex items-center gap-1 text-[#002B49] hover:underline">Identifier mes droits possibles <ArrowRight className="h-4 w-4" /></Link><Link to="/international" className="inline-flex items-center gap-1 text-[#002B49] hover:underline">Explorer l’international <ArrowRight className="h-4 w-4" /></Link></div></article>
            <article className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-extrabold text-amber-950">Sécuriser avant d’agir</h3><p className="mt-2 text-sm leading-relaxed text-amber-950">Avant de divulguer une invention ou un design, vérifiez les effets sur la nouveauté. Avant d’utiliser la marque, le dessin ou modèle, le procédé ou la technologie d’un tiers, vérifiez les autorisations. Pour toute décision juridique, fiscale ou de dépôt, confirmez les exigences en vigueur auprès de l’OMAPI ou d’un professionnel.</p><Link to="/contact" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-amber-950 underline">Contacter l’OMAPI <ArrowRight className="h-4 w-4" /></Link></article>
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-5 md:p-8" aria-labelledby="resources-title">
          <div className="flex items-center gap-3"><BookOpenCheck className="h-6 w-6 text-[#D3273E]" /><div><p className="text-xs font-bold uppercase tracking-widest text-[#D3273E]">Pour approfondir</p><h2 id="resources-title" className="text-xl font-extrabold text-[#002B49]">Méthodes et ressources de référence</h2></div></div>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600">Cette page adapte des repères de gestion stratégique aux titres et démarches de propriété industrielle. Les ressources ci-dessous portent sur l’inventaire, les choix de protection, la gestion et la valorisation des brevets, marques, dessins ou modèles et noms commerciaux.</p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SourceCard href="https://www.wipo.int/fr/web/wipo-magazine/articles/ip-and-business-managing-ip-as-a-set-of-business-assets-36097" title="OMPI : gérer les brevets et marques stratégiquement" text="Relier les dépôts, les coûts et l’exploitation des titres industriels aux objectifs commerciaux." />
            <SourceCard href="http://www.omapi.mg/" title="OMAPI Madagascar" text="Office national chargé des brevets, marques, dessins ou modèles industriels et noms commerciaux." />
            <SourceCard href="http://www.omapi.mg/brevet.html" title="OMAPI : brevet d’invention" text="Critères, démarches et informations sur les inventions brevetables." />
            <SourceCard href="http://www.omapi.mg/marque.html" title="OMAPI : marques" text="Signes distinctifs, produits/services et recherche d’antériorité." />
            <SourceCard href="http://www.omapi.mg/dessin_ou_model.html" title="OMAPI : dessins et modèles" text="Protection de l’apparence ornementale ou esthétique d’un produit." />
            <SourceCard href="http://www.omapi.mg/noms_commerciaux.html" title="OMAPI : noms commerciaux" text="Recherche et enregistrement des dénominations commerciales." />
          </div>
          <div className="mt-5 flex flex-wrap gap-3"><Link to="/guides" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-[#002B49] hover:bg-slate-50"><BookOpenCheck className="h-4 w-4" />Guides OMAPI</Link><Link to="/contact" className="inline-flex items-center gap-2 rounded-lg bg-[#D3273E] px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800">Demander une orientation <ArrowRight className="h-4 w-4" /></Link></div>
        </section>

        <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-relaxed text-slate-500">Ce système est un outil pédagogique d’organisation, pas un avis juridique, une recherche d’antériorité, une analyse de liberté d’exploitation ou une garantie d’enregistrement. Les règles varient selon le droit, le territoire et les faits. Les informations enregistrées localement restent sous le contrôle de l’utilisateur.</p>
      </div>
    </div>
  );
};

function StrategyCard({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#002B49]"><Icon className="h-5 w-5" /></span><h3 className="mt-3 font-extrabold text-[#002B49]">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p></article>;
}

function SourceCard({ href, title, text }: { href: string; title: string; text: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="group rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"><span className="flex items-start justify-between gap-2"><strong className="text-sm text-[#002B49]">{title}</strong><ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#002B49]" /></span><span className="mt-2 block text-xs leading-relaxed text-slate-600">{text}</span></a>;
}

export default IPStrategy;
