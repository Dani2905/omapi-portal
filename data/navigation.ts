
import { NavItem } from '../types';
import { SERVICE_IDS } from './config';

// =============================================================================
// NAVIGATION
// =============================================================================

export const NAV_ITEMS: NavItem[] = [
  { label: 'Accueil', path: '/' },
  {
    label: "L'Office",
    children: [
      { label: 'Présentation', path: '/presentation' },
      { label: 'Missions', path: '/missions' },
      { label: 'Organisation', path: '/organisation' },
    ]
  },
  {
    label: 'Procédures',
    children: [
      { label: 'Marques', path: `/service/${SERVICE_IDS.MARQUE}` },
      { label: 'Brevets', path: `/service/${SERVICE_IDS.BREVET}` },
      { label: 'Dessins & Modèles', path: `/service/${SERVICE_IDS.DESSIN}` },
      { label: 'Noms Commerciaux', path: `/service/${SERVICE_IDS.NOM_COMMERCIAL}` },
    ]
  },
  {
    label: 'International',
    children: [
      { label: 'Procédures Internationales', path: '/international' },
    ]
  },
  {
    label: 'Ressources',
    path: '/ressources',
    children: [
      { label: 'Actualités', path: '/news' },
      { label: 'Événements', path: '/events' },
      { label: 'Législation', path: '/legislation' },
      { label: 'Formations', path: '/formations' },
      { label: 'Formulaires', path: '/formulaires' },
      { label: 'Guides', path: '/guides' },
      { label: 'FAQ', path: '/faq' },
    ]
  },
  { label: 'Contact', path: '/contact' },
];
