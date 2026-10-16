import { Component } from '@angular/core';
import { Author, Banner, PageFrame, Quote } from '@apps/ui';
import { applyPageSeo } from '@apps/seo';

@Component({
  imports: [PageFrame, Banner, Quote, Author],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  constructor() {
    applyPageSeo('home');
  }
}
