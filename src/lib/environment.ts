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

export const getCanonicalOrigin = (): string => {
  try {
    const { hostname, protocol, origin } = window.location;
    // Map preview domains to canonical project domain
    // id-preview--<id>.lovable.app -> <id>.lovableproject.com
    const previewMatch = hostname.match(/^id-preview--([a-z0-9-]+)\.lovable\.app$/);
    if (previewMatch) {
      const projectId = previewMatch[1];
      return `${protocol}//${projectId}.lovableproject.com`;
    }
    return origin;
  } catch {
    return "";
  }
};

export const getShareableUrl = (path: string): string => {
  try {
    const origin = getCanonicalOrigin() || window.location.origin;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const url = `${origin}${normalized}`;
    return url;
  } catch {
    return path;
  }
};

export const getPublicProfileUrl = (userId: string): string => {
  return getShareableUrl(`/ping/${userId}`);
};
