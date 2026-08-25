import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-empty',
  template: `<p class="empty"><ng-content /></p>`,
  styles: `
    .empty {
      margin: 0;
      color: var(--apps-color-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Empty {}
