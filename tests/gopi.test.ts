import assert from 'node:assert/strict';
import {
  canTransitionGopiOrder,
  GOPI_PRICE_MGA,
  getGopiOrderStatusLabel,
  hasGopiPdf,
  normalizeGopiOrder,
  normalizeGopiPublication,
  validateGopiOrder,
  validateGopiPublication,
} from '../utils/gopiLogic';
import { GopiItem } from '../types';

const publication: GopiItem = {
  id: 7,
  title: 'GOPI n° 521',
  date: 'Février 2026',
  category: 'Gazette Officielle',
  fileUrl: 'data:application/pdf;base64,JVBERi0=',
};

console.log('GOPI test 1 — prix fixe et normalisation des publications');
assert.equal(GOPI_PRICE_MGA, 10_000);
assert.equal(normalizeGopiPublication({ title: '  GOPI   n° 521  ', date: ' Février 2026 ', category: ' Gazette Officielle ' }).title, 'GOPI n° 521');
assert.equal(normalizeGopiPublication({ fileUrl: '#' }).fileUrl, '');

console.log('GOPI test 2 — champs obligatoires et catégories');
assert.match(validateGopiPublication({ ...publication, title: '  ' }) ?? '', /titre/i);
assert.match(validateGopiPublication({ ...publication, date: '' }) ?? '', /date/i);
assert.match(validateGopiPublication({ ...publication, category: 'Inconnu' }) ?? '', /catégorie/i);
assert.equal(validateGopiPublication(publication), null);

console.log('GOPI test 3 — PDF joint contrôlé');
assert.match(validateGopiPublication({ ...publication, fileUrl: 'data:text/html;base64,PHNjcmlwdD4=' }) ?? '', /PDF/i);
assert.equal(validateGopiPublication({ ...publication, fileUrl: 'data:application/pdf;base64,JVBERi0=' }), null);
assert.equal(hasGopiPdf(publication), true);
assert.equal(hasGopiPdf({ ...publication, fileUrl: '' }), false);

console.log('GOPI test 4 — commande normalisée et validée');
const order = normalizeGopiOrder({
  customerName: '  Ada   Rakoto ',
  customerEmail: ' customer@example.invalid ',
  customerPhone: ' 034 12 345 67 ',
  paymentMethod: 'MVola',
  transactionRef: '  MM 123  ',
});
assert.deepEqual(order, {
  customerName: 'Ada Rakoto',
  customerEmail: 'customer@example.invalid',
  customerPhone: '034 12 345 67',
  paymentMethod: 'MVola',
  transactionRef: 'MM 123',
});
assert.equal(validateGopiOrder(order, publication), null);
assert.match(validateGopiOrder({ ...order, customerEmail: 'bad' }, publication) ?? '', /e-mail/i);
assert.match(validateGopiOrder({ ...order, transactionRef: '' }, publication) ?? '', /référence/i);
assert.match(validateGopiOrder(order, null) ?? '', /plus disponible/i);
assert.match(validateGopiOrder(order, { ...publication, fileUrl: '' }) ?? '', /aucun PDF/i);

console.log('GOPI test 5 — espèces sans référence et transitions de commande');
assert.equal(validateGopiOrder({ ...order, paymentMethod: 'Espèces', transactionRef: '' }, publication), null);
assert.equal(canTransitionGopiOrder('En attente', 'Paiement confirmé'), true);
assert.equal(canTransitionGopiOrder('En attente', 'Annulé'), true);
assert.equal(canTransitionGopiOrder('Paiement confirmé', 'Envoyé'), true);
assert.equal(canTransitionGopiOrder('Annulé', 'Paiement confirmé'), false);
assert.equal(canTransitionGopiOrder('Envoyé', 'Paiement confirmé'), false);
assert.equal(getGopiOrderStatusLabel('Envoyé'), 'Envoyé (ancien statut)');
assert.equal(getGopiOrderStatusLabel('Envoyé', '2026-10-29T10:00:00.000Z'), 'Envoyé');

console.log('Tous les tests GOPI PASSENT.');
