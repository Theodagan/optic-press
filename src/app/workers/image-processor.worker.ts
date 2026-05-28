/// <reference lib="webworker" />

export interface WorkerRequest {
  readonly imageData: ArrayBuffer;
  readonly width?: number;
  readonly height?: number;
  readonly format: string;
  readonly quality: number;
}

export interface WorkerResponse {
  readonly blob: ArrayBuffer;
  readonly type: string;
}

addEventListener('message', ({ data }: MessageEvent<WorkerRequest>) => {
  handleRequest(data).then(
    (result) => postMessage(result),
    (error) => postMessage({ error: (error as Error).message }),
  );
});

async function handleRequest(request: WorkerRequest): Promise<WorkerResponse> {
  const blob = new Blob([request.imageData]);
  const imageBitmap = await createImageBitmap(blob);

  const width = request.width ?? imageBitmap.width;
  const height = request.height ?? imageBitmap.height;

  const outputBlob = await processImage(imageBitmap, width, height, request.format, request.quality);
  const buffer = await outputBlob.arrayBuffer();

  imageBitmap.close();

  return { blob: buffer, type: outputBlob.type };
}

async function processImage(
  source: ImageBitmap,
  width: number,
  height: number,
  format: string,
  quality: number,
): Promise<Blob> {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get OffscreenCanvas 2d context in worker');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);

  return canvas.convertToBlob({ type: format, quality });
}
