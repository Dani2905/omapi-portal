
import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import ProcedureSidebar from '../components/ProcedureSidebar';
import NomsCommerciauxHeader from '../components/noms-commerciaux/NomsCommerciauxHeader';
import Definition from '../components/noms-commerciaux/sections/Definition';
import Types from '../components/noms-commerciaux/sections/Types';
import DepotProcedure from '../components/noms-commerciaux/sections/DepotProcedure';
import Tarifs from '../components/noms-commerciaux/sections/Tarifs';
import Registre from '../components/noms-commerciaux/sections/Registre';
import Modifications from '../components/noms-commerciaux/sections/Modifications';
import Transfert from '../components/noms-commerciaux/sections/Transfert';
import Radiation from '../components/noms-commerciaux/sections/Radiation';
import Renouvellement from '../components/noms-commerciaux/sections/Renouvellement';

const NomsCommerciaux: React.FC = () => {
  const [activeSection, setActiveSection] = useState('definition');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const sections = [
    { id: 'definition', label: 'Conditions & Définition' },
    { id: 'types', label: 'Types de noms' },
    { id: 'depot', label: 'Procédure de dépôt' },
    { id: 'tarifs', label: 'Tarifs' },
    { id: 'registre', label: 'Inscription au Registre' },
    { id: 'modifications', label: 'Modifications' },
    { id: 'transfert', label: 'Transfert' },
    { id: 'radiation', label: 'Radiation' },
    { id: 'renouvellement', label: 'Renouvellement' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <Breadcrumb 
        items={[
          { label: 'Procédures' }, 
          { label: 'Noms Commerciaux' }
        ]} 
      />

      <NomsCommerciauxHeader />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
                <ProcedureSidebar 
                    sections={sections}
                    activeSection={activeSection}
                    onNavigate={scrollToSection}
                    colorTheme="emerald"
                />
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 space-y-16">
                
                <Definition />
                <Types />
                <DepotProcedure />
                <Tarifs />
                <Registre />
                <Modifications />
                <Transfert />
                <Radiation />
                <Renouvellement />

            </div>
        </div>
      </div>
    </div>
  );
};

export default NomsCommerciaux;
