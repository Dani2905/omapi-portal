
import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import ProcedureSidebar from '../components/ProcedureSidebar';
import MarquesHeader from '../components/marques/MarquesHeader';
import Definition from '../components/marques/sections/Definition';
import DepotProcedure from '../components/marques/sections/DepotProcedure';
import Taxes from '../components/marques/sections/Taxes';
import Renouvellement from '../components/marques/sections/Renouvellement';
import Registre from '../components/marques/sections/Registre';
import Transfert from '../components/marques/sections/Transfert';
import Radiation from '../components/marques/sections/Radiation';

const Marques: React.FC = () => {
  const [activeSection, setActiveSection] = useState('notion');

  // Smooth scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  // Sections definition for the sidebar
  const sections = [
    { id: 'notion', label: 'Notion de Marque' },
    { id: 'depot', label: 'Dépôt Initial & Procédure' },
    { id: 'taxes', label: 'Taxes et Tarifs' },
    { id: 'renouvellement', label: 'Renouvellement' },
    { id: 'registre', label: 'Inscription au Registre' },
    { id: 'transfert', label: 'Transfert de Marque' },
    { id: 'radiation', label: 'Radiation du Droit' },
  ];

  // Update active section on scroll
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
          { label: 'Marques' }
        ]} 
      />

      {/* Hero Header */}
      <MarquesHeader />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation (Desktop Sticky) */}
            <div className="lg:w-1/4">
                <ProcedureSidebar 
                    sections={sections}
                    activeSection={activeSection}
                    onNavigate={scrollToSection}
                    colorTheme="blue"
                />
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 space-y-16">
                
                {/* Section 0: Notion de Marque */}
                <Definition />

                {/* Section 1: Dépôt Initial */}
                <DepotProcedure />

                {/* Section 2: Taxes */}
                <Taxes />

                {/* Section 3: Renouvellement */}
                <Renouvellement />

                {/* Section 4: Inscription au Registre */}
                <Registre />

                {/* Section 5: Transfert */}
                <Transfert />

                {/* Section 6: Radiation */}
                <Radiation />

            </div>
        </div>
      </div>
    </div>
  );
};

export default Marques;
