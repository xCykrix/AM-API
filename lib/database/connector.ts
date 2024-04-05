import { kvdex } from '../../deps.ts';
import { ImageModel } from './transactions/image.ts';
import { UserModel } from './transactions/user.ts';

await Deno.mkdir('./persistence/', { recursive: true });

export const kv = await Deno.openKv('./persistence/local-storage.kv');
export const database = kvdex.kvdex(kv, {
  users: kvdex.collection(UserModel, {
    history: true,
    indices: {
      eid: 'primary',
      token: 'primary'
    }
  }),
  image: kvdex.collection(ImageModel, {
    indices: {
      rid: 'primary',
      iid: 'primary',
    }
  }),
});
