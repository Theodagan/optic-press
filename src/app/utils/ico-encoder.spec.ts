import { buildIcoBlob, encodeIco } from './ico-encoder';

function createPngBlob(size: number, content: number[]): Blob {
  return new Blob([new Uint8Array(content)], { type: 'image/png' });
}

describe('encodeIco', () => {
  it('should produce a Blob with image/x-icon MIME type', async () => {
    const png16 = createPngBlob(16, [0x89, 0x50, 0x4e, 0x47]);
    const blob = await buildIcoBlob(new Map([[16, png16]]));
    expect(blob.type).toBe('image/x-icon');
  });

  it('should produce a non-empty Blob', async () => {
    const png16 = createPngBlob(16, [0x89, 0x50, 0x4e, 0x47]);
    const blob = await buildIcoBlob(new Map([[16, png16]]));
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should write correct ICO header for single image', async () => {
    const png16 = createPngBlob(16, Array(64).fill(0x00));
    const blob = await buildIcoBlob(new Map([[16, png16]]));
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);

    expect(view.getUint16(0, true)).toBe(0);
    expect(view.getUint16(2, true)).toBe(1);
    expect(view.getUint16(4, true)).toBe(1);
  });

  it('should write correct ICO header for multiple images', async () => {
    const png16 = createPngBlob(16, Array(32).fill(0x00));
    const png32 = createPngBlob(32, Array(48).fill(0x00));
    const png48 = createPngBlob(48, Array(64).fill(0x00));

    const blob = await buildIcoBlob(new Map([[16, png16], [32, png32], [48, png48]]));
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);

    expect(view.getUint16(0, true)).toBe(0);
    expect(view.getUint16(2, true)).toBe(1);
    expect(view.getUint16(4, true)).toBe(3);
  });

  it('should write correct directory entries for 16x16', async () => {
    const png16 = createPngBlob(16, Array(100).fill(0xaa));
    const blob = await buildIcoBlob(new Map([[16, png16]]));
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);

    expect(view.getUint8(6)).toBe(16);
    expect(view.getUint8(7)).toBe(16);
    expect(view.getUint8(8)).toBe(0);
    expect(view.getUint8(9)).toBe(0);
    expect(view.getUint16(10, true)).toBe(1);
    expect(view.getUint16(12, true)).toBe(32);
    expect(view.getUint32(14, true)).toBe(png16.size);
    expect(view.getUint32(18, true)).toBe(22);
  });

  it('should sort entries by size descending', async () => {
    const png16 = createPngBlob(16, Array(20).fill(0x00));
    const png48 = createPngBlob(48, Array(30).fill(0x00));

    const blob = await buildIcoBlob(new Map([[16, png16], [48, png48]]));
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);

    expect(view.getUint8(6)).toBe(48);
    expect(view.getUint8(7)).toBe(48);
    expect(view.getUint8(22)).toBe(16);
    expect(view.getUint8(23)).toBe(16);
  });

  it('should include image data at correct offsets', async () => {
    const png16 = createPngBlob(16, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
    const png32 = createPngBlob(32, [0xff, 0xd8, 0xff, 0xe0]);

    const blob = await buildIcoBlob(new Map([[16, png16], [32, png32]]));
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);

    const entriesOffset = 6;
    const entry1Offset = view.getUint32(entriesOffset + 12, true);
    const entry2Offset = view.getUint32(entriesOffset + 16 + 12, true);

    expect(entry1Offset).toBe(6 + 2 * 16);
    expect(entry2Offset).toBe(6 + 2 * 16 + png16.size);

    const img1Data = new Uint8Array(buffer, entry1Offset, 6);
    expect([...img1Data]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);

    const img2Data = new Uint8Array(buffer, entry2Offset, 4);
    expect([...img2Data]).toEqual([0xff, 0xd8, 0xff, 0xe0]);
  });

  it('should handle 256px size width/height as 0', async () => {
    const png256 = createPngBlob(256, Array(100).fill(0x00));
    const blob = await buildIcoBlob(new Map([[256, png256]]));
    const buffer = await blob.arrayBuffer();
    const view = new DataView(buffer);

    expect(view.getUint8(6)).toBe(0);
    expect(view.getUint8(7)).toBe(0);
  });
});

describe('buildIcoBlob', () => {
  it('should accept a Map of size to PNG Blob', async () => {
    const png16 = createPngBlob(16, Array(20).fill(0x00));
    const blob = await buildIcoBlob(new Map([[16, png16]]));
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/x-icon');
  });
});
