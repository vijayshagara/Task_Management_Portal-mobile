import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export async function loadAuth() {
  const [token, userJson] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(USER_KEY),
  ]);

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
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function clearAuth() {
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}
