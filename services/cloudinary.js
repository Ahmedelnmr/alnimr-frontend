/**
 * cloudinary.js — Frontend Cloudinary upload service
 * Uploads directly to Cloudinary from the browser using unsigned preset.
 */

const CLOUD_NAME    = window.APP_CONFIG?.CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const UPLOAD_PRESET = window.APP_CONFIG?.CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';

/**
 * Upload a file directly to Cloudinary (unsigned upload).
 * @param {File} file
 * @param {string} folder - Cloudinary folder path
 * @param {Function} onProgress - optional progress callback (0-100)
 * @returns {Promise<string>} secure_url
 */
export async function uploadToCloudinary(file, folder = 'realestate', onProgress = null) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const resourceType = file.type.startsWith('video/') ? 'video'
    : file.type === 'application/pdf' ? 'raw'
    : 'image';

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        reject(new Error(`Upload failed: ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

/**
 * Upload multiple files and return array of URLs.
 */
export async function uploadMultiple(files, folder = 'realestate', onProgress = null) {
  const total     = files.length;
  let   completed = 0;

  const urls = await Promise.all(
    Array.from(files).map(async (file) => {
      const url = await uploadToCloudinary(file, folder, null);
      completed++;
      if (onProgress) onProgress(Math.round((completed / total) * 100));
      return url;
    })
  );

  return urls;
}
