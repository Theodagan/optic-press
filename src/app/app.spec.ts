import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { App } from './app';
import { UploadZone } from './components/upload-zone/upload-zone';
import { TOOLS } from './models/tool';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render a router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});

describe('App shell routes', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should render the homepage route with every PRD tool', async () => {
    const harness = await RouterTestingHarness.create('/');
    const text = harness.routeNativeElement?.textContent ?? '';

    expect(text).toContain('OPTICPRESS');
    for (const tool of TOOLS) {
      expect(text).toContain(tool.name);
    }
  });

  for (const tool of TOOLS) {
    it(`should render the ${tool.name} workspace route`, async () => {
      const harness = await RouterTestingHarness.create(`/${tool.slug}`);
      const text = harness.routeNativeElement?.textContent ?? '';

      expect(text).toContain(tool.name);
      expect(text).toContain('Back to tools');
      expect(text).toContain('Output options');
    });
  }
});

describe('UploadZone', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadZone],
    }).compileComponents();
  });

  it('should render file picker, drop, and paste guidance', () => {
    const fixture = TestBed.createComponent(UploadZone);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('input[type="file"]')).toBeTruthy();
    expect(compiled.textContent).toContain('Drop image files here');
    expect(compiled.textContent).toContain('paste from the clipboard');
  });
});
