const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://task-management-portal-be.vercel.app/api';

export function getSocialMediaUrl(fileId) {
  if (!fileId) return null;
  return `${API_URL}/social/media/${fileId}`;
}

export function extractHashtags(text = '') {
  const matches = text.match(/#[\w]+/g) || [];
  return matches.map((tag) => tag.slice(1).toLowerCase());
}
