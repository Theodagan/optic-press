import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-output-options',
  imports: [],
  templateUrl: './output-options.html',
  styleUrl: './output-options.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutputOptions {
  readonly title = input('Output options');
  readonly description = input('Fine tune encoding settings after choosing a task.');

  protected readonly isOpen = signal(false);

  protected toggle(): void {
    this.isOpen.update((value) => !value);
  }
}
