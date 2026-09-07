import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';

import { AUTHOR } from './author';

@Component({
  selector: 'app-author-menu',
  templateUrl: './author-menu.html',
  styleUrl: './author-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorMenu {
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly AUTHOR = AUTHOR;
  protected readonly open = signal(false);

  protected toggleOpen(): void {
    if (this.open()) {
      this.close();
      return;
    }

    this.open.set(true);
    afterNextRender(
      () => {
        this.panel()?.nativeElement.querySelector<HTMLElement>('a, button')?.focus();
      },
      { injector: this.injector },
    );
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key !== 'Tab' || !this.panel()) {
      return;
    }

    const focusable = Array.from(
      this.panel()!.nativeElement.querySelectorAll<HTMLElement>('a, button'),
    );

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  protected close(): void {
    if (!this.open()) {
      return;
    }

    this.open.set(false);
    afterNextRender(() => this.trigger().nativeElement.focus(), { injector: this.injector });
  }
}
