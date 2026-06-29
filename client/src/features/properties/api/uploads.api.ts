/**
 * Uploads API — images go DIRECT to Cloudinary from the browser.
 *
 * We first ask our own backend for a short-lived signature (a tiny JSON call
 * that rides the normal same-origin proxy and carries the auth cookie), then
 * POST each file straight to Cloudinary. The heavy image bytes never touch our
 * API host or its proxy, so large multi-image uploads can't hit any
 * request-size limit. Deletes still go through our backend (authorized there).
 */
import { http } from '@/shared/api/httpClient';
import type { PropertyImage } from '@/shared/types/property';

interface UploadSignature {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

// Cloudinary delivery transform — injected into the returned URL so images are
// served resized and in a modern format (webp/avif). This reproduces the old
// server-side optimization on delivery, without transforming (and re-signing)
// at upload time.
const DELIVERY_TRANSFORM = 'c_limit,w_1600,h_1200,f_auto,q_auto:good';

function optimizedUrl(secureUrl: string): string {
  return secureUrl.replace('/upload/', `/upload/${DELIVERY_TRANSFORM}/`);
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
}

async function uploadOne(file: File, sig: UploadSignature): Promise<PropertyImage> {
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  // Plain fetch — must NOT go through our axios client (no cookies/baseURL to Cloudinary).
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  if (!res.ok) {
    throw new Error(`Cloudinary upload failed (${res.status})`);
  }
  const data = (await res.json()) as CloudinaryUploadResponse;
  return { publicId: data.public_id, url: optimizedUrl(data.secure_url) };
}

export const uploadsApi = {
  images: async (files: File[]): Promise<PropertyImage[]> => {
    // One signature is valid for the whole batch (it signs only folder +
    // timestamp, not the file), so all files upload in parallel.
    const sig = await http.get<UploadSignature>('/uploads/signature');
    return Promise.all(files.map((f) => uploadOne(f, sig)));
  },
  remove: (publicId: string) =>
    http.delete<{ message: string }>('/uploads/images', {
      data: { publicId },
    }),
};
