import { Component } from '@angular/core';
import { PageFrame } from '@apps/ui';
import { applyPageSeo } from '@apps/seo';

@Component({
  imports: [PageFrame],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  constructor() {
    applyPageSeo('home');
  }
}
