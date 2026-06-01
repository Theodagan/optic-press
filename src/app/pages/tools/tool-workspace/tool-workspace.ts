import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AutoOptimizeControls } from '../../../components/auto-optimize-controls/auto-optimize-controls';
import { CompressControls } from '../../../components/compress-controls/compress-controls';
import { ConvertControls } from '../../../components/convert-controls/convert-controls';
import { DownloadBar } from '../../../components/download-bar/download-bar';
import { ImageCard } from '../../../components/image-card/image-card';
import { OutputOptions } from '../../../components/output-options/output-options';
import { ResizeControls } from '../../../components/resize-controls/resize-controls';
import { UploadZone } from '../../../components/upload-zone/upload-zone';
import type { AutoOptimizeSettings } from '../../../models/auto-optimize';
import { DEFAULT_AUTO_OPTIMIZE_SETTINGS, computeTargetBytes } from '../../../models/auto-optimize';
import type { CompressSettings } from '../../../models/compress-settings';
import { DEFAULT_COMPRESS_SETTINGS } from '../../../models/compress-settings';
import type { ConvertSettings } from '../../../models/convert-settings';
import { DEFAULT_CONVERT_SETTINGS } from '../../../models/convert-settings';
import { ImageJob } from '../../../models/image-job';
import type { ImageProcessingSettings } from '../../../models/processing-settings';
import { DEFAULT_SETTINGS } from '../../../models/processing-settings';
import type { ResizeSettings } from '../../../models/resize-settings';
import { DEFAULT_RESIZE_SETTINGS } from '../../../models/resize-settings';
import { ToolDefinition } from '../../../models/tool';
import { AutoOptimizeService } from '../../../services/auto-optimize.service';
import { ImageProcessorService, ImageSource } from '../../../services/image-processor.service';
import { ZipService } from '../../../services/zip.service';
import { isAvifSupported } from '../../../utils/avif-detect';
import { analyzeContent } from '../../../utils/content-detect';
import { outputFileNameFor } from '../../../utils/format-mapping';
import { computeResizeTarget } from '../../../utils/resize-dimensions';

@Component({
  selector: 'app-tool-workspace',
  imports: [
    AutoOptimizeControls,
    CompressControls,
    ConvertControls,
    DownloadBar,
    ImageCard,
    OutputOptions,
    ResizeControls,
    RouterLink,
    UploadZone,
  ],
  templateUrl: './tool-workspace.html',
  styleUrl: './tool-workspace.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolWorkspace {
  private readonly route = inject(ActivatedRoute);
  private readonly processor = inject(ImageProcessorService);
  private readonly zipService = inject(ZipService);
  private readonly autoOptimize = inject(AutoOptimizeService);

  protected readonly tool = computed(() => this.route.snapshot.data['tool'] as ToolDefinition);
  protected readonly jobs = signal<readonly ImageJob[]>([]);
  protected readonly convertSettings = signal<ConvertSettings>(DEFAULT_CONVERT_SETTINGS);
  protected readonly resizeSettings = signal<ResizeSettings>(DEFAULT_RESIZE_SETTINGS);
  protected readonly compressSettings = signal<CompressSettings>(DEFAULT_COMPRESS_SETTINGS);
  protected readonly autoOptimizeSettings = signal<AutoOptimizeSettings>(DEFAULT_AUTO_OPTIMIZE_SETTINGS);
  protected readonly isProcessing = signal(false);

  protected readonly hasQueuedJobs = computed(() =>
    this.jobs().some((job) => job.status === 'queued'),
  );

  protected addFiles(files: readonly File[]): void {
    const slug = this.tool().slug;
    const nameFor =
      slug === 'convert'
        ? (file: File) => outputFileNameFor(file.name, this.convertSettings().outputFormat)
        : slug === 'resize'
          ? (file: File) => outputFileNameFor(file.name, this.resizeSettings().outputFormat)
          : slug === 'compress'
            ? (file: File) => outputFileNameFor(file.name, this.compressSettings().format)
            : slug === 'auto-optimize'
              ? (file: File) => {
                  const dotIndex = file.name.lastIndexOf('.');
                  const baseName = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
                  const extension = dotIndex > 0 ? file.name.slice(dotIndex) : '';
                  return `${baseName}-optimized${extension}`;
                }
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

  protected onResizeSettingsChange(settings: ResizeSettings): void {
    this.resizeSettings.set(settings);
  }

  protected onCompressSettingsChange(settings: CompressSettings): void {
    this.compressSettings.set(settings);
  }

  protected onAutoOptimizeSettingsChange(settings: AutoOptimizeSettings): void {
    this.autoOptimizeSettings.set(settings);
  }

  protected async processJobs(): Promise<void> {
    if (this.isProcessing()) return;
    this.isProcessing.set(true);

    try {
      for (const job of this.jobs()) {
        if (job.status !== 'queued') continue;

        this.updateJobStatus(job.id, 'processing');

        try {
          if (this.tool().slug === 'auto-optimize') {
            await this.processAutoOptimizeJob(job);
          } else {
            const settings = await this.resolveProcessingSettings(job.inputFile);
            const blob = await this.processor.processInWorker(job.inputFile, settings);
            this.updateJobResult(job.id, blob);
          }
        } catch (error) {
          this.updateJobError(job.id, (error as Error).message);
        }
      }
    } finally {
      this.isProcessing.set(false);
    }
  }

  private async processAutoOptimizeJob(job: ImageJob): Promise<void> {
    const aos = this.autoOptimizeSettings();
    const avifSupported = await isAvifSupported();
    const source = await this.processor.loadImage(job.inputFile);
    const sourceWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const sourceHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;

    const analysis = await analyzeContent(source, this.processor);
    const hasAlpha = await this.hasImageAlpha(source);

    const format = this.autoOptimize.selectFormat(
      analysis.isPhoto,
      hasAlpha,
      job.inputBytes,
      avifSupported,
      aos.formatLock,
    );

    const resize = this.autoOptimize.computeMaxDimensionOverride(
      sourceWidth,
      sourceHeight,
      aos,
    );

    const canvas = await this.processor.drawToCanvas(source, resize.targetDimensions);
    if (source instanceof ImageBitmap) source.close();

    const targetBytes = computeTargetBytes(job.inputBytes, aos.targetProfile);

    const qualityResult = await this.autoOptimize.binarySearchQuality(
      async (quality: number) => {
        const blob = await this.processor.encode(canvas, {
          format,
          quality,
          stripMetadata: true,
        });
        return blob.size;
      },
      targetBytes,
    );

    const finalBlob = await this.processor.encode(canvas, {
      format,
      quality: qualityResult.quality,
      stripMetadata: true,
    });

    const finalized = this.autoOptimize.finalizeOutput(job.inputBytes, finalBlob.size);

    const outputName = finalized.isAlreadyOptimal
      ? job.inputFile.name
      : outputFileNameFor(job.inputFile.name, format);

    this.jobs.update((currentJobs) =>
      currentJobs.map((j) =>
        j.id === job.id
          ? {
              ...j,
              status: 'done' as const,
              outputBlob: finalized.isAlreadyOptimal ? job.inputFile : finalBlob,
              outputBytes: finalized.outputBytes,
              outputName,
              warnings: finalized.isAlreadyOptimal ? ['Already optimal'] : undefined,
            }
          : j,
      ),
    );
  }

  private async hasImageAlpha(source: ImageSource): Promise<boolean> {
    const canvas = await this.processor.drawToCanvas(source, { width: 1, height: 1 });
    const ctx = (canvas instanceof OffscreenCanvas
      ? canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | null
      : (canvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D | null);
    if (!ctx) return false;
    const imageData = ctx.getImageData(0, 0, 1, 1);
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 255) return true;
    }
    return false;
  }

  private async resolveProcessingSettings(file: File): Promise<ImageProcessingSettings> {
    if (this.tool().slug === 'convert') {
      const cs = this.convertSettings();
      return {
        format: cs.outputFormat,
        quality: cs.qualityByFormat[cs.outputFormat],
      };
    }
    if (this.tool().slug === 'resize') {
      const rs = this.resizeSettings();
      const source = await this.processor.loadImage(file);
      const sourceWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
      const sourceHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
      const target = computeResizeTarget(sourceWidth, sourceHeight, rs);
      if (source instanceof ImageBitmap) source.close();
      return {
        format: rs.outputFormat,
        quality: rs.quality,
        width: target.output.width,
        height: target.output.height,
      };
    }
    if (this.tool().slug === 'compress') {
      const cs = this.compressSettings();
      return {
        format: cs.format,
        quality: cs.quality,
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
