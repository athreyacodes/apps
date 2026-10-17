import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { Author, Banner, IconButton, PageFrame } from '@apps/ui';
import { applyPageSeo } from '@apps/seo';

@Component({
  imports: [PageFrame, Banner, Author, IconButton, MatTooltip],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly destroyRef = inject(DestroyRef);
  private readonly authorTrigger = viewChild.required<ElementRef<HTMLElement>>('authorTrigger');
  private readonly authorCard = viewChild.required('authorCard', { read: ElementRef<HTMLElement> });
  protected readonly authorOpen = signal(false);
  protected readonly authorClosing = signal(false);
  private closeToken = 0;
  private closeTimer = 0;
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
    afterNextRender(() => {
      const query = window.matchMedia('(max-width: 720px)');
      const onChange = () => {
        if (!query.matches) {
          this.closeToken += 1;
          this.clearMotion();
          this.authorClosing.set(false);
          this.authorOpen.set(false);
        }
      };
      query.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
    });
  }

  protected open(href: string): void {
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  protected toggleAuthor(): void {
    if (this.authorOpen()) {
      this.closeAuthor();
      return;
    }
    this.openAuthor();
  }

  protected closeAuthor(): void {
    const card = this.cardElement();
    const trigger = this.authorTrigger().nativeElement;
    if (!card || prefersReducedMotion()) {
      this.finishClose(card);
      return;
    }
    if (this.authorClosing()) {
      return;
    }

    const icon = trigger.getBoundingClientRect();
    const start = card.getBoundingClientRect();
    const token = ++this.closeToken;
    this.authorClosing.set(true);
    card.style.transition = CLOSE_MOTION;
    void card.offsetWidth;
    card.style.transform = shiftFrom(icon, start);
    card.style.opacity = '0';
    const finish = (event: TransitionEvent) => {
      if (event.propertyName !== 'transform') {
        return;
      }
      card.removeEventListener('transitionend', finish);
      if (token !== this.closeToken) {
        return;
      }
      this.finishClose(card);
    };
    card.addEventListener('transitionend', finish);
    window.clearTimeout(this.closeTimer);
    this.closeTimer = window.setTimeout(() => {
      if (token !== this.closeToken) {
        return;
      }
      card.removeEventListener('transitionend', finish);
      this.finishClose(card);
    }, 420);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.authorOpen()) {
      this.closeAuthor();
    }
  }

  private openAuthor(): void {
    const card = this.cardElement();
    const trigger = this.authorTrigger().nativeElement;
    if (!card) {
      return;
    }
    if (prefersReducedMotion()) {
      this.authorOpen.set(true);
      return;
    }

    const icon = trigger.getBoundingClientRect();
    const end = card.getBoundingClientRect();
    this.closeToken += 1;
    card.style.visibility = '';
    card.style.transition = 'none';
    card.style.transform = shiftFrom(icon, end);
    card.style.opacity = '0.35';
    this.authorOpen.set(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.transition = MOTION;
        card.style.transform = 'none';
        card.style.opacity = '1';
        const finish = (event: TransitionEvent) => {
          if (event.propertyName !== 'transform') {
            return;
          }
          card.removeEventListener('transitionend', finish);
          card.style.transition = '';
          card.style.transform = '';
          card.style.opacity = '';
        };
        card.addEventListener('transitionend', finish);
      });
    });
  }

  private cardElement(): HTMLElement | null {
    return this.authorCard().nativeElement ?? null;
  }

  private finishClose(card: HTMLElement | null): void {
    this.closeToken += 1;
    window.clearTimeout(this.closeTimer);
    if (card) {
      card.style.visibility = 'hidden';
    }
    this.clearMotion();
    this.authorClosing.set(false);
    this.authorOpen.set(false);
    requestAnimationFrame(() => {
      if (card && !this.authorOpen()) {
        card.style.visibility = '';
      }
    });
  }

  private clearMotion(): void {
    const card = this.authorCard()?.nativeElement;
    if (!card) {
      return;
    }
    card.style.transition = '';
    card.style.transform = '';
    card.style.opacity = '';
  }
}

const MOTION = 'transform 340ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 220ms ease';
const CLOSE_MOTION = 'transform 340ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 340ms linear';

function shiftFrom(icon: DOMRect, card: DOMRect): string {
  const dx = icon.left + icon.width / 2 - (card.left + card.width / 2);
  const dy = icon.top + icon.height / 2 - (card.top + card.height / 2);
  const scale = card.width ? icon.width / card.width : 1;
  return `translate(${dx}px, ${dy}px) scale(${scale})`;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
