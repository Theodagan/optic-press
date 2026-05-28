import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ConvertControls } from '../../../components/convert-controls/convert-controls';
import { DownloadBar } from '../../../components/download-bar/download-bar';
import { ImageCard } from '../../../components/image-card/image-card';
import { OutputOptions } from '../../../components/output-options/output-options';
import { UploadZone } from '../../../components/upload-zone/upload-zone';
import type { ConvertSettings } from '../../../models/convert-settings';
import { DEFAULT_CONVERT_SETTINGS } from '../../../models/convert-settings';
import { ImageJob } from '../../../models/image-job';
import type { ImageProcessingSettings } from '../../../models/processing-settings';
import { DEFAULT_SETTINGS } from '../../../models/processing-settings';
import { ToolDefinition } from '../../../models/tool';
import { ImageProcessorService } from '../../../services/image-processor.service';
import { ZipService } from '../../../services/zip.service';
import { outputFileNameFor } from '../../../utils/format-mapping';

@Component({
  selector: 'app-tool-workspace',
  imports: [ConvertControls, DownloadBar, ImageCard, OutputOptions, RouterLink, UploadZone],
  templateUrl: './tool-workspace.html',
  styleUrl: './tool-workspace.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolWorkspace {
  private readonly route = inject(ActivatedRoute);
  private readonly processor = inject(ImageProcessorService);
  private readonly zipService = inject(ZipService);

  protected readonly tool = computed(() => this.route.snapshot.data['tool'] as ToolDefinition);
  protected readonly jobs = signal<readonly ImageJob[]>([]);
  protected readonly convertSettings = signal<ConvertSettings>(DEFAULT_CONVERT_SETTINGS);
  protected readonly isProcessing = signal(false);

  protected readonly hasQueuedJobs = computed(() =>
    this.jobs().some((job) => job.status === 'queued'),
  );

  protected addFiles(files: readonly File[]): void {
    const nameFor = this.tool().slug === 'convert'
      ? (file: File) => outputFileNameFor(file.name, this.convertSettings().outputFormat)
      : (file: File) => this.outputNameFor(file.name);

    const queuedJobs = files.map((file) => ({
      id: crypto.randomUUID(),
      inputFile: file,
      status: 'queued' as const,
      settings: DEFAULT_SETTINGS,
      inputBytes: file.size,
      outputName: nameFor(file),
    }));

    this.jobs.update((currentJobs) => [...queuedJobs, ...currentJobs]);
  }

  protected onConvertSettingsChange(settings: ConvertSettings): void {
    this.convertSettings.set(settings);
  }

  protected async processJobs(): Promise<void> {
    if (this.isProcessing()) return;
    this.isProcessing.set(true);

    try {
      for (const job of this.jobs()) {
        if (job.status !== 'queued') continue;

        this.updateJobStatus(job.id, 'processing');

        try {
          const settings = this.processingSettings();
          const blob = await this.processor.processInWorker(job.inputFile, settings);
          this.updateJobResult(job.id, blob);
        } catch (error) {
          this.updateJobError(job.id, (error as Error).message);
        }
      }
    } finally {
      this.isProcessing.set(false);
    }
  }

  private processingSettings(): ImageProcessingSettings {
    if (this.tool().slug === 'convert') {
      const cs = this.convertSettings();
      return {
        format: cs.outputFormat,
        quality: cs.qualityByFormat[cs.outputFormat],
      };
    }
    return DEFAULT_SETTINGS;
  }

  private updateJobStatus(id: string, status: ImageJob['status']): void {
    this.jobs.update((currentJobs) =>
      currentJobs.map((job) => (job.id === id ? { ...job, status } : job)),
    );
  }

  private updateJobResult(id: string, blob: Blob): void {
    this.jobs.update((currentJobs) =>
      currentJobs.map((job) =>
        job.id === id
          ? { ...job, status: 'done' as const, outputBlob: blob, outputBytes: blob.size }
          : job,
      ),
    );
  }

  private updateJobError(id: string, error: string): void {
    this.jobs.update((currentJobs) =>
      currentJobs.map((job) =>
        job.id === id ? { ...job, status: 'error' as const, error } : job,
      ),
    );
  }

  protected async requestZip(): Promise<void> {
    const completed = this.jobs().filter(
      (job): job is ImageJob & { outputBlob: Blob; outputName: string } =>
        job.status === 'done' && !!job.outputBlob && !!job.outputName,
    );

    if (completed.length === 0) return;

    const fileMap = new Map(
      completed.map((job) => [job.outputName, job.outputBlob] as const),
    );

    const zipBlob = await this.zipService.buildZipFromFiles(fileMap);
    this.downloadBlob(zipBlob, `${this.tool().slug}-export.zip`);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private outputNameFor(fileName: string): string {
    const dotIndex = fileName.lastIndexOf('.');
    const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
    const extension = dotIndex > 0 ? fileName.slice(dotIndex) : '';
    return `${baseName}-${this.tool().slug}${extension}`;
  }
}
