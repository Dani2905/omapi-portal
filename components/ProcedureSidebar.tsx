
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from './Icons';

interface ProcedureSidebarProps {
  sections: { id: string; label: string }[];
  activeSection: string;
  onNavigate: (id: string) => void;
  colorTheme?: 'blue' | 'amber' | 'purple' | 'emerald';
}

const ProcedureSidebar: React.FC<ProcedureSidebarProps> = ({ 
  sections, 
  activeSection, 
  onNavigate,
  colorTheme = 'blue'
}) => {
  
  // Mapping pour les couleurs dynamiques
  const themeClasses = {
    blue: { border: 'border-primary', text: 'text-primary', bg: 'bg-blue-50', btn: 'bg-primary hover:bg-secondary' },
    amber: { border: 'border-amber-600', text: 'text-amber-700', bg: 'bg-amber-50', btn: 'bg-amber-600 hover:bg-amber-700' },
    purple: { border: 'border-purple-600', text: 'text-purple-700', bg: 'bg-purple-50', btn: 'bg-purple-600 hover:bg-purple-700' },
    emerald: { border: 'border-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  };

  const currentTheme = themeClasses[colorTheme];

  return (
    <div className="sticky top-24 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Sommaire</h3>
        </div>
        <nav className="flex flex-col">
            {sections.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`text-left px-4 py-3 text-sm font-medium border-l-4 transition-colors ${
                        activeSection === item.id 
                        ? `${currentTheme.border} ${currentTheme.text} ${currentTheme.bg}` 
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    {item.label}
                </button>
            ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
            <Link to="/formulaires" className={`flex items-center justify-center w-full py-2 text-white rounded-lg text-sm font-bold transition-colors ${currentTheme.btn}`}>
                <ArrowRightIcon className="w-4 h-4 mr-2" />
                Télécharger Formulaires
            </Link>
        </div>
    </div>
  );
};

export default ProcedureSidebar;
