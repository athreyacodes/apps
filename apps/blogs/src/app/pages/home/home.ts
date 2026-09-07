import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { distinctUntilChanged, map, of, switchMap, timer } from 'rxjs';

import { TAGS, TAG_LABELS, type Tag } from '../../core/post';
import { Posts } from '../../core/posts';
import { AuthorMenu } from '../../shared/author/author-menu';

const PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-home',
  imports: [AuthorMenu, DatePipe, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly posts = inject(Posts);

  protected readonly tags = TAGS;
  protected readonly tag = signal<Tag | null>(null);
  protected readonly searchInput = signal('');
  protected readonly visibleCount = signal(PAGE_SIZE);

  protected readonly searchQuery = toSignal(
    toObservable(this.searchInput).pipe(
      switchMap((value) =>
        value.trim() === '' ? of('') : timer(SEARCH_DEBOUNCE_MS).pipe(map(() => value)),
      ),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  protected readonly filtered = computed(() => {
    const tag = this.tag();
    const query = this.searchQuery().trim().toLowerCase();

    return this.posts.all.filter((post) => {
      if (tag && !post.tags.includes(tag)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        post.title,
        post.tagline,
        post.description,
        ...post.tags.map((item) => TAG_LABELS[item]),
        ...post.tags,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  });

  protected readonly isNarrowed = computed(
    () => this.tag() !== null || this.searchQuery().trim().length > 0,
  );

  protected readonly list = computed(() => {
    const filtered = this.filtered();

    if (this.isNarrowed()) {
      return filtered;
    }

    return filtered.slice(0, this.visibleCount());
  });

  protected readonly showLoadMore = computed(
    () => !this.isNarrowed() && this.filtered().length > this.visibleCount(),
  );

  protected tagLabel(tag: Tag): string {
    return this.posts.tagLabel(tag);
  }

  protected toggleTag(tag: Tag): void {
    this.tag.update((current) => (current === tag ? null : tag));
    this.visibleCount.set(PAGE_SIZE);
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInput.set(value);
    this.visibleCount.set(PAGE_SIZE);
  }

  protected clearSearch(): void {
    this.searchInput.set('');
    this.visibleCount.set(PAGE_SIZE);
  }

  protected loadMore(): void {
    this.visibleCount.update((count) => count + PAGE_SIZE);
  }
}
