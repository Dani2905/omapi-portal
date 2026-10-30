import assert from 'node:assert/strict';
import {
  getApplicationFileMime,
  getJobAvailabilityLabel,
  isJobOpenOnDate,
  isSafeApplicationFileUrl,
  isValidApplicationFileSignature,
  isValidIsoDate,
  normalizeApplicantFileName,
  normalizeJobApplicationRecord,
  normalizeJobOfferDraft,
  validateApplicationFileMetadata,
  validateJobOfferDraft,
} from '../utils/jobLogic';
import type { JobOffer } from '../types';

const validJob: JobOffer = {
  id: 1,
  title: 'Chargé de communication',
  department: 'Communication',
  location: 'Antananarivo',
  type: 'CDI',
  experience: '2 ans',
  description: '<p>Présentation du poste et responsabilités principales.</p>',
  status: 'Ouvert',
  publishDate: '2026-10-01',
  deadline: '2026-11-01',
};

assert.equal(validateJobOfferDraft(validJob), null);
assert.equal(isValidIsoDate('2026-02-29'), false);
assert.equal(isValidIsoDate('2028-02-29'), true);
assert.equal(isJobOpenOnDate(validJob, '2026-10-29'), true);
assert.equal(isJobOpenOnDate(validJob, '2026-11-02'), false, 'deadline must close public applications the next day');
assert.equal(isJobOpenOnDate({ ...validJob, publishDate: '2026-10-30' }, '2026-10-29'), false);
assert.equal(isJobOpenOnDate({ ...validJob, publishDate: '' }, '2026-10-29'), false);
assert.equal(getJobAvailabilityLabel(validJob, '2026-11-02'), 'Expirée');
assert.match(validateJobOfferDraft({ ...validJob, deadline: '2026-09-30' }) || '', /ne peut pas précéder/);
assert.match(validateJobOfferDraft({ ...validJob, description: '<p><br></p>' }) || '', /description détaillée/);

const sanitized = normalizeJobOfferDraft({ ...validJob, description: '<p onclick="alert(1)">Sûr</p><script>alert(1)</script>' });
assert.equal(sanitized.description?.includes('onclick'), false);
assert.equal(sanitized.description?.includes('<script>'), false);

assert.equal(getApplicationFileMime('CV.DOCX'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
assert.equal(validateApplicationFileMetadata({ name: 'cv.pdf', size: 100, type: 'application/pdf' }), null);
assert.match(validateApplicationFileMetadata({ name: 'cv.pdf', size: 0, type: 'application/pdf' }) || '', /vide/);
assert.match(validateApplicationFileMetadata({ name: 'cv.pdf', size: 700 * 1024 + 1, type: 'application/pdf' }) || '', /700 Ko/);
assert.match(validateApplicationFileMetadata({ name: 'cv.pdf', size: 100, type: 'image/png' }) || '', /extension/);
assert.equal(isValidApplicationFileSignature('cv.pdf', new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])), true);
assert.equal(isValidApplicationFileSignature('faux.pdf', new Uint8Array([0x50, 0x4b, 0x03, 0x04])), false);
assert.equal(isValidApplicationFileSignature('cv.docx', new Uint8Array([0x50, 0x4b, 0x03, 0x04])), true);
assert.equal(isSafeApplicationFileUrl('data:application/pdf;base64,JVBERi0='), true);
assert.equal(isSafeApplicationFileUrl('javascript:alert(1)'), false);
assert.equal(normalizeApplicantFileName('../mon/CV?.docx', 'CV.pdf'), '_mon_CV_.docx');
assert.equal(normalizeJobApplicationRecord(null), null);
assert.deepEqual(normalizeJobApplicationRecord({ id: '42', firstName: 'Ana', status: 'autre', applicationDate: 'date invalide' }), {
  id: 42,
  firstName: 'Ana',
  lastName: '',
  email: '',
  phone: '',
  cvUrl: '',
  applicationDate: '',
  status: 'Nouvelle',
});

console.log('Job logic tests passed');
