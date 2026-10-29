import assert from 'node:assert/strict';
import {
  describeCrudAction,
  formatNotificationTime,
  getNotificationItemLabel,
} from '../utils/notificationMessages';

console.log('Notification test 1 — action et contenu nommés pour une actualité');
const news = describeCrudAction('omapi_news', 'updated', {
  id: 42,
  title: 'Nouvelle procédure OMAPI',
});
assert.equal(news.title, 'Modification enregistrée — Actualité');
assert.equal(news.message, 'L’actualité « Nouvelle procédure OMAPI » a été mise à jour.');

console.log('Notification test 2 — compte utilisateur identifié sans exposer les empreintes');
const credentialMarker = 'fixture-marker';
const user = describeCrudAction('omapi_users', 'created', {
  id: 9,
  name: '  Alice   Rakoto ',
  email: 'user@example.invalid',
  passwordSalt: credentialMarker,
  passwordHash: `${credentialMarker}-hash`,
});
assert.equal(user.message, 'Le compte utilisateur « Alice Rakoto — user@example.invalid » a été créé.');
assert.equal(user.message.includes(credentialMarker), false);

console.log('Notification test 3 — nom de secours compréhensible si aucun libellé');
assert.equal(getNotificationItemLabel('omapi_news', { id: 12 }), 'ID 12');
assert.match(describeCrudAction('omapi_events', 'deleted', { id: 12 }).message, /événement « ID 12 » a été supprimé/);

console.log('Notification test 4 — temps relatif en français et compatibilité anciennes dates locales');
const now = new Date(2026, 9, 29, 12, 0, 0).getTime();
assert.equal(formatNotificationTime('2026-10-29T11:58:00', now), 'il y a 2 minutes');
assert.equal(formatNotificationTime('29/10/2026 11:58:00', now), 'il y a 2 minutes');
assert.equal(formatNotificationTime('Aujourd’hui', now), 'Aujourd’hui');

console.log('\nTous les tests de messages de notification PASSENT.');
