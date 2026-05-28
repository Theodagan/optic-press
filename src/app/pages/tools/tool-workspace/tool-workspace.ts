import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { DownloadBar } from '../../../components/download-bar/download-bar';
import { ImageCard } from '../../../components/image-card/image-card';
import { OutputOptions } from '../../../components/output-options/output-options';
import { UploadZone } from '../../../components/upload-zone/upload-zone';
import { ImageJob } from '../../../models/image-job';
import { ToolDefinition } from '../../../models/tool';

@Component({
  selector: 'app-tool-workspace',
  imports: [DownloadBar, ImageCard, OutputOptions, RouterLink, UploadZone],
  templateUrl: './tool-workspace.html',
  styleUrl: './tool-workspace.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolWorkspace {
  private readonly route = inject(ActivatedRoute);

  protected readonly tool = computed(() => this.route.snapshot.data['tool'] as ToolDefinition);
  protected readonly jobs = signal<readonly ImageJob[]>([]);

  protected addFiles(files: readonly File[]): void {
    const queuedJobs = files.map((file) => ({
      id: crypto.randomUUID(),
      inputFile: file,
      status: 'queued' as const,
      inputBytes: file.size,
      outputName: this.outputNameFor(file.name),
    }));

    this.jobs.update((currentJobs) => [...queuedJobs, ...currentJobs]);
  }

  protected requestZip(): void {
    console.info(`ZIP export requested for ${this.tool().name}`);
  }

  private outputNameFor(fileName: string): string {
    const dotIndex = fileName.lastIndexOf('.');
    const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
    const extension = dotIndex > 0 ? fileName.slice(dotIndex) : '';
    return `${baseName}-${this.tool().slug}${extension}`;
  }
}
