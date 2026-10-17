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
      (click)="emit($event)"
    >
      <ng-content />
    </button>
  `,
  styleUrl: './icon-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButton {
  readonly tooltip = input.required<string>();
  readonly pressed = output<MouseEvent>();

  protected emit(event: MouseEvent): void {
    event.stopPropagation();
    this.pressed.emit(event);
  }
}
