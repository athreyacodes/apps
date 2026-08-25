import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageFrame } from '@apps/ui';

@Component({
  imports: [RouterModule, PageFrame],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = 'Weather';
}
