import assert from 'node:assert/strict';
import {
  formatEventDate,
  getEffectiveEventStatus,
  getEventCapacity,
  isValidEventDocumentDataUrl,
  isEventRegistrationOpen,
  normalizeEventDraft,
  normalizeEventRecord,
  normalizeEventRegistration,
  parseEventDate,
  validateEventDraft,
  validateEventRegistrationDraft,
  isValidEventTime,
} from '../utils/eventLogic';
import type { Event, EventRegistration } from '../types';

const event: Event = {
  id: 10,
  title: 'Atelier sur les marques',
  date: '2026-11-20',
  time: '09:00 - 12:00',
  location: 'Antananarivo',
  description: '<p>Informations complètes sur cet atelier.</p>',
  image: 'https://example.org/event.jpg',
  status: 'À venir',
  places: 'Sur inscription',
};

assert.equal(parseEventDate('2026-02-29'), null);
assert.equal(parseEventDate('2028-02-29'), '2028-02-29');
assert.equal(parseEventDate('26/04/2024'), '2024-04-26');
assert.equal(parseEventDate('26 Avril 2024'), '2024-04-26');
assert.equal(formatEventDate('2024-04-26'), '26 avril 2024');
assert.equal(isValidEventTime('9h00 - 17h00'), true);
assert.equal(isValidEventTime('25:00'), false);
assert.equal(isValidEventTime('17:00 - 09:00'), false);
assert.equal(getEffectiveEventStatus({ date: '2026-10-28', status: 'À venir' }, '2026-10-29'), 'Terminé');
assert.equal(getEffectiveEventStatus({ date: '2026-10-29', status: 'À venir' }, '2026-10-29'), 'En cours');
assert.equal(isEventRegistrationOpen(event, '2026-10-29'), true);
assert.equal(isEventRegistrationOpen({ ...event, status: 'Annulé' }, '2026-10-29'), false);
assert.equal(isEventRegistrationOpen({ ...event, date: '2026-10-28' }, '2026-10-29'), false);
assert.equal(getEventCapacity('Limité à 50 places'), 50);
assert.equal(getEventCapacity('12 participants'), 12);
assert.equal(getEventCapacity('Entrée libre'), null);

assert.equal(validateEventDraft(event), null);
assert.match(validateEventDraft({ ...event, date: '31/02/2026' }) || '', /date valide/);
assert.match(validateEventDraft({ ...event, time: '25:00' }) || '', /heure valide/);
assert.match(validateEventDraft({ ...event, description: '<p><br></p>' }) || '', /description/);
const normalizedEvent = normalizeEventDraft({ ...event, title: '  Atelier   sur les marques ', date: '20 Novembre 2026', description: '<p onclick="x()">Texte</p><script>bad()</script>' });
assert.equal(normalizedEvent.title, 'Atelier sur les marques');
assert.equal(normalizedEvent.date, '2026-11-20');
assert.equal(normalizedEvent.description?.includes('onclick'), false);
assert.equal(normalizedEvent.description?.includes('<script>'), false);

const registration: Omit<EventRegistration, 'id'> = {
  eventId: event.id,
  name: ' Ada Exemple ',
  email: 'ADA@example.org',
  phone: '+261 34 12 345 67',
  registrationDate: '2026-10-29T08:00:00.000Z',
};
assert.equal(validateEventRegistrationDraft(registration, event, [], '2026-10-29'), null);
assert.equal(validateEventRegistrationDraft({ ...registration, name: '  ' }, event, [], '2026-10-29'), 'Saisissez votre nom complet.');
assert.match(validateEventRegistrationDraft({ ...registration, email: 'bad' }, event, [], '2026-10-29') || '', /adresse e-mail valide/);
assert.match(validateEventRegistrationDraft(registration, event, [{ ...registration, id: 4, email: 'ada@EXAMPLE.org' }], '2026-10-29') || '', /existe déjà/);
assert.match(validateEventRegistrationDraft(registration, { ...event, status: 'Annulé' }, [], '2026-10-29') || '', /inscriptions.*closes/i);
assert.match(validateEventRegistrationDraft({ ...registration, email: 'other@example.org' }, { ...event, places: '1 place' }, [{ ...registration, id: 4, email: 'first@example.org' }], '2026-10-29') || '', /capacité maximale/);
assert.equal(isValidEventDocumentDataUrl('data:application/pdf;base64,JVBERi0=', 'programme.pdf'), true);
assert.equal(isValidEventDocumentDataUrl('data:application/pdf;base64,ZmFrZQ==', 'programme.pdf'), false);
assert.equal(normalizeEventRegistration({ id: '9', eventId: '10', name: ' A ', email: 'A@EXAMPLE.ORG' })?.email, 'a@example.org');
assert.equal(normalizeEventRecord(null), null);
assert.equal(normalizeEventRecord({ id: '10', title: { bad: true }, status: 'unknown' })?.title, '');

console.log('Event logic tests passed');
