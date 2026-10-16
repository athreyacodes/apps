import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { Footer } from '../footer/footer';
import { IconButton } from '../icon-button/icon-button';
import { ThemeService } from '../theme/theme';

@Component({
  selector: 'ui-page-frame',
  imports: [Footer, IconButton, MatTooltip],
  templateUrl: './page-frame.html',
  styleUrl: './page-frame.scss',
  host: { '[attr.title]': 'null' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageFrame {
  private readonly themes = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  readonly title = input('');
  readonly byline = input('');
  protected readonly theme = this.themes.theme;
  protected readonly showHome = computed(() => !isHomeUrl(this.url()));

  protected toggleTheme(): void {
    this.themes.toggle();
  }

  protected themeLabel(): string {
    return this.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  }
}

function isHomeUrl(url: string): boolean {
  const path = url.split(/[?#]/)[0];
  return path === '' || path === '/';
}
