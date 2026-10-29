import { GopiItem, GopiOrder } from '../types';

export const GOPI_PRICE_MGA = 10_000;
export const MAX_GOPI_PDF_BYTES = 2 * 1024 * 1024;

export const GOPI_CATEGORIES = [
  'Gazette Officielle',
  'Inscription au Registre',
  'Renouvellement',
  'GOPI spéciale GMD',
  'GOPI spéciale GDM',
] as const;

export type GopiCategory = typeof GOPI_CATEGORIES[number];
export type GopiPaymentMethod = 'MVola' | 'Orange Money' | 'Airtel Money' | 'Virement Bancaire' | 'Espèces' | 'Chèque';
export const GOPI_PAYMENT_METHODS: GopiPaymentMethod[] = [
  'MVola', 'Orange Money', 'Airtel Money', 'Virement Bancaire', 'Espèces', 'Chèque',
];

export type GopiOrderStatus = 'En attente' | 'Paiement confirmé' | 'Envoyé' | 'Annulé';

export function hasGopiPdf(publication: Pick<GopiItem, 'fileUrl'> | null | undefined): boolean {
  const fileUrl = publication?.fileUrl?.trim() || '';
  return fileUrl.startsWith('data:application/pdf;base64,') || /^https:\/\/.+\.pdf(?:[?#].*)?$/i.test(fileUrl);
}

export function normalizeGopiPublication<T extends Partial<GopiItem>>(draft: T): T {
  return {
    ...draft,
    title: typeof draft.title === 'string' ? draft.title.replace(/\s+/g, ' ').trim() : draft.title,
    date: typeof draft.date === 'string' ? draft.date.replace(/\s+/g, ' ').trim() : draft.date,
    category: typeof draft.category === 'string' ? draft.category.trim() : draft.category,
    description: typeof draft.description === 'string' ? draft.description.trim() : draft.description,
    fileUrl: typeof draft.fileUrl === 'string' && draft.fileUrl.trim() && draft.fileUrl.trim() !== '#'
      ? draft.fileUrl.trim()
      : '',
    fileName: typeof draft.fileName === 'string' ? draft.fileName.trim() : draft.fileName,
  } as T;
}

export function validateGopiPublication(draft: Partial<GopiItem>): string | null {
  if (!draft.title || draft.title.trim().length < 3) return 'Le titre doit contenir au moins 3 caractères.';
  if (!draft.date || !draft.date.trim()) return 'Indiquez la date ou la période de la publication.';
  if (!GOPI_CATEGORIES.includes(draft.category as GopiCategory)) return 'Sélectionnez une catégorie GOPI reconnue.';
  if (draft.fileUrl && draft.fileUrl !== '#') {
    const isPdfData = draft.fileUrl.startsWith('data:application/pdf;base64,');
    const isPdfUrl = /^https:\/\/.+\.pdf(?:[?#].*)?$/i.test(draft.fileUrl);
    if (!isPdfData && !isPdfUrl) return 'Le document associé doit être un fichier PDF valide.';
  }
  return null;
}

export function normalizeGopiOrder(draft: Pick<GopiOrder, 'customerName' | 'customerEmail' | 'customerPhone' | 'paymentMethod' | 'transactionRef'>) {
  return {
    customerName: draft.customerName.replace(/\s+/g, ' ').trim(),
    customerEmail: draft.customerEmail.trim().toLowerCase(),
    customerPhone: draft.customerPhone.replace(/\s+/g, ' ').trim(),
    paymentMethod: (draft.paymentMethod || '').trim(),
    transactionRef: draft.transactionRef?.replace(/\s+/g, ' ').trim() || '',
  };
}

export function validateGopiOrder(
  draft: ReturnType<typeof normalizeGopiOrder>,
  publication: GopiItem | null | undefined,
): string | null {
  if (!publication) return 'Cette publication n’est plus disponible. Actualisez la page et réessayez.';
  if (!hasGopiPdf(publication)) return 'La commande est indisponible : aucun PDF valide n’est associé à cette publication.';
  if (draft.customerName.length < 2) return 'Saisissez un nom complet valide (au moins 2 caractères).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.customerEmail)) return 'Saisissez une adresse e-mail valide.';
  if (draft.customerPhone.replace(/\D/g, '').length < 7) return 'Saisissez un numéro de téléphone valide.';
  if (!GOPI_PAYMENT_METHODS.includes(draft.paymentMethod as GopiPaymentMethod)) return 'Sélectionnez un moyen de paiement reconnu.';
  if (draft.paymentMethod !== 'Espèces' && draft.paymentMethod !== 'Chèque' && draft.transactionRef.length < 3) {
    return 'La référence de transaction est obligatoire pour ce moyen de paiement.';
  }
  return null;
}

export function canTransitionGopiOrder(from: string, to: string): boolean {
  if (from === 'En attente') return to === 'Paiement confirmé' || to === 'Annulé';
  if (from === 'Paiement confirmé') return to === 'Envoyé';
  // « Envoyé » est conservé pour les anciennes commandes déjà traitées.
  return false;
}

export function getGopiOrderStatusLabel(status: string, sentAt?: string): string {
  if (status === 'Envoyé') return sentAt ? 'Envoyé' : 'Envoyé (ancien statut)';
  return status || 'Statut inconnu';
}
