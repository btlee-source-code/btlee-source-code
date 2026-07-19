import { File } from 'expo-file-system';

import { get } from '@/shared/api/httpClient';
import type { PropertyImage } from '@/shared/types/property';

/**
 * Image upload — same flow as the web: ask our backend for a short-lived
 * Cloudinary signature, then POST each picked file straight to Cloudinary. The
 * image bytes never touch our API host.
 */
interface UploadSignature {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

const DELIVERY_TRANSFORM = 'c_limit,w_1600,h_1200,f_auto,q_auto:good';
const optimizedUrl = (secureUrl: string) =>
  secureUrl.replace('/upload/', `/upload/${DELIVERY_TRANSFORM}/`);

export interface LocalImage {
  uri: string;
  name?: string;
  mimeType?: string;
}

async function uploadOne(img: LocalImage, sig: UploadSignature): Promise<PropertyImage> {
  const form = new FormData();
  // Expo's WinterCG fetch requires a Blob/File implementation with `bytes()`.
  // A legacy React Native `{ uri, name, type }` part throws
  // "Unsupported FormDataPart implementation" on current Expo SDKs.
  const file = new File(img.uri);
  form.append('file', file, img.name ?? file.name ?? `photo-${sig.timestamp}.jpg`);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('IMAGE_UPLOAD_FAILED');
  const data = (await res.json()) as { public_id?: string; secure_url?: string };
  if (!data.public_id || !data.secure_url) throw new Error('IMAGE_UPLOAD_FAILED');
  return { publicId: data.public_id, url: optimizedUrl(data.secure_url) };
}

export const uploadsApi = {
  images: async (imgs: LocalImage[]): Promise<PropertyImage[]> => {
    const sig = await get<UploadSignature>('/uploads/signature');
    return Promise.all(imgs.map((i) => uploadOne(i, sig)));
  },
};
