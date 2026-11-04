import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_PROFILE_PHOTO_BYTES, normalizeProfilePhoto } from './profilePhoto.js';

function dataUrl(bytes) {
  return `data:image/jpeg;base64,${Buffer.from(bytes).toString('base64')}`;
}

test('accepts a small JPEG and returns the exact data URL', () => {
  const photo = dataUrl([0xff, 0xd8, 0xff, 0x01, 0x02, 0xff, 0xd9]);
  assert.deepEqual(normalizeProfilePhoto(photo), { ok: true, value: photo });
});

test('accepts removing a profile photo', () => {
  assert.deepEqual(normalizeProfilePhoto(null), { ok: true, value: null });
  assert.deepEqual(normalizeProfilePhoto(''), { ok: true, value: null });
});

test('rejects non-JPEG data, malformed base64, and missing JPEG markers', () => {
  assert.deepEqual(normalizeProfilePhoto('data:image/png;base64,iVBORw0KGgo='), { ok: false });
  assert.deepEqual(normalizeProfilePhoto('data:image/jpeg;base64,not-base64!'), { ok: false });
  assert.deepEqual(normalizeProfilePhoto(dataUrl([0, 1, 2, 3])), { ok: false });
});

test('rejects images over the storage limit', () => {
  const bytes = Buffer.alloc(MAX_PROFILE_PHOTO_BYTES + 1, 0x01);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  bytes[bytes.length - 2] = 0xff;
  bytes[bytes.length - 1] = 0xd9;
  assert.deepEqual(normalizeProfilePhoto(dataUrl(bytes)), { ok: false });
});
