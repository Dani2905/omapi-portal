
import React, { useState } from 'react';
import { NewsItem } from '../../types';
import { sortNewsItems } from '../../utils/editorialLogic';
import { PlusIcon, PencilSquareIcon, TrashIcon, CalendarIcon, StarIcon, MagnifyingGlassIcon, FunnelIcon, NewspaperIcon } from './AdminIcons';

interface AdminNewsManagerProps {
  newsItems: NewsItem[];
  onAdd: () => void;
  onEdit: (news: NewsItem) => void;
  onDelete: (id: number) => void;
}

const AdminNewsManager: React.FC<AdminNewsManagerProps> = ({ newsItems, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const orderedItems = sortNewsItems(newsItems);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('fr');
  const filteredItems = orderedItems.filter((item) => {
    const matchesSearch = String(item.title || '').toLocaleLowerCase('fr').includes(normalizedSearch)
      || String(item.description || '').toLocaleLowerCase('fr').includes(normalizedSearch);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(newsItems.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'fr'));
  const totalFeatured = newsItems.filter((item) => item.featured === true).length;

  return (
    <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Centre Éditorial</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Gérez vos articles, communiqués et événements</p>
            </div>
            <button 
                onClick={onAdd}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-sm border border-slate-900 flex items-center"
            >
                <PlusIcon className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Nouvel article</span>
            </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-sm border border-slate-200 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Articles</p>
                    <p className="text-2xl font-mono font-bold text-slate-900 mt-1">{newsItems.length}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-100 text-slate-400">
                    <NewspaperIcon className="w-5 h-5" />
                </div>
            </div>
            <div className="bg-white p-5 rounded-sm border border-slate-200 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">À la une</p>
                    <p className="text-2xl font-mono font-bold text-slate-900 mt-1">{totalFeatured}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-100 text-yellow-500">
                    <StarIcon className="w-5 h-5" />
                </div>
            </div>
            <div className="bg-white p-5 rounded-sm border border-slate-200 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dernière publication</p>
                    <p className="text-sm font-mono font-bold text-slate-900 mt-1 truncate max-w-[150px]">{orderedItems[0]?.date || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-100 text-green-600">
                    <CalendarIcon className="w-5 h-5" />
                </div>
            </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-3 rounded-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                    type="text" 
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-sm text-[10px] bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-bold uppercase tracking-widest"
                    placeholder="RECHERCHER UN ARTICLE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
                <FunnelIcon className="w-4 h-4 text-slate-400" />
                <select 
                    className="block w-full md:w-48 pl-3 pr-10 py-2 text-[10px] border-slate-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-sm bg-slate-50 border cursor-pointer font-bold uppercase tracking-widest"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="all">TOUTES LES CATÉGORIES</option>
                    {categories.map(cat => (
                        <option key={cat as string} value={cat as string}>{(cat as string).toUpperCase()}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Content Table/List */}
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="w-[44%] px-4 sm:px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Article
                            </th>
                            <th scope="col" className="hidden w-[16%] px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest md:table-cell">
                                Catégorie
                            </th>
                            <th scope="col" className="hidden w-[14%] px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest md:table-cell">
                                Date
                            </th>
                            <th scope="col" className="w-[13%] px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Statut
                            </th>
                            <th scope="col" className="w-[13%] px-3 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 group">
                                <td className="px-4 sm:px-6 py-4 align-top">
                                    <div className="flex items-center">
                                        <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-sm border border-slate-200 bg-slate-50 hidden sm:block">
                                            {item.image ? (
                                                <img className="h-full w-full object-cover grayscale" src={item.image} alt="" />
                                            ) : (
                                                <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                                                    <span className="text-[8px] text-slate-400">IMG</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="sm:ml-4 flex-1 min-w-0">
                                            <div className="text-[11px] font-bold text-slate-900 uppercase tracking-tight whitespace-normal break-words leading-snug">{item.title}</div>
                                            <div className="text-[10px] text-slate-500 mt-1 line-clamp-2 break-words">{item.description}</div>
                                            {/* Mobile specific metadata block */}
                                            <div className="mt-1 flex items-center gap-2 md:hidden">
                                                <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                    {item.category}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-mono">
                                                    {item.date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="hidden px-4 py-4 text-[10px] text-slate-500 md:table-cell">
                                    <span className="px-2 py-0.5 inline-flex text-[9px] font-bold uppercase tracking-widest rounded-sm border border-blue-100 bg-blue-50 text-blue-700">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="hidden px-4 py-4 text-[10px] text-slate-500 font-mono break-words md:table-cell">
                                    {item.date}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                    {item.featured ? (
                                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-sm border border-yellow-100 bg-yellow-50 text-[9px] font-bold uppercase tracking-widest text-yellow-700">
                                            <StarIcon className="w-2.5 h-2.5 sm:mr-1 text-yellow-600" />
                                            <span className="hidden sm:inline">À la une</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-sm border border-slate-200 bg-slate-50 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                                            <span className="hidden sm:inline">Standard</span>
                                            <span className="sm:hidden text-center block w-full">-</span>
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2 sm:gap-3">
                                        <button 
                                            onClick={() => onEdit(item)}
                                            className="text-slate-400 hover:text-blue-600 p-1 sm:p-0"
                                            title="Modifier"
                                        >
                                            <PencilSquareIcon className="w-4 h-4 sm:w-4 sm:h-4" />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(item.id)}
                                            className="text-slate-400 hover:text-red-600 p-1 sm:p-0"
                                            title="Supprimer"
                                        >
                                            <TrashIcon className="w-4 h-4 sm:w-4 sm:h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Vue mobile : cartes pour laisser les titres et résumés respirer */}
            <div className="divide-y divide-slate-100 md:hidden">
                {filteredItems.map((item) => (
                    <article key={item.id} className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-sm border border-slate-200 bg-slate-100">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        onError={(event) => { event.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-[8px] font-bold text-slate-400">IMG</div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-bold leading-snug text-slate-900 whitespace-normal break-words">{item.title}</h3>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="max-w-full rounded border border-blue-100 bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-700 whitespace-normal break-words">
                                        {item.category}
                                    </span>
                                    <time className="text-[10px] font-mono text-slate-500 whitespace-normal break-words">{item.date}</time>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap break-words">{item.description}</p>
                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                            {item.featured === true ? (
                                <span className="inline-flex items-center gap-1 rounded border border-yellow-100 bg-yellow-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-yellow-700">
                                    <StarIcon className="h-3 w-3 text-yellow-600" /> À la une
                                </span>
                            ) : (
                                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-600">Standard</span>
                            )}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => onEdit(item)}
                                    className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                    aria-label={`Modifier l’article ${item.title}`}
                                    title="Modifier"
                                >
                                    <PencilSquareIcon className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(item.id)}
                                    className="flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700"
                                    aria-label={`Supprimer l’article ${item.title}`}
                                    title="Supprimer"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                    <NewspaperIcon className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-[10px] font-bold uppercase tracking-widest italic">Aucun article trouvé</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default AdminNewsManager;
