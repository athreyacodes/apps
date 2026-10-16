import { afterNextRender, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@apps/ui';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: '<router-outlet />',
})
export class App {
  private readonly theme = inject(ThemeService);

  constructor() {
    afterNextRender(() => this.theme.restore());
  }
}
