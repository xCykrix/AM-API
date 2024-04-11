import { kvdex } from '../../deps.ts';
import { BucketCollection } from './model/bucket.ts';
import { Uint8Collection } from './model/uint8.ts';
import { UserCollection } from './model/user.ts';

await Deno.mkdir('./persistence/', { recursive: true });

export const kv = await Deno.openKv('./persistence/local-storage.kv');
export const database = kvdex.kvdex(kv, {
  users: UserCollection,
  bucket: BucketCollection,
  uint8: Uint8Collection,
});
