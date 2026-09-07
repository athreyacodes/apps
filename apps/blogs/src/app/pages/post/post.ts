import { DatePipe, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  PLATFORM_ID,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PageFrame } from '@apps/ui';

import type { Post, Tag } from '../../core/post';
import { Posts } from '../../core/posts';
import bodies from '../../generated/bodies.json';

const SECTIONS = [
  { id: 'what', label: 'What' },
  { id: 'when', label: 'When' },
  { id: 'how', label: 'How' },
  { id: 'watch-out-for', label: 'Watch out for' },
] as const;

@Component({
  selector: 'app-post',
  imports: [PageFrame, DatePipe, RouterLink],
  templateUrl: './post.html',
  styleUrl: './post.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PostPage {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly posts = inject(Posts);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: IntersectionObserver | undefined;
  private observedSlug: string | undefined;

  protected readonly title = 'Blogs';

  readonly post = toSignal(inject(ActivatedRoute).data.pipe(map((data) => data['post'] as Post)), {
    requireSync: true,
  });

  protected readonly html = computed(() => {
    const body = (bodies as Record<string, string>)[this.post().slug] ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(body);
  });

  protected readonly similar = computed(() => this.posts.similar(this.post()));
  protected readonly recent = computed(() => this.posts.recent(this.post()));
  protected readonly sections = computed(() => {
    const body = (bodies as Record<string, string>)[this.post().slug] ?? '';
    return SECTIONS.filter((section) => body.includes(`id="${section.id}"`));
  });
  protected readonly activeSection = signal<string | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.teardownSpy());

    afterRenderEffect(() => {
      this.html();
      this.sections();
      this.observeSections();
    });
  }

  protected tagLabel(tag: Tag): string {
    return this.posts.tagLabel(tag);
  }

  protected onNavClick(event: MouseEvent, id: string): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.scrollTo(id);
  }

  @HostListener('click', ['$event'])
  protected copyCode(event: Event): void {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('[data-copy]');

    if (!button) {
      return;
    }

    const source = button
      .closest('.code-block')
      ?.querySelector<HTMLTextAreaElement>('.code-block__source');
    const text = source?.value;

    if (!text) {
      return;
    }

    void navigator.clipboard.writeText(text).then(() => {
      const previous = button.textContent;
      button.textContent = 'Copied';
      window.setTimeout(() => {
        button.textContent = previous ?? 'Copy';
      }, 1600);
    });
  }

  private teardownSpy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.observedSlug = undefined;
  }

  private observeSections(): void {
    const slug = this.post().slug;

    if (this.observer && this.observedSlug === slug) {
      return;
    }

    this.teardownSpy();

    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const sections = this.sections();
    const visible = new Set<string>();
    this.observedSlug = slug;
    this.activeSection.set(sections[0]?.id ?? null);

    const highlight = () => {
      let current: string | null = null;

      for (const section of sections) {
        if (visible.has(section.id)) {
          current = section.id;
        }
      }

      if (current) {
        this.activeSection.set(current);
        return;
      }

      const first = sections[0] && this.document.getElementById(sections[0].id);
      const last = sections.at(-1);

      if (first && first.getBoundingClientRect().top >= 0) {
        this.activeSection.set(sections[0].id);
        return;
      }

      this.activeSection.set(last?.id ?? null);
    };

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }

        highlight();
      },
      {
        root: null,
        rootMargin: '0px 0px -30% 0px',
        threshold: 0,
      },
    );

    for (const section of sections) {
      const element = this.document.getElementById(section.id);

      if (element) {
        this.observer.observe(element);
      }
    }
  }

  private scrollTo(id: string): void {
    if (!this.isBrowser) {
      return;
    }

    const target = this.document.getElementById(id);

    if (!target) {
      return;
    }

    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 24);
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    window.scrollTo({ top, behavior });
    this.activeSection.set(id);
  }
}
