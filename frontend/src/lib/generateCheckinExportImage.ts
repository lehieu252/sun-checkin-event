import type { Locale } from '@/lib/i18n/types';

const EXPORT_WIDTH = 1080;
const EXPORT_HEIGHT = 1919;
const PHOTO_WIDTH = 528;
const PHOTO_HEIGHT = 940;
const PHOTO_LEFT = 0;
const PHOTO_TOP = 567;
const NAME_FONT_SIZE = 42;
const NAME_MARGIN_LEFT = 606;
const NAME_MARGIN_RIGHT = 32;
/** Vertical center of the name slot — text block grows evenly for 1 or 2 lines. */
const NAME_CENTER_Y = 888;
const NAME_LINE_HEIGHT = 1.35;

const TEMPLATE_VI_URL = '/template_vi.png';
const TEMPLATE_EN_URL = '/template_vi.png';
const OVERLAY_URL = '/template_2.png';
const FONT_SEMIBOLD_URL = '/fonts/SVN-Gilroy-SemiBold.otf';

let fontsReady: Promise<void> | null = null;

function getTemplateUrl(locale: Locale): string {
  return locale === 'en' ? TEMPLATE_EN_URL : TEMPLATE_VI_URL;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function loadPhotoFromFile(file: File | Blob): Promise<ImageBitmap> {
  return createImageBitmap(file, { imageOrientation: 'from-image' });
}

function getSourceSize(source: CanvasImageSource): { width: number; height: number } {
  if (source instanceof HTMLImageElement) {
    return {
      width: source.naturalWidth,
      height: source.naturalHeight,
    };
  }

  const bitmap = source as ImageBitmap;
  return { width: bitmap.width, height: bitmap.height };
}

async function ensureFontsLoaded(): Promise<void> {
  if (fontsReady) return fontsReady;

  fontsReady = (async () => {
    const semibold = await new FontFace('GilroyExport', `url(${FONT_SEMIBOLD_URL})`, {
      weight: '600',
    }).load();
    document.fonts.add(semibold);
    await document.fonts.ready;
  })();

  return fontsReady;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }

    let current = words[0];
    for (let i = 1; i < words.length; i += 1) {
      const next = `${current} ${words[i]}`;
      if (ctx.measureText(next).width <= maxWidth) {
        current = next;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
  }

  return lines;
}

function drawCoverPhoto(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const { width: imgWidth, height: imgHeight } = getSourceSize(img);
  if (!imgWidth || !imgHeight) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  const scale = Math.max(width / imgWidth, height / imgHeight);
  const drawWidth = imgWidth * scale;
  const drawHeight = imgHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

export interface GenerateCheckinExportImageOptions {
  photo: File | Blob;
  name: string;
  locale: Locale;
}

export async function generateCheckinExportImage({
  photo,
  name,
  locale,
}: GenerateCheckinExportImageOptions): Promise<Blob> {
  await ensureFontsLoaded();

  const [background, overlay, userPhoto] = await Promise.all([
    loadImage(getTemplateUrl(locale)),
    loadImage(OVERLAY_URL),
    loadPhotoFromFile(photo),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is not supported');
  }

  ctx.drawImage(background, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
  drawCoverPhoto(ctx, userPhoto, PHOTO_LEFT, PHOTO_TOP, PHOTO_WIDTH, PHOTO_HEIGHT);
  userPhoto.close?.();
  ctx.drawImage(overlay, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  const nameMaxWidth = EXPORT_WIDTH - NAME_MARGIN_LEFT - NAME_MARGIN_RIGHT;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `600 ${NAME_FONT_SIZE}px GilroyExport, sans-serif`;

  const nameLines = wrapText(ctx, name.trim(), nameMaxWidth);
  const lineHeight = NAME_FONT_SIZE * NAME_LINE_HEIGHT;
  const blockHeight = nameLines.length * lineHeight;
  let nameY = NAME_CENTER_Y - blockHeight / 2;

  for (const line of nameLines) {
    ctx.fillText(line, NAME_MARGIN_LEFT, nameY);
    nameY += lineHeight;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to export image'));
      },
      'image/png',
      1,
    );
  });
}
