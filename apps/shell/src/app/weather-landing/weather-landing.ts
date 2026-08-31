import { Component } from '@angular/core';
import { PageFrame } from '@apps/ui';
import { applyPageSeo } from '@apps/seo';

@Component({
  imports: [PageFrame],
  selector: 'app-weather-landing',
  template: `
    <ui-page-frame [title]="title" homeHref="/">
      <p class="landing">
        City search and a short forecast. This is its own Angular app on
        <code>/weather</code>.
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
export class WeatherLanding {
  constructor() {
    applyPageSeo('weather');
  }

  protected readonly title = 'Weather';
}
