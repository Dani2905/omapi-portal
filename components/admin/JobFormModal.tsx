import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { JobOffer } from '../../types';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Partial<JobOffer>) => void;
  job: JobOffer | null;
}

const JobFormModal: React.FC<JobFormModalProps> = ({ isOpen, onClose, onSave, job }) => {
  const [formData, setFormData] = useState<Partial<JobOffer>>(job || {
    title: '',
    department: '',
    location: '',
    type: 'CDI',
    experience: '',
    description: '',
    status: 'Ouvert',
    publishDate: new Date().toISOString().split('T')[0],
    deadline: '',
    fileUrl: ''
  });

  useEffect(() => {
    if (job) {
      setFormData(job);
    } else {
      setFormData({
        title: '',
        department: '',
        location: '',
        type: 'CDI',
        experience: '',
        description: '',
        status: 'Ouvert',
        publishDate: new Date().toISOString().split('T')[0],
        deadline: '',
        fileUrl: ''
      });
    }
  }, [job, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm sm:p-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            {job ? 'Modifier l\'offre' : 'Ajouter une offre'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Titre de l'offre</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Département</label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department || ''}
                  onChange={handleChange}
                  placeholder="Ex: Marques, Brevets, Informatique"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Lieu</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Type de contrat</label>
                <select
                  name="type"
                  value={formData.type || 'CDI'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Consultant">Consultant</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Expérience requise</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience || ''}
                  onChange={handleChange}
                  placeholder="Ex: 3-5 ans"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Statut</label>
                <select
                  name="status"
                  value={formData.status || 'Ouvert'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                >
                  <option value="Ouvert">Ouvert</option>
                  <option value="Fermé">Fermé</option>
                </select>
              </div>
              
              <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Date de publication</label>
                  <input
                      type="date"
                      name="publishDate"
                      required
                      value={formData.publishDate || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                  />
              </div>

              <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Date limite (optionnelle)</label>
                  <input
                      type="date"
                      name="deadline"
                      value={formData.deadline || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                  />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Description détaillée</label>
              <div className="bg-white [&_.ql-container]:min-h-[250px] [&_.ql-editor]:min-h-[250px] [&_.ql-container]:text-sm [&_.ql-editor]:text-gray-800 [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-gray-200 [&_.ql-toolbar]:bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <ReactQuill
                  theme="snow"
                  value={formData.description || ''}
                  onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                  placeholder="Décrivez l'offre en détail..."
                  className="border-0"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#002B49] text-white rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-sm"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobFormModal;
