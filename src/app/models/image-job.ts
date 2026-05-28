export type ImageJobStatus = 'queued' | 'processing' | 'done' | 'error';

export interface ImageJob {
  readonly id: string;
  readonly inputFile: File;
  readonly status: ImageJobStatus;
  readonly outputBlob?: Blob;
  readonly outputName?: string;
  readonly inputBytes: number;
  readonly outputBytes?: number;
  readonly width?: number;
  readonly height?: number;
  readonly warnings?: readonly string[];
  readonly error?: string;
}
