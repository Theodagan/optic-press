const UNITS: readonly string[] = ['B', 'KB', 'MB', 'GB'];

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) {
    return '0 B';
  }

  const factor = 1024;
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(factor)),
    UNITS.length - 1,
  );
  const value = bytes / (factor ** unitIndex);

  return `${value.toFixed(unitIndex === 0 ? 0 : decimals)} ${UNITS[unitIndex]}`;
}

export function savingsPercent(inputBytes: number, outputBytes: number): number {
  if (inputBytes <= 0 || outputBytes < 0) {
    return 0;
  }

  const saved = inputBytes - outputBytes;
  if (saved <= 0) {
    return 0;
  }

  return Math.round((saved / inputBytes) * 100);
}

export function savingsDescription(inputBytes: number, outputBytes: number): string {
  const percent = savingsPercent(inputBytes, outputBytes);
  const saved = inputBytes - outputBytes;

  if (percent <= 0) {
    return 'No savings';
  }

  return `${percent}% smaller (${formatBytes(saved)} saved)`;
}
