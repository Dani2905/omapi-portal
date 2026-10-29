import assert from 'node:assert/strict';
import type { Formation, FormationRegistration } from '../types';
import {
  isSupportedFormationDocument,
  normalizeFormationDraft,
  normalizeFormationRegistration,
  validateFormationDraft,
  validateFormationRegistration,
} from '../utils/formationLogic';

console.log('Formations test 1 — titre nettoyé et champs normalisés');
const draft: Partial<Formation> = {
  title: '  Protection   des   marques  ',
  category: 'Avancee',
  date: ' 15/11/2026 ',
  location: '  Antananarivo   Centre ',
};
assert.equal(normalizeFormationDraft(draft).title, 'Protection des marques');
assert.equal(normalizeFormationDraft(draft).location, 'Antananarivo Centre');
assert.deepEqual(validateFormationDraft(draft), {});

console.log('Formations test 2 — titre vide/court et catégorie inconnue refusés');
assert.match(validateFormationDraft({ title: '   ', category: 'Base' }).title ?? '', /obligatoire/);
assert.match(validateFormationDraft({ title: 'PI', category: 'Base' }).title ?? '', /3 caractères/);
assert.match(validateFormationDraft({ title: 'Formation PI', category: 'autre' as Formation['category'] }).category ?? '', /catégorie/);

console.log('Formations test 3 — inscription normalisée et validation de l’e-mail');
const person = normalizeFormationRegistration({
  name: '  Alice   Rakoto ', email: ' learner@example.invalid ', phone: ' 034 00 ',
});
assert.equal(person.name, 'Alice Rakoto');
assert.equal(person.email, 'learner@example.invalid');
assert.equal(person.phone, '034 00');
const training: Formation = { id: 20, title: 'Protection des marques', category: 'Base' };
assert.equal(validateFormationRegistration(person, training, []), undefined);
assert.match(validateFormationRegistration({ ...person, email: 'pas-un-email' }, training, []) ?? '', /adresse e-mail valide/);

console.log('Formations test 4 — doublon interdit uniquement pour la même formation');
const prior: FormationRegistration = {
  id: 50, formationId: 20, name: 'Alice Rakoto', email: 'learner@example.invalid', phone: '', registrationDate: '2026-10-29T08:00:00.000Z',
};
assert.match(validateFormationRegistration(person, training, [prior]) ?? '', /déjà inscrite/);
assert.equal(validateFormationRegistration(person, { ...training, id: 21 }, [prior]), undefined);

console.log('Formations test 5 — pièces jointes limitées aux PDF et DOCX');
assert.equal(isSupportedFormationDocument({ name: 'programme.pdf', type: 'application/pdf' }), true);
assert.equal(isSupportedFormationDocument({ name: 'brochure.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), true);
assert.equal(isSupportedFormationDocument({ name: 'script.exe', type: 'application/octet-stream' }), false);

console.log('\nTous les tests Formations PASSENT.');
