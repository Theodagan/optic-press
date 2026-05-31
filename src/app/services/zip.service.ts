import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import type { ProcessingOutput } from '../models/processing-output';

@Injectable({ providedIn: 'root' })
export class ZipService {
  async buildZip(outputs: readonly ProcessingOutput[]): Promise<Blob> {
    const zip = new JSZip();

    for (const output of outputs) {
      zip.file(output.filename, output.blob);
    }

    return zip.generateAsync({ type: 'blob' });
  }

  async buildZipFromFiles(files: ReadonlyMap<string, Blob>): Promise<Blob> {
    const zip = new JSZip();

    for (const [name, blob] of files) {
      zip.file(name, blob);
    }

    return zip.generateAsync({ type: 'blob' });
  }
}
