export const MAX_PROFILE_PHOTO_BYTES = 320 * 1024;

export function normalizeProfilePhoto(value) {
  if (value === null || value === '') return { ok: true, value: null };
  if (typeof value !== 'string') return { ok: false };
  const match = /^data:image[/]jpeg;base64,([A-Za-z0-9+/]*={0,2})$/.exec(value);
  if (!match || !match[1] || match[1].length % 4 !== 0 || match[1].length > Math.ceil(MAX_PROFILE_PHOTO_BYTES * 4 / 3) + 4) {
    return { ok: false };
  }

  const bytes = Buffer.from(match[1], 'base64');
  if (!bytes.length || bytes.length > MAX_PROFILE_PHOTO_BYTES || bytes.toString('base64') !== match[1]) {
    return { ok: false };
  }
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
    return { ok: false };
  }

  return { ok: true, value };
}
