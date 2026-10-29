
import React from 'react';
import { 
  NewspaperIcon, 
  CalendarIcon, 
  BookOpenIcon, 
  ShoppingCartIcon, 
  PlusIcon,
  UsersIcon
} from './AdminIcons';

interface AdminOverviewProps {
  data: any;
  openModal: (type: string, data?: any) => void;
  setActiveTab: (tab: string) => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ data, openModal, setActiveTab }) => {
  const newsCount = data.newsItems?.length || 0;
  const eventsCount = data.events?.filter((e: any) => e.status === 'À venir').length || 0;
  const gopiCount = data.gopiItems?.length || 0;
  const pendingOrders = data.gopiOrders?.filter((o: any) => o.status === 'En attente').length || 0;
  const totalFormationRegs = data.formationRegistrations?.length || 0;

  // Recent items logic
  const recentNews = [...(data.newsItems || [])].sort((a: any, b: any) => b.id - a.id).slice(0, 3);
  const upcomingEvents = [...(data.events || [])]
    .filter((e: any) => e.status === 'À venir')
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const parseEventDate = (dateStr: string) => {
    try {
      if (!dateStr) return { day: '', month: '' };
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        return { day: parts[0].substring(0, 2), month: months[parseInt(parts[1]) - 1] || '' };
      }
      if (dateStr.includes('-')) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          return {
            day: d.getDate().toString().padStart(2, '0'),
            month: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').substring(0, 3)
          };
        }
      }
      const parts = dateStr.split(' ');
      return {
        day: parts[0].substring(0, 2) || '',
        month: parts[1] ? parts[1].substring(0, 3) : ''
      };
    } catch {
      return { day: '', month: '' };
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* News KPI */}
        <div 
            onClick={() => setActiveTab('news')}
            className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        >
           <div>
              <p className="text-sm font-medium text-gray-500">Actualités</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{newsCount}</p>
           </div>
           <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <NewspaperIcon className="w-6 h-6" />
           </div>
        </div>

        {/* Events KPI */}
        <div 
            onClick={() => setActiveTab('events')}
            className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        >
           <div>
              <p className="text-sm font-medium text-gray-500">Événements</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{eventsCount}</p>
           </div>
           <div className="bg-purple-50 p-3 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <CalendarIcon className="w-6 h-6" />
           </div>
        </div>

        {/* GOPI KPI */}
        <div 
            onClick={() => setActiveTab('gopi')}
            className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        >
           <div>
              <p className="text-sm font-medium text-gray-500">Gazettes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{gopiCount}</p>
           </div>
           <div className="bg-green-50 p-3 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <BookOpenIcon className="w-6 h-6" />
           </div>
        </div>

        {/* Engagement KPI (Links to GOPI Orders) */}
        <div 
            onClick={() => setActiveTab('gopi')}
            className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        >
           <div>
              <p className="text-sm font-medium text-gray-500">Commandes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingOrders}</p>
              <p className="text-xs text-gray-400 mt-2 flex items-center font-medium">
                  <UsersIcon className="w-3 h-3 mr-1" /> {totalFormationRegs} inscrits aux formations
              </p>
           </div>
           <div className="bg-amber-50 p-3 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <ShoppingCartIcon className="w-6 h-6" />
           </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => openModal('news', { 
                title: '', description: '', category: 'Annonce', featured: false, 
                date: new Date().toLocaleDateString('fr-FR'), image: '' 
            })}
            className="flex items-center justify-center p-4 bg-white text-gray-900 rounded-2xl border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
          >
              <div className="bg-blue-50 p-2 rounded-lg mr-3">
                <PlusIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-semibold">Publier une actualité</span>
          </button>
          <button 
            onClick={() => openModal('event', { title: '', status: 'À venir' })}
            className="flex items-center justify-center p-4 bg-white text-gray-900 rounded-2xl border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
          >
              <div className="bg-purple-50 p-2 rounded-lg mr-3">
                <PlusIcon className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-semibold">Créer un événement</span>
          </button>
          <button 
            onClick={() => openModal('gopi', { title: '', category: 'Gazette Officielle' })}
            className="flex items-center justify-center p-4 bg-white text-gray-900 rounded-2xl border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
          >
              <div className="bg-green-50 p-2 rounded-lg mr-3">
                <PlusIcon className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-semibold">Publier une GOPI</span>
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent News */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <NewspaperIcon className="w-4 h-4 mr-2 text-blue-600" />
                      Dernières Actualités
                  </h3>
                  <button 
                    onClick={() => setActiveTab('news')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Voir tout
                  </button>
              </div>
              <div className="divide-y divide-gray-100 flex-1">
                  {recentNews.map((item: any) => (
                      <div key={item.id} className="p-5 flex items-start hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setActiveTab('news')}>
                          <div className="w-16 h-16 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 mr-4">
                              {item.image ? (
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-medium">NO IMG</div>
                              )}
                          </div>
                          <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h4>
                              <div className="text-xs text-gray-500 mt-1.5 flex items-center">
                                {item.date} 
                                <span className="mx-2 text-gray-300">•</span> 
                                <span className="text-blue-600 font-medium">{item.category}</span>
                              </div>
                          </div>
                      </div>
                  ))}
                  {recentNews.length === 0 && <div className="p-8 text-center text-gray-400 text-sm font-medium">Aucune actualité</div>}
              </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-purple-600" />
                      Prochains Événements
                  </h3>
                  <button 
                    onClick={() => setActiveTab('events')}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                  >
                    Voir tout
                  </button>
              </div>
              <div className="divide-y divide-gray-100 flex-1">
                  {upcomingEvents.map((item: any) => (
                      <div key={item.id} className="p-5 flex items-center hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setActiveTab('events')}>
                          <div className="w-14 h-14 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 flex flex-col items-center justify-center mr-4 flex-shrink-0">
                              <span className="text-lg font-bold leading-none">{parseEventDate(item.date).day}</span>
                              <span className="text-[10px] uppercase font-semibold mt-0.5">{parseEventDate(item.date).month}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h4>
                              <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-2"></span>
                                  {item.location}
                              </p>
                          </div>
                      </div>
                  ))}
                  {upcomingEvents.length === 0 && <div className="p-8 text-center text-gray-400 text-sm font-medium">Aucun événement</div>}
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminOverview;
