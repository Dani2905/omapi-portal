
import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import { useCrud } from '../hooks/useCrud';
import { JobOffer } from '../types';
import { DEFAULT_JOBS } from '../constants';
import 'react-quill-new/dist/quill.snow.css'; // Import for rich text styles
import { isJobOpenOnDate, normalizeJobOfferDraft } from '../utils/jobLogic';

const Jobs: React.FC = () => {
  const { items: jobs } = useCrud<JobOffer>('omapi_jobs', DEFAULT_JOBS, () => {});

  const openJobs = jobs.filter((job): job is JobOffer => Boolean(job && isJobOpenOnDate(job)));

  return (
    <div className="bg-white min-h-screen font-sans">
      <Breadcrumb items={[{ label: 'Emplois' }]} />

      {/* Hero Section */}
      <section className="bg-[#002B49] text-white py-16 lg:py-24">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
              Façonnez l'avenir de l'innovation à Madagascar
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-light">
              Rejoignez une équipe d'experts dédiés à la protection et à la promotion de la créativité et de l'ingéniosité malgaches.
            </p>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 md:py-20 border-b border-gray-100">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-[#002B49] mb-6">Pourquoi rejoindre l'OMAPI ?</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#002B49] mb-2">Impact National</h3>
                  <p className="text-gray-700">Votre travail soutient directement le développement économique et technologique de Madagascar en protègeant les inventeurs locaux.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#002B49] mb-2">Expertise de Pointe</h3>
                  <p className="text-gray-700">Travaillez aux côtés d'experts nationaux et collaborez avec des organisations internationales comme l'OMPI et l'OAPI.</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#002B49] mb-2">Développement Professionnel</h3>
                  <p className="text-gray-700">Nous investissons dans la formation continue de nos agents pour maintenir un haut niveau de compétence technique et juridique.</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 p-8 border-l-8 border-[#D3273E]">
              <blockquote className="text-2xl italic text-gray-800 mb-6">
                "Travailler à l'OMAPI, c'est être aux premières loges de la création malgache tous les jours."
              </blockquote>
              <p className="font-bold text-[#002B49]">— Un Examinateur de Brevets</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Openings Static Message */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto max-w-5xl px-4 lg:px-8">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-extrabold text-[#002B49]">Postes vacants</h2>
          </div>

          {openJobs.length > 0 ? (
            <div className="space-y-6">
              {openJobs.map(job => (
                <div key={job.id} className="bg-white border text-left border-gray-200 p-6 md:p-8 hover:shadow-lg transition-shadow flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 min-w-0 break-words">
                    <h3 className="text-xl font-bold text-[#002B49] mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> {job.department}</span>
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location}</span>
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {job.type} ({job.experience})</span>
                    </div>
                    <div 
                      className="text-gray-700 text-sm border-t border-gray-100 pt-4 mt-4 richtext-content text-wrap break-words"
                      dangerouslySetInnerHTML={{ __html: String(normalizeJobOfferDraft(job).description || '') }}
                    />
                  </div>
                  <div className="shrink-0 mt-2 md:mt-0">
                     <Link to={`/postuler?jobId=${job.id}`} className="inline-block px-6 py-3 bg-[#002B49] text-white font-medium hover:bg-blue-900 transition-colors w-full md:w-auto text-center">
                       Postuler
                     </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FFF8E1] border-2 border-[#FFB700] p-8 md:p-12 text-center">
              <Briefcase className="w-16 h-16 text-[#FFB700] mx-auto mb-6" />
              <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
                Nous n'avons pas de postes vacants pour le moment, mais nous sommes toujours à la recherche de talents.
              </p>
              <Link to="/postuler" className="inline-block w-full sm:w-auto text-center bg-[#002B49] text-white px-6 sm:px-10 py-4 font-bold text-base sm:text-lg hover:bg-[#004f87] transition-colors shadow-lg">
                Envoyer une candidature spontanée
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Equal Opportunity */}
      <section className="py-12 bg-white text-center border-t border-gray-100">
        <div className="container mx-auto max-w-3xl px-4">
          <p className="text-sm text-gray-500 font-medium italic">
            L'OMAPI est un employeur offrant l'égalité des chances. Nous célébrons la diversité et nous nous engageons à créer un environnement inclusif pour tous les employés.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Jobs;
