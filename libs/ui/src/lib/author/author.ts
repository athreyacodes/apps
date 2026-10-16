import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconButton } from '../icon-button/icon-button';

const AUTHOR = {
  name: 'Athreya M R',
  jobTitle: 'Front-end Architect',
  image: '/images/dp-240.jpg',
  links: [
    { kind: 'portfolio' as const, label: 'Checkout my Portfolio.', href: 'https://athreya.codes/' },
    { kind: 'how' as const, label: "Here's How - Blogs", href: 'https://how.athreya.codes' },
    { kind: 'linkedin' as const, label: 'Say Hello! on LinkedIn.', href: 'https://www.linkedin.com/in/athreyamr/' },
    { kind: 'github' as const, label: 'View My GitHub', href: 'https://github.com/athreyacodes' },
  ],
};

@Component({
  selector: 'ui-author',
  imports: [IconButton],
  templateUrl: './author.html',
  styleUrl: './author.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Author {
  protected readonly author = AUTHOR;

  protected open(href: string): void {
    window.open(href, '_blank', 'noopener,noreferrer');
  }
}
