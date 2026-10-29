
import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import ProcedureSidebar from '../components/ProcedureSidebar';
import { BREVETS_NAVIGATION } from '../data/brevetsData';
import BrevetsHeader from '../components/brevets/BrevetsHeader';
import Definition from '../components/brevets/sections/Definition';
import DepotProcedure from '../components/brevets/sections/DepotProcedure';
import Tarifs from '../components/brevets/sections/Tarifs';
import Examen from '../components/brevets/sections/Examen';
import Delivrance from '../components/brevets/sections/Delivrance';
import Annuites from '../components/brevets/sections/Annuites';
import Modifications from '../components/brevets/sections/Modifications';
import Transfert from '../components/brevets/sections/Transfert';
import Radiation from '../components/brevets/sections/Radiation';

const Brevets: React.FC = () => {
  const [activeSection, setActiveSection] = useState('definition');

  // Smooth scroll
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  // Scrollspy
  useEffect(() => {
    const handleScroll = () => {
      for (const section of BREVETS_NAVIGATION) {
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
      <Breadcrumb items={[{ label: 'Procédures' }, { label: 'Brevets' }]} />

      <BrevetsHeader />

      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
                <ProcedureSidebar 
                    sections={BREVETS_NAVIGATION} 
                    activeSection={activeSection} 
                    onNavigate={scrollToSection}
                    colorTheme="amber"
                />
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4 space-y-16">
                
                <Definition />
                <DepotProcedure />
                <Tarifs />
                <Examen />
                <Delivrance />
                <Annuites />
                <Modifications />
                <Transfert />
                <Radiation />

            </div>
        </div>
      </div>
    </div>
  );
};

export default Brevets;
