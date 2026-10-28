import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Drive Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive');

// In-memory token cache (Do NOT store in localStorage per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
}

/**
 * Initializes the auth listener to monitor sign-in state.
 */
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in using Google popup to acquire OAuth token with Drive scopes.
 */
export const signInWithGoogleDrive = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan Access Token Google Drive dari autentikasi.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (err) {
    console.error('Google Drive sign-in error:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out and clear in-memory token.
 */
export const signOutGoogleDrive = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Retrieves the currently cached access token.
 */
export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Helper to ensure a valid access token is present before calling Google Drive API.
 */
async function requireAccessToken(): Promise<string> {
  if (cachedAccessToken) return cachedAccessToken;
  // If not cached, prompt sign in
  const authRes = await signInWithGoogleDrive();
  return authRes.accessToken;
}

const APP_FOLDER_NAME = 'Aplikasi 8355 SMPN 18 Jakarta';

/**
 * Finds or creates the dedicated app folder in Google Drive.
 */
export const getOrCreateAppFolder = async (): Promise<string> => {
  const token = await requireAccessToken();

  // Search for folder
  const query = encodeURIComponent(
    `name = '${APP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!searchRes.ok) {
    throw new Error('Gagal memeriksa folder di Google Drive.');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder arsip dan cadangan resmi data siswa Aplikasi 8355 SMPN 18 Jakarta',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Gagal membuat folder di Google Drive.');
  }

  const folderData = await createRes.json();
  return folderData.id;
};

/**
 * Lists backup files in the app folder or root.
 */
export const listDriveFiles = async (): Promise<DriveFileItem[]> => {
  const token = await requireAccessToken();
  const folderId = await getOrCreateAppFolder().catch(() => null);

  let q = "trashed = false and mimeType != 'application/vnd.google-apps.folder'";
  if (folderId) {
    q += ` and '${folderId}' in parents`;
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&orderBy=modifiedTime desc&pageSize=50&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,iconLink)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    throw new Error('Gagal mengambil daftar file dari Google Drive.');
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Uploads a text or binary Blob file into Google Drive (multipart upload).
 */
export const uploadFileToDrive = async ({
  name,
  mimeType,
  blob,
  description,
}: {
  name: string;
  mimeType: string;
  blob: Blob;
  description?: string;
}): Promise<DriveFileItem> => {
  const token = await requireAccessToken();
  const folderId = await getOrCreateAppFolder().catch(() => null);

  const metadata: Record<string, any> = {
    name,
    mimeType,
    description: description || 'Dibuat otomatis oleh Aplikasi 8355 SMPN 18 Jakarta',
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;

  const reader = new FileReader();
  const fileDataPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

  const fileData = await fileDataPromise;

  // Build multipart body
  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(metadataPart);
  const mediaHeaderBytes = encoder.encode(
    `\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`
  );
  const closeDelimiterBytes = encoder.encode(closeDelimiter);

  const multipartBody = new Uint8Array(
    metadataBytes.length +
      mediaHeaderBytes.length +
      fileData.byteLength +
      closeDelimiterBytes.length
  );

  let offset = 0;
  multipartBody.set(metadataBytes, offset);
  offset += metadataBytes.length;
  multipartBody.set(mediaHeaderBytes, offset);
  offset += mediaHeaderBytes.length;
  multipartBody.set(new Uint8Array(fileData), offset);
  offset += fileData.byteLength;
  multipartBody.set(closeDelimiterBytes, offset);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Drive upload failed:', errorText);
    throw new Error('Gagal mengunggah berkas ke Google Drive.');
  }

  return await res.json();
};

/**
 * Deletes a file from Google Drive.
 * NOTE: User confirmation MUST be obtained in UI before calling this!
 */
export const deleteFileFromDrive = async (fileId: string): Promise<void> => {
  const token = await requireAccessToken();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error('Gagal menghapus berkas dari Google Drive.');
  }
};
