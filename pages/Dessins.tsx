
import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import ProcedureSidebar from '../components/ProcedureSidebar';
import DessinsHeader from '../components/dessins/DessinsHeader';
import Definition from '../components/dessins/sections/Definition';
import DepotProcedure from '../components/dessins/sections/DepotProcedure';
import Tarifs from '../components/dessins/sections/Tarifs';
import Examen from '../components/dessins/sections/Examen';
import Renouvellement from '../components/dessins/sections/Renouvellement';
import Modifications from '../components/dessins/sections/Modifications';
import Transfert from '../components/dessins/sections/Transfert';
import Radiation from '../components/dessins/sections/Radiation';

const Dessins: React.FC = () => {
  const [activeSection, setActiveSection] = useState('definition');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const sections = [
    { id: 'definition', label: 'Conditions & Types' },
    { id: 'depot', label: 'Procédure de dépôt' },
    { id: 'tarifs', label: 'Tarifs de dépôt' },
    { id: 'examen', label: 'Examen & Délivrance' },
    { id: 'renouvellement', label: 'Renouvellement' },
    { id: 'modifications', label: 'Modifications' },
    { id: 'transfert', label: 'Transfert' },
    { id: 'radiation', label: 'Radiation' },
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
          { label: 'Dessins & Modèles' }
        ]} 
      />

      <DessinsHeader />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
                <ProcedureSidebar 
                    sections={sections}
                    activeSection={activeSection}
                    onNavigate={scrollToSection}
                    colorTheme="purple"
                />
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 space-y-16">
                
                <Definition />
                <DepotProcedure />
                <Tarifs />
                <Examen />
                <Renouvellement />
                <Modifications />
                
                <div className="grid md:grid-cols-2 gap-8">
                    <Transfert />
                    <Radiation />
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default Dessins;
