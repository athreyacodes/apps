import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'ui-icon-button',
  imports: [MatTooltip],
  template: `
    <button
      type="button"
      [attr.aria-label]="tooltip()"
      [matTooltip]="tooltip()"
      matTooltipPosition="below"
      (click)="pressed($event)"
    >
      <ng-content />
    </button>
  `,
  styleUrl: './icon-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButton {
  readonly tooltip = input.required<string>();
  readonly click = output<MouseEvent>();

  protected pressed(event: MouseEvent): void {
    event.stopPropagation();
    this.click.emit(event);
  }
}
