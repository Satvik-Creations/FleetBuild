import crypto from 'crypto';

/**
 * Hashes a plaintext password using Node.js crypto.scrypt with a 16-byte random salt.
 */
export function hashPassword(password: string, saltHex?: string): { hash: string; salt: string } {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt: salt.toString('hex'),
  };
}

/**
 * Verifies a password against a hash using timing-safe comparison.
 */
export function verifyPassword(password: string, hashHex: string, saltHex: string): boolean {
  try {
    const salt = Buffer.from(saltHex, 'hex');
    const hashBuffer = Buffer.from(hashHex, 'hex');
    const key = crypto.scryptSync(password, salt, 64);

    if (hashBuffer.length !== key.length) {
      return false;
    }

    return crypto.timingSafeEqual(hashBuffer, key);
  } catch (err) {
    console.error('Error verifying password:', err);
    return false;
  }
}

/**
 * Generates a secure random 256-bit token for user sessions.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
