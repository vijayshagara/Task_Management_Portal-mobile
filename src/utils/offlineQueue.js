import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

const QUEUE_KEY = '@toral_offline_queue';

export async function getOfflineQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function enqueueOfflineAction(action) {
  const queue = await getOfflineQueue();
  queue.push({ ...action, queuedAt: Date.now() });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return queue.length;
}

export async function syncOfflineQueue() {
  const queue = await getOfflineQueue();
  if (!queue.length) return { synced: 0, failed: 0, dropped: 0 };

  const remaining = [];
  let synced = 0;
  let dropped = 0;

  for (const item of queue) {
    try {
      if (item.type === 'health') await api.post('/health', item.payload);
      else if (item.type === 'milk') await api.post('/farm/milk', item.payload);
      else if (item.type === 'diary') await api.post('/farm/diary', item.payload);
      else continue;
      synced += 1;
    } catch (err) {
      const status = err?.response?.status;
      // Server rejected the data itself (validation etc.) — retrying will never work, so drop it.
      if (status && status >= 400 && status < 500 && ![401, 408, 429].includes(status)) dropped += 1;
      else remaining.push(item);
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { synced, failed: remaining.length, dropped };
}
