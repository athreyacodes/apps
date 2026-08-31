import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageFrame } from '@apps/ui';
import { applyPageSeo } from '@apps/seo';

@Component({
  imports: [RouterModule, PageFrame],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    applyPageSeo('weather');
  }

  protected readonly title = 'Weather';
}
