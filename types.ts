
export interface NavItem {
  label: string;
  path?: string;
  children?: NavItem[];
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  image: string;
  description: string;
  content?: string; // Contenu complet de l'article (HTML ou texte brut)
  featured?: boolean; // Indique si l'actualité est à la une
}

export interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  newsId?: number; // ID de l'actualité associée si le slide est généré automatiquement
}

export interface Announcement {
  id: number;
  text: string;
  isActive: boolean;
}

export interface HomeScamConfig {
  title: string;
  subtitle: string;
  description: string;
}

export interface HomeResourcesConfig {
  omapiHourTitle: string;
  omapiHourDesc: string;
  omapiHourThumbnail?: string;
  videoTitle: string;
  videoDesc: string;
  videoThumbnail: string;
  videoDuration: string;
}

export interface SiteConfig {
  newsSectionBgImage?: string;
  // On pourra ajouter d'autres configs de design ici (logo, couleurs primaires, etc.)
}

export interface Formulaire {
  id: number;
  title: string;
  description: string;
  category: 'Marques' | 'Brevets' | 'Dessins' | 'Autres';
  fileUrl: string; // Lien vers le fichier ou dataURL
  fileName?: string;
}

export interface Guide {
  id: number;
  title: string;
  description: string;
  iconName: string; // 'tag', 'bulb', 'swatch', 'book', 'globe', 'banknotes'
  points: string[]; // Liste des points clés
  colorTheme: 'blue' | 'amber' | 'purple' | 'emerald' | 'orange' | 'gray';
  fileUrl: string;
}

export interface LegislationItem {
  id: number;
  title: string;
  category: 'Fondamental' | 'Application' | 'Autre';
  type: 'Loi' | 'Ordonnance' | 'Décret' | 'Arrêté' | 'Autre';
  date: string;
  description: string;
  fileUrl: string;
}

export interface GopiItem {
  id: number;
  title: string; // Ex: GOPI n° 500
  date: string; // Ex: Janvier 2024
  category: string; // 'Brevets', 'Marques', 'Dessins', 'Toutes'
  description?: string;
  fileUrl: string;
  coverImage?: string; // Optionnel : image de couverture de la gazette
}

export interface GopiOrder {
  id: number;
  gopiId: number;
  gopiTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: 'En attente' | 'Envoyé' | 'Annulé';
  transactionRef?: string; // Numéro de transaction (Mobile money / Banque)
  paymentMethod?: string; // MVola, Orange Money, Virement, Espèces
}

export interface Formation {
  id: number;
  title: string;
  category: 'Base' | 'Avancee';
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  conditions?: string;
  colorTheme?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'cyan';
  fileUrl?: string; // URL du fichier joint (programme, brochure)
  fileName?: string; // Nom du fichier
}

export interface FormationRegistration {
  id: number;
  formationId: number;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  message?: string;
  registrationDate: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  status: 'À venir' | 'En cours' | 'Terminé' | 'Annulé';
  places?: string; // Ex: "Limité à 50 places" ou "Entrée libre"
  fileUrl?: string; // URL du document joint (programme, présentation)
  fileName?: string; // Nom du document
}

export interface EventRegistration {
  id: number;
  eventId: number;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  registrationDate: string;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: 'Admin' | 'Éditeur';
  status: 'Actif' | 'Inactif';
}

export interface JobOffer {
  id: number;
  title: string;
  department: string;
  location: string;
  type: 'CDI' | 'CDD' | 'Stage' | 'Consultant';
  experience: string;
  description: string;
  status: 'Ouvert' | 'Fermé';
  publishDate: string;
  deadline?: string;
  fileUrl?: string;
}

export interface JobApplication {
  id: number;
  jobId?: number; // Optional if spontaneous
  jobTitle?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message?: string;
  cvUrl: string; // URL of the uploaded CV
  coverLetterUrl?: string; // URL of the uploaded Cover Letter
  applicationDate: string;
  status: 'Nouvelle' | 'En cours' | 'Rejetée' | 'Acceptée';
}

export interface ServiceData {
  id: string;
  title: string;
  icon: string; // Icon name for mapping
  shortDesc: string;
  fullDesc?: string;
  features?: { title: string; desc: string; iconName: string }[]; // New: Conditions/Characteristics
  steps?: { title: string; desc: string }[];
  prices?: { label: string; amount: string }[];
  docs?: string[];
}

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'order' | 'info' | 'alert' | 'success';
}

export interface ActivityLog {
  id: number;
  userId?: string;
  userName?: string;
  action: string;
  details: string;
  timestamp: string;
}
