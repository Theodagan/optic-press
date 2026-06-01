export interface StripMetadataSummary {
  readonly beforeBytes: number;
  readonly afterBytes: number;
  readonly bytesSaved: number;
  readonly headerFieldsRemoved: readonly string[];
  readonly exifStripped: boolean;
  readonly iccStripped: boolean;
  readonly srgbRetagged: boolean;
  readonly outputFormat: string;
  readonly detectionNote: string;
}

export function createDefaultSummary(
  beforeBytes: number,
  afterBytes: number,
  outputFormat: string,
): StripMetadataSummary {
  return {
    beforeBytes,
    afterBytes,
    bytesSaved: beforeBytes - afterBytes,
    headerFieldsRemoved: [],
    exifStripped: true,
    iccStripped: false,
    srgbRetagged: false,
    outputFormat,
    detectionNote: 'Metadata stripped via canvas redraw. Individual fields not available for browser-processed images.',
  };
}
