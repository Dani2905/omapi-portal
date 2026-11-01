import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionToken, hashPassword, hashSessionToken, verifyPassword } from './authCrypto.js';

test('scrypt password hashes verify only the matching password', async () => {
  const encoded = await hashPassword('correct horse battery staple');
  assert.equal(await verifyPassword('correct horse battery staple', encoded), true);
  assert.equal(await verifyPassword('incorrect horse battery staple', encoded), false);
  assert.equal(encoded.startsWith('scrypt$16384$8$1$'), true);
  assert.equal(encoded.includes('correct horse battery staple'), false);
});

test('password hashing rejects short passwords', async () => {
  await assert.rejects(() => hashPassword('short'), /between 12 and 1024 bytes/);
});

test('session tokens are random and stored as a one-way digest', () => {
  const first = createSessionToken();
  const second = createSessionToken();
  assert.notEqual(first, second);
  assert.notEqual(hashSessionToken(first), first);
  assert.equal(hashSessionToken(first), hashSessionToken(first));
});
