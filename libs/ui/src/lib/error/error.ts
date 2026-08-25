import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'ui-error',
  template: `
    <div class="error">
      <p><ng-content /></p>
      <button type="button" (click)="retry.emit()">Retry</button>
    </div>
  `,
  styles: `
    .error {
      display: grid;
      gap: var(--apps-space-sm);
    }
    .error p {
      margin: 0;
      color: var(--apps-color-danger);
    }
    button {
      justify-self: start;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  readonly retry = output();
}
