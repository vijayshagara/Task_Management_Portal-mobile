import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// The login token lives in the device's encrypted keystore; the (non-secret) profile stays in AsyncStorage.
async function secureGet(key) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureSet(key, value) {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch {
    return false;
  }
}

async function secureDelete(key) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
}

export async function loadAuth() {
  let token = await secureGet(TOKEN_KEY);

  // Migrate a token saved by an older app version (plain AsyncStorage) into secure storage.
  if (!token) {
    const legacy = await AsyncStorage.getItem(TOKEN_KEY);
    if (legacy) {
      token = legacy;
      if (await secureSet(TOKEN_KEY, legacy)) await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }

  const userJson = await AsyncStorage.getItem(USER_KEY);

  let user = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      await clearAuth();
      return { token: null, user: null };
    }
  }

  // Orphaned token without user — clear to avoid stale auth
  if (token && !user) {
    await clearAuth();
    return { token: null, user: null };
  }

  return { token, user };
}

export async function saveAuth(token, user) {
  const stored = await secureSet(TOKEN_KEY, token);
  // If secure storage is unavailable on this device, fall back so login still works.
  if (!stored) await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearAuth() {
  await secureDelete(TOKEN_KEY);
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}
