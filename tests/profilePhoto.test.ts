import assert from 'node:assert/strict';
import {
  getProfilePhotoFileError,
  isProfilePhotoDataUrl,
  MAX_PROFILE_PHOTO_BYTES,
} from '../utils/profilePhoto';

assert.equal(getProfilePhotoFileError({ type: 'image/jpeg', size: 1024 }), null);
assert.equal(getProfilePhotoFileError({ type: 'image/png', size: 1024 }), null);
assert.match(getProfilePhotoFileError({ type: 'image/svg+xml', size: 1024 }) ?? '', /JPG, PNG ou WebP/);
assert.match(getProfilePhotoFileError({ type: 'image/jpeg', size: 0 }) ?? '', /vide/);
assert.match(getProfilePhotoFileError({ type: 'image/jpeg', size: 8 * 1024 * 1024 + 1 }) ?? '', /8 Mo/);

assert.equal(isProfilePhotoDataUrl('data:image/jpeg;base64,/9j/AA=='), true);
assert.equal(isProfilePhotoDataUrl('data:image/png;base64,iVBORw0KGgo='), false);
assert.equal(isProfilePhotoDataUrl('data:image/jpeg;base64,not-a-jpeg'), false);
assert.equal(isProfilePhotoDataUrl(`data:image/jpeg;base64,/9j/${'A'.repeat(Math.ceil(MAX_PROFILE_PHOTO_BYTES * 4 / 3) + 16)}`), false);

console.log('Tous les tests de validation de photo de profil PASSENT.');
