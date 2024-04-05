import { kvdex } from '../../../deps.ts';

export type User = {
  eid: string;
  rid: string;
  password?: string;
  token?: string;
  authorization: 'BASIC' | 'SUPPORT' | 'SUPERUSER';
};

export const UserModel = kvdex.model<User>();


