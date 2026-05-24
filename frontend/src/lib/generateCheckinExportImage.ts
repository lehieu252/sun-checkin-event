import { translate } from '@/lib/i18n/translations';
import type { Locale } from '@/lib/i18n/types';

const EXPORT_WIDTH = 1440;
const EXPORT_HEIGHT = 1920;
const PHOTO_SIZE = 717;
const PHOTO_TOP = 366;
const TEXT_MARGIN_TOP = 328;
const TEXT_FONT_SIZE = 38;
const TEXT_MARGIN_X = 318;
const TEXT_LINE_HEIGHT = 1.45;

const TEMPLATE_URL = '/export_image_template.png';
const FONT_MEDIUM_URL = '/fonts/SVN-Gilroy-Medium.otf';

let fontsReady: Promise<void> | null = null;

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
    const face = await new FontFace(
      'GilroyExport',
      `url(${FONT_MEDIUM_URL})`,
      { weight: '500' },
    ).load();
    document.fonts.add(face);
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

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  let cursorY = y;

  for (const line of lines) {
    ctx.fillText(line, x + maxWidth / 2, cursorY);
    cursorY += lineHeight;
  }

  return cursorY;
}

function drawCirclePhoto(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  size: number,
): void {
  const { width: imgWidth, height: imgHeight } = getSourceSize(img);
  if (!imgWidth || !imgHeight) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const scale = Math.max(size / imgWidth, size / imgHeight);
  const drawWidth = imgWidth * scale;
  const drawHeight = imgHeight * scale;
  const drawX = x + (size - drawWidth) / 2;
  const drawY = y + (size - drawHeight) / 2;

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

  const [template, userPhoto] = await Promise.all([
    loadImage(TEMPLATE_URL),
    loadPhotoFromFile(photo),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is not supported');
  }

  ctx.drawImage(template, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

  const photoX = (EXPORT_WIDTH - PHOTO_SIZE) / 2;
  drawCirclePhoto(ctx, userPhoto, photoX, PHOTO_TOP, PHOTO_SIZE);
  userPhoto.close?.();

  const textMaxWidth = EXPORT_WIDTH - TEXT_MARGIN_X * 2;
  const photoBottom = PHOTO_TOP + PHOTO_SIZE;
  const body = translate(locale, 'display.thankYouBody', { name });

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `500 ${TEXT_FONT_SIZE}px GilroyExport, sans-serif`;

  const bodyLines = wrapText(ctx, body, textMaxWidth);
  drawWrappedText(
    ctx,
    bodyLines,
    TEXT_MARGIN_X,
    photoBottom + TEXT_MARGIN_TOP,
    textMaxWidth,
    TEXT_FONT_SIZE * TEXT_LINE_HEIGHT,
  );

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
