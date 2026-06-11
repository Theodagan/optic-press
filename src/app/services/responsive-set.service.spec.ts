import { TestBed } from '@angular/core/testing';
import JSZip from 'jszip';

import { ResponsiveSetService } from './responsive-set.service';
import { ZipService } from './zip.service';
import { DEFAULT_SRCSET_SETTINGS } from '../models/srcset-settings';
import type { SrcsetSettings } from '../models/srcset-settings';
import { referencedFileNames, snippetFileNameFor } from '../utils/srcset-snippet';

async function makeTestImage(width: number, height: number, name = 'Test Image.png'): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#3366cc';
  ctx.fillRect(0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });

  return new File([blob], name, { type: 'image/png' });
}

describe('ResponsiveSetService', () => {
  let service: ResponsiveSetService;
  let zipService: ZipService;

  const settings: SrcsetSettings = {
    ...DEFAULT_SRCSET_SETTINGS,
    widths: [320, 640, 2000],
    formats: ['webp', 'png'],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponsiveSetService);
    zipService = TestBed.inject(ZipService);
  });

  it('should produce one file per effective width and format with exact names', async () => {
    const file = await makeTestImage(800, 400);
    const result = await service.generateSet(file, settings);

    expect([...result.files.keys()].sort()).toEqual([
      'test-image-320w.png',
      'test-image-320w.webp',
      'test-image-640w.png',
      'test-image-640w.webp',
      'test-image-800w.png',
      'test-image-800w.webp',
    ]);
    expect(result.sourceWidth).toBe(800);
    expect(result.sourceHeight).toBe(400);
  });

  it('should keep snippet references and generated files consistent both ways', async () => {
    const file = await makeTestImage(800, 400);
    const result = await service.generateSet(file, settings);

    const referenced = [...referencedFileNames(result.snippet)].sort();
    const generated = [...result.files.keys()].sort();

    expect(referenced).toEqual(generated);
  });

  it('should emit an <img> snippet for one format and <picture> for several', async () => {
    const file = await makeTestImage(800, 400);

    const single = await service.generateSet(file, { ...settings, formats: ['webp'] });
    expect(single.snippet.startsWith('<img')).toBeTrue();

    const multi = await service.generateSet(file, settings);
    expect(multi.snippet.startsWith('<picture>')).toBeTrue();
  });

  it('should reject an empty format selection', async () => {
    const file = await makeTestImage(100, 100);

    await expectAsync(service.generateSet(file, { ...settings, formats: [] })).toBeRejectedWithError(
      'Select at least one output format.',
    );
  });

  it('should package an images-only ZIP with exactly the generated variants', async () => {
    const file = await makeTestImage(500, 250);
    const result = await service.generateSet(file, { ...settings, formats: ['webp'] });

    const zipBlob = await zipService.buildZipFromFiles(result.files);
    const zip = await JSZip.loadAsync(zipBlob);

    expect(Object.keys(zip.files).sort()).toEqual([
      'test-image-320w.webp',
      'test-image-500w.webp',
    ]);
  });

  it('should package an images-plus-snippet ZIP when the snippet file is added', async () => {
    const file = await makeTestImage(500, 250);
    const result = await service.generateSet(file, { ...settings, formats: ['webp'] });

    const files = new Map(result.files);
    files.set(snippetFileNameFor('html'), new Blob([result.snippet], { type: 'text/html' }));

    const zipBlob = await zipService.buildZipFromFiles(files);
    const zip = await JSZip.loadAsync(zipBlob);

    expect(Object.keys(zip.files).sort()).toEqual([
      'snippet.html',
      'test-image-320w.webp',
      'test-image-500w.webp',
    ]);

    const snippetText = await zip.files['snippet.html'].async('string');
    expect(snippetText).toBe(result.snippet);
  });
});
