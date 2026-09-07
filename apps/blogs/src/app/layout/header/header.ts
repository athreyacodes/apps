import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header class="site-header">
      @if (isHome()) {
        <div class="brand">
          <h1 class="wordmark-heading">
            <a routerLink="/" class="wordmark wordmark--home">
              <span class="wordmark-thin">Here’s </span><span class="wordmark-strong">How!</span>
            </a>
          </h1>
          <p class="lede">Essential ways of building reliable software</p>
        </div>
      } @else {
        <a routerLink="/" class="wordmark wordmark--expand" aria-label="Here’s How!">
          <span class="wordmark-bits" aria-hidden="true">
            <span class="wordmark-here"><span>Here’s </span></span>
            <span class="wordmark-how">How</span>
            <span class="wordmark-punct">
              <span class="wordmark-q">?</span>
              <span class="wordmark-bang">!</span>
            </span>
          </span>
        </a>
      }
    </header>
  `,
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-home]': 'isHome()',
  },
})
export class Header {
  private readonly router = inject(Router);

  protected readonly isHome = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => this.isHomePath(event.urlAfterRedirects)),
      startWith(this.isHomePath(this.router.url)),
    ),
    { requireSync: true },
  );

  private isHomePath(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];
    return path === '/' || path === '';
  }
}
