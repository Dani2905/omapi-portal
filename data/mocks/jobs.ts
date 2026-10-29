import { JobOffer } from '../../types';

export const DEFAULT_JOBS: JobOffer[] = [
  {
    id: 1,
    title: "Examinateur de brevets en mécanique",
    department: "Département des Brevets",
    location: "Antananarivo",
    type: "CDI",
    experience: "3-5 ans",
    description: "Nous recherchons un examinateur de brevets spécialisé en ingénierie mécanique pour analyser les demandes de brevets et évaluer leur nouveauté.",
    status: 'Fermé',
    publishDate: '2024-01-15'
  },
  {
    id: 2,
    title: "Juriste spécialisé en marques",
    department: "Département des Marques",
    location: "Antananarivo",
    type: "CDI",
    experience: "5+ ans",
    description: "Le candidat sera en charge du traitement des oppositions et de l'examen complexe des demandes d'enregistrement de marques.",
    status: 'Fermé',
    publishDate: '2024-02-01'
  }
];
