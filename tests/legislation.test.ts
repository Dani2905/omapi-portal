import assert from 'node:assert/strict';
import {
  hasPdfSignature,
  isAllowedLegislationUrl,
  normalizeLegislationDraft,
  normalizeLegislationUrl,
  validateLegislationDraft,
  validateLegislationPdfMetadata,
} from '../utils/legislationLogic';

const validDraft = {
  title: '  Loi   sur la propriété industrielle ',
  type: 'Loi' as const,
  category: 'Fondamental' as const,
  date: ' 31/07/1989 ',
  description: '  Texte de référence. ',
  fileUrl: ' https://example.invalid/texte.pdf ',
};

console.log('Législation test 1 — normalisation du texte');
assert.deepEqual(normalizeLegislationDraft(validDraft), {
  ...validDraft,
  title: 'Loi sur la propriété industrielle',
  date: '31/07/1989',
  description: 'Texte de référence.',
  fileUrl: 'https://example.invalid/texte.pdf',
});
assert.equal(normalizeLegislationUrl('#'), '');
assert.equal(normalizeLegislationDraft({ ...validDraft, fileUrl: '#' }).fileUrl, '');

console.log('Législation test 2 — validation des champs et catégories, y compris Autre');
assert.equal(validateLegislationDraft(validDraft), null);
assert.equal(validateLegislationDraft({ ...validDraft, category: 'Autre' }), null);
assert.match(validateLegislationDraft({ ...validDraft, title: '  ' }) ?? '', /titre/);
assert.match(validateLegislationDraft({ ...validDraft, date: ' ' }) ?? '', /date/);
assert.match(validateLegislationDraft({ ...validDraft, category: 'Inconnue' as never }) ?? '', /catégorie/);
assert.match(validateLegislationDraft({ ...validDraft, type: 'Inconnu' as never }) ?? '', /type/);
assert.match(validateLegislationDraft({ ...validDraft, fileUrl: '#' }) ?? '', /PDF/);

console.log('Législation test 3 — liens sécurisés et rejet des URL dangereuses');
assert.equal(isAllowedLegislationUrl('https://example.invalid/texte.pdf'), true);
assert.equal(isAllowedLegislationUrl('/documents/texte.pdf'), true);
assert.equal(isAllowedLegislationUrl('javascript:alert(1)'), false);
assert.equal(isAllowedLegislationUrl('//example.invalid/texte.pdf'), false);
assert.equal(isAllowedLegislationUrl('http://example.invalid/texte.pdf'), false);
assert.equal(isAllowedLegislationUrl('data:application/pdf;base64,JVBERi0xLjQ='), true);

console.log('Législation test 4 — fichiers PDF contrôlés avant import');
assert.equal(validateLegislationPdfMetadata({ name: 'texte.pdf', size: 100 }), null);
assert.match(validateLegislationPdfMetadata({ name: 'texte.docx', size: 100 }) ?? '', /PDF/);
assert.match(validateLegislationPdfMetadata({ name: 'texte.pdf', size: 0 }) ?? '', /vide/);
assert.match(validateLegislationPdfMetadata({ name: 'texte.pdf', size: 2 * 1024 * 1024 + 1 }) ?? '', /2 Mo/);
assert.equal(hasPdfSignature(new TextEncoder().encode('%PDF-1.7')) , true);
assert.equal(hasPdfSignature(new TextEncoder().encode('not-a-pdf')), false);

console.log('Tous les tests Législation PASSENT.');
