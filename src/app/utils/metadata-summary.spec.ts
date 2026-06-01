import { analyzeMetadata } from './metadata-summary';

function toBytes(arr: number[]): Uint8Array<ArrayBuffer> {
  return new Uint8Array(arr);
}

function pngFile(bytes: number[]): File {
  const uint8 = toBytes(bytes);
  const blob = new Blob([uint8], { type: 'image/png' });
  return new File([blob], 'test.png', { type: 'image/png' });
}

function jpegFile(bytes: number[]): File {
  const uint8 = toBytes(bytes);
  const blob = new Blob([uint8], { type: 'image/jpeg' });
  return new File([blob], 'test.jpg', { type: 'image/jpeg' });
}

function outputBlob(size: number): Blob {
  return new Blob([new ArrayBuffer(size)], { type: 'image/webp' });
}

function minimalPng(): number[] {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  const ihdr = buildChunk('IHDR', new Array(13).fill(0));
  const iend = buildChunk('IEND', []);
  return [...signature, ...ihdr, ...iend];
}

function minimalJpeg(): number[] {
  const soi = [0xFF, 0xD8];
  const sos = [0xFF, 0xDA, 0, 8, 0];
  const eoi = [0xFF, 0xD9];
  return [...soi, ...sos, ...eoi];
}

function buildChunk(type: string, data: number[]): number[] {
  const encoder = new TextEncoder();
  const typeBytes = encoder.encode(type);
  const length = data.length;
  const result = new Uint8Array(8 + length + 4);
  const view = new DataView(result.buffer);
  view.setUint32(0, length);
  result.set(typeBytes, 4);
  result.set(data, 8);
  return Array.from(result);
}

function concatBytes(...arrays: number[][]): number[] {
  return arrays.flat();
}

describe('analyzeMetadata', () => {
  it('should report size savings', async () => {
    const file = pngFile(minimalPng());
    const blob = outputBlob(50);
    const summary = await analyzeMetadata(file, blob, {
      stripIccProfile: true,
      retagSrgb: true,
      outputFormat: 'webp',
    });

    expect(summary.beforeBytes).toBe(file.size);
    expect(summary.afterBytes).toBe(50);
    expect(summary.bytesSaved).toBe(file.size - 50);
  });

  it('should mark exifStripped as true', async () => {
    const file = pngFile(minimalPng());
    const blob = outputBlob(50);
    const summary = await analyzeMetadata(file, blob, {
      stripIccProfile: true,
      retagSrgb: true,
      outputFormat: 'webp',
    });

    expect(summary.exifStripped).toBe(true);
  });

  it('should report iccStripped from settings', async () => {
    const file = pngFile(minimalPng());
    const blob = outputBlob(50);

    const summaryTrue = await analyzeMetadata(file, blob, {
      stripIccProfile: true,
      retagSrgb: true,
      outputFormat: 'webp',
    });
    expect(summaryTrue.iccStripped).toBe(true);

    const summaryFalse = await analyzeMetadata(file, blob, {
      stripIccProfile: false,
      retagSrgb: true,
      outputFormat: 'webp',
    });
    expect(summaryFalse.iccStripped).toBe(false);
  });

  it('should report srgbRetagged from settings', async () => {
    const file = pngFile(minimalPng());
    const blob = outputBlob(50);

    const summaryTrue = await analyzeMetadata(file, blob, {
      stripIccProfile: true,
      retagSrgb: true,
      outputFormat: 'webp',
    });
    expect(summaryTrue.srgbRetagged).toBe(true);

    const summaryFalse = await analyzeMetadata(file, blob, {
      stripIccProfile: true,
      retagSrgb: false,
      outputFormat: 'webp',
    });
    expect(summaryFalse.srgbRetagged).toBe(false);
  });

  it('should include detection note', async () => {
    const file = pngFile(minimalPng());
    const blob = outputBlob(50);
    const summary = await analyzeMetadata(file, blob, {
      stripIccProfile: true,
      retagSrgb: true,
      outputFormat: 'webp',
    });

    expect(summary.detectionNote).toBeTruthy();
    expect(typeof summary.detectionNote).toBe('string');
  });

  it('should report headerFieldsRemoved', async () => {
    const file = pngFile(minimalPng());
    const blob = outputBlob(50);
    const summary = await analyzeMetadata(file, blob, {
      stripIccProfile: true,
      retagSrgb: true,
      outputFormat: 'webp',
    });

    expect(Array.isArray(summary.headerFieldsRemoved)).toBe(true);
  });

  it('should accept non-image mime type with fallback note', async () => {
    const blob = new Blob([new Uint8Array(100)], { type: 'application/octet-stream' });
    const file = new File([blob], 'test.bin', { type: 'application/octet-stream' });
    const output = outputBlob(50);

    const summary = await analyzeMetadata(file, output, {
      stripIccProfile: true,
      retagSrgb: true,
      outputFormat: 'png',
    });

    expect(summary.headerFieldsRemoved).toEqual([]);
    expect(summary.detectionNote).toContain('canvas redraw');
  });

  it('should report outputFormat from settings', async () => {
    const file = pngFile(minimalPng());
    const blob = outputBlob(50);

    const summary = await analyzeMetadata(file, blob, {
      stripIccProfile: true,
      retagSrgb: true,
      outputFormat: 'jpeg',
    });

    expect(summary.outputFormat).toBe('jpeg');
  });
});

describe('metadata-summary creation', () => {
  it('should handle empty headers gracefully in PNG', async () => {
    const file = pngFile(minimalPng());
    const blob = outputBlob(5);
    const summary = await analyzeMetadata(file, blob, {
      stripIccProfile: true,
      retagSrgb: true,
      outputFormat: 'same',
    });

    expect(summary.beforeBytes).toBeGreaterThan(0);
    expect(summary.afterBytes).toBe(5);
    expect(summary.outputFormat).toBe('same');
  });

  it('should handle empty headers gracefully in JPEG', async () => {
    const file = jpegFile(minimalJpeg());
    const blob = outputBlob(5);
    const summary = await analyzeMetadata(file, blob, {
      stripIccProfile: true,
      retagSrgb: true,
      outputFormat: 'same',
    });

    expect(summary.beforeBytes).toBeGreaterThan(0);
    expect(summary.afterBytes).toBe(5);
  });
});
