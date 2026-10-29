import { defineConfig } from 'vite';

// Config locale de test uniquement (aperçu Arena) - ne pas envoyer sur GitHub
export default defineConfig({
  preview: {
    port: 4173,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
