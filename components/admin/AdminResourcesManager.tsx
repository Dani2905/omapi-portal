import React, { useEffect, useState } from 'react';
import { Upload, Check, Image as ImageIcon, PlayCircle, Save, Clock3 } from 'lucide-react';
import { HomeResourcesConfig } from '../../types';
import { DEFAULT_HOME_RESOURCES_CONFIG, isValidVideoDuration, normalizeHomeResourcesConfig, normalizeResourceUrl } from '../../data/homeResources';

interface AdminResourcesManagerProps {
  config: HomeResourcesConfig;
  onSave: (config: HomeResourcesConfig) => Promise<boolean> | boolean | void;
}

type ImageField = 'omapiHourThumbnail' | 'videoThumbnail';

const AdminResourcesManager: React.FC<AdminResourcesManagerProps> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<HomeResourcesConfig>(() => normalizeHomeResourcesConfig(config));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<ImageField | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLocalConfig(normalizeHomeResourcesConfig(config));
  }, [config]);

  const updateField = <K extends keyof HomeResourcesConfig>(field: K, value: HomeResourcesConfig[K]) => {
    setLocalConfig((current) => ({ ...current, [field]: value }));
    setErrorMessage('');
    setShowSuccess(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: ImageField) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setErrorMessage('');
    setShowSuccess(false);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Choisissez une image au format JPG, PNG ou WebP.');
      input.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Le fichier est trop volumineux (maximum 8 Mo avant compression).');
      input.value = '';
      return;
    }

    setUploading(field);
    try {
      const compressedImage = await compressImage(file, field === 'videoThumbnail' ? 1280 : 900, field === 'videoThumbnail' ? 720 : 900);
      if (compressedImage.length > 650_000) {
        throw new Error('Cette image reste trop lourde après compression. Essayez une image plus légère (vignette de moins de 650 Ko).');
      }
      updateField(field, compressedImage);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Impossible de traiter cette image. Essayez un autre fichier.');
    } finally {
      setUploading(null);
      input.value = '';
    }
  };

  const handleSave = async () => {
    setErrorMessage('');
    setShowSuccess(false);

    if (!localConfig.omapiHourTitle.trim() || !localConfig.omapiHourDesc.trim() || !localConfig.videoTitle.trim() || !localConfig.videoDesc.trim()) {
      setErrorMessage('Renseignez un titre et une description pour chaque ressource.');
      return;
    }
    if (normalizeResourceUrl(localConfig.omapiHourUrl, 'INVALID_RESOURCE_URL') === 'INVALID_RESOURCE_URL') {
      setErrorMessage('Le lien des rencontres OMAPI doit être une adresse du site (ex. /events) ou commencer par http:// ou https://.');
      return;
    }
    if (localConfig.videoUrl?.trim() && normalizeResourceUrl(localConfig.videoUrl, 'INVALID_RESOURCE_URL') === 'INVALID_RESOURCE_URL') {
      setErrorMessage('Le lien vidéo doit être une adresse du site ou commencer par http:// ou https://.');
      return;
    }
    if (!isValidVideoDuration(localConfig.videoDuration || '')) {
      setErrorMessage('La durée doit respecter le format MM:SS ou HH:MM:SS, par exemple 04:15.');
      return;
    }

    setSaving(true);
    try {
      const normalized = normalizeHomeResourcesConfig(localConfig);
      const result = await onSave(normalized);
      if (result === false) {
        setErrorMessage('La sauvegarde a échoué. Vos modifications restent dans le formulaire ; vérifiez l’espace disponible dans le navigateur et réessayez.');
        return;
      }
      setLocalConfig(normalized);
      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      setErrorMessage('La sauvegarde a échoué. Vérifiez le formulaire puis réessayez.');
    } finally {
      setSaving(false);
    }
  };

  const hourThumbnail = localConfig.omapiHourThumbnail || DEFAULT_HOME_RESOURCES_CONFIG.omapiHourThumbnail || '';
  const videoThumbnail = localConfig.videoThumbnail || DEFAULT_HOME_RESOURCES_CONFIG.videoThumbnail;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Accueil · Ressources</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">Ressources vedettes</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">Modifiez les deux cartes visibles dans la section « Ressources Clés & Formations ». Les aperçus ci-dessous reflètent vos changements avant publication.</p>
          </div>
          <span className="hidden rounded-lg bg-blue-50 p-3 text-blue-700 sm:inline-flex"><PlayCircle className="h-5 w-5" /></span>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <fieldset className="space-y-5">
            <legend className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900"><Clock3 className="h-4 w-4 text-blue-700" />Rencontres « L’Heure OMAPI »</legend>
            <TextField label="Titre" name="omapiHourTitle" value={localConfig.omapiHourTitle} maxLength={100} onChange={(value) => updateField('omapiHourTitle', value)} />
            <TextField label="Description" name="omapiHourDesc" value={localConfig.omapiHourDesc} maxLength={500} multiline onChange={(value) => updateField('omapiHourDesc', value)} />
            <TextField label="Lien de destination" name="omapiHourUrl" value={localConfig.omapiHourUrl || ''} maxLength={2048} placeholder="/events ou https://…" onChange={(value) => updateField('omapiHourUrl', value)} />
            <ImageFieldEditor label="Image de la rencontre" src={hourThumbnail} alt={localConfig.omapiHourTitle} uploading={uploading === 'omapiHourThumbnail'} onUpload={(event) => handleImageUpload(event, 'omapiHourThumbnail')} onReset={() => updateField('omapiHourThumbnail', '')} aspect="video" />
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900"><PlayCircle className="h-4 w-4 text-red-700" />Vidéo ou guide numérique</legend>
            <TextField label="Titre" name="videoTitle" value={localConfig.videoTitle} maxLength={100} onChange={(value) => updateField('videoTitle', value)} />
            <TextField label="Description" name="videoDesc" value={localConfig.videoDesc} maxLength={500} multiline onChange={(value) => updateField('videoDesc', value)} />
            <TextField label="Lien vidéo (facultatif)" name="videoUrl" value={localConfig.videoUrl || ''} maxLength={2048} placeholder="https://… (si vide, le bouton renvoie vers /guides)" onChange={(value) => updateField('videoUrl', value)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Durée (facultative)" name="videoDuration" value={localConfig.videoDuration || ''} maxLength={12} placeholder="MM:SS ou HH:MM:SS" onChange={(value) => updateField('videoDuration', value)} />
              <ImageFieldEditor label="Miniature vidéo" src={videoThumbnail} alt={localConfig.videoTitle} uploading={uploading === 'videoThumbnail'} onUpload={(event) => handleImageUpload(event, 'videoThumbnail')} onReset={() => updateField('videoThumbnail', '')} aspect="video" />
            </div>
          </fieldset>
        </div>

        {errorMessage && <div role="alert" className="mt-7 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{errorMessage}</div>}
        {showSuccess && <div role="status" className="mt-7 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><Check className="h-4 w-4" />Ressources enregistrées et prêtes à être affichées.</div>}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">Les images sont redimensionnées et compressées avant leur sauvegarde locale.</p>
          <button type="button" disabled={saving || uploading !== null} onClick={handleSave} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60">
            {saving ? <span className="animate-pulse">Enregistrement…</span> : <><Save className="h-4 w-4" />{showSuccess ? 'Enregistré' : 'Enregistrer les ressources'}</>}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-8" aria-labelledby="resources-preview-title">
        <div className="mb-5 flex items-center gap-3"><ImageIcon className="h-5 w-5 text-slate-500" /><div><h3 id="resources-preview-title" className="font-extrabold text-slate-900">Aperçu de la section publique</h3><p className="text-xs text-slate-500">Rendu indicatif des titres, descriptions et vignettes.</p></div></div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <PreviewCard image={hourThumbnail} alt={localConfig.omapiHourTitle} eyebrow="Rencontres régulières" title={localConfig.omapiHourTitle} description={localConfig.omapiHourDesc} linkLabel="Consulter les prochaines sessions" />
          <PreviewCard image={videoThumbnail} alt={localConfig.videoTitle} eyebrow={localConfig.videoUrl ? 'Vidéo / tutoriel' : 'Guide numérique'} title={localConfig.videoTitle} description={localConfig.videoDesc} duration={localConfig.videoDuration} linkLabel={localConfig.videoUrl ? 'Regarder le tutoriel' : 'Explorer les guides pratiques'} />
        </div>
      </section>
    </div>
  );
};

function TextField({ label, name, value, onChange, maxLength, multiline = false, placeholder = '' }: { label: string; name: string; value: string; onChange: (value: string) => void; maxLength: number; multiline?: boolean; placeholder?: string }) {
  const common = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100';
  return <label className="block text-xs font-bold text-slate-600">{label}{multiline ? <textarea name={name} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} className={`${common} resize-y font-normal`} /> : <input name={name} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${common} font-normal`} />}</label>;
}

function ImageFieldEditor({ label, src, alt, uploading, onUpload, onReset, aspect }: { label: string; src: string; alt: string; uploading: boolean; onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void; onReset: () => void; aspect: 'video' }) {
  return <div>
    <div className="mb-2 flex items-center justify-between gap-2"><span className="text-xs font-bold text-slate-600">{label}</span><button type="button" onClick={onReset} className="text-[11px] font-semibold text-slate-500 hover:text-red-700">Réinitialiser l’image</button></div>
    <div className={`relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 ${aspect === 'video' ? 'aspect-video' : ''}`}><img src={src} alt={alt} className="h-full w-full object-cover" /><span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">Aperçu</span></div>
    <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 hover:border-slate-500 hover:bg-white"><Upload className="h-4 w-4" />{uploading ? 'Traitement…' : 'Choisir une image'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={onUpload} className="sr-only" /></label>
    <p className="mt-1 text-[10px] text-slate-500">JPG, PNG ou WebP · 8 Mo max · image optimisée automatiquement.</p>
  </div>;
}

function PreviewCard({ image, alt, eyebrow, title, description, duration, linkLabel }: { image: string; alt: string; eyebrow: string; title: string; description: string; duration?: string; linkLabel: string }) {
  return <article className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><div className="relative aspect-video bg-slate-200"><img src={image} alt={alt} className="h-full w-full object-cover" />{duration && <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-[10px] font-mono text-white">{duration}</span>}</div><div className="p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">{eyebrow}</p><h4 className="mt-1 font-bold text-[#002B49]">{title}</h4><p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">{description}</p><span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700">{linkLabel}<span aria-hidden="true">→</span></span></div></article>;
}

async function compressImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lecture de l’image impossible.'));
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Format d’image non reconnu.'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onerror = () => reject(new Error('Le fichier choisi ne peut pas être décodé comme image.'));
    element.onload = () => resolve(element);
    element.src = dataUrl;
  });
  const ratio = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Le navigateur ne peut pas optimiser cette image.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.76);
}

export default AdminResourcesManager;
