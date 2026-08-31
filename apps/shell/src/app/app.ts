import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageFrame } from '@apps/ui';

type ProductCard = {
  href: string;
  title: string;
  subtitle: string;
  image: string;
};

@Component({
  imports: [RouterModule, PageFrame],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
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
