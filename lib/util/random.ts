import { hex } from '../../deps.ts';

export function getRandomString(len: number): string {
  if (len % 2 === 1) {
    throw new Deno.errors.InvalidData('Only even sizes are supported');
  }
  const buffer = new Uint8Array(len / 2);
  crypto.getRandomValues(buffer);
  return hex.encodeHex(buffer);
}
