export function isMobileExportDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

export function canShareExportFile(blob: Blob, fileName: string): boolean {
  if (typeof navigator === 'undefined' || !navigator.canShare) return false;

  const file = new File([blob], fileName, { type: blob.type || 'image/png' });
  return navigator.canShare({ files: [file] });
}

export function downloadExportImage(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function shareExportImage(
  blob: Blob,
  fileName: string,
): Promise<void> {
  const file = new File([blob], fileName, { type: blob.type || 'image/png' });
  await navigator.share({ files: [file] });
}

export async function saveCheckinExportImage(
  blob: Blob,
  fileName: string,
): Promise<void> {
  if (isMobileExportDevice() && canShareExportFile(blob, fileName)) {
    try {
      await shareExportImage(blob, fileName);
      return;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw err;
      downloadExportImage(blob, fileName);
      return;
    }
  }

  downloadExportImage(blob, fileName);
}
