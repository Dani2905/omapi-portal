
// Données statiques pour la page Brevets

export const BREVETS_CONDITIONS = [
  {
    title: "Nouveauté",
    desc: "L'invention ne doit pas être comprise dans l'état de la technique au moment du dépôt (ni divulguée, ni publiée).",
    icon: "sparkles",
    color: "amber"
  },
  {
    title: "Activité inventive",
    desc: "L'invention ne doit pas découler de manière évidente de l'état de la technique pour un homme du métier.",
    icon: "bulb",
    color: "blue"
  },
  {
    title: "Application industrielle",
    desc: "L'invention doit pouvoir être fabriquée ou utilisée dans tout genre d'industrie, y compris l'agriculture.",
    icon: "wrench",
    color: "green"
  }
];

export const BREVETS_STEPS = [
  { step: 1, title: "Recherche d'antériorité", desc: "Vérifiez que votre invention n'a pas déjà été brevetée ou divulguée." },
  { step: 2, title: "Préparation du dossier", desc: "Rédigez la description, les revendications, les dessins et le résumé." },
  { step: 3, title: "Dépôt à l'OMAPI", desc: "Soumettez votre dossier complet et payez les frais de dépôt." },
  { step: 4, title: "Examen formel", desc: "Vérification de la conformité administrative du dossier." },
  { step: 5, title: "Rapport de recherche", desc: "Établissement du rapport citant les documents pertinents de l'état de la technique." }
];

export const BREVETS_PRICES = [
  { name: "Dépôt (2 premières années)", std: "180 000", red: "144 000" },
  { name: "Demande divisionnaire", std: "10 000", red: "8 000" },
  { name: "Revendication de priorité (par priorité)", std: "65 000", red: "52 000" },
  { name: "Revendication supplémentaire (au-delà 10)", std: "60 000", red: "48 000" },
  { name: "Page supplémentaire (à partir de la 21ᵉ)", std: "25 000", red: "20 000" },
  { name: "Correction d’erreur (par page)", std: "8 000", red: "6 400" },
];

export const BREVETS_ANNUITIES = [
  { year: "2ᵉ à 4ᵉ année", std: "125 000", red: "100 000" },
  { year: "5ᵉ année", std: "125 000", red: "100 000" },
  { year: "6ᵉ à 10ᵉ année", std: "380 000", red: "304 000" },
  { year: "11ᵉ et 12ᵉ années", std: "650 000", red: "520 000" },
  { year: "...", std: "...", red: "..." },
];

export const BREVETS_MODIFICATIONS = [
  { title: "Correction d'erreurs", price: "75 000 Ar", desc: "Erreurs matérielles ou typographiques." },
  { title: "Limitation des revendications", price: "100 000 Ar", desc: "Réduction de la portée pour renforcer la validité." },
  { title: "Division du brevet", price: "150 000 Ar", desc: "Division en plusieurs brevets si inventions multiples." },
];

export const BREVETS_NAVIGATION = [
  { id: 'definition', label: 'Conditions de brevetabilité' },
  { id: 'depot', label: 'Procédure de dépôt' },
  { id: 'tarifs', label: 'Tarifs de dépôt' },
  { id: 'examen', label: 'Examen & Publication' },
  { id: 'delivrance', label: 'Délivrance & Droits' },
  { id: 'annuites', label: 'Annuités & Maintien' },
  { id: 'modifications', label: 'Modifications' },
  { id: 'transfert', label: 'Transfert de Brevet' },
  { id: 'radiation', label: 'Radiation du Droit' },
];
