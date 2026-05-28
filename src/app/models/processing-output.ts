export interface ProcessingOutput {
  readonly blob: Blob;
  readonly filename: string;
  readonly mimeType: string;
  readonly bytes: number;
  readonly width: number;
  readonly height: number;
}
