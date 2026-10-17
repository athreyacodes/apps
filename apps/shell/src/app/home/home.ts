import { Component } from '@angular/core';
import { Author, Banner, IconButton, PageFrame } from '@apps/ui';
import { applyPageSeo } from '@apps/seo';

@Component({
  imports: [PageFrame, Banner, Author, IconButton],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly proofs = [
    {
      name: 'Outlook-style List',
      note: 'POC to implement infinite scroll',
      repo: 'https://github.com/athreyacodes/scroll-pagination',
      live: 'https://athreyacodes.github.io/scroll-pagination/',
    },
    {
      name: 'Currency Control',
      note: 'POC to achieve custom currency control',
      repo: 'https://github.com/athreyacodes/CurrencyControl',
      live: 'https://athreyacodes.github.io/CurrencyControl/',
    },
    {
      name: 'Desktop Notifications',
      note: 'POC to understand how desktop notification works',
      repo: 'https://github.com/athreyacodes/DesktopNotifications',
      live: 'https://athreyacodes.github.io/DesktopNotifications/',
    },
  ];

  constructor() {
    applyPageSeo('home');
  }

  protected open(href: string): void {
    window.open(href, '_blank', 'noopener,noreferrer');
  }
}
