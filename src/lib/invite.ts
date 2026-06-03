import { customAlphabet } from "nanoid";

// Ambiguous characters (0/O, 1/l/I) are excluded so links survive being read aloud or retyped.
export const makeInviteToken = customAlphabet(
  "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789",
  32
);

// How long an invite link stays valid. Mirrors the "expires in 7 days" copy shown to teachers.
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function inviteExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + INVITE_TTL_MS);
}

export function isInviteExpired(expires: Date | null): boolean {
  // Treat a missing expiry as expired so legacy invites must be re-sent.
  return !expires || expires.getTime() < Date.now();
}
