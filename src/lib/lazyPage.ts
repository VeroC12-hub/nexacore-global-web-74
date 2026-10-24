import { lazy, type ComponentType } from 'react';

const RELOAD_KEY = 'nexacore-chunk-reload';

// After a deploy, an open tab may ask for page files that no longer exist.
// Reload once to pick up the new build instead of showing a blank page.
export function lazyPage<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const page = await load();
      try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* storage unavailable */ }
      return page;
    } catch (error) {
      let reloaded = false;
      try { reloaded = sessionStorage.getItem(RELOAD_KEY) === '1'; } catch { /* storage unavailable */ }
      if (!reloaded) {
        try { sessionStorage.setItem(RELOAD_KEY, '1'); } catch { /* storage unavailable */ }
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}
