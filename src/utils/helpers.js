export const DEFAULT_COW_IMAGE =
  'https://images.unsplash.com/photo-1546445317-29f4545c9d0c?w=400&h=300&fit=crop';

export function getCowImageUrl(cow) {
  if (!cow?.image) return DEFAULT_COW_IMAGE;
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

export function getErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || fallback;
}

export function titleCase(value) {
  if (!value) return '';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
