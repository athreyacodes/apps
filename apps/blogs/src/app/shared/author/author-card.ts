import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AUTHOR } from './author';

@Component({
  selector: 'app-author-card',
  templateUrl: './author-card.html',
  styleUrl: './author-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorCard {
  protected readonly AUTHOR = AUTHOR;
}
