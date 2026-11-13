import createCache from '@emotion/cache';

/**
 * One Emotion cache key on server and client, so the client adopts the style tags
 * the prerender emitted. `prepend` keeps MUI's styles first, letting the site's
 * stylesheets refine them at equal specificity.
 */
export const createEmotionCache = () => createCache({ key: 'css', prepend: true });
