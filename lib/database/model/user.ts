import { kvdex } from '../../../deps.ts';

export type User = {
  eid: string;
  rid: string;
  password?: string;
  token?: string;
  authorization: 'BASIC' | 'SUPPORT' | 'SUPERUSER';
};

export const UserCollection = kvdex.collection(kvdex.model<User>(), {
  history: true,
  indices: {
    eid: 'primary',
    token: 'primary',
  },
  serialize: 'json',
});
