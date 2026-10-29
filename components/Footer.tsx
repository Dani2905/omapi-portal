import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0b1e42] text-white pt-16 pb-8 border-t-4 border-red-700">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Organization */}
          <div>
            <div className="mb-6">
                <img 
                  src="https://drive.google.com/thumbnail?id=1F6Xyjj4LvHoeCIRbFieU6pg6sxMMKCR3&sz=w800" 
                  alt="Logo OMAPI" 
                  className="h-14 w-auto object-contain mb-4 bg-white p-1.5 rounded shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-blue-800 pb-2">L'Office</h3>
            </div>
            <address className="not-italic text-sm text-gray-300 leading-relaxed space-y-2">
              <p><strong>OMAPI</strong></p>
              <p>LOT VH 69 Volosarika Ambanidia</p>
              <p>Antananarivo 101, Madagascar</p>
              <p className="mt-4"><a href="tel:+261344315236" className="hover:text-white hover:underline">(+261 34) 43 152 36</a></p>
              <p><a href="mailto:omapi@moov.mg" className="hover:text-white hover:underline">omapi@moov.mg</a></p>
            </address>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-blue-800 pb-2">Ressources</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/gopi" className="hover:text-white hover:underline">Gazette Officielle (GOPI)</Link></li>
              <li><Link to="/formulaires" className="hover:text-white hover:underline">Formulaires & Guides</Link></li>
              <li><Link to="/legislation" className="hover:text-white hover:underline">Législation & Textes</Link></li>
              <li><Link to="/service/marque" className="hover:text-white hover:underline">Recherche de Marques</Link></li>
              <li><Link to="/service/brevet" className="hover:text-white hover:underline">Base de données Brevets</Link></li>
              <li><Link to="/faq" className="hover:text-white hover:underline">Foire Aux Questions</Link></li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-blue-800 pb-2">Politiques</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link to="/legislation" className="hover:text-white hover:underline">Politique de confidentialité</Link></li>
              <li><Link to="/legislation" className="hover:text-white hover:underline">Conditions d'utilisation</Link></li>
              <li><Link to="/faq" className="hover:text-white hover:underline">Accessibilité</Link></li>
              <li><Link to="/legislation" className="hover:text-white hover:underline">Sécurité de l'information</Link></li>
              <li><Link to="/missions" className="hover:text-white hover:underline">Plan stratégique</Link></li>
              <li><Link to="/gopi" className="hover:text-white hover:underline">Données ouvertes</Link></li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-blue-800 pb-2">Restez connecté</h3>
            <p className="text-sm text-gray-300 mb-4">Suivez-nous sur les réseaux sociaux pour les dernières mises à jour.</p>
            <div className="flex space-x-4 mb-6">
              <a href="https://www.facebook.com/OmapiMadagascar" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#0b1e42] transition-all" aria-label="Facebook">
                <i className="fab fa-facebook-f text-lg"></i>
              </a>
              <a href="https://www.linkedin.com/company/omapi-madagascar" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#0b1e42] transition-all" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in text-lg"></i>
              </a>
              <a href="https://www.youtube.com/@omapi-madagascar" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#0b1e42] transition-all" aria-label="YouTube">
                <i className="fab fa-youtube text-lg"></i>
              </a>
            </div>
            <div className="bg-blue-800 p-4 rounded text-center">
                <p className="text-xs text-blue-200 mb-2">Abonnez-vous à notre newsletter</p>
                <Link to="/contact" className="inline-block bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2 px-4 rounded transition-colors uppercase">
                    S'inscrire
                </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Office Malgache de la Propriété Industrielle. Tous droits réservés. | Développé par Daniel's Dev</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/login" className="hover:text-white flex items-center gap-1">
              <i className="fas fa-lock text-[10px]"></i> Accès Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
