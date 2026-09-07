import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageFrame } from '@apps/ui';

@Component({
  selector: 'app-not-found',
  imports: [PageFrame, RouterLink],
  template: `
    <ui-page-frame [title]="title" homeHref="/">
      <section class="not-found">
        <h1>Not found</h1>
        <p>That page is not on Blogs.</p>
        <a class="btn-primary" routerLink="/">Back to Blogs</a>
      </section>
    </ui-page-frame>
  `,
  styles: `
    .not-found {
      display: grid;
      justify-items: start;
      gap: 0.85rem;
      text-align: left;
    }

    h1 {
      margin: 0;
      font-size: clamp(2rem, 6vw, 3rem);
    }

    p {
      margin: 0 0 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  protected readonly title = 'Blogs';
}
