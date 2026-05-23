export async function requestDisplayFullscreen(
  element?: HTMLElement | null,
): Promise<boolean> {
  const target = element ?? document.documentElement;

  try {
    if (target.requestFullscreen) {
      await target.requestFullscreen();
      return true;
    }
    const legacy = target as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    if (legacy.webkitRequestFullscreen) {
      await legacy.webkitRequestFullscreen();
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function isFullscreenActive(): boolean {
  return Boolean(
    document.fullscreenElement ||
      (document as Document & { webkitFullscreenElement?: Element })
        .webkitFullscreenElement,
  );
}

export async function exitDisplayFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }
  const legacy = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
  };
  await legacy.webkitExitFullscreen?.();
}

export async function toggleDisplayFullscreen(
  element?: HTMLElement | null,
): Promise<void> {
  if (isFullscreenActive()) {
    await exitDisplayFullscreen();
    return;
  }
  await requestDisplayFullscreen(element);
}
