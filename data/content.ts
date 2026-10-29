import { Slide, Announcement, ServiceData } from '../types';
import { SERVICE_IDS } from './config';

// =============================================================================
// CONTENU SITE (HERO, STATS, SERVICES)
// =============================================================================

export const SLIDES: Slide[] = [
  {
    id: 1,
    title: "Protéger l'Innovation et le Génie Malgache",
    subtitle: "L'Office Malgache de la Propriété Industrielle accompagne les créateurs, chercheurs et entreprises dans l'enregistrement et la valorisation de leurs droits de propriété intellectuelle.",
    image: "/src/assets/images/omapi_headquarters_hero_1791815108089.jpg",
    ctaText: "Déposer une demande",
    ctaLink: "/formulaires"
  },
  {
    id: 2,
    title: "Brevets & Souveraineté Technologique",
    subtitle: "Sécurisez vos inventions techniques avec un monopole d'exploitation de 20 ans sur le territoire national et à l'international.",
    image: "/src/assets/images/omapi_patent_innovation_1791815120217.jpg",
    ctaText: "Découvrir les brevets",
    ctaLink: "/service/brevet"
  },
  {
    id: 3,
    title: "Marques Déposées & Noms Commerciaux",
    subtitle: "Défendez votre capital de marque et consolidez la réputation de vos produits et services auprès des consommateurs.",
    image: "/src/assets/images/omapi_trademark_brand_1791815130490.jpg",
    ctaText: "Recherche d'antériorité",
    ctaLink: "/service/marque"
  }
];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [];

export const SERVICES_DATA: Record<string, ServiceData> = {
  [SERVICE_IDS.MARQUE]: {
    id: SERVICE_IDS.MARQUE,
    title: 'Dépôt de Marque',
    icon: 'tag',
    shortDesc: "Protégez l'identité de vos produits et services.",
    fullDesc: "Le dépôt d'une marque auprès de l'OMAPI vous permet de protéger votre signe distinctif et d'obtenir un monopole d'exploitation sur le territoire malgache. La protection est valable pour une durée de 10 ans renouvelable indéfiniment.",
    steps: [
      { title: "Recherche d'antériorité", desc: "Vérifiez que votre marque n'est pas déjà déposée ou enregistrée par un tiers." },
      { title: "Préparation du dossier", desc: "Rassemblez tous les documents nécessaires et complétez le formulaire de dépôt." },
      { title: "Dépôt à l'OMAPI", desc: "Soumettez votre dossier complet à l'OMAPI et payez les frais de dépôt." },
      { title: "Examen et publication", desc: "L'OMAPI examine votre demande et publie la marque au Bulletin Officiel." },
      { title: "Délivrance du certificat", desc: "Après la période d'opposition, le certificat d'enregistrement vous est délivré." }
    ],
    prices: [
      { label: "Dépôt (3 classes)", amount: "180 000 Ar" },
      { label: "Renouvellement (10 ans)", amount: "200 000 Ar" },
      { label: "Recherche d'antériorité", amount: "30 000 Ar" }
    ],
    docs: [
      "Formulaire de dépôt de marque",
      "Copie de la pièce d'identité ou RCS",
      "Représentation graphique de la marque",
      "Liste des produits/services visés",
      "Pouvoir (si mandataire)",
      "Statuts (si personne morale)"
    ]
  },
  [SERVICE_IDS.BREVET]: {
    id: SERVICE_IDS.BREVET,
    title: "Dépôt de Brevet",
    icon: 'bulb',
    shortDesc: "Protégez vos inventions techniques.",
    fullDesc: "Un brevet d'invention est un titre de propriété industrielle qui confère à son titulaire un monopole d'exploitation sur une invention pour une durée de 20 ans. L'invention doit être nouvelle, impliquer une activité inventive et être susceptible d'application industrielle.",
    features: [
      { title: "Nouveauté", desc: "L'invention ne doit pas faire partie de l'état de la technique.", iconName: "star" },
      { title: "Activité inventive", desc: "Non évidente pour un homme du métier.", iconName: "brain" },
      { title: "Application industrielle", desc: "Susceptible d'être fabriquée ou utilisée.", iconName: "cog" }
    ],
    steps: [
      { title: "Recherche d'antériorité", desc: "Vérifiez que votre invention n'a pas déjà été brevetée." },
      { title: "Rédaction du dossier", desc: "Description détaillée, revendications, dessins techniques." },
      { title: "Dépôt à l'OMAPI", desc: "Soumission du dossier complet et paiement des taxes." },
      { title: "Examen de forme", desc: "Vérification de la conformité du dossier." },
      { title: "Publication et délivrance", desc: "Publication au GOPI et délivrance du brevet." }
    ],
    prices: [
      { label: "Taxe de dépôt", amount: "150 000 Ar" },
      { label: "Recherche d'antériorité", amount: "50 000 Ar" },
      { label: "Annuités de maintien", amount: "Variable" }
    ],
    docs: [
      "Formulaire de demande",
      "Description de l'invention",
      "Revendications",
      "Dessins techniques (si nécessaire)",
      "Abrégé de l'invention"
    ]
  },
  [SERVICE_IDS.DESSIN]: {
    id: SERVICE_IDS.DESSIN,
    title: "Dépôt de Dessin/Modèle",
    icon: 'swatch',
    shortDesc: "Protégez l'apparence de vos créations.",
    fullDesc: "Un dessin ou modèle industriel protège l'apparence d'un produit ou d'une partie de produit. Il peut s'agir de caractéristiques des lignes, contours, couleurs, forme, texture ou matériaux du produit lui-même ou de son ornementation. La protection est accordée pour une durée de 5 ans, renouvelable deux fois.",
    features: [
      { title: "Nouveauté", desc: "Le dessin ne doit pas être identique à un dessin antérieur.", iconName: "sparkles" },
      { title: "Caractère propre", desc: "L'impression visuelle doit différer de celle produite par tout dessin antérieur.", iconName: "eye" }
    ],
    steps: [
      { title: "Vérification", desc: "S'assurer de la nouveauté et du caractère propre." },
      { title: "Constitution du dossier", desc: "Préparer les reproductions graphiques et formulaires." },
      { title: "Dépôt", desc: "Soumission à l'OMAPI et paiement des taxes." },
      { title: "Enregistrement", desc: "Délivrance du certificat après examen." }
    ],
    prices: [
      { label: "Taxe de dépôt", amount: "100 000 Ar" },
      { label: "1er renouvellement (5 ans)", amount: "80 000 Ar" },
      { label: "2ème renouvellement (5 ans)", amount: "100 000 Ar" }
    ],
    docs: [
      "Formulaire de dépôt",
      "Copie CIN ou Extrait RCS",
      "Reproductions du dessin/modèle",
      "Description du produit",
      "Pouvoir (si mandataire)"
    ]
  },
  [SERVICE_IDS.NOM_COMMERCIAL]: {
    id: SERVICE_IDS.NOM_COMMERCIAL,
    title: "Dépôt de Nom Commercial",
    icon: 'store',
    shortDesc: "Protégez l'identité de votre entreprise.",
    fullDesc: "Le nom commercial est la dénomination sous laquelle une personne physique ou morale exerce son activité commerciale, industrielle ou artisanale. Il permet d'identifier l'entreprise auprès du public et se distingue de la raison sociale et de l'enseigne.",
    features: [
      { title: "Protection territoriale", desc: "Protégé sur l'ensemble du territoire malgache.", iconName: "map" },
      { title: "Durée illimitée", desc: "La protection dure tant que l'activité est exercée.", iconName: "infinity" },
      { title: "Disponibilité", desc: "Le nom ne doit pas être déjà utilisé par un tiers.", iconName: "check" },
      { title: "Distinctivité", desc: "Le nom doit permettre d'identifier l'entreprise.", iconName: "fingerprint" }
    ],
    steps: [
      { title: "Vérification de disponibilité", desc: "Assurez-vous que le nom n'est pas déjà utilisé." },
      { title: "Constitution du dossier", desc: "Rassemblez les documents nécessaires." },
      { title: "Dépôt à l'OMAPI", desc: "Soumettez votre demande avec les pièces justificatives." },
      { title: "Enregistrement", desc: "Obtention du certificat d'enregistrement." }
    ],
    prices: [
      { label: "Taxe d'enregistrement", amount: "50 000 Ar" },
      { label: "Recherche de disponibilité", amount: "30 000 Ar" }
    ],
    docs: [
      "Formulaire de demande",
      "Copie de la pièce d'identité (Physique)",
      "Extrait du registre de commerce (Morale)",
      "Justificatif de paiement",
      "Procuration (si mandataire)"
    ]
  }
};