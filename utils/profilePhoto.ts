export const MAX_PROFILE_PHOTO_INPUT_BYTES = 8 * 1024 * 1024;
export const MAX_PROFILE_PHOTO_BYTES = 320 * 1024;
const MAX_PROFILE_PHOTO_DIMENSION = 512;
const JPEG_DATA_URL_PREFIX = 'data:image/jpeg;base64,';

const SUPPORTED_PROFILE_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function getProfilePhotoFileError(file: Pick<File, 'type' | 'size'>): string | null {
  if (!SUPPORTED_PROFILE_PHOTO_TYPES.has(file.type.toLowerCase())) {
    return 'Choisissez une image JPG, PNG ou WebP.';
  }
  if (file.size <= 0) return 'Le fichier image est vide.';
  if (file.size > MAX_PROFILE_PHOTO_INPUT_BYTES) return 'La photo source ne doit pas dépasser 8 Mo.';
  return null;
}

export function isProfilePhotoDataUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.startsWith(JPEG_DATA_URL_PREFIX)) return false;
  const encoded = value.slice(JPEG_DATA_URL_PREFIX.length);
  if (!encoded || encoded.length > Math.ceil(MAX_PROFILE_PHOTO_BYTES * 4 / 3) + 4) return false;
  return /^\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(encoded) && encoded.length % 4 === 0;
}

export async function optimizeProfilePhoto(file: File): Promise<string> {
  const fileError = getProfilePhotoFileError(file);
  if (fileError) throw new Error(fileError);
  if (typeof createImageBitmap !== 'function') {
    throw new Error('Ce navigateur ne peut pas optimiser cette photo. Essayez un navigateur récent.');
  }

  const bitmap = await createImageBitmap(file);
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width > 12000 || bitmap.height > 12000) {
      throw new Error('Les dimensions de cette image ne sont pas prises en charge.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = MAX_PROFILE_PHOTO_DIMENSION;
    canvas.height = MAX_PROFILE_PHOTO_DIMENSION;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Impossible de préparer cette photo.');

    // Recadrage carré centré, avec fond blanc pour les images transparentes.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const cropSize = Math.min(bitmap.width, bitmap.height);
    const sourceX = (bitmap.width - cropSize) / 2;
    const sourceY = (bitmap.height - cropSize) / 2;
    context.drawImage(bitmap, sourceX, sourceY, cropSize, cropSize, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.86, 0.78, 0.7, 0.62, 0.54]) {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => result ? resolve(result) : reject(new Error('Impossible de convertir cette photo.')),
          'image/jpeg',
          quality,
        );
      });
      if (blob.size > MAX_PROFILE_PHOTO_BYTES) continue;

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Lecture de la photo impossible.'));
        reader.onerror = () => reject(new Error('Lecture de la photo impossible.'));
        reader.readAsDataURL(blob);
      });
      if (!isProfilePhotoDataUrl(dataUrl)) throw new Error('Le format de la photo optimisée est invalide.');
      return dataUrl;
    }

    throw new Error('Cette photo reste trop volumineuse après optimisation. Choisissez une image plus simple.');
  } finally {
    bitmap.close();
  }
}
