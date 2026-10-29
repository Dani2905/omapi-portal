import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { Briefcase, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useCrud } from '../hooks/useCrud';
import { JobOffer, JobApplication } from '../types';
import { DEFAULT_JOBS } from '../constants';

const Apply: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // We can pass job info via state: { jobId, jobTitle } or query param
  const passedJobId = location.state?.jobId || new URLSearchParams(location.search).get('jobId');
  const [jobId, setJobId] = useState<string>(passedJobId ? String(passedJobId) : '');

  const { items: jobs } = useCrud<JobOffer>('omapi_jobs', DEFAULT_JOBS, () => {});
  const { saveItem: addApplication } = useCrud<JobApplication>('omapi_job_applications', [], () => {});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'jobId') {
      setJobId(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'coverLetter') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 700 * 1024) { // 700KB max for demo database compatibility
        setError(`Le fichier ${file.name} dépasse la taille maximale autorisée (700 Ko pour cette version d'essai).`);
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setError("Seuls les formats PDF, DOC et DOCX sont acceptés.");
        return;
      }
      setError('');
      if (type === 'cv') {
        setCvFile(file);
      } else {
        setCoverLetterFile(file);
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cvFile) {
      setError("Veuillez importer votre CV.");
      return;
    }

    setIsSubmitting(true);

    try {
      const cvUrl = await fileToBase64(cvFile);
      const coverLetterUrl = coverLetterFile ? await fileToBase64(coverLetterFile) : null;

      const selectedJob = jobs.find(j => j.id.toString() === jobId);

      const application: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        cvUrl,
        applicationDate: new Date().toISOString(),
        status: 'Nouvelle'
      };

      if (selectedJob?.id) application.jobId = selectedJob.id;
      if (selectedJob?.title) application.jobTitle = selectedJob.title;
      if (formData.message) application.message = formData.message;
      if (coverLetterUrl) application.coverLetterUrl = coverLetterUrl;

      // Exclude id so addItem assigns a real ID
      await addApplication(application as Omit<JobApplication, 'id'>);
      setIsSubmitting(false);
      setSubmitSuccess(true);
    } catch (err) {
      setError("Erreur lors de l'upload du fichier. Veuillez réessayer.");
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-gray-50 min-h-screen py-24">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[#002B49] mb-4">Candidature envoyée avec succès</h1>
            <p className="text-lg text-gray-600 mb-8">
              Nous avons bien reçu votre candidature. Notre équipe de recrutement l'examinera dans les plus brefs délais. 
              Si votre profil correspond à nos attentes, nous vous contacterons pour la suite du processus.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/jobs" className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 transition-colors">
                Retour aux offres
              </Link>
              <Link to="/" className="px-6 py-3 bg-[#002B49] text-white font-medium rounded hover:bg-blue-900 transition-colors">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="bg-[#002B49] py-16 text-white text-center">
        <h1 className="text-4xl font-extrabold mb-4">Postuler à l'OMAPI</h1>
        <p className="text-xl max-w-2xl mx-auto opacity-90 px-4">
          Rejoignez une équipe dynamique au cœur de l'innovation et de la protection de la propriété industrielle.
        </p>
      </div>

      <Breadcrumb items={[
        { label: 'Accueil', path: '/' },
        { label: 'Carrières', path: '/jobs' },
        { label: 'Postuler' }
      ]} />

      <div className="container mx-auto max-w-4xl px-4 lg:px-8 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Offre */}
            <div className="border-b border-gray-100 pb-8">
              <h2 className="text-xl font-bold text-[#002B49] mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" /> 
                Offre concernée
              </h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Choisir une offre ou candidature spontanée</label>
                <select
                  name="jobId"
                  value={jobId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                >
                  <option value="">Candidature spontanée</option>
                  {jobs.filter(j => j.status === 'Ouvert').map(job => (
                    <option key={job.id} value={job.id.toString()}>{job.title} - {job.location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 2: Informations personnelles */}
            <div className="border-b border-gray-100 pb-8">
              <h2 className="text-xl font-bold text-[#002B49] mb-4">Vos coordonnées</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                    placeholder="votre.email@exemple.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                    placeholder="+261 34 00 000 00"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Fichiers */}
            <div className="border-b border-gray-100 pb-8">
              <h2 className="text-xl font-bold text-[#002B49] mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Vos documents
              </h2>
              <p className="text-sm text-gray-600 mb-6">Formats acceptés : PDF, DOC, DOCX. Taille maximale : 5 Mo par fichier.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CV Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Curriculum Vitae (CV) <span className="text-red-500">*</span></label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="cv-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#002B49] hover:text-blue-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#002B49]">
                          <span>Importer un fichier</span>
                          <input id="cv-upload" name="cv-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'cv')} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        {cvFile ? cvFile.name : "Aucun fichier sélectionné"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cover Letter Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lettre de motivation</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="lm-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#002B49] hover:text-blue-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#002B49]">
                          <span>Importer un fichier</span>
                          <input id="lm-upload" name="lm-upload" type="file" className="sr-only" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'coverLetter')} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        {coverLetterFile ? coverLetterFile.name : "Optionnel"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Message */}
            <div>
              <h2 className="text-xl font-bold text-[#002B49] mb-4">Message additionnel</h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Avez-vous quelque chose à ajouter ? (Optionnel)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors"
                  placeholder="Informations complémentaires, liens vers votre portfolio, etc."
                ></textarea>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-4 px-8 border border-transparent shadow-sm text-lg font-bold rounded-lg text-white bg-[#002B49] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002B49] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Apply;
