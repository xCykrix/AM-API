import { kvdex } from '../../../deps.ts';

export type Image = {
  rid: string;
  iid: string;
  buffer: Uint8Array;
  type: 'image/png' | 'image/jpeg'
};

export const ImageModel = kvdex.model<Image>();


