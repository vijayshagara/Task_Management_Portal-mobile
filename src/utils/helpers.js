export function getCowImageUrl(cow) {
  if (!cow?.image) return null;
  const base = (process.env.EXPO_PUBLIC_API_URL || 'https://task-management-portal-be.vercel.app/api').replace(/\/$/, '');
  return `${base}/cows/${cow.id}/image`;
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const NETWORK_ERROR = 'Cannot reach the server. Check your internet connection and try again.';
export const TIMEOUT_ERROR = 'The server took too long to respond. Please try again.';

export function getErrorMessage(error, fallback = 'Something went wrong') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return TIMEOUT_ERROR;
  if (error?.request && !error?.response) return NETWORK_ERROR;
  return error?.message || fallback;
}

/** True when a thunk rejection (string message) means the device is offline / server unreachable. */
export function isOfflineError(err) {
  return err === NETWORK_ERROR || err === TIMEOUT_ERROR;
}

export function titleCase(value) {
  if (!value) return '';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
