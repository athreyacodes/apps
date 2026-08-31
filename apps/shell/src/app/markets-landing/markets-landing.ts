import { Component } from '@angular/core';
import { PageFrame } from '@apps/ui';
import { applyPageSeo } from '@apps/seo';

@Component({
  imports: [PageFrame],
  selector: 'app-markets-landing',
  template: `
    <ui-page-frame [title]="title" homeHref="/">
      <p class="landing">
        FX rates and a small watchlist. This is its own Angular app on
        <code>/markets</code>.
      </p>
    </ui-page-frame>
  `,
  styles: `
    .landing {
      margin: 0.5rem 0 0;
      font-size: 1.05rem;
      line-height: 1.65;
    }

    .landing code {
      font-size: 0.9em;
    }
  `,
})
export class MarketsLanding {
  constructor() {
    applyPageSeo('markets');
  }

  protected readonly title = 'Markets';
}
