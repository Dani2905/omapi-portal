import React, { useState } from 'react';
import { JobApplication } from '../../types';
import { DocumentTextIcon, XMarkIcon, EyeIcon, CalendarIcon, BriefcaseIcon } from './AdminIcons';
import { isSafeApplicationFileUrl, normalizeApplicantFileName, normalizeJobApplicationRecord } from '../../utils/jobLogic';

interface AdminJobApplicationsManagerProps {
  applications: JobApplication[];
  onUpdateStatus: (application: JobApplication, status: JobApplication['status']) => void | boolean | Promise<void | boolean>;
  onDelete: (id: number) => void;
}

const AdminJobApplicationsManager: React.FC<AdminJobApplicationsManagerProps> = ({ applications, onUpdateStatus, onDelete }) => {
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<JobApplication['status'] | null>(null);
  const [statusError, setStatusError] = useState('');
  const safeApplications = (Array.isArray(applications) ? applications : [])
    .map(normalizeJobApplicationRecord)
    .filter((application): application is JobApplication => application !== null)
    .sort((left, right) => {
      const leftTime = new Date(left.applicationDate).getTime();
      const rightTime = new Date(right.applicationDate).getTime();
      return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
    });

  const formatDate = (value: string, withTime = false) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Date inconnue' : date.toLocaleString('fr-FR', withTime ? undefined : { dateStyle: 'short' });
  };

  const updateStatus = async (status: JobApplication['status']) => {
    if (!selectedApp || status === selectedApp.status || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setPendingStatus(status);
    setStatusError('');
    try {
      const saved = await onUpdateStatus(selectedApp, status);
      if (saved === false) {
        setStatusError("Le nouveau statut n'a pas pu être enregistré.");
        return;
      }
      setSelectedApp((current) => current ? { ...current, status } : current);
    } catch {
      setStatusError("Une erreur est survenue lors de la mise à jour du statut.");
    } finally {
      setIsUpdatingStatus(false);
      setPendingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Nouvelle': return 'bg-blue-100 text-blue-800';
      case 'En cours': return 'bg-yellow-100 text-yellow-800';
      case 'Acceptée': return 'bg-green-100 text-green-800';
      case 'Rejetée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-gray-900">Gestion des Candidatures</h2>
      </div>

      <div className="bg-white border text-left border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidat</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Poste</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeApplications.length > 0 ? safeApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{app.firstName} {app.lastName}</div>
                    <div className="text-xs text-gray-500">{app.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.jobTitle || 'Candidature spontanée'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDate(app.applicationDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setSelectedApp(app)} className="text-[#002B49] hover:bg-blue-50 p-2 rounded mr-2" title="Voir les détails">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => { if(window.confirm('Voulez-vous vraiment supprimer cette candidature ?')) onDelete(app.id) }} className="text-red-600 hover:bg-red-50 p-2 rounded" title="Supprimer">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>Aucune candidature reçue pour le moment.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Détails de la candidature</h3>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
                 <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-2xl font-bold">
                    {String(selectedApp.firstName || '?').charAt(0)}{String(selectedApp.lastName || '?').charAt(0)}
                 </div>
                 <div>
                   <h4 className="text-xl font-bold text-gray-900">{selectedApp.firstName} {selectedApp.lastName}</h4>
                   <p className="text-gray-500">{selectedApp.email} • {selectedApp.phone}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <h5 className="text-sm font-semibold text-gray-500 uppercase mb-1">Poste visé</h5>
                  <p className="font-medium text-gray-900 flex items-center">
                    <BriefcaseIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {selectedApp.jobTitle || 'Candidature spontanée'}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-500 uppercase mb-1">Date de candidature</h5>
                  <p className="font-medium text-gray-900 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(selectedApp.applicationDate, true)}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-500 uppercase mb-2">Message</h5>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm whitespace-pre-wrap">
                  {selectedApp.message || <span className="italic text-gray-400">Aucun message</span>}
                </div>
              </div>

              <div className="mb-8">
                <h5 className="text-sm font-semibold text-gray-500 uppercase mb-2">Documents</h5>
                <div className="flex flex-wrap gap-4">
                  {isSafeApplicationFileUrl(selectedApp.cvUrl) ? (
                    <a href={selectedApp.cvUrl} download={normalizeApplicantFileName(selectedApp.cvFileName, `CV_${selectedApp.firstName}_${selectedApp.lastName}.pdf`)} className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">
                      <DocumentTextIcon className="w-5 h-5 mr-2" />Télécharger le CV
                    </a>
                  ) : <span className="text-sm text-gray-500">CV indisponible ou invalide</span>}
                  {selectedApp.coverLetterUrl && (isSafeApplicationFileUrl(selectedApp.coverLetterUrl) ? (
                    <a href={selectedApp.coverLetterUrl} download={normalizeApplicantFileName(selectedApp.coverLetterFileName, `Lettre_${selectedApp.firstName}_${selectedApp.lastName}.pdf`)} className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100 transition-colors">
                      <DocumentTextIcon className="w-5 h-5 mr-2" />Télécharger la lettre
                    </a>
                  ) : <span className="text-sm text-gray-500">Lettre indisponible ou invalide</span>)}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                 <h5 className="text-sm font-semibold text-gray-500 uppercase mb-3">Mettre à jour le statut</h5>
                 {statusError && <p role="alert" className="mb-3 text-sm text-red-700">{statusError}</p>}
                 <div className="flex flex-wrap gap-3">
                   {(['Nouvelle', 'En cours', 'Acceptée', 'Rejetée'] as JobApplication['status'][]).map(status => (
                     <button key={status} type="button" disabled={isUpdatingStatus || selectedApp.status === status} onClick={() => void updateStatus(status)}
                       className={`px-4 py-2 rounded-full text-sm font-medium border disabled:cursor-not-allowed disabled:opacity-70 ${selectedApp.status === status ? getStatusColor(status) : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                       {pendingStatus === status ? 'Enregistrement…' : status}
                     </button>
                   ))}
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobApplicationsManager;
