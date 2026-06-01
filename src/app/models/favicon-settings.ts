export interface FaviconSettings {
  readonly backgroundColor: string;
  readonly appName: string;
  readonly appShortName: string;
}

export const DEFAULT_FAVICON_SETTINGS: FaviconSettings = {
  backgroundColor: '#ffffff',
  appName: 'My App',
  appShortName: 'App',
};

export const FAVICON_ICO_FILENAME = 'favicon.ico';

export const FAVICON_PNG_BY_SIZE: Record<number, string> = {
  16: 'favicon-16x16.png',
  32: 'favicon-32x32.png',
  48: 'favicon-48x48.png',
};

export const APPLE_TOUCH_ICON_FILENAME = 'apple-touch-icon.png';

export const ANDROID_CHROME_BY_SIZE: Record<number, string> = {
  192: 'android-chrome-192x192.png',
  512: 'android-chrome-512x512.png',
};

export const WEBMANIFEST_FILENAME = 'site.webmanifest';

export const HEAD_SNIPPET_FILENAME = 'head-snippet.html';

export interface FaviconOutputSpec {
  readonly filename: string;
  readonly width: number;
  readonly height: number;
  readonly format: 'png' | 'ico' | 'meta';
}

export const FAVICON_OUTPUT_SPECS: readonly FaviconOutputSpec[] = [
  { filename: FAVICON_ICO_FILENAME, width: 0, height: 0, format: 'ico' },
  { filename: FAVICON_PNG_BY_SIZE[16], width: 16, height: 16, format: 'png' },
  { filename: FAVICON_PNG_BY_SIZE[32], width: 32, height: 32, format: 'png' },
  { filename: FAVICON_PNG_BY_SIZE[48], width: 48, height: 48, format: 'png' },
  { filename: APPLE_TOUCH_ICON_FILENAME, width: 180, height: 180, format: 'png' },
  { filename: ANDROID_CHROME_BY_SIZE[192], width: 192, height: 192, format: 'png' },
  { filename: ANDROID_CHROME_BY_SIZE[512], width: 512, height: 512, format: 'png' },
  { filename: WEBMANIFEST_FILENAME, width: 0, height: 0, format: 'meta' },
  { filename: HEAD_SNIPPET_FILENAME, width: 0, height: 0, format: 'meta' },
];

export const FAVICON_ICO_SIZES: readonly number[] = [16, 32, 48];

export const FAVICON_PNG_SIZES: readonly number[] = [16, 32, 48];

export const APPLE_TOUCH_ICON_SIZE = 180;

export const ANDROID_CHROME_SIZES: readonly number[] = [192, 512];

export interface FaviconManifestIcon {
  readonly src: string;
  readonly sizes: string;
  readonly type: string;
}

export interface FaviconManifest {
  readonly name: string;
  readonly short_name: string;
  readonly icons: readonly FaviconManifestIcon[];
  readonly theme_color: string;
  readonly background_color: string;
  readonly display: string;
}
