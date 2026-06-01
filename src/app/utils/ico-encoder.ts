const ICO_HEADER_SIZE = 6;
const ICO_DIR_ENTRY_SIZE = 16;

interface IcoEntry {
  readonly width: number;
  readonly height: number;
  readonly pngBlob: Blob;
}

function writeIcoHeader(imageCount: number): Uint8Array {
  const header = new Uint8Array(ICO_HEADER_SIZE);
  const view = new DataView(header.buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, imageCount, true);

  return header;
}

function writeDirEntry(entry: IcoEntry, offset: number): Uint8Array {
  const dir = new Uint8Array(ICO_DIR_ENTRY_SIZE);
  const view = new DataView(dir.buffer);

  view.setUint8(0, entry.width >= 256 ? 0 : entry.width);
  view.setUint8(1, entry.height >= 256 ? 0 : entry.height);
  view.setUint8(2, 0);
  view.setUint8(3, 0);
  view.setUint16(4, 1, true);
  view.setUint16(6, 32, true);
  view.setUint32(8, entry.pngBlob.size, true);
  view.setUint32(12, offset, true);

  return dir;
}

export async function encodeIco(entries: readonly IcoEntry[]): Promise<Blob> {
  const sorted = [...entries].sort((a, b) => b.width - a.width);

  const header = writeIcoHeader(sorted.length);

  const dataOffset = ICO_HEADER_SIZE + sorted.length * ICO_DIR_ENTRY_SIZE;
  const dirEntries = sorted.map((entry, i) => {
    let offset = dataOffset;
    for (let j = 0; j < i; j++) {
      offset += sorted[j].pngBlob.size;
    }
    return writeDirEntry(entry, offset);
  });

  const headerAndDirs = new Uint8Array(dataOffset);
  headerAndDirs.set(header, 0);
  sorted.forEach((_, i) =>
    headerAndDirs.set(dirEntries[i], ICO_HEADER_SIZE + i * ICO_DIR_ENTRY_SIZE),
  );

  const parts: BlobPart[] = [headerAndDirs.buffer as ArrayBuffer];
  for (const entry of sorted) {
    parts.push(entry.pngBlob);
  }

  return new Blob(parts, { type: 'image/x-icon' });
}

export async function buildIcoBlob(
  pngBySize: ReadonlyMap<number, Blob>,
): Promise<Blob> {
  const entries: IcoEntry[] = [];
  for (const [size, blob] of pngBySize) {
    entries.push({ width: size, height: size, pngBlob: blob });
  }
  return encodeIco(entries);
}
