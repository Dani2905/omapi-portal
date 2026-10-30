import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  Globe2,
  Lightbulb,
  LockKeyhole,
  MapPin,
  Package,
  Printer,
  RotateCcw,
  ShieldCheck,
  Tag,
  Users,
  AlertTriangle,
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

type AssetKey = 'invention' | 'mark' | 'design' | 'tradeName' | 'secret' | 'origin';
type Choice = 'not-yet' | 'already' | 'unsure' | '';
type Ownership = 'individual' | 'team' | 'employee' | 'unsure' | '';
type Territory = 'madagascar' | 'international' | '';

const ASSETS: Array<{ key: AssetKey; title: string; prompt: string; example: string; icon: React.ElementType }> = [
  { key: 'invention', title: 'Une solution technique', prompt: 'Comment un produit ou un procédé fonctionne.', example: 'Un dispositif, une machine, une composition ou une méthode technique.', icon: Lightbulb },
  { key: 'mark', title: 'Un nom, un logo ou un signe', prompt: 'Ce qui permet aux clients de reconnaître vos produits ou services.', example: 'Nom de marque, logo, slogan ou signe distinctif.', icon: Tag },
  { key: 'design', title: 'L’apparence d’un produit', prompt: 'Son aspect visuel, indépendamment de son fonctionnement.', example: 'Forme, lignes, motifs, couleurs ou emballage.', icon: Package },
  { key: 'tradeName', title: 'Le nom de votre entreprise', prompt: 'La dénomination utilisée pour identifier l’entreprise ou l’établissement.', example: 'Nom commercial distinctif d’une activité.', icon: Building2 },
  { key: 'secret', title: 'Un savoir-faire confidentiel', prompt: 'Une information utile à votre activité que vous voulez garder secrète.', example: 'Recette, méthode, processus, fichier client ou savoir-faire.', icon: LockKeyhole },
  { key: 'origin', title: 'Un produit lié à son origine', prompt: 'Sa qualité ou sa réputation dépend d’un lieu géographique.', example: 'Produit dont les caractéristiques sont liées à une région.', icon: MapPin },
];

const RECOMMENDATIONS: Record<AssetKey, { title: string; category: string; intro: string; checks: string[]; path?: string; officialUrl?: string; note?: string }> = {
  invention: {
    title: 'Brevet d’invention', category: 'Titre de propriété industrielle OMAPI',
    intro: 'À explorer si vous avez une solution technique concrète à un problème. L’OMAPI indique notamment les critères de nouveauté, d’activité inventive et d’application industrielle.',
    checks: ['Décrivez le problème technique et la solution, sans la publier.', 'Faites vérifier l’état de la technique et la brevetabilité.', 'Préparez une description précise, les revendications et, si nécessaire, des dessins.'],
    path: '/service/brevet', officialUrl: 'http://www.omapi.mg/brevet.html',
    note: 'Une présentation publique avant le dépôt peut compromettre la nouveauté. Si vous avez déjà divulgué l’invention, demandez rapidement conseil à l’OMAPI ou à un mandataire.',
  },
  mark: {
    title: 'Marque de produits ou de services', category: 'Titre de propriété industrielle OMAPI',
    intro: 'À explorer pour protéger un signe qui distingue vos produits ou services de ceux d’autres entreprises. Une marque peut notamment être verbale, figurative ou combiner texte et logo.',
    checks: ['Choisissez le signe exact à protéger (nom, logo ou combinaison).', 'Définissez les produits et services concernés.', 'Recherchez les signes identiques ou similaires avant le dépôt.'],
    path: '/service/marque', officialUrl: 'http://www.omapi.mg/marque.html',
  },
  design: {
    title: 'Dessin ou modèle industriel', category: 'Titre de propriété industrielle OMAPI',
    intro: 'À explorer pour protéger l’apparence ornementale ou esthétique d’un produit : forme, surface, lignes ou couleurs. L’OMAPI précise que le dessin ou modèle doit être nouveau ou original et ne pas être fonctionnel.',
    checks: ['Rassemblez des vues claires de l’apparence à protéger.', 'Séparez les caractéristiques visuelles des caractéristiques purement techniques.', 'Faites vérifier la nouveauté avant toute diffusion publique.'],
    path: '/service/dessin', officialUrl: 'http://www.omapi.mg/dessin_ou_model.html',
    note: 'Ne publiez pas le produit ou ses visuels avant d’avoir vérifié les conséquences sur la nouveauté.',
  },
  tradeName: {
    title: 'Nom commercial', category: 'Titre de propriété industrielle OMAPI',
    intro: 'À explorer pour la dénomination sous laquelle votre entreprise ou établissement est connu. Le nom commercial ne remplace pas automatiquement l’enregistrement d’une marque de produit ou de service.',
    checks: ['Identifiez le nom utilisé pour désigner l’entreprise ou l’établissement.', 'Vérifiez les noms commerciaux et marques antérieurs.', 'Préparez les informations sur l’activité de l’entreprise.'],
    path: '/service/nom-commercial', officialUrl: 'http://www.omapi.mg/noms_commerciaux.html',
  },
  secret: {
    title: 'Secret d’affaires / savoir-faire confidentiel', category: 'Protection par la confidentialité — pas un titre OMAPI',
    intro: 'À envisager pour une information commerciale ou technique qui a de la valeur parce qu’elle reste secrète. Il n’y a pas de certificat OMAPI de secret : la protection dépend de mesures réelles de confidentialité et du droit applicable.',
    checks: ['Limitez l’accès aux personnes qui en ont besoin.', 'Marquez les documents confidentiels et sécurisez les accès.', 'Utilisez des engagements de confidentialité avant tout partage.'],
    officialUrl: 'https://www.wipo.int/en/web/trade-secrets/tradesecrets_faqs',
    note: 'Un secret ne protège pas contre une découverte indépendante ou, selon le cas, l’analyse licite d’un produit. Comparez cette option au brevet avant toute divulgation.',
  },
  origin: {
    title: 'Indication géographique — à vérifier', category: 'Piste de protection liée à l’origine',
    intro: 'Une indication géographique peut être pertinente lorsqu’un produit est associé à un territoire et que sa qualité, sa réputation ou une autre caractéristique est essentiellement liée à cette origine.',
    checks: ['Délimitez l’origine géographique et le produit concerné.', 'Documentez les caractéristiques ou la réputation liées au territoire.', 'Demandez à l’OMAPI quelle procédure et quelle autorité s’appliquent à Madagascar.'],
    officialUrl: 'https://www.wipo.int/geo_indications/fr/',
    note: 'Les pages de services de l’OMAPI consultées listent les brevets, marques, dessins ou modèles et noms commerciaux ; elles ne décrivent pas ici une procédure de dépôt d’indication géographique.',
  },
};

const IdentifyIndustrialProperty: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedAssets, setSelectedAssets] = useState<AssetKey[]>([]);
  const [territory, setTerritory] = useState<Territory>('');
  const [disclosure, setDisclosure] = useState<Choice>('');
  const [ownership, setOwnership] = useState<Ownership>('');
  const [canKeepSecret, setCanKeepSecret] = useState<Choice>('');
  const [copied, setCopied] = useState(false);

  const needsNoveltyCheck = selectedAssets.includes('invention') || selectedAssets.includes('design');
  const canContinue = step === 1
    ? selectedAssets.length > 0
    : step === 2
      ? Boolean(territory && ownership && (!needsNoveltyCheck || disclosure) && (!selectedAssets.includes('secret') || canKeepSecret))
      : true;

  const toggleAsset = (key: AssetKey) => {
    setSelectedAssets((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  const summary = useMemo(() => {
    const names = selectedAssets.map((key) => RECOMMENDATIONS[key].title);
    const lines = [
      'Mon premier repérage de propriété industrielle',
      `Actifs identifiés : ${names.join(', ')}`,
      `Territoire visé : ${territory === 'international' ? 'Madagascar et/ou d’autres pays' : 'Madagascar'}`,
      `Développement / inventeur : ${ownership === 'individual' ? 'individuel' : ownership === 'team' ? 'en équipe ou en collaboration' : ownership === 'employee' ? 'dans un cadre salarié ou contractuel' : 'à clarifier'}`,
    ];
    if (needsNoveltyCheck) lines.push(`Divulgation publique : ${disclosure === 'not-yet' ? 'pas encore' : disclosure === 'already' ? 'oui, déjà divulguée' : 'incertaine'}`);
    lines.push('À confirmer avec l’OMAPI ou un professionnel avant tout dépôt.');
    return lines.join('\n');
  }, [selectedAssets, territory, ownership, needsNoveltyCheck, disclosure]);

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.print();
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedAssets([]);
    setTerritory('');
    setDisclosure('');
    setOwnership('');
    setCanKeepSecret('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 text-slate-800">
      <Breadcrumb items={[{ label: 'Procédures' }, { label: 'Identifier ma propriété industrielle' }]} />

      <section className="bg-[#002B49] text-white">
        <div className="container mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100">
              <ShieldCheck className="h-4 w-4" /> Outil d’orientation OMAPI
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">Quel titre de propriété industrielle pour mon actif&nbsp;?</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-blue-100 md:text-xl">
              Répondez à quelques questions simples pour repérer les droits qui pourraient correspondre à votre projet, puis obtenez une première liste d’étapes.
            </p>
            <p className="mt-4 text-sm text-blue-200">Environ 2 minutes · Plusieurs protections peuvent se compléter · Aucun renseignement personnel demandé</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4">
        <section className="-mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg md:p-8" aria-labelledby="wizard-title">
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#D3273E]">Étape {step} sur 3</p>
              <h2 id="wizard-title" className="mt-1 text-xl font-extrabold text-[#002B49] md:text-2xl">
                {step === 1 ? 'Qu’est-ce que vous souhaitez protéger ?' : step === 2 ? 'Votre situation et votre objectif' : 'Votre première feuille de route'}
              </h2>
            </div>
            <div className="flex items-center gap-2" aria-label={`Étape ${step} sur 3`}>
              {[1, 2, 3].map((item) => <span key={item} className={`h-2.5 rounded-full transition-all ${item === step ? 'w-10 bg-[#D3273E]' : item < step ? 'w-6 bg-[#002B49]' : 'w-6 bg-slate-200'}`} />)}
            </div>
          </div>

          {step === 1 && (
            <>
              <p className="mb-6 max-w-3xl text-slate-600">Cochez tout ce qui correspond. Un même produit peut combiner une invention, une marque, un dessin ou modèle et un nom commercial.</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {ASSETS.map(({ key, title, prompt, example, icon: Icon }) => {
                  const selected = selectedAssets.includes(key);
                  return (
                    <button key={key} type="button" aria-pressed={selected} onClick={() => toggleAsset(key)} className={`group relative rounded-xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${selected ? 'border-[#002B49] bg-blue-50 ring-2 ring-[#002B49]/15' : 'border-slate-200 bg-white hover:border-blue-300'}`}>
                      <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${selected ? 'bg-[#002B49] text-white' : 'bg-slate-100 text-[#002B49]'}`}><Icon className="h-5 w-5" /></span>
                      <span className="block font-bold text-[#002B49]">{title}</span>
                      <span className="mt-1 block text-sm text-slate-600">{prompt}</span>
                      <span className="mt-3 block text-xs leading-relaxed text-slate-500">{example}</span>
                      <span className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border ${selected ? 'border-[#002B49] bg-[#002B49] text-white' : 'border-slate-300 text-transparent'}`}><Check className="h-4 w-4" /></span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900"><strong>Astuce :</strong> décrivez ce que vous voulez protéger, pas seulement le nom de votre produit. Le nom, son apparence et sa technologie peuvent relever de droits différents.</div>
            </>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <fieldset className="rounded-xl border border-slate-200 p-5">
                <legend className="px-2 font-bold text-[#002B49]">Où souhaitez-vous être protégé(e) ?</legend>
                <div className="mt-3 space-y-3">
                  <ChoiceCard selected={territory === 'madagascar'} onClick={() => setTerritory('madagascar')} title="À Madagascar" description="Je vise principalement le marché malgache." />
                  <ChoiceCard selected={territory === 'international'} onClick={() => setTerritory('international')} title="À Madagascar et à l’étranger" description="Je vise aussi un ou plusieurs marchés hors de Madagascar." />
                </div>
              </fieldset>

              <fieldset className="rounded-xl border border-slate-200 p-5">
                <legend className="px-2 font-bold text-[#002B49]">Qui a créé ou inventé l’actif ?</legend>
                <div className="mt-3 space-y-2">
                  <RadioChoice name="ownership" value="individual" selected={ownership} onChange={(value) => setOwnership(value as Ownership)} label="Moi-même, seul(e)" />
                  <RadioChoice name="ownership" value="team" selected={ownership} onChange={(value) => setOwnership(value as Ownership)} label="Une équipe, un associé ou un partenaire" />
                  <RadioChoice name="ownership" value="employee" selected={ownership} onChange={(value) => setOwnership(value as Ownership)} label="Dans le cadre d’un emploi ou d’un contrat" />
                  <RadioChoice name="ownership" value="unsure" selected={ownership} onChange={(value) => setOwnership(value as Ownership)} label="Je ne suis pas sûr(e)" />
                </div>
              </fieldset>

              {needsNoveltyCheck && (
                <fieldset className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                  <legend className="px-2 font-bold text-[#002B49]">L’invention ou l’apparence a-t-elle déjà été montrée au public ?</legend>
                  <p className="mb-3 text-sm text-slate-600">Pensez aux réseaux sociaux, ventes, salons, démonstrations, vidéos, mémoire ou pitch ouvert. Ne décrivez pas l’invention ici.</p>
                  <div className="space-y-2">
                    <RadioChoice name="disclosure" value="not-yet" selected={disclosure} onChange={(value) => setDisclosure(value as Choice)} label="Non, pas encore" />
                    <RadioChoice name="disclosure" value="already" selected={disclosure} onChange={(value) => setDisclosure(value as Choice)} label="Oui, déjà divulguée" />
                    <RadioChoice name="disclosure" value="unsure" selected={disclosure} onChange={(value) => setDisclosure(value as Choice)} label="Je ne sais pas / c’était sous accord de confidentialité" />
                  </div>
                </fieldset>
              )}

              {selectedAssets.includes('secret') && (
                <fieldset className="rounded-xl border border-slate-200 p-5">
                  <legend className="px-2 font-bold text-[#002B49]">Pouvez-vous garder cette information confidentielle ?</legend>
                  <div className="mt-3 space-y-2">
                    <RadioChoice name="secret" value="not-yet" selected={canKeepSecret} onChange={(value) => setCanKeepSecret(value as Choice)} label="Oui, avec des mesures de confidentialité" />
                    <RadioChoice name="secret" value="already" selected={canKeepSecret} onChange={(value) => setCanKeepSecret(value as Choice)} label="Non, le produit révèle déjà le secret" />
                    <RadioChoice name="secret" value="unsure" selected={canKeepSecret} onChange={(value) => setCanKeepSecret(value as Choice)} label="Je ne sais pas encore" />
                  </div>
                </fieldset>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-7">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 md:p-6">
                <div className="flex items-start gap-3"><BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#002B49]" /><div><h3 className="text-lg font-extrabold text-[#002B49]">Votre repérage initial</h3><p className="mt-1 text-sm leading-relaxed text-slate-700">Ce résultat est une orientation pédagogique, pas une décision d’enregistrement ni un avis juridique. Vérifiez les critères et la procédure auprès de l’OMAPI.</p></div></div>
                <div className="mt-4 flex flex-wrap gap-2">{selectedAssets.map((key) => <span key={key} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#002B49] ring-1 ring-blue-200">{RECOMMENDATIONS[key].title}</span>)}</div>
                <p className="mt-3 text-sm text-slate-600">Territoire visé : <strong>{territory === 'international' ? 'Madagascar et autres pays à sélectionner' : 'Madagascar'}</strong></p>
              </div>

              {needsNoveltyCheck && disclosure !== 'not-yet' && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><h3 className="font-bold">À traiter en priorité : la nouveauté</h3><p className="mt-1 text-sm leading-relaxed">Une divulgation publique peut affecter la nouveauté d’une invention ou d’un dessin/modèle. Les réponses ne permettent pas de conclure si votre droit est perdu : ne publiez pas davantage de détails et demandez rapidement à l’OMAPI ou à un mandataire d’examiner la situation.</p></div></div>
              )}

              {ownership === 'team' || ownership === 'employee' || ownership === 'unsure' ? (
                <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-5 text-violet-950"><Users className="mt-0.5 h-5 w-5 shrink-0" /><p className="text-sm leading-relaxed"><strong>Vérifiez la titularité :</strong> si plusieurs personnes ont contribué ou si la création a été faite dans le cadre d’un emploi, d’une commande ou d’un partenariat, relisez les contrats et clarifiez par écrit qui peut déposer et exploiter les droits.</p></div>
              ) : null}

              {territory === 'international' && (
                <div className="flex items-start gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-5 text-cyan-950"><Globe2 className="mt-0.5 h-5 w-5 shrink-0" /><p className="text-sm leading-relaxed"><strong>La protection est territoriale :</strong> un dépôt à Madagascar ne signifie pas automatiquement une protection partout. Selon le droit choisi, des voies internationales existent notamment pour les marques (système de Madrid) et les brevets (PCT). Identifiez les pays prioritaires et vérifiez les délais avant divulgation. <Link to="/international" className="font-bold underline">Voir les procédures internationales de l’OMAPI.</Link></p></div>
              )}

              {selectedAssets.includes('secret') && canKeepSecret !== 'already' && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-bold text-[#002B49]">Votre option confidentialité</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">Limitez l’accès, marquez les documents confidentiels et utilisez des accords de confidentialité lorsque nécessaire. Un secret d’affaires n’empêche pas toujours une découverte indépendante ou une analyse licite par un tiers.</p></div>
              )}

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {selectedAssets.map((key) => <RecommendationCard key={key} assetKey={key} territory={territory} />)}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-extrabold text-[#002B49]">Prochaines étapes utiles</h3>
                <ol className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2"><span className="font-bold text-[#D3273E]">1.</span> Listez séparément vos actifs : technologie, marque, nom commercial, apparence et savoir-faire industriel.</li>
                  <li className="flex gap-2"><span className="font-bold text-[#D3273E]">2.</span> Gardez les preuves de création, les dates et les contrats de collaboration.</li>
                  <li className="flex gap-2"><span className="font-bold text-[#D3273E]">3.</span> Faites une recherche d’antériorité et confirmez les critères, pièces et taxes directement auprès de l’OMAPI.</li>
                  <li className="flex gap-2"><span className="font-bold text-[#D3273E]">4.</span> Déposez avant de divulguer une invention ou un nouveau design, sauf conseil spécialisé adapté à votre cas.</li>
                </ol>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D3273E] px-5 py-3 text-sm font-bold text-white hover:bg-red-800">Contacter l’OMAPI <ArrowRight className="h-4 w-4" /></Link>
                  <Link to="/guides" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-[#002B49] hover:bg-slate-50">Voir les guides <BookOpen className="h-4 w-4" /></Link>
                  <button type="button" onClick={copySummary} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-[#002B49] hover:bg-slate-50"><Printer className="h-4 w-4" />{copied ? 'Résumé copié' : typeof navigator !== 'undefined' && navigator.clipboard ? 'Copier mon résumé' : 'Imprimer mon résumé'}</button>
                </div>
                <p className="mt-3 text-xs text-slate-500">Le résumé ne contient que vos choix dans cet outil. Il n’est pas enregistré ni envoyé.</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>{step > 1 && <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Précédent</button>}</div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {step === 3 && <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"><RotateCcw className="h-4 w-4" />Recommencer</button>}
              {step < 3 && <button type="button" disabled={!canContinue} onClick={() => setStep((current) => current + 1)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#002B49] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#004f87] disabled:cursor-not-allowed disabled:opacity-40">Continuer <ArrowRight className="h-4 w-4" /></button>}
            </div>
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <InfoCard title="Un produit, plusieurs titres" text="Une innovation peut réunir plusieurs actifs industriels : la technologie, la marque, le nom commercial et l’apparence peuvent demander des protections différentes." />
          <InfoCard title="Pensez avant de publier" text="Pour les inventions et les dessins ou modèles, une divulgation prématurée peut poser un problème de nouveauté. Demandez conseil avant une démonstration ou une mise en vente." />
          <InfoCard title="Madagascar ou l’étranger ?" text="Les titres sont généralement territoriaux. Choisissez les marchés visés et renseignez-vous sur les voies nationales ou internationales adaptées." />
        </section>

        <section className="mt-10 rounded-xl border border-slate-200 bg-white p-5 md:p-7">
          <h2 className="text-lg font-extrabold text-[#002B49]">Sources et vérification</h2>
          <p className="mt-2 text-sm text-slate-600">Le parcours s’appuie sur les informations publiques de l’OMAPI et les ressources de l’OMPI. Les formulaires, lois, taxes et modalités peuvent évoluer : vérifiez toujours les informations actuelles auprès de l’Office.</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
            <ExternalLink href="http://www.omapi.mg/presentation_omapi.html" label="Rôle et titres délivrés par l’OMAPI" />
            <ExternalLink href="http://www.omapi.mg/brevet.html" label="Brevet d’invention" />
            <ExternalLink href="http://www.omapi.mg/marque.html" label="Marques" />
            <ExternalLink href="http://www.omapi.mg/dessin_ou_model.html" label="Dessins et modèles" />
            <ExternalLink href="http://www.omapi.mg/noms_commerciaux.html" label="Noms commerciaux" />
            <ExternalLink href="https://www.wipo.int/madrid/fr/" label="OMPI : système de Madrid" />
            <ExternalLink href="https://www.wipo.int/pct/fr/" label="OMPI : système PCT" />
            <ExternalLink href="https://www.wipo.int/en/web/trade-secrets/tradesecrets_faqs" label="OMPI : secrets d’affaires" />
          </div>
        </section>

        <p className="mx-auto mt-6 max-w-4xl text-center text-xs leading-relaxed text-slate-500">Cet outil donne une orientation générale à partir de vos réponses. Il ne vérifie pas la disponibilité d’un droit, ne garantit pas l’acceptation d’une demande et ne remplace pas les conseils de l’OMAPI, d’un mandataire ou d’un juriste.</p>
      </div>
    </div>
  );
};

function ChoiceCard({ selected, onClick, title, description }: { selected: boolean; onClick: () => void; title: string; description: string }) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={`w-full rounded-lg border p-4 text-left transition-colors ${selected ? 'border-[#002B49] bg-blue-50 ring-2 ring-[#002B49]/10' : 'border-slate-200 hover:border-blue-300'}`}><span className="flex items-center justify-between gap-3"><span className="font-bold text-[#002B49]">{title}</span><span className={`h-4 w-4 rounded-full border-2 ${selected ? 'border-[#002B49] bg-[#002B49] ring-2 ring-white' : 'border-slate-300'}`} /></span><span className="mt-1 block text-sm text-slate-600">{description}</span></button>;
}

function RadioChoice({ name, value, selected, onChange, label }: { name: string; value: string; selected: string; onChange: (value: string) => void; label: string }) {
  return <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-slate-50"><input type="radio" name={name} value={value} checked={selected === value} onChange={() => onChange(value)} className="mt-1 accent-[#002B49]" /><span className="text-sm text-slate-700">{label}</span></label>;
}

function RecommendationCard({ assetKey, territory }: { assetKey: AssetKey; territory: Territory }) {
  const recommendation = RECOMMENDATIONS[assetKey];
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-wide text-[#D3273E]">{recommendation.category}</p><h3 className="mt-1 text-lg font-extrabold text-[#002B49]">{recommendation.title}</h3></div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{recommendation.intro}</p>
      <ul className="mt-4 space-y-2">
        {recommendation.checks.map((check) => <li key={check} className="flex gap-2 text-sm text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{check}</li>)}
      </ul>
      {recommendation.note && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{recommendation.note}</p>}
      {assetKey === 'mark' && territory === 'international' && <p className="mt-3 text-xs text-slate-600">La protection de marque dépend des pays et produits/services visés. Le système de Madrid peut simplifier certaines démarches internationales, sous conditions.</p>}
      {assetKey === 'invention' && territory === 'international' && <p className="mt-3 text-xs text-slate-600">Le PCT facilite une procédure internationale de demande de brevet ; il ne délivre pas un « brevet mondial » et ne remplace pas les décisions nationales.</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        {recommendation.path && <Link to={recommendation.path} className="inline-flex items-center gap-1 text-sm font-bold text-[#002B49] hover:underline">Voir la page OMAPI <ArrowRight className="h-4 w-4" /></Link>}
        {recommendation.officialUrl && <ExternalLink href={recommendation.officialUrl} label={assetKey === 'secret' || assetKey === 'origin' ? 'En savoir plus' : 'Source officielle'} />}
      </div>
    </article>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-extrabold text-[#002B49]">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p></article>;
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#002B49] hover:underline">{label}<ArrowRight className="h-3.5 w-3.5" /></a>;
}

export default IdentifyIndustrialProperty;
