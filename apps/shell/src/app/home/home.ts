import { Component } from '@angular/core';
import { Author, Banner, PageFrame } from '@apps/ui';
import { applyPageSeo } from '@apps/seo';

@Component({
  imports: [PageFrame, Banner, Author],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor() {
    applyPageSeo('home');
  }
}
