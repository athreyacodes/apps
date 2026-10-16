import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-banner',
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Banner {}
