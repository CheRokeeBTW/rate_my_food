import { getAccessToken } from './token.service';

export type CloudinaryUploadResponse = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
  original_filename: string;
};

export type UploadPromise<T> = Promise<T> & {
  abort: () => void;
};

export async function getCloudinarySignature() {
  const token = getAccessToken();

  if (!token) {
    throw new Error('You must be logged in');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/cloudinary/signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Could not prepare image upload');
  }

  return response.json();
}

export async function uploadToCloudinary(
  file: File,
  onProgress: (progress: number) => void,
): Promise<CloudinaryUploadResponse> {
  const {
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder,
  } = await getCloudinarySignature();

  const formData = new FormData();

  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    );

    xhr.responseType = 'json';

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;

      const progress = Math.round(
        (event.loaded / event.total) * 100,
      );

      onProgress(progress);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject(
          new Error(
            xhr.response?.error?.message ||
              'Image upload failed',
          ),
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading image'));
    };

    xhr.onabort = () => {
      reject(new Error('Upload cancelled'));
    };

    xhr.send(formData);
  });
}