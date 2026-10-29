import React from 'react';

// Interface commune pour les props
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Fonction usine (Factory) pour générer des composants d'icônes standardisés.
 * Cela évite de répéter le wrapper SVG pour chaque icône.
 */
export const createIcon = (path: React.ReactNode) => {
  // eslint-disable-next-line react/display-name
  return ({ className, ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      {...props}
    >
      {path}
    </svg>
  );
};