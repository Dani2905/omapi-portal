
import React from 'react';
import HeroSlider from '../components/HeroSlider';
import NewsTabsSection from '../components/home/NewsTabsSection';
import IPStrategySection from '../components/home/IPStrategySection';
import FeaturedResourcesSection from '../components/home/FeaturedResourcesSection';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Main Hero Slider (Top Banner) */}
      <HeroSlider />
      
      <div className="mt-8 bg-white">
        {/* News, Blog, Remarks Panels */}
        <NewsTabsSection />

        {/* PI strategy and management tools */}
        <IPStrategySection />

        {/* Featured Resources (OMAPI Hour & Video) */}
        <FeaturedResourcesSection />
      </div>
    </div>
  );
};

export default Home;
