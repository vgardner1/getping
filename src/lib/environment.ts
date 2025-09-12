// Environment utilities for generating shareable, production-safe URLs
// These functions ensure we never include the sandbox path in shared links

export const isProduction = (): boolean => {
  try {
    return !window.location.pathname.includes('/sandbox/');
  } catch {
    // If window is not available (SSR or tests), assume production for share links
    return true;
  }
};

export const getShareableUrl = (path: string): string => {
  try {
    const origin = window.location.origin;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    // Always return origin + path (no sandbox segment)
    const url = `${origin}${normalized}`;
    return url;
  } catch {
    return path;
  }
};

export const getPublicProfileUrl = (userId: string): string => {
  return getShareableUrl(`/ping/${userId}`);
};
