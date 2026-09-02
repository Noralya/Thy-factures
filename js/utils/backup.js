// backup.js
// Exports/imports an encrypted snapshot of all local data.
// Uses PBKDF2 (derive key from password) + AES-GCM (authenticated encryption).
// Everything happens on-device via the Web Crypto API - nothing is sent anywhere,
// and the password itself is never stored.

import DB from '../db/database.js';

const PBKDF2_ITERATIONS = 250000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const FILE_MAGIC = 'BACKUP-V1';

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function concatBuffers(...buffers) {
  const total = buffers.reduce((sum, b) => sum + b.byteLength, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) {
    result.set(new Uint8Array(b), offset);
    offset += b.byteLength;
  }
  return result;
}

function toBase64(bytes) {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function fromBase64(str) {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function collectAllData() {
  const [profile, clients, services, invoices, settings, counters] = await Promise.all([
    DB.getAll(DB.STORES.profile),
    DB.getAll(DB.STORES.clients),
    DB.getAll(DB.STORES.services),
    DB.getAll(DB.STORES.invoices),
    DB.getAll(DB.STORES.settings),
    DB.getAll(DB.STORES.counters)
  ]);
  return {
    exportedAt: new Date().toISOString(),
    appVersion: 1,
    data: { profile, clients, services, invoices, settings, counters }
  };
}

export async function createEncryptedBackup(password) {
  if (!password || password.length < 4) {
    throw new Error('Le mot de passe de sauvegarde doit contenir au moins 4 caractères.');
  }
  const payload = await collectAllData();
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);

  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

  const container = {
    magic: FILE_MAGIC,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext))
  };

  return new Blob([JSON.stringify(container)], { type: 'application/json' });
}

export async function restoreEncryptedBackup(file, password) {
  const text = await file.text();
  let container;
  try {
    container = JSON.parse(text);
  } catch (e) {
    throw new Error('Fichier de sauvegarde invalide.');
  }
  if (!container || container.magic !== FILE_MAGIC) {
    throw new Error('Ce fichier ne semble pas être une sauvegarde valide de cette application.');
  }

  const salt = fromBase64(container.salt);
  const iv = fromBase64(container.iv);
  const ciphertext = fromBase64(container.ciphertext);

  const key = await deriveKey(password, salt);

  let decrypted;
  try {
    decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  } catch (e) {
    throw new Error('Mot de passe incorrect ou fichier corrompu.');
  }

  const json = new TextDecoder().decode(decrypted);
  const payload = JSON.parse(json);
  return payload;
}

export async function restoreAllData(payload, { replace = true } = {}) {
  const { data } = payload;
  const storeMap = {
    profile: DB.STORES.profile,
    clients: DB.STORES.clients,
    services: DB.STORES.services,
    invoices: DB.STORES.invoices,
    settings: DB.STORES.settings,
    counters: DB.STORES.counters
  };

  for (const [key, storeName] of Object.entries(storeMap)) {
    if (replace) await DB.clear(storeName);
    const records = data[key] || [];
    for (const record of records) {
      await DB.put(storeName, record);
    }
  }
}
