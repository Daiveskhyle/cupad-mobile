import { Platform } from 'react-native';

/**
 * Cross-platform key/value storage.
 * - Native: expo-secure-store (when available)
 * - Web / fallback: localStorage or in-memory
 */
const memory = new Map<string, string>();

async function getSecureStore() {
  try {
    const mod = await import('expo-secure-store');
    if (typeof mod.setItemAsync === 'function' && typeof mod.getItemAsync === 'function') {
      return mod;
    }
  } catch {
    // module missing or broken
  }
  return null;
}

export async function storageGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
      return memory.get(key) ?? null;
    }
    const SecureStore = await getSecureStore();
    if (SecureStore) {
      return await SecureStore.getItemAsync(key);
    }
    return memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

export async function storageSet(key: string, value: string): Promise<void> {
  try {
    memory.set(key, value);
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    const SecureStore = await getSecureStore();
    if (SecureStore) {
      await SecureStore.setItemAsync(key, value);
    }
  } catch {
    // keep memory value
  }
}

export async function storageDelete(key: string): Promise<void> {
  try {
    memory.delete(key);
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    const SecureStore = await getSecureStore();
    if (SecureStore && typeof SecureStore.deleteItemAsync === 'function') {
      await SecureStore.deleteItemAsync(key);
    }
  } catch {
    // ignore
  }
}
