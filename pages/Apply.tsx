import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { Briefcase, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useCrud } from '../hooks/useCrud';
import { JobOffer, JobApplication } from '../types';
import { DEFAULT_JOBS } from '../constants';
import {
  getApplicationFileMime,
  isJobOpenOnDate,
  isValidApplicationFileSignature,
  JOB_APPLICATION_FILE_MAX_BYTES,
  validateApplicationFileMetadata,
} from '../utils/jobLogic';

const Apply: React.FC = () => {
  const location = useLocation();
  const stateJobId = location.state?.jobId;
  const passedJobId = stateJobId !== undefined && stateJobId !== null
    ? stateJobId
    : new URLSearchParams(location.search).get('jobId');
  const [jobId, setJobId] = useState<string>(passedJobId ? String(passedJobId) : '');
  const { items: jobs } = useCrud<JobOffer>('omapi_jobs', DEFAULT_JOBS, () => {});
  const { saveItem: addApplication } = useCrud<JobApplication>('omapi_job_applications', [], () => {});
  const availableJobs = jobs.filter((job): job is JobOffer => Boolean(job && isJobOpenOnDate(job)));

  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const submissionLock = useRef(false);

  useEffect(() => {
    setJobId(passedJobId ? String(passedJobId) : '');
  }, [passedJobId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'jobId') setJobId(value);
    else setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'coverLetter') => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const clearSelectedFile = () => {
      if (type === 'cv') setCvFile(null);
      else setCoverLetterFile(null);
      input.value = '';
    };

    const metadataError = validateApplicationFileMetadata(file);
    if (metadataError) {
      clearSelectedFile();
      setError(`${file.name} : ${metadataError}`);
      return;
    }

    try {
      const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
      if (!isValidApplicationFileSignature(file.name, header)) {
        clearSelectedFile();
        setError(`${file.name} : le contenu du fichier ne correspond pas à un document PDF, DOC ou DOCX valide.`);
        return;
      }
      if (type === 'cv') setCvFile(file);
      else setCoverLetterFile(file);
      setError('');
    } catch {
      clearSelectedFile();
      setError("Impossible de vérifier ce fichier. Veuillez réessayer avec un autre document.");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return reject(new Error('Lecture du fichier impossible'));
      const mime = getApplicationFileMime(file.name);
      const separatorIndex = reader.result.indexOf(',');
      if (!mime || separatorIndex < 0) return reject(new Error('Format de fichier impossible à vérifier'));
      resolve(`data:${mime};base64,${reader.result.slice(separatorIndex + 1)}`);
    };
    reader.onerror = () => reject(new Error('Lecture du fichier impossible'));
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submissionLock.current) return;
    setError('');

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    if (!firstName || !lastName || !email || !phone) {
      setError('Veuillez renseigner votre prénom, votre nom, votre adresse e-mail et votre téléphone.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    if (!cvFile) {
      setError('Veuillez importer votre CV.');
      return;
    }
    if (validateApplicationFileMetadata(cvFile) || (coverLetterFile && validateApplicationFileMetadata(coverLetterFile))) {
      setError('Un document sélectionné est invalide. Veuillez le retirer et le sélectionner à nouveau.');
      return;
    }

    let selectedJob: JobOffer | undefined;
    if (jobId) {
      let latestJobs = jobs;
      try {
        const storedJobs = localStorage.getItem('omapi_jobs');
        if (storedJobs !== null) {
          const parsed: unknown = JSON.parse(storedJobs);
          if (Array.isArray(parsed)) latestJobs = parsed as JobOffer[];
        }
      } catch {
        setError("Impossible de vérifier l'offre sélectionnée. Actualisez la page puis réessayez.");
        return;
      }
      selectedJob = latestJobs.find((job) => job && String(job.id) === jobId && isJobOpenOnDate(job));
      if (!selectedJob) {
        setError("Cette offre n'est plus ouverte ou n'existe plus. Choisissez une offre actuellement disponible ou envoyez une candidature spontanée.");
        return;
      }
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    try {
      const cvUrl = await fileToBase64(cvFile);
      const coverLetterUrl = coverLetterFile ? await fileToBase64(coverLetterFile) : undefined;
      const application: Omit<JobApplication, 'id'> = {
        firstName,
        lastName,
        email,
        phone,
        cvUrl,
        cvFileName: cvFile.name,
        applicationDate: new Date().toISOString(),
        status: 'Nouvelle',
        ...(selectedJob ? { jobId: selectedJob.id, jobTitle: selectedJob.title } : {}),
        ...(formData.message.trim() ? { message: formData.message.trim() } : {}),
        ...(coverLetterUrl && coverLetterFile ? { coverLetterUrl, coverLetterFileName: coverLetterFile.name } : {}),
      };
      const saved = await addApplication(application);
      if (!saved) {
        setError("La candidature n'a pas pu être enregistrée dans ce navigateur. Libérez de l'espace puis réessayez.");
        return;
      }
      setSubmitSuccess(true);
    } catch {
      setError("Une erreur est survenue lors de la préparation ou de l'enregistrement de votre candidature. Veuillez réessayer.");
    } finally {
      submissionLock.current = false;
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
              <Link to="/jobs" className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 transition-colors">Retour aux offres</Link>
              <Link to="/" className="px-6 py-3 bg-[#002B49] text-white font-medium rounded hover:bg-blue-900 transition-colors">Retour à l'accueil</Link>
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
        <p className="text-xl max-w-2xl mx-auto opacity-90 px-4">Rejoignez une équipe dynamique au cœur de l'innovation et de la protection de la propriété industrielle.</p>
      </div>

      <Breadcrumb items={[
        { label: 'Accueil', path: '/' },
        { label: 'Carrières', path: '/jobs' },
        { label: 'Postuler' },
      ]} />

      <div className="container mx-auto max-w-4xl px-4 lg:px-8 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center" role="alert">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="border-b border-gray-100 pb-8">
              <h2 className="text-xl font-bold text-[#002B49] mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2" />Offre concernée</h2>
              <div>
                <label htmlFor="jobId" className="block text-sm font-semibold text-gray-700 mb-2">Choisir une offre ou candidature spontanée</label>
                <select id="jobId" name="jobId" value={jobId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors">
                  <option value="">Candidature spontanée</option>
                  {availableJobs.map((job) => <option key={job.id} value={String(job.id)}>{job.title} - {job.location}</option>)}
                </select>
                {jobId && !availableJobs.some((job) => String(job.id) === jobId) && <p className="mt-2 text-sm text-red-700">Cette offre n'est plus disponible. Sélectionnez une offre ouverte ou la candidature spontanée.</p>}
              </div>
            </div>

            <div className="border-b border-gray-100 pb-8">
              <h2 className="text-xl font-bold text-[#002B49] mb-4">Vos coordonnées</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">Prénom <span className="text-red-500">*</span></label><input id="firstName" type="text" name="firstName" required maxLength={100} value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors" placeholder="Votre prénom" /></div>
                <div><label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">Nom <span className="text-red-500">*</span></label><input id="lastName" type="text" name="lastName" required maxLength={100} value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors" placeholder="Votre nom" /></div>
                <div><label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label><input id="email" type="email" name="email" required maxLength={254} value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors" placeholder="votre.email@exemple.com" /></div>
                <div><label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Téléphone <span className="text-red-500">*</span></label><input id="phone" type="tel" name="phone" required maxLength={50} value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors" placeholder="+261 34 00 000 00" /></div>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-8">
              <h2 className="text-xl font-bold text-[#002B49] mb-4 flex items-center"><Upload className="w-5 h-5 mr-2" />Vos documents</h2>
              <p className="text-sm text-gray-600 mb-6">Formats acceptés : PDF, DOC, DOCX. Taille maximale : {Math.round(JOB_APPLICATION_FILE_MAX_BYTES / 1024)} Ko par fichier.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="cv-upload">Curriculum Vitae (CV) <span className="text-red-500">*</span></label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors"><div className="space-y-1 text-center"><Upload className="mx-auto h-12 w-12 text-gray-400" /><label htmlFor="cv-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#002B49] hover:text-blue-800"><span>Importer un fichier</span><input id="cv-upload" name="cv-upload" type="file" disabled={isSubmitting} className="sr-only" accept=".pdf,.doc,.docx" onChange={(e) => void handleFileChange(e, 'cv')} /></label><p className="text-xs text-gray-500 break-all">{cvFile ? cvFile.name : 'Aucun fichier sélectionné'}</p></div></div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="lm-upload">Lettre de motivation</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors"><div className="space-y-1 text-center"><Upload className="mx-auto h-12 w-12 text-gray-400" /><label htmlFor="lm-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#002B49] hover:text-blue-800"><span>Importer un fichier</span><input id="lm-upload" name="lm-upload" type="file" disabled={isSubmitting} className="sr-only" accept=".pdf,.doc,.docx" onChange={(e) => void handleFileChange(e, 'coverLetter')} /></label><p className="text-xs text-gray-500 break-all">{coverLetterFile ? coverLetterFile.name : 'Optionnel'}</p></div></div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#002B49] mb-4">Message additionnel</h2>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Avez-vous quelque chose à ajouter ? (Optionnel)</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={4} maxLength={3000} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B49] focus:bg-white transition-colors" placeholder="Votre message..." />
            </div>

            <div className="pt-4">
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#D3273E] text-white font-bold text-lg rounded-lg hover:bg-red-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
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
