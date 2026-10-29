import type { User } from '../types';
import { DEFAULT_USERS } from '../data/mocks/users';

/**
 * Utilitaires de gestion des comptes du prototype.
 *
 * IMPORTANT : l'application ne dispose pas encore d'un backend.
 * L'empreinte ci-dessous évite de stocker un mot de passe en clair
 * dans localStorage, mais elle ne remplace pas une authentification
 * serveur (à réaliser avec l'API/PostgreSQL en production).
 */

const principalAdminEmail = DEFAULT_USERS.find((user) => String(user.id) === '1')?.email.trim().toLowerCase();
export const SUPER_ADMIN_EMAILS: readonly string[] = principalAdminEmail ? [principalAdminEmail] : [];

export const ACCOUNT_DELETE_CONFIRMATION = 'SUPPRIMER';

export interface UserDraftErrors {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
}

export const normalizeName = (value: string | undefined): string =>
  (value ?? '').trim().replace(/\s+/g, ' ');

export const normalizeEmail = (value: string | undefined): string =>
  (value ?? '').trim().toLowerCase();

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function validateUserDraft(
  draft: Partial<User>,
  existingUsers: User[],
  currentUserId?: User['id'],
): UserDraftErrors {
  const errors: UserDraftErrors = {};
  const name = normalizeName(draft.name);
  const email = normalizeEmail(draft.email);

  if (!name) {
    errors.name = 'Le nom complet est obligatoire.';
  } else if (name.length < 2) {
    errors.name = 'Le nom doit contenir au moins 2 caractères.';
  }

  if (!email) {
    errors.email = "L'adresse e-mail est obligatoire.";
    return errors;
  }

  if (!isValidEmail(email)) {
    errors.email = "L'adresse e-mail n'est pas valide.";
    return errors;
  }

  const currentId = currentUserId === undefined ? undefined : String(currentUserId);
  const isReserved = SUPER_ADMIN_EMAILS.includes(email as typeof SUPER_ADMIN_EMAILS[number]);
  const alreadyOwnsReservedEmail = existingUsers.some(
    (user) => String(user.id) === currentId && normalizeEmail(user.email) === email,
  );

  if (isReserved && !alreadyOwnsReservedEmail) {
    errors.email = 'Cette adresse est réservée au compte super administrateur existant.';
    return errors;
  }

  const duplicate = existingUsers.some(
    (user) => String(user.id) !== currentId && normalizeEmail(user.email) === email,
  );

  if (duplicate) {
    errors.email = 'Un utilisateur avec cette adresse e-mail existe déjà.';
  }

  return errors;
}

export const isPrincipalAdminAccount = (
  user: Partial<User> | undefined,
): boolean => {
  if (!user) return false;
  return String(user.id) === '1'
    || SUPER_ADMIN_EMAILS.includes(
      normalizeEmail(user.email) as typeof SUPER_ADMIN_EMAILS[number],
    );
};

export const isActiveAdmin = (
  user: Partial<User> | undefined,
): boolean => user?.role === 'Admin' && user?.status === 'Actif';

export const countActiveAdmins = (users: User[]): number =>
  users.filter((user) => isActiveAdmin(user)).length;

export function validateAccountModification(
  existingUsers: User[],
  originalUser: User | undefined,
  draft: Partial<User>,
  actorUserId?: User['id'],
): string | undefined {
  if (!originalUser) {
    return "Ce compte n'existe plus. Fermez cette fenêtre puis rouvrez la liste des utilisateurs.";
  }

  const nextEmail = normalizeEmail(draft.email ?? originalUser.email);
  const nextRole = draft.role || originalUser.role;
  const nextStatus = draft.status || originalUser.status;
  const isSelf = actorUserId !== undefined
    && String(actorUserId) === String(originalUser.id);

  if (isPrincipalAdminAccount(originalUser)) {
    if (nextEmail !== normalizeEmail(originalUser.email)) {
      return "L'adresse e-mail du compte administrateur principal ne peut pas être modifiée.";
    }
    if (nextRole !== 'Admin' || nextStatus !== 'Actif') {
      return 'Le compte administrateur principal doit rester Admin et actif.';
    }
  }

  if (isSelf) {
    if (nextRole !== originalUser.role) {
      return 'Vous ne pouvez pas modifier votre propre rôle depuis le module Utilisateurs.';
    }
    if (nextStatus !== originalUser.status) {
      return 'Vous ne pouvez pas modifier le statut de votre propre compte.';
    }
  }

  const usersAfterChange = existingUsers.map((user) => (
    String(user.id) === String(originalUser.id)
      ? { ...user, role: nextRole, status: nextStatus }
      : user
  ));

  if (countActiveAdmins(usersAfterChange) === 0) {
    return 'Au moins un administrateur actif doit être conservé.';
  }

  return undefined;
}

export function validateAccountDeletion(
  existingUsers: User[],
  targetUser: User | undefined,
  actorUserId?: User['id'],
): string | undefined {
  if (!targetUser) {
    return "Ce compte n'existe déjà plus.";
  }

  if (isPrincipalAdminAccount(targetUser)) {
    return 'Le compte administrateur principal ne peut pas être supprimé.';
  }

  if (
    actorUserId !== undefined
    && String(actorUserId) === String(targetUser.id)
  ) {
    return 'Vous ne pouvez pas supprimer votre propre compte.';
  }

  const remainingUsers = existingUsers.filter(
    (user) => String(user.id) !== String(targetUser.id),
  );

  if (countActiveAdmins(remainingUsers) === 0) {
    return 'Impossible de supprimer le dernier administrateur actif.';
  }

  return undefined;
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) {
    return 'Le mot de passe est obligatoire.';
  }

  if (password.trim() !== password) {
    return "Le mot de passe ne doit ni commencer ni se terminer par un espace.";
  }

  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères.';
  }

  return undefined;
}

export function validatePasswordSelection(
  mode: 'none' | 'auto' | 'manual',
  manualPassword: string,
): string | undefined {
  if (mode !== 'manual') return undefined;

  if (!manualPassword) {
    return 'Saisissez le mot de passe manuel, ou choisissez un autre mode.';
  }

  return validateNewPassword(manualPassword);
}

export interface ProfilePasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  hasCurrentCredential: boolean;
}

export const hasProfilePasswordChangeInput = (
  input: Pick<ProfilePasswordChangeInput, 'currentPassword' | 'newPassword' | 'confirmPassword'>,
): boolean => Boolean(input.currentPassword || input.newPassword || input.confirmPassword);

export function validateProfilePasswordChange(
  input: ProfilePasswordChangeInput,
): string | undefined {
  if (!hasProfilePasswordChangeInput(input)) return undefined;

  if (input.hasCurrentCredential && !input.currentPassword) {
    return 'Saisissez votre mot de passe actuel pour le modifier.';
  }

  if (!input.newPassword) {
    return 'Saisissez le nouveau mot de passe.';
  }

  const newPasswordError = validateNewPassword(input.newPassword);
  if (newPasswordError) return newPasswordError;

  if (!input.confirmPassword) {
    return 'Confirmez le nouveau mot de passe.';
  }

  if (input.newPassword !== input.confirmPassword) {
    return 'Les nouveaux mots de passe ne correspondent pas.';
  }

  if (input.hasCurrentCredential && input.currentPassword === input.newPassword) {
    return "Le nouveau mot de passe doit être différent de l'actuel.";
  }

  return undefined;
}

const PASSWORD_GROUPS = [
  'abcdefghjkmnpqrstuvwxyz',
  'ABCDEFGHJKMNPQRSTUVWXYZ',
  '23456789',
  '!@#$%^&*',
] as const;

const getCrypto = (): Crypto => {
  if (typeof globalThis.crypto === 'undefined') {
    throw new Error('Web Crypto est indisponible dans ce navigateur.');
  }
  return globalThis.crypto;
};

const randomInt = (maxExclusive: number): number => {
  const crypto = getCrypto();
  if (typeof crypto.getRandomValues !== 'function') {
    throw new Error("Le générateur aléatoire sécurisé est indisponible.");
  }

  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);

  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);

  return buffer[0] % maxExclusive;
};

export function generateTemporaryPassword(length = 14): string {
  const safeLength = Math.max(12, length);
  const allChars = PASSWORD_GROUPS.join('');
  const chars = PASSWORD_GROUPS.map((group) => group[randomInt(group.length)]);

  while (chars.length < safeLength) {
    chars.push(allChars[randomInt(allChars.length)]);
  }

  // Mélange Fisher-Yates avec source cryptographique.
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');

const createSalt = (): string => {
  const salt = new Uint8Array(16);
  getCrypto().getRandomValues(salt);
  return bytesToHex(salt);
};

const hashPassword = async (password: string, salt: string): Promise<string> => {
  const crypto = getCrypto();
  if (!crypto.subtle) {
    throw new Error('Web Crypto Subtle est indisponible (contexte non sécurisé).');
  }

  const encoded = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return bytesToHex(new Uint8Array(digest));
};

export async function createPasswordCredential(password: string): Promise<{
  passwordSalt: string;
  passwordHash: string;
  passwordUpdatedAt: string;
}> {
  const passwordSalt = createSalt();
  const passwordHash = await hashPassword(password, passwordSalt);

  return {
    passwordSalt,
    passwordHash,
    passwordUpdatedAt: new Date().toISOString(),
  };
}

export const hasPasswordCredential = (
  user: Partial<User> | undefined,
): user is Partial<User> & { passwordSalt: string; passwordHash: string } =>
  Boolean(user?.passwordSalt && user?.passwordHash);

const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

export async function verifyPasswordCredential(
  password: string,
  user: Partial<User>,
): Promise<boolean> {
  if (!hasPasswordCredential(user)) return false;
  const candidate = await hashPassword(password, user.passwordSalt);
  return safeEqual(candidate, user.passwordHash);
}
