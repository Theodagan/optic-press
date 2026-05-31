let cached: boolean | undefined;

export async function isAvifSupported(): Promise<boolean> {
  if (cached !== undefined) {
    return cached;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      cached = false;
      return false;
    }
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 1, 1);

    cached = await new Promise<boolean>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob?.type === 'image/avif'),
        'image/avif',
      );
    });
  } catch {
    cached = false;
  }

  return cached;
}
