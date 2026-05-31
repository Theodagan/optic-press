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
    const blob = new Blob([''], { type: 'image/png' });
    const file = new File([blob], 'test.png', { type: 'image/png' });

    const result = await service.processMainThread(file, DEFAULT_SETTINGS);
    expect(result).toBeInstanceOf(Blob);
  });
});
