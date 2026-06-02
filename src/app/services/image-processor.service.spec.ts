import { TestBed } from '@angular/core/testing';
import { DEFAULT_SETTINGS } from '../models/processing-settings';
import { ImageProcessorService } from './image-processor.service';

describe('ImageProcessorService', () => {
  let service: ImageProcessorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageProcessorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should report worker support availability', () => {
    expect(typeof service.isWorkerSupported).toBe('boolean');
  });

  it('should process main thread without settings dimensions', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      pending('Canvas 2d context not available');
      return;
    }
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 1, 1);
    const validPng = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject()), 'image/png');
    });
    const file = new File([validPng], 'test.png', { type: 'image/png' });

    const result = await service.processMainThread(file, DEFAULT_SETTINGS);
    expect(result).toBeInstanceOf(Blob);
  });
});
