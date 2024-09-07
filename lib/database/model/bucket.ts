import { kvdex } from '../../../deps.ts';

export type Bucket = {
  rid: string;
  iid: string;
  did: string;
  bid: string;
  type: string;
};

export const BucketCollection = kvdex.collection(kvdex.model<Bucket>(), {
  indices: {
    rid: 'secondary',
    iid: 'primary',
  },
  serialize: 'json',
});
