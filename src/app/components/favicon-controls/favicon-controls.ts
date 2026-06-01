import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { FaviconSettings } from '../../models/favicon-settings';
import { DEFAULT_FAVICON_SETTINGS } from '../../models/favicon-settings';

@Component({
  selector: 'app-favicon-controls',
  imports: [],
  templateUrl: './favicon-controls.html',
  styleUrl: './favicon-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaviconControls {
  readonly settings = input(DEFAULT_FAVICON_SETTINGS);
  readonly settingsChange = output<FaviconSettings>();

  protected onBackgroundChange(color: string): void {
    this.settingsChange.emit({ ...this.settings(), backgroundColor: color });
  }

  protected onAppNameChange(name: string): void {
    this.settingsChange.emit({ ...this.settings(), appName: name });
  }

  protected onAppShortNameChange(name: string): void {
    this.settingsChange.emit({ ...this.settings(), appShortName: name });
  }
}
