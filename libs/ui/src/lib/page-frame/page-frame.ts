import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-page-frame',
  imports: [],
  templateUrl: './page-frame.html',
  styleUrl: './page-frame.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageFrame {
  readonly title = input.required<string>();
  readonly homeHref = input<string | undefined>(undefined);
}
