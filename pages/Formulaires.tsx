import React from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Folder, Info, Lightbulb, Palette, Tag } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { DEFAULT_FORMS } from '../constants';
import { Formulaire } from '../types';
import { useCrud } from '../hooks/useCrud';
import { FORM_CATEGORIES, getLibraryPlainText, isAllowedLibraryUrl } from '../utils/documentLibraryLogic';

const UNCATEGORIZED = '__forms_no_category__';
const CATEGORY_LABELS: Record<string, string> = {
  Marques: 'Marques',
  Brevets: 'Brevets',
  Dessins: 'Dessins et Modèles',
  Autres: 'Divers',
};

const Formulaires: React.FC = () => {
  const { items: forms } = useCrud<Formulaire>('omapi_forms', DEFAULT_FORMS);
  const knownCategories = FORM_CATEGORIES.map((category) => ({
    id: category,
    title: CATEGORY_LABELS[category] || category,
    icon: category === 'Marques' ? <Tag className="w-7 h-7" />
      : category === 'Brevets' ? <Lightbulb className="w-7 h-7" />
        : category === 'Dessins' ? <Palette className="w-7 h-7" />
          : <Folder className="w-7 h-7" />,
  }));
  const hasUncategorized = forms.some((form) => !String(form.category || '').trim());
  const unknownCategories = Array.from(new Set(forms.map((form) => String(form.category || '').trim()).filter(Boolean)))
    .filter((category) => !FORM_CATEGORIES.includes(category as typeof FORM_CATEGORIES[number]))
    .map((category) => ({ id: category, title: `Autres — ${category}`, icon: <Folder className="w-7 h-7" /> }));
  const categories = [
    ...knownCategories,
    ...(hasUncategorized ? [{ id: UNCATEGORIZED, title: 'Catégorie non définie', icon: <Folder className="w-7 h-7" /> }] : []),
    ...unknownCategories,
  ];

  const categoryForms = (categoryId: string) => forms.filter((form) => {
    const category = String(form.category || '').trim();
    return categoryId === UNCATEGORIZED ? !category : category === categoryId;
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb items={[{ label: 'Ressources' }, { label: 'Formulaires' }]} />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Formulaires</h1>
          <p className="text-xl text-secondary font-medium">Téléchargez les formulaires nécessaires pour vos démarches</p>
          <div className="w-24 h-1.5 bg-primary rounded-full mt-4" />
        </div>

        {forms.length === 0 && <div className="mb-8 rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">Aucun formulaire n’est actuellement publié.</div>}

        {categories.map(({ id, title, icon }) => {
          const items = categoryForms(id);
          if (!items.length) return null;
          return (
            <section key={id} className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="bg-primary text-white p-3 rounded-lg mr-4">{icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Formulaires {title}</h2>
                  <p className="text-sm text-gray-500">{items.length} document{items.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => {
                  const canDownload = isAllowedLibraryUrl(item.fileUrl);
                  const label = item.fileName || item.title || 'Télécharger le formulaire';
                  return (
                    <article key={item.id} className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all">
                      <div className="flex items-start space-x-3 min-w-0">
                        <FileText className="w-8 h-8 text-red-500 mt-1 shrink-0" />
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800">{item.title || 'Document sans titre'}</h3>
                          <p className="text-sm text-gray-600 mb-2 break-words line-clamp-3">{getLibraryPlainText(item.description)}</p>
                          {item.fileName && <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 break-all">{item.fileName}</span>}
                        </div>
                      </div>
                      {canDownload ? (
                        <a href={item.fileUrl} target={item.fileUrl?.startsWith('/') || item.fileUrl?.startsWith('data:') ? undefined : '_blank'} rel="noopener noreferrer" download={item.fileUrl?.startsWith('data:') ? label : undefined} aria-label={`Télécharger ${label}`} className="p-2 text-gray-500 hover:text-primary shrink-0" title="Télécharger">
                          <Download className="w-5 h-5" />
                        </a>
                      ) : <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1 shrink-0" title="Le document n’est pas disponible"><Info className="w-4 h-4" /> Indisponible</span>}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        <div className="bg-blue-50 border-l-4 border-primary rounded-lg p-6 flex items-start">
          <Info className="w-8 h-8 text-primary mr-4 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Information importante</h3>
            <p className="text-gray-700 text-sm">Tous les formulaires doivent être remplis en français et signés. Pour toute assistance dans leur remplissage, <Link to="/contact" className="text-primary font-bold hover:underline">contactez-nous</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Formulaires;
