
import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { SERVICES_DATA } from '../constants';

// --- Heroicons ---
const LightBulbIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);
const TagIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.593l6.002-4.5c.827-.478.966-1.583.428-2.282l-9.58-9.58A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
);
const SwatchIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
    </svg>
);
const StorefrontIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
    </svg>
);
const StarIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>);
const BrainIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>); // Reusing bulb for brain metaphor or custom svg
const CogIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const SparklesIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>);
const EyeIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const MapIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" /></svg>);
const InfinityIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h13.5m-13.5 7.5h13.5" /></svg>); // Using generic lines for infinity rep if not available, or better
const CheckIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>);
const FingerPrintIcon = ({ className }: { className?: string }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565m12.943 1.943a18.8 18.8 0 0 0-1.658-4.443" /></svg>);

const ServiceIcon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case 'bulb': return <LightBulbIcon className={className} />;
    case 'tag': return <TagIcon className={className} />;
    case 'swatch': return <SwatchIcon className={className} />;
    case 'store': return <StorefrontIcon className={className} />;
    case 'star': return <StarIcon className={className} />;
    case 'brain': return <BrainIcon className={className} />; // Using bulb here if brain is missing, or separate
    case 'cog': return <CogIcon className={className} />;
    case 'sparkles': return <SparklesIcon className={className} />;
    case 'eye': return <EyeIcon className={className} />;
    case 'map': return <MapIcon className={className} />;
    case 'infinity': return <InfinityIcon className={className} />;
    case 'check': return <CheckIcon className={className} />;
    case 'fingerprint': return <FingerPrintIcon className={className} />;
    default: return <LightBulbIcon className={className} />;
  }
};

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const service = id ? SERVICES_DATA[id] : undefined;

  if (!service) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb 
        items={[
          { label: 'Procédures' }, 
          { label: service.title }
        ]} 
      />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{service.title}</h1>
            <p className="text-xl text-secondary font-medium">{service.shortDesc}</p>
            <div className="w-24 h-1.5 bg-primary rounded-full mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
               <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl mr-4">
                     <ServiceIcon name={service.icon} className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">En bref</h2>
               </div>
               <p className="text-gray-700 leading-relaxed text-lg">
                  {service.fullDesc}
               </p>
            </div>

            {/* Features / Conditions */}
            {service.features && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.features.map((feat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-3">
                      <ServiceIcon name={feat.iconName} className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">{feat.title}</h4>
                    <p className="text-sm text-gray-600">{feat.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Steps */}
            {service.steps && (
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                 <h2 className="text-2xl font-bold text-gray-800 mb-6">Étapes de la procédure</h2>
                 <div className="space-y-6">
                    {service.steps.map((step, index) => (
                       <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                             {index + 1}
                          </div>
                          <div>
                             <h4 className="font-bold text-gray-800 text-lg mb-1">{step.title}</h4>
                             <p className="text-gray-600">{step.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Pricing */}
            {service.prices && (
               <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="bg-gray-900 p-6">
                     <h3 className="text-xl font-bold text-white flex items-center">
                        <TagIcon className="w-5 h-5 mr-3 text-accent" /> Tarifs Principaux
                     </h3>
                  </div>
                  <div className="p-6">
                     <ul className="space-y-4">
                        {service.prices.map((price, idx) => (
                           <li key={idx} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                              <span className="text-gray-600 text-sm font-medium">{price.label}</span>
                              <span className="text-primary font-bold">{price.amount}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            )}

            {/* Documents */}
            {service.docs && (
               <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                     <ServiceIcon name="tag" className="w-5 h-5 mr-2" /> Documents Requis
                  </h3>
                  <ul className="space-y-3">
                     {service.docs.map((doc, idx) => (
                        <li key={idx} className="flex items-start text-sm text-blue-800">
                           <span className="mt-1 mr-2 text-blue-500">•</span>
                           {doc}
                        </li>
                     ))}
                  </ul>
                  <div className="mt-6">
                     <Link to="/formulaires" className="block w-full text-center bg-white border border-blue-200 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                        Télécharger les formulaires
                     </Link>
                  </div>
               </div>
            )}

            {/* Assistance */}
            <div className="bg-gradient-to-br from-primary to-blue-700 rounded-xl p-6 text-white text-center shadow-lg">
               <h3 className="text-xl font-bold mb-2">Besoin d'aide ?</h3>
               <p className="text-blue-100 text-sm mb-6">Nos experts sont disponibles pour vous guider dans vos démarches.</p>
               <Link to="/contact" className="inline-block bg-white text-primary font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                  Contactez-nous
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
