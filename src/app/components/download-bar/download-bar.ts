import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ImageJob } from '../../models/image-job';

@Component({
  selector: 'app-download-bar',
  imports: [],
  templateUrl: './download-bar.html',
  styleUrl: './download-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadBar {
  readonly jobs = input<readonly ImageJob[]>([]);
  readonly zipRequested = output<void>();

  protected readonly completedJobs = computed(() =>
    this.jobs().filter((job) => job.status === 'done' && job.outputBlob),
  );

  protected readonly outputSize = computed(() =>
    this.formatBytes(
      this.completedJobs().reduce((total, job) => total + (job.outputBytes ?? job.outputBlob?.size ?? 0), 0),
    ),
  );

  protected readonly savings = computed(() => {
    const inputBytes = this.completedJobs().reduce((total, job) => total + job.inputBytes, 0);
    const outputBytes = this.completedJobs().reduce(
      (total, job) => total + (job.outputBytes ?? job.outputBlob?.size ?? 0),
      0,
    );

    if (inputBytes === 0 || outputBytes === 0) {
      return 'Pending';
    }

    return `${Math.round((1 - outputBytes / inputBytes) * 100)}%`;
  });

  protected requestZip(): void {
    if (this.completedJobs().length === 0) {
      return;
    }

    this.zipRequested.emit();
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }

    return `${size.toFixed(unitIndex === 0 || size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
  }
}
