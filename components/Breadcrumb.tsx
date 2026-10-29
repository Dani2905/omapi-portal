import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  items: { label: string; path?: string }[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <div className={`bg-gray-100 py-3 border-b border-gray-200 ${className}`}>
      <div className="container mx-auto max-w-7xl px-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary transition-colors">
            <i className="fas fa-home mr-1"></i> Accueil
          </Link>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <i className="fas fa-chevron-right text-xs text-gray-400"></i>
              {item.path ? (
                <Link to={item.path} className="hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-primary font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;