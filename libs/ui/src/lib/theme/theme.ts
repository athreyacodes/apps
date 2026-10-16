import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

/** Same key as athreya.codes. A parent-domain cookie is what actually syncs the two origins. */
const STORAGE_KEY = 'portfolio.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly current = signal<ThemeMode>(this.initialTheme());
  readonly theme = this.current.asReadonly();

  restore(): void {
    if (!this.isBrowser) {
      return;
    }

    this.apply(this.initialTheme(), false);
  }

  toggle(): void {
    this.setTheme(this.current() === 'dark' ? 'light' : 'dark');
  }

  setTheme(mode: ThemeMode): void {
    this.apply(mode, true);
  }

  private initialTheme(): ThemeMode {
    if (!this.isBrowser) {
      return 'light';
    }

    return this.readTheme() ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  private apply(mode: ThemeMode, persist: boolean): void {
    this.current.set(mode);

    if (!this.isBrowser) {
      return;
    }

    const root = this.document.documentElement;
    root.classList.toggle('color-scheme-dark', mode === 'dark');
    root.setAttribute('data-color-scheme', mode);
    root.style.colorScheme = mode;
    this.syncThemeColor(mode);

    if (persist) {
      this.persist(mode);
    }
  }

  private syncThemeColor(mode: ThemeMode): void {
    const color = mode === 'dark' ? '#121212' : '#eeeeee';

    for (const meta of Array.from(this.document.querySelectorAll('meta[name="theme-color"]'))) {
      meta.remove();
    }

    const meta = this.document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', color);
    this.document.head.appendChild(meta);
  }

  private readTheme(): ThemeMode | null {
    return this.readCookie() ?? this.readStored();
  }

  private readStored(): ThemeMode | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  private readCookie(): ThemeMode | null {
    const match = this.document.cookie.match(/(?:^|; )portfolio\.theme=(light|dark)(?:;|$)/);
    return match?.[1] === 'light' || match?.[1] === 'dark' ? match[1] : null;
  }

  private persist(mode: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* private mode */
    }

    const domain = cookieDomain(this.document.location.hostname);
    const secure = this.document.location.protocol === 'https:' ? '; Secure' : '';
    this.document.cookie = `${STORAGE_KEY}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax${domain}${secure}`;
  }
}

function cookieDomain(hostname: string): string {
  if (hostname === 'athreya.codes' || hostname.endsWith('.athreya.codes')) {
    return '; Domain=.athreya.codes';
  }

  return '';
}
