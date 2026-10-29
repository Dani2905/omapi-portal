
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS } from '../constants';
import { MagnifyingGlassIcon } from './admin/AdminIcons';
import { Menu, X, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFindFastOpen, setIsFindFastOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const hasSession = !!localStorage.getItem('omapi_user_email') && !!localStorage.getItem('omapi_user_role');
      setIsLoggedIn(hasSession);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location.pathname]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const handleDropdownEnter = (label: string) => {
    if (window.innerWidth >= 1024) {
      setActiveDropdown(label);
    }
  };

  const handleDropdownLeave = () => {
    if (window.innerWidth >= 1024) {
      setActiveDropdown(null);
    }
  };

  const toggleMobileDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="flex flex-col w-full z-50 font-sans tracking-tight relative">
      {/* Top Banner (Official Republic of Madagascar bar) */}
      <div className="bg-[#111827] text-stone-200 py-1.5 border-b border-stone-800 relative z-50 text-xs">
        <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="h-3.5 w-5 rounded-xs shrink-0">
               <rect width="900" height="600" fill="#fff"/>
               <rect width="900" height="200" fill="#fc3d32"/>
               <rect y="200" width="900" height="200" fill="#fff"/>
               <rect y="400" width="900" height="200" fill="#007e3a"/>
            </svg>
            <span className="font-medium text-stone-300">Site officiel de la République de Madagascar</span>
            <span className="text-stone-500 hidden sm:inline">·</span>
            <span className="text-stone-400 hidden sm:inline">Ministère de l'Industrialisation et du Commerce</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-stone-400">
            <span>Antananarivo 101</span>
            <span>·</span>
            <a href="tel:+261344315236" className="hover:text-white transition-colors tabular-nums">(+261 34) 43 152 36</a>
          </div>
        </div>
      </div>

      {/* Main Header Area */}
      <div className="bg-white py-4 px-4 border-b border-stone-200 relative z-40">
        <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center group py-0.5" aria-label="Accueil OMAPI">
            <motion.div
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-flex items-center"
            >
              <img 
                src="https://drive.google.com/thumbnail?id=1F6Xyjj4LvHoeCIRbFieU6pg6sxMMKCR3&sz=w800" 
                alt="Logo OMAPI" 
                className="h-16 sm:h-18 md:h-20 max-h-20 w-auto object-contain transition-all"
                onError={(e) => {
                  // Fallback for hermetic environment
                  (e.target as HTMLElement).style.display = 'none';
                  const fb = e.currentTarget.parentElement?.parentElement?.querySelector('.logo-fallback') as HTMLElement;
                  if (fb) fb.classList.remove('hidden');
                }}
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="logo-fallback hidden border-2 border-[#002B49] px-4 py-2 bg-stone-50">
              <span className="font-serif font-black text-2xl text-[#002B49] tracking-widest">
                OMAPI
              </span>
            </div>
          </Link>

          {/* Right Action Area */}
          <div className="w-full lg:w-auto flex flex-col items-end gap-2.5">
             <div className="hidden lg:flex gap-6 text-xs font-semibold uppercase tracking-wider text-stone-600">
                <Link to="/presentation" className="hover:text-[#002B49] transition-colors">L'Office</Link>
                <Link to="/jobs" className="hover:text-[#002B49] transition-colors">Carrières</Link>
                <Link to="/contact" className="hover:text-[#002B49] transition-colors">Permanence</Link>
                <Link to="/faq" className="hover:text-[#002B49] transition-colors">Aide & FAQ</Link>
             </div>
             
             <div className="flex w-full lg:w-auto gap-2">
                <form onSubmit={handleSearch} className="flex flex-1 lg:w-80 border border-stone-300 focus-within:border-[#002B49] bg-stone-50 overflow-hidden">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher brevet, marque, bulletin..." 
                      className="w-full pl-3 pr-2 py-2 outline-none text-xs text-stone-800 bg-transparent placeholder:text-stone-400"
                    />
                    <button type="submit" className="px-3 bg-[#002B49] text-white hover:bg-[#003e69] transition-colors flex items-center justify-center">
                      <MagnifyingGlassIcon className="w-4 h-4" />
                    </button>
                </form>
                
                <div className="relative hidden md:block">
                  <button 
                    onClick={() => setIsFindFastOpen(!isFindFastOpen)}
                    className="bg-[#002B49] text-white px-5 py-2.5 font-bold text-sm whitespace-nowrap hover:bg-[#004f87] transition-colors rounded-sm flex items-center gap-2"
                  >
                      Trouver rapidement <ChevronDown className={`w-4 h-4 transition-transform ${isFindFastOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {/* Find it Fast Dropdown */}
                  {isFindFastOpen && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 shadow-xl z-50 text-sm">
                      <div className="bg-gray-100 px-4 py-2 font-bold text-gray-700 border-b border-gray-200">Raccourcis</div>
                      <Link to="/search" className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100">Recherche de brevets</Link>
                      <Link to="/search" className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100">Recherche de marques</Link>
                      <Link to="/formulaires" className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100">Soumettre une demande</Link>
                      <Link to="/gopi" className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-900">Consulter la GOPI</Link>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                  className="lg:hidden text-gray-800 p-2 border-2 border-gray-400 rounded-sm px-3 hover:bg-gray-100 flex items-center justify-center"
                  onClick={toggleMobileMenu}
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Navy Blue `#002B49`) */}
      <div className="bg-[#002B49] text-white relative z-30 hidden lg:block">
        <div className="container mx-auto max-w-7xl">
          <nav className="flex items-center">
            {NAV_ITEMS.map((item) => (
              <div 
                key={item.label} 
                className="relative group"
                onMouseEnter={() => handleDropdownEnter(item.label)}
                onMouseLeave={handleDropdownLeave}
              >
                {item.children ? (
                  item.path ? (
                    <Link 
                      to={item.path} 
                      className={`flex items-center font-bold text-[15px] px-6 py-4 border-l border-white/10 hover:bg-white hover:text-[#002B49] transition-colors ${activeDropdown === item.label ? 'bg-white text-[#002B49]' : ''}`}
                    >
                      {item.label}
                      <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                    </Link>
                  ) : (
                    <button className={`flex items-center font-bold text-[15px] px-6 py-4 border-l border-white/10 hover:bg-white hover:text-[#002B49] transition-colors ${activeDropdown === item.label ? 'bg-white text-[#002B49]' : ''}`}>
                      {item.label}
                      <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>
                  )
                ) : (
                  <Link 
                    to={item.path || '#'} 
                    className={`block font-bold text-[15px] px-6 py-4 border-l border-white/10 hover:bg-white hover:text-[#002B49] transition-colors ${location.pathname === item.path ? 'bg-white text-[#002B49]' : ''}`}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown Desktop */}
                <AnimatePresence>
                  {item.children && activeDropdown === item.label && (
                    <motion.div 
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="absolute top-full left-0 w-72 bg-white text-gray-800 shadow-2xl border-t-2 border-[#002B49] z-50"
                    >
                      <div className="p-2">
                          {item.children.map((child) => (
                          <Link 
                              key={child.label} 
                              to={child.path || '#'} 
                              className="block px-4 py-3 text-sm font-semibold hover:bg-blue-50 hover:text-blue-900 border-b border-gray-100 last:border-0 rounded-sm transition-colors"
                          >
                              {child.label}
                          </Link>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            
            {/* Login / Admin tools on far right */}
            <div className="ml-auto flex items-stretch border-l border-white/10">
                {isLoggedIn ? (
                    <Link to="/admin" className="flex items-center px-6 py-4 font-bold text-[15px] hover:bg-white hover:text-[#002B49] transition-colors">
                        Tableau de bord
                    </Link>
                ) : (
                    <Link to="/login" className="flex items-center px-6 py-4 font-bold text-[15px] hover:bg-white hover:text-[#002B49] transition-colors">
                        Connexion
                    </Link>
                )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
            className="lg:hidden absolute top-full left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-xl overflow-y-auto" 
            style={{ maxHeight: 'calc(100vh - 120px)'}}
          >
            <div className="flex flex-col">
              <div className="bg-gray-100 p-4 pb-2 text-sm font-bold text-gray-500 uppercase tracking-wider">Navigation principale</div>
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="border-b border-gray-100">
                  {item.children ? (
                    <div>
                      {item.path ? (
                        <div className="w-full flex justify-between items-center py-4 px-4 text-[#002B49] font-bold text-lg hover:bg-gray-50">
                          <Link to={item.path} onClick={() => setIsMobileMenuOpen(false)} className="hover:underline flex-grow">
                            {item.label}
                          </Link>
                          <button onClick={() => toggleMobileDropdown(item.label)} className="p-2">
                            <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => toggleMobileDropdown(item.label)}
                          className="w-full flex justify-between items-center py-4 px-4 text-[#002B49] font-bold text-lg hover:bg-gray-50"
                        >
                          {item.label}
                          <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gray-50 border-t border-gray-100 overflow-hidden"
                          >
                            {item.children.map((child) => (
                              <Link 
                                key={child.label} 
                                to={child.path || '#'} 
                                className="block py-3 px-8 text-gray-700 font-semibold hover:text-[#002B49] hover:bg-gray-100 border-b border-gray-200/50 last:border-0"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link 
                      to={item.path || '#'} 
                      className="block py-4 px-4 text-[#002B49] font-bold text-lg hover:bg-gray-50"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
               <div className="p-4 bg-gray-50 flex flex-col gap-3 border-t-4 border-gray-200 mt-2">
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Liens utiles</div>
                <Link to="/presentation" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-gray-700 hover:text-blue-900 border-b border-gray-200 pb-2">À propos de l'OMAPI</Link>
                <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-gray-700 hover:text-blue-900 border-b border-gray-200 pb-2">Emplois</Link>
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-gray-700 hover:text-blue-900 border-b border-gray-200 pb-2">Contactez-nous</Link>
                
                {isLoggedIn ? (
                    <Link 
                      to="/admin" 
                      className="block w-full mt-4 text-center border-2 border-[#002B49] text-[#002B49] py-3 font-bold hover:bg-[#002B49] hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Tableau de bord
                    </Link>
                ) : (
                    <Link 
                      to="/login" 
                      className="block w-full mt-4 text-center border-2 border-[#002B49] text-[#002B49] py-3 font-bold hover:bg-[#002B49] hover:text-white transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

