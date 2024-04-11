import { kvdex } from '../../../deps.ts';

export const Uint8Collection = kvdex.collection(kvdex.model<Uint8Array>(), {
  serialize: 'json',
});

