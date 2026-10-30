import React, { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { JobOffer } from '../../types';
import { getJobAvailabilityLabel } from '../../utils/jobLogic';

interface AdminJobsManagerProps {
  jobs: JobOffer[];
  onEdit: (job: JobOffer) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

const AdminJobsManager: React.FC<AdminJobsManagerProps> = ({ jobs, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const filteredJobs = jobs.filter((job): job is JobOffer => Boolean(job && typeof job === 'object')).filter(job => {
    const title = typeof job.title === 'string' ? job.title : '';
    const department = typeof job.department === 'string' ? job.department : '';
    return title.toLocaleLowerCase().includes(normalizedSearch) || department.toLocaleLowerCase().includes(normalizedSearch);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestion des Offres d'Emploi</h2>
          <p className="text-sm text-gray-500 mt-1">Publiez et gérez les offres d'emploi sur le portail</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-[#002B49] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors flex items-center shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter une offre
        </button>
      </div>

      <div className="p-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="Rechercher une offre..."
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm">
              <th className="p-4 font-semibold text-gray-600">Titre</th>
              <th className="p-4 font-semibold text-gray-600">Département</th>
              <th className="p-4 font-semibold text-gray-600">Type</th>
              <th className="p-4 font-semibold text-gray-600">Statut</th>
              <th className="p-4 font-semibold text-gray-600 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-gray-800">{job.title || 'Offre sans titre'}</div>
                    <div className="text-xs text-gray-500 mt-1">{job.location || 'Lieu non renseigné'} • Exp. {job.experience || '—'}</div>
                  </td>
                  <td className="p-4 text-gray-600">{job.department || '—'}</td>
                  <td className="p-4 text-gray-600">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                        {job.type}
                    </span>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const availability = getJobAvailabilityLabel(job);
                      const isActuallyOpen = availability === 'Ouvert';
                      return <span className={`inline-block px-2 py-1 text-xs rounded-md font-medium ${isActuallyOpen ? 'bg-green-100 text-green-700' : availability === 'À venir' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {availability}
                      </span>;
                    })()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => onEdit(job)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('Voulez-vous vraiment supprimer cette offre ?')) {
                              onDelete(job.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                        Aucune offre trouvée.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminJobsManager;
