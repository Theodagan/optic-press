import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ImageJob } from '../../models/image-job';

@Component({
  selector: 'app-image-card',
  imports: [],
  templateUrl: './image-card.html',
  styleUrl: './image-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageCard {
  readonly job = input.required<ImageJob>();

  protected readonly hasWarnings = computed(() => {
    const warnings = this.job().warnings;
    return warnings !== undefined && warnings.length > 0;
  });

  protected readonly warningsList = computed(() =>
    this.job().warnings ?? [],
  );

  protected readonly statusLabel = computed(() => {
    const status = this.job().status;
    return status.charAt(0).toUpperCase() + status.slice(1);
  });

  protected readonly inputSize = computed(() => this.formatBytes(this.job().inputBytes));
  protected readonly outputSize = computed(() => this.formatBytes(this.job().outputBytes));

  protected readonly savings = computed(() => {
    const { inputBytes, outputBytes } = this.job();

    if (!outputBytes || inputBytes === 0) {
      return 'Pending';
    }

    const percent = Math.round((1 - outputBytes / inputBytes) * 100);
    return `${percent}%`;
  });

  protected downloadFile(): void {
    const { outputBlob, outputName } = this.job();
    if (!outputBlob) return;
    const url = URL.createObjectURL(outputBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = outputName ?? 'output';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private formatBytes(bytes?: number): string {
    if (bytes === undefined) {
      return 'Pending';
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const units = ['KB', 'MB', 'GB'];
    let size = bytes / 1024;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }

    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
  }
}
