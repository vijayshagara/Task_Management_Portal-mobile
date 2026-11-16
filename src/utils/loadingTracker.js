// Tracks in-flight API requests so a global loader can show while any call is slow.
let pending = 0;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const loadingTracker = {
  start() { pending += 1; emit(); },
  stop() { pending = Math.max(0, pending - 1); emit(); },
  subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
  getSnapshot() { return pending; },
};
