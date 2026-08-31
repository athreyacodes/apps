import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageFrame } from '@apps/ui';
import { applyPageSeo } from '@apps/seo';

type ProductCard = {
  href: string;
  title: string;
  subtitle: string;
  image: string;
};

@Component({
  imports: [PageFrame, RouterLink],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor() {
    applyPageSeo('home');
  }

  protected readonly title = 'Apps';
  protected readonly products: readonly ProductCard[] = [
    {
      href: '/weather',
      title: 'Weather',
      subtitle: 'City search and a short forecast. Its own Angular app.',
      image: '/images/weather.svg',
    },
    {
      href: '/markets',
      title: 'Markets',
      subtitle: 'FX rates and a small watchlist. Its own Angular app.',
      image: '/images/markets.svg',
    },
  ];
}
