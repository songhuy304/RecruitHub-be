import { randomBytes } from 'node:crypto';

export function generateCode(length = 3): string {
  return randomBytes(length).toString('hex');
}
