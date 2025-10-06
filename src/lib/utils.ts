import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Build a fully qualified URL that preserves the sandbox base path in preview
export function buildPublicUrl(path: string) {
  try {
    const { origin, pathname } = window.location;
    const match = pathname.match(/^\/sandbox\/[^/]+/);
    const base = match ? match[0] : "";
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${origin}${base}${normalized}`;
  } catch {
    return path;
  }
}

// Safely navigate to external OAuth URLs from sandboxed iframes
export function safeRedirect(url: string) {
  try {
    // Prefer top-level navigation when accessible
    if (window.top && window.top !== window) {
      window.top.location.href = url;
      return;
    }
  } catch (e) {
    // Accessing window.top can throw in sandbox/cross-origin; ignore and fallback
  }

  // Fallback: open a new tab (works in sandboxed previews)
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    // Last resort: same-frame navigation (may be blocked by X-Frame-Options)
    window.location.href = url;
  }
}
