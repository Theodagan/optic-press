import { TestBed } from '@angular/core/testing';
import type { ProcessingOutput } from '../models/processing-output';
import { ZipService } from './zip.service';

describe('ZipService', () => {
  let service: ZipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZipService);
  });

  describe('buildZip', () => {
    it('should return a Blob', async () => {
      const result = await service.buildZip([]);
      expect(result).toBeInstanceOf(Blob);
    });

    it('should return a ZIP with correct MIME type', async () => {
      const result = await service.buildZip([]);
      expect(result.type).toBe('application/zip');
    });

    it('should include multiple files in the ZIP', async () => {
      const outputs: readonly ProcessingOutput[] = [
        {
          blob: new Blob(['content1'], { type: 'image/png' }),
          filename: 'file1.png',
          mimeType: 'image/png',
          bytes: 8,
          width: 100,
          height: 100,
        },
        {
          blob: new Blob(['content2'], { type: 'image/jpeg' }),
          filename: 'file2.jpg',
          mimeType: 'image/jpeg',
          bytes: 8,
          width: 200,
          height: 200,
        },
      ];

      const zipBlob = await service.buildZip(outputs);
      expect(zipBlob).toBeInstanceOf(Blob);
      expect(zipBlob.size).toBeGreaterThan(0);
    });

    it('should produce distinct ZIPs for distinct inputs', async () => {
      const zip1 = await service.buildZip([{
        blob: new Blob(['a'], { type: 'image/png' }),
        filename: 'a.png',
        mimeType: 'image/png',
        bytes: 1,
        width: 10,
        height: 10,
      }]);

      const zip2 = await service.buildZip([{
        blob: new Blob(['b'], { type: 'image/png' }),
        filename: 'b.png',
        mimeType: 'image/png',
        bytes: 1,
        width: 10,
        height: 10,
      }]);

      expect(zip1.size).not.toBe(zip2.size);
    });
  });

  describe('buildZipFromFiles', () => {
    it('should return a Blob', async () => {
      const result = await service.buildZipFromFiles(new Map());
      expect(result).toBeInstanceOf(Blob);
    });

    it('should return a ZIP with correct MIME type', async () => {
      const result = await service.buildZipFromFiles(new Map());
      expect(result.type).toBe('application/zip');
    });

    it('should include multiple files from a Map', async () => {
      const files = new Map<string, Blob>([
        ['a.webp', new Blob(['hello'], { type: 'image/webp' })],
        ['b.png', new Blob(['world'], { type: 'image/png' })],
      ]);

      const zipBlob = await service.buildZipFromFiles(files);
      expect(zipBlob).toBeInstanceOf(Blob);
      expect(zipBlob.size).toBeGreaterThan(0);
    });
  });
});
