import assert from 'node:assert/strict';
import {
  getActiveAnnouncements,
  getNextAnnouncementIndex,
  getSafeAnnouncementIndex,
  MAX_ANNOUNCEMENT_LENGTH,
  normalizeAnnouncementDraft,
  normalizeAnnouncementText,
  validateAnnouncementText,
} from '../utils/announcementLogic';

console.log('Bandeau Info test 1 — normalisation des messages');
assert.equal(normalizeAnnouncementText('  Fermeture   exceptionnelle\n demain  '), 'Fermeture exceptionnelle demain');
assert.equal(normalizeAnnouncementDraft({ id: 1, text: '  Avis   officiel ', isActive: true }).text, 'Avis officiel');
assert.equal(validateAnnouncementText('   '), 'Le message ne peut pas être vide.');
assert.equal(validateAnnouncementText('Annonce valide'), null);
assert.match(validateAnnouncementText('x'.repeat(MAX_ANNOUNCEMENT_LENGTH + 1)) ?? '', /caractères/);

console.log('Bandeau Info test 2 — seuls les messages actifs non vides sont visibles');
assert.deepEqual(getActiveAnnouncements([
  { id: 1, text: ' Premier avis ', isActive: true },
  { id: 2, text: 'Avis inactif', isActive: false },
  { id: 3, text: '   ', isActive: true },
  { id: 4, text: 'Second avis', isActive: 'true' },
  { id: 5, text: 'Valeur invalide', isActive: 'false' },
  null,
]), [
  { id: 1, text: 'Premier avis', isActive: true },
  { id: 4, text: 'Second avis', isActive: true },
]);
assert.deepEqual(getActiveAnnouncements({ id: 1 }), []);

console.log('Bandeau Info test 3 — rotation et navigation circulaire');
assert.equal(getSafeAnnouncementIndex(0, 0), 0);
assert.equal(getSafeAnnouncementIndex(4, 3), 1);
assert.equal(getSafeAnnouncementIndex(-1, 3), 2);
assert.equal(getNextAnnouncementIndex(2, 3), 0);
assert.equal(getNextAnnouncementIndex(0, 3, -1), 2);
assert.equal(getNextAnnouncementIndex(0, 0), 0);

console.log('Tous les tests du Bandeau Info PASSENT.');
