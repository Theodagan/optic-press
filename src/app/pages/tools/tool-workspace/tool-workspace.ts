import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AutoOptimizeControls } from '../../../components/auto-optimize-controls/auto-optimize-controls';
import { CompressControls } from '../../../components/compress-controls/compress-controls';
import { ConvertControls } from '../../../components/convert-controls/convert-controls';
import { CropControls } from '../../../components/crop-controls/crop-controls';
import { FaviconControls } from '../../../components/favicon-controls/favicon-controls';
import { StripMetadataControls } from '../../../components/strip-metadata-controls/strip-metadata-controls';
import { DownloadBar } from '../../../components/download-bar/download-bar';
import { ImageCard } from '../../../components/image-card/image-card';
import { OutputOptions } from '../../../components/output-options/output-options';
import { ResizeControls } from '../../../components/resize-controls/resize-controls';
import { ResponsiveSrcsetControls } from '../../../components/responsive-srcset-controls/responsive-srcset-controls';
import { UploadZone } from '../../../components/upload-zone/upload-zone';
import type { AutoOptimizeSettings } from '../../../models/auto-optimize';
import { DEFAULT_AUTO_OPTIMIZE_SETTINGS, computeTargetBytes } from '../../../models/auto-optimize';
import type { CompressSettings } from '../../../models/compress-settings';
import { DEFAULT_COMPRESS_SETTINGS } from '../../../models/compress-settings';
import type { ConvertSettings } from '../../../models/convert-settings';
import { DEFAULT_CONVERT_SETTINGS } from '../../../models/convert-settings';
import type { CropSettings } from '../../../models/crop-settings';
import { DEFAULT_CROP_SETTINGS } from '../../../models/crop-settings';
import type { FaviconSettings } from '../../../models/favicon-settings';
import { DEFAULT_FAVICON_SETTINGS } from '../../../models/favicon-settings';
import { ImageJob } from '../../../models/image-job';
import type { ImageProcessingSettings } from '../../../models/processing-settings';
import { DEFAULT_SETTINGS } from '../../../models/processing-settings';
import type { ResizeSettings } from '../../../models/resize-settings';
import { DEFAULT_RESIZE_SETTINGS } from '../../../models/resize-settings';
import type { ResponsiveSetResult, SrcsetSettings } from '../../../models/srcset-settings';
import { DEFAULT_SRCSET_SETTINGS } from '../../../models/srcset-settings';
import { ToolDefinition } from '../../../models/tool';
import type { StripMetadataSettings } from '../../../models/strip-metadata-settings';
import { DEFAULT_STRIP_METADATA_SETTINGS } from '../../../models/strip-metadata-settings';
import { AutoOptimizeService } from '../../../services/auto-optimize.service';
import { FaviconService } from '../../../services/favicon.service';
import { ImageProcessorService, ImageSource } from '../../../services/image-processor.service';
import { ResponsiveSetService } from '../../../services/responsive-set.service';
import { ZipService } from '../../../services/zip.service';
import { isAvifSupported } from '../../../utils/avif-detect';
import { analyzeContent } from '../../../utils/content-detect';
import { outputFileNameFor } from '../../../utils/format-mapping';
import { analyzeMetadata } from '../../../utils/metadata-summary';
import { computeResizeTarget } from '../../../utils/resize-dimensions';
import { snippetFileNameFor } from '../../../utils/srcset-snippet';

@Component({
  selector: 'app-tool-workspace',
  imports: [
    AutoOptimizeControls,
    CompressControls,
    ConvertControls,
    CropControls,
    FaviconControls,
    StripMetadataControls,
    DownloadBar,
    ImageCard,
    OutputOptions,
    ResizeControls,
    ResponsiveSrcsetControls,
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
  private readonly faviconService = inject(FaviconService);
  private readonly responsiveSetService = inject(ResponsiveSetService);

  protected readonly tool = computed(() => this.route.snapshot.data['tool'] as ToolDefinition);
  protected readonly jobs = signal<readonly ImageJob[]>([]);
  protected readonly convertSettings = signal<ConvertSettings>(DEFAULT_CONVERT_SETTINGS);
  protected readonly resizeSettings = signal<ResizeSettings>(DEFAULT_RESIZE_SETTINGS);
  protected readonly compressSettings = signal<CompressSettings>(DEFAULT_COMPRESS_SETTINGS);
  protected readonly autoOptimizeSettings = signal<AutoOptimizeSettings>(DEFAULT_AUTO_OPTIMIZE_SETTINGS);
  protected readonly faviconSettings = signal<FaviconSettings>(DEFAULT_FAVICON_SETTINGS);
  protected readonly stripMetadataSettings = signal<StripMetadataSettings>(DEFAULT_STRIP_METADATA_SETTINGS);
  protected readonly cropSettings = signal<CropSettings>(DEFAULT_CROP_SETTINGS);
  protected readonly srcsetSettings = signal<SrcsetSettings>(DEFAULT_SRCSET_SETTINGS);
  protected readonly srcsetResults = signal<ReadonlyMap<string, ResponsiveSetResult>>(new Map());
  protected readonly copiedSnippetJobId = signal<string | null>(null);
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
            : slug === 'crop'
              ? (file: File) => outputFileNameFor(file.name, this.cropSettings().outputFormat)
              : slug === 'auto-optimize'
                ? (file: File) => {
                    const dotIndex = file.name.lastIndexOf('.');
                    const baseName = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
                    const extension = dotIndex > 0 ? file.name.slice(dotIndex) : '';
                    return `${baseName}-optimized${extension}`;
                  }
                : slug === 'favicon'
                  ? (file: File) => {
                      const dotIndex = file.name.lastIndexOf('.');
                      const baseName = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
                      return `${baseName}-favicon.zip`;
                    }
                  : slug === 'responsive-srcset'
                    ? (file: File) => {
                        const dotIndex = file.name.lastIndexOf('.');
                        const baseName = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
                        return `${baseName}-srcset.zip`;
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

  protected onFaviconSettingsChange(settings: FaviconSettings): void {
    this.faviconSettings.set(settings);
  }

  protected onStripMetadataSettingsChange(settings: StripMetadataSettings): void {
    this.stripMetadataSettings.set(settings);
  }

  protected onCropSettingsChange(settings: CropSettings): void {
    this.cropSettings.set(settings);
  }

  protected onSrcsetSettingsChange(settings: SrcsetSettings): void {
    this.srcsetSettings.set(settings);
  }

  protected readonly srcsetSnippets = computed(() => {
    if (this.tool().slug !== 'responsive-srcset') return [];
    const results = this.srcsetResults();
    return this.jobs()
      .filter((job) => job.status === 'done' && results.has(job.id))
      .map((job) => ({
        jobId: job.id,
        fileName: job.inputFile.name,
        snippet: results.get(job.id)!.snippet,
      }));
  });

  protected readonly cropPreviewFile = computed(() => {
    if (this.tool().slug !== 'crop') return null;
    const jobList = this.jobs();
    if (jobList.length === 0) return null;
    return jobList[0].inputFile;
  });

  protected async processJobs(): Promise<void> {
    if (this.isProcessing()) return;
    this.isProcessing.set(true);

    try {
      for (const job of this.jobs()) {
        if (job.status !== 'queued') continue;

        this.updateJobStatus(job.id, 'processing');

        try {
          if (this.tool().slug === 'favicon') {
            await this.processFaviconJob(job);
          } else if (this.tool().slug === 'responsive-srcset') {
            await this.processResponsiveSetJob(job);
          } else if (this.tool().slug === 'auto-optimize') {
            await this.processAutoOptimizeJob(job);
          } else if (this.tool().slug === 'strip-metadata') {
            await this.processStripMetadataJob(job);
          } else if (this.tool().slug === 'crop') {
            await this.processCropJob(job);
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

  private async processFaviconJob(job: ImageJob): Promise<void> {
    const fileMap = await this.faviconService.generatePackage(
      job.inputFile,
      this.faviconSettings(),
    );

    const zipBlob = await this.zipService.buildZipFromFiles(fileMap);

    this.jobs.update((currentJobs) =>
      currentJobs.map((j) =>
        j.id === job.id
          ? {
              ...j,
              status: 'done' as const,
              outputBlob: zipBlob,
              outputBytes: zipBlob.size,
            }
          : j,
      ),
    );
  }

  private async processResponsiveSetJob(job: ImageJob): Promise<void> {
    const result = await this.responsiveSetService.generateSet(
      job.inputFile,
      this.srcsetSettings(),
    );

    const zipBlob = await this.zipService.buildZipFromFiles(result.files);

    this.srcsetResults.update((results) => new Map(results).set(job.id, result));

    this.jobs.update((currentJobs) =>
      currentJobs.map((j) =>
        j.id === job.id
          ? {
              ...j,
              status: 'done' as const,
              outputBlob: zipBlob,
              outputBytes: zipBlob.size,
              width: result.sourceWidth,
              height: result.sourceHeight,
            }
          : j,
      ),
    );
  }

  protected async copySnippet(jobId: string): Promise<void> {
    const result = this.srcsetResults().get(jobId);
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.snippet);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = result.snippet;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    this.copiedSnippetJobId.set(jobId);
    setTimeout(() => {
      if (this.copiedSnippetJobId() === jobId) {
        this.copiedSnippetJobId.set(null);
      }
    }, 2000);
  }

  private async processStripMetadataJob(job: ImageJob): Promise<void> {
    const sms = this.stripMetadataSettings();
    const output = await this.processor.processStripMetadata(job.inputFile, sms);

    const summary = await analyzeMetadata(job.inputFile, output.blob, {
      stripIccProfile: sms.stripIccProfile,
      retagSrgb: sms.retagSrgb,
      outputFormat: sms.outputFormat,
    });

    const warnings: string[] = [];
    if (summary.bytesSaved > 0) {
      warnings.push(`Saved ${this.formatBytesForJob(summary.bytesSaved)} (${this.percentSaved(summary.beforeBytes, summary.afterBytes)} reduction).`);
    }
    if (summary.headerFieldsRemoved.length > 0) {
      warnings.push(`Removed: ${summary.headerFieldsRemoved.join(', ')}.`);
    }
    warnings.push(summary.detectionNote);

    this.jobs.update((currentJobs) =>
      currentJobs.map((j) =>
        j.id === job.id
          ? {
              ...j,
              status: 'done' as const,
              outputBlob: output.blob,
              outputBytes: output.bytes,
              outputName: output.filename,
              width: output.width,
              height: output.height,
              warnings,
            }
          : j,
      ),
    );
  }

  private async processCropJob(job: ImageJob): Promise<void> {
    const blob = await this.processor.processCrop(job.inputFile, this.cropSettings());
    const cs = this.cropSettings();

    this.jobs.update((currentJobs) =>
      currentJobs.map((j) =>
        j.id === job.id
          ? {
              ...j,
              status: 'done' as const,
              outputBlob: blob,
              outputBytes: blob.size,
              outputName: outputFileNameFor(job.inputFile.name, cs.outputFormat),
              width: cs.rect.width > 0 ? cs.rect.width : undefined,
              height: cs.rect.height > 0 ? cs.rect.height : undefined,
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
    if (this.tool().slug === 'responsive-srcset') {
      const job = this.jobs().find(
        (j): j is ImageJob & { outputBlob: Blob; outputName: string } =>
          j.status === 'done' && !!j.outputBlob && !!j.outputName && this.srcsetResults().has(j.id),
      );
      if (!job) return;

      const settings = this.srcsetSettings();
      if (!settings.includeSnippetInZip) {
        this.downloadBlob(job.outputBlob, job.outputName);
        return;
      }

      const result = this.srcsetResults().get(job.id)!;
      const mimeType = settings.snippetFileType === 'html' ? 'text/html' : 'text/plain';
      const files = new Map(result.files);
      files.set(
        snippetFileNameFor(settings.snippetFileType),
        new Blob([result.snippet], { type: mimeType }),
      );

      const zipBlob = await this.zipService.buildZipFromFiles(files);
      this.downloadBlob(zipBlob, job.outputName);
      return;
    }

    if (this.tool().slug === 'favicon') {
      const completed = this.jobs().filter(
        (job): job is ImageJob & { outputBlob: Blob; outputName: string } =>
          job.status === 'done' && !!job.outputBlob && !!job.outputName,
      );
      if (completed.length === 0) return;
      this.downloadBlob(completed[0].outputBlob, completed[0].outputName);
      return;
    }

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

  private formatBytesForJob(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    let size = bytes / 1024;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
  }

  private percentSaved(before: number, after: number): string {
    if (before === 0) return '0%';
    return `${Math.round((1 - after / before) * 100)}%`;
  }

  private outputNameFor(fileName: string): string {
    const dotIndex = fileName.lastIndexOf('.');
    const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
    const extension = dotIndex > 0 ? fileName.slice(dotIndex) : '';
    return `${baseName}-${this.tool().slug}${extension}`;
  }
}
