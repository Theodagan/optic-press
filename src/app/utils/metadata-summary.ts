import type { StripMetadataSummary } from '../models/strip-metadata-summary';

interface DetectedFields {
  exif: boolean;
  iccProfile: boolean;
  xmp: boolean;
  comment: boolean;
  iptc: boolean;
  jfif: boolean;
  textChunks: boolean;
  srgbChunk: boolean;
  gamaChunk: boolean;
  chromaChunk: boolean;
}

function detectJpegMetadata(buffer: ArrayBuffer): DetectedFields {
  const view = new DataView(buffer);
  const fields: DetectedFields = {
    exif: false,
    iccProfile: false,
    xmp: false,
    comment: false,
    iptc: false,
    jfif: false,
    textChunks: false,
    srgbChunk: false,
    gamaChunk: false,
    chromaChunk: false,
  };

  if (view.byteLength < 4) return fields;
  if (view.getUint8(0) !== 0xFF || view.getUint8(1) !== 0xD8) return fields;

  let offset = 2;
  const decoder = new TextDecoder('ascii');
  const maxOffset = Math.min(view.byteLength - 2, 65536);

  while (offset < maxOffset) {
    if (view.getUint8(offset) !== 0xFF) break;
    const marker = view.getUint8(offset + 1);

    if (marker === 0xE0) {
      fields.jfif = true;
      offset += 2 + view.getUint16(offset + 2);
      continue;
    }

    if (marker === 0xE1) {
      const length = view.getUint16(offset + 2);
      if (offset + 4 + 6 <= view.byteLength) {
        const headerBytes = new Uint8Array(buffer, offset + 4, Math.min(40, length - 2));
        const header = decoder.decode(headerBytes);
        if (header.startsWith('Exif\x00\x00')) {
          fields.exif = true;
        } else if (header.startsWith('http://ns.adobe.com/xap/1.0/')) {
          fields.xmp = true;
        }
      }
      offset += 2 + length;
      continue;
    }

    if (marker === 0xE2) {
      const length = view.getUint16(offset + 2);
      if (offset + 4 + 12 <= view.byteLength) {
        const headerBytes = new Uint8Array(buffer, offset + 4, 12);
        const header = decoder.decode(headerBytes);
        if (header.startsWith('ICC_PROFILE')) {
          fields.iccProfile = true;
        }
      }
      offset += 2 + length;
      continue;
    }

    if (marker === 0xED) {
      fields.iptc = true;
      offset += 2 + view.getUint16(offset + 2);
      continue;
    }

    if (marker === 0xFE) {
      fields.comment = true;
      offset += 2 + view.getUint16(offset + 2);
      continue;
    }

    if (marker === 0xDA) break;
    if (marker === 0xD9) break;

    offset += 2 + view.getUint16(offset + 2);
  }

  return fields;
}

function detectPngMetadata(buffer: ArrayBuffer): DetectedFields {
  const view = new DataView(buffer);
  const fields: DetectedFields = {
    exif: false,
    iccProfile: false,
    xmp: false,
    comment: false,
    iptc: false,
    jfif: false,
    textChunks: false,
    srgbChunk: false,
    gamaChunk: false,
    chromaChunk: false,
  };

  if (view.byteLength < 8) return fields;

  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) {
    if (view.getUint8(i) !== pngSignature[i]) return fields;
  }

  let offset = 8;
  const decoder = new TextDecoder('ascii');

  while (offset + 8 <= view.byteLength) {
    const length = view.getUint32(offset);
    const typeBytes = new Uint8Array(buffer, offset + 4, 4);
    const type = decoder.decode(typeBytes);
    offset += 8 + length + 4;

    switch (type) {
      case 'eXIf':
        fields.exif = true;
        break;
      case 'iCCP':
        fields.iccProfile = true;
        break;
      case 'tEXt':
      case 'zTXt':
      case 'iTXt':
        fields.textChunks = true;
        break;
      case 'sRGB':
        fields.srgbChunk = true;
        break;
      case 'gAMA':
        fields.gamaChunk = true;
        break;
      case 'cHRM':
        fields.chromaChunk = true;
        break;
    }

    if (type === 'IEND') break;
  }

  return fields;
}

function detectMetadata(originalBuffer: ArrayBuffer, mimeType: string): DetectedFields {
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
    return detectJpegMetadata(originalBuffer);
  }
  if (mimeType.includes('png')) {
    return detectPngMetadata(originalBuffer);
  }
  return {
    exif: false,
    iccProfile: false,
    xmp: false,
    comment: false,
    iptc: false,
    jfif: false,
    textChunks: false,
    srgbChunk: false,
    gamaChunk: false,
    chromaChunk: false,
  };
}

function labelsFor(fields: DetectedFields): readonly string[] {
  const labels: string[] = [];
  if (fields.exif) labels.push('EXIF data');
  if (fields.iccProfile) labels.push('ICC color profile');
  if (fields.xmp) labels.push('XMP metadata');
  if (fields.comment) labels.push('JPEG comment');
  if (fields.iptc) labels.push('IPTC metadata');
  if (fields.jfif) labels.push('JFIF header');
  if (fields.textChunks) labels.push('PNG text metadata');
  if (fields.srgbChunk) labels.push('sRGB chunk');
  if (fields.gamaChunk) labels.push('Gamma info');
  if (fields.chromaChunk) labels.push('Chromaticity info');
  return labels;
}

export async function analyzeMetadata(
  originalFile: File,
  outputBlob: Blob,
  settings: {
    readonly stripIccProfile: boolean;
    readonly retagSrgb: boolean;
    readonly outputFormat: string;
  },
): Promise<StripMetadataSummary> {
  const beforeBytes = originalFile.size;
  const afterBytes = outputBlob.size;

  let headerFieldsRemoved: readonly string[] = [];
  let detectionNote =
    'Metadata stripped via canvas redraw. Individual fields not available for browser-processed images.';

  if (originalFile.type && (originalFile.type.includes('jpeg') || originalFile.type.includes('png'))) {
    try {
      const buffer = originalFile.slice(0, Math.min(originalFile.size, 65536));
      const reader = new FileReader();
      const arrayBuffer = await readAsArrayBuffer(reader, buffer);
      const detected = detectMetadata(arrayBuffer, originalFile.type);
      headerFieldsRemoved = labelsFor(detected);
      detectionNote = headerFieldsRemoved.length > 0
        ? `Metadata fields detected in original file: ${headerFieldsRemoved.join(', ')}. All removed via canvas redraw.`
        : 'No standard metadata fields detected in original file headers.';
    } catch {
      detectionNote = 'Could not inspect original file headers. Metadata was stripped via canvas redraw.';
    }
  }

  return {
    beforeBytes,
    afterBytes,
    bytesSaved: beforeBytes - afterBytes,
    headerFieldsRemoved,
    exifStripped: true,
    iccStripped: settings.stripIccProfile,
    srgbRetagged: settings.retagSrgb,
    outputFormat: settings.outputFormat,
    detectionNote,
  };
}

function readAsArrayBuffer(reader: FileReader, blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file for metadata analysis'));
    reader.readAsArrayBuffer(blob);
  });
}
