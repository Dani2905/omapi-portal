
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AnnouncementBar from './components/home/AnnouncementBar';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Presentation from './pages/Presentation';
import Missions from './pages/Missions';
import Organisation from './pages/Organisation';
import ServiceDetail from './pages/ServiceDetail';
import Marques from './pages/Marques';
import Brevets from './pages/Brevets';
import Dessins from './pages/Dessins';
import NomsCommerciaux from './pages/NomsCommerciaux';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import InternationalProcedures from './pages/InternationalProcedures';
import Formulaires from './pages/Formulaires';
import Guides from './pages/Guides';
import Faq from './pages/Faq';
import Gopi from './pages/Gopi';
import Jobs from './pages/Jobs';
import Apply from './pages/Apply';
import Formations from './pages/Formations';
import Legislation from './pages/Legislation';
import RessourcesAccueil from './pages/RessourcesAccueil';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import SearchResults from './pages/SearchResults';

// Helper component to render layout with Header/Footer for public pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen font-sans text-gray-800">
    <Header />
    <AnnouncementBar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Header & Footer */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/jobs" element={<PublicLayout><Jobs /></PublicLayout>} />
        <Route path="/postuler" element={<PublicLayout><Apply /></PublicLayout>} />
        
        {/* L'Office Submenu Routes */}
        <Route path="/presentation" element={<PublicLayout><Presentation /></PublicLayout>} />
        <Route path="/missions" element={<PublicLayout><Missions /></PublicLayout>} />
        <Route path="/organisation" element={<PublicLayout><Organisation /></PublicLayout>} />

        {/* Routes spécifiques Procédures */}
        <Route path="/service/marque" element={<PublicLayout><Marques /></PublicLayout>} />
        <Route path="/service/brevet" element={<PublicLayout><Brevets /></PublicLayout>} />
        <Route path="/service/dessin" element={<PublicLayout><Dessins /></PublicLayout>} />
        <Route path="/service/nom-commercial" element={<PublicLayout><NomsCommerciaux /></PublicLayout>} />
        
        {/* Route générique pour les autres services */}
        <Route path="/service/:id" element={<PublicLayout><ServiceDetail /></PublicLayout>} />
        
        {/* Ressources Routes */}
        <Route path="/ressources" element={<PublicLayout><RessourcesAccueil /></PublicLayout>} />
        <Route path="/news" element={<PublicLayout><News /></PublicLayout>} />
        <Route path="/news/:id" element={<PublicLayout><NewsDetail /></PublicLayout>} />
        <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
        <Route path="/events/:id" element={<PublicLayout><EventDetail /></PublicLayout>} />
        <Route path="/formations" element={<PublicLayout><Formations /></PublicLayout>} />
        <Route path="/legislation" element={<PublicLayout><Legislation /></PublicLayout>} />
        <Route path="/formulaires" element={<PublicLayout><Formulaires /></PublicLayout>} />
        <Route path="/guides" element={<PublicLayout><Guides /></PublicLayout>} />
        <Route path="/faq" element={<PublicLayout><Faq /></PublicLayout>} />
        <Route path="/gopi" element={<PublicLayout><Gopi /></PublicLayout>} />
        <Route path="/search" element={<PublicLayout><SearchResults /></PublicLayout>} />

        {/* International Route */}
        <Route path="/international" element={<PublicLayout><InternationalProcedures /></PublicLayout>} />

        {/* Auth & Admin Routes (No public Header/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;