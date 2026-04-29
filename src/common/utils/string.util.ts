import crypto from 'crypto';

export function generateCode(length = 3): string {
  return crypto.randomBytes(length).toString('hex').toUpperCase();
}
