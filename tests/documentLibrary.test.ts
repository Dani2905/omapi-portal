import assert from 'node:assert/strict';
import {
  getLibraryPlainText,
  isAllowedLibraryUrl,
  isValidLibraryFileSignature,
  libraryFileMime,
  normalizeFormDraft,
  normalizeGuideDraft,
  validateFormDraft,
  validateGuideDraft,
  validateLibraryFileMetadata,
} from '../utils/documentLibraryLogic';

console.log('Bibliothèque test 1 — nettoyage et validation des formulaires');
const form = normalizeFormDraft({ title: '  Demande   de marque ', category: 'Marques', fileUrl: ' # ' });
assert.equal(form.title, 'Demande de marque');
assert.equal(form.fileUrl, '');
assert.match(validateFormDraft(form) ?? '', /lien sécurisé/i);
assert.equal(validateFormDraft({ ...form, fileUrl: 'https://documents.example.mg/demande.pdf' }), null);
assert.match(validateFormDraft({ ...form, category: 'Ancienne catégorie' as never, fileUrl: 'https://example.mg/file.pdf' }) ?? '', /catégorie/i);

console.log('Bibliothèque test 2 — sécurité des liens');
assert.equal(isAllowedLibraryUrl('https://example.mg/form.pdf'), true);
assert.equal(isAllowedLibraryUrl('/documents/formulaire.pdf'), true);
assert.equal(isAllowedLibraryUrl('javascript:alert(1)'), false);
assert.equal(isAllowedLibraryUrl('//example.mg/file.pdf'), false);
assert.equal(isAllowedLibraryUrl('#'), false);
assert.equal(isAllowedLibraryUrl('data:text/html;base64,PHNjcmlwdD4='), false);

console.log('Bibliothèque test 3 — formats, poids et signatures réels');
assert.equal(validateLibraryFileMetadata({ name: 'demande.pdf', size: 10 }), null);
assert.match(validateLibraryFileMetadata({ name: 'programme.exe', size: 10 }) ?? '', /PDF, DOC et DOCX/i);
assert.match(validateLibraryFileMetadata({ name: 'demande.pdf', size: 2 * 1024 * 1024 + 1 }) ?? '', /2 Mo/i);
assert.equal(isValidLibraryFileSignature('form.pdf', new TextEncoder().encode('%PDF-1.7')), true);
assert.equal(isValidLibraryFileSignature('fake.pdf', new TextEncoder().encode('<html>')), false);
assert.equal(isValidLibraryFileSignature('form.docx', new Uint8Array([0x50, 0x4b, 0x03, 0x04])), true);
assert.equal(libraryFileMime('guide.docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

console.log('Bibliothèque test 4 — guides sans points legacy et données incohérentes');
const guide = normalizeGuideDraft({ title: '  Guide   Marques ', iconName: 'book', colorTheme: 'blue', fileUrl: 'https://example.mg/guide.pdf' });
assert.equal(guide.title, 'Guide Marques');
assert.deepEqual(guide.points, []);
assert.equal(validateGuideDraft(guide), null);
assert.match(validateGuideDraft({ ...guide, iconName: 'not-an-icon' as never }) ?? '', /icône/i);
assert.match(validateGuideDraft({ ...guide, colorTheme: 'not-a-theme' as never }) ?? '', /couleur/i);
assert.match(validateGuideDraft({ ...guide, points: Array.from({ length: 21 }, () => 'Point') }) ?? '', /20 éléments/i);

console.log('Bibliothèque test 5 — texte enrichi converti sans balises résiduelles');
assert.equal(getLibraryPlainText('<p>Déposer&nbsp;une <strong>marque</strong></p>'), 'Déposer une marque');

console.log('Tous les tests Formulaires et Guides PASSENT.');
