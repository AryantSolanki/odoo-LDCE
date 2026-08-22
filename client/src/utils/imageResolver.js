/**
 * Helper to safely resolve image URLs across different backend entity types.
 * Prevents 'undefined' or broken images in the UI.
 */
export const getOptimizedImage = (entity, type = 'destination') => {
  if (!entity) return getFallbackImage(type);

  // Try various possible fields an image could be stored in
  const imgUrl = entity.image_url || entity.imageUrl || entity.image || entity.coverImage;

  if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim() !== '' && imgUrl !== 'undefined') {
    return imgUrl;
  }

  return getFallbackImage(type);
};

const getFallbackImage = (type) => {
  if (type === 'destination') {
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
  }
  if (type === 'activity') {
    return 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80';
  }
  if (type === 'trip') {
    return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80';
};
