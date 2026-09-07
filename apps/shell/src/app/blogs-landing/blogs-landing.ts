import { Component } from '@angular/core';
import { PageFrame } from '@apps/ui';
import { applyPageSeo } from '@apps/seo';

@Component({
  imports: [PageFrame],
  selector: 'app-blogs-landing',
  template: `
    <ui-page-frame [title]="title" homeHref="/">
      <p class="landing">
        Writing on Apps. This is its own prerendered Angular app on
        <code>/blogs</code>. Locally this stub is enough; production serves the static listing and
        posts.
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
export class BlogsLanding {
  constructor() {
    applyPageSeo('blogs');
  }

  protected readonly title = 'Blogs';
}
