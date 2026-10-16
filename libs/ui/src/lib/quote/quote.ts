import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ui-quote',
  template: `
    <figure>
      <blockquote>
        <ng-content />
      </blockquote>
    </figure>
  `,
  styles: `
    ui-quote {
      display: block;
      padding: 0.15rem 0 0.15rem 1.15rem;
      border-left: 3px solid var(--apps-color-accent, var(--primary-color, #156064));
      font-synthesis: weight;
    }

    ui-quote figure,
    ui-quote blockquote {
      margin: 0;
    }

    ui-quote p {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.65;
    }

    ui-quote strong {
      font-weight: 800;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Quote {}
