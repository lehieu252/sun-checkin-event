const BASE_BRIGHTNESS = 0.3;
const BRIGHTNESS_STEP = 0.01;
const CHECKINS_PER_STEP = 2;

/** Dark screen starts at 50% brightness; +1% every 3 check-ins (max 100%). */
export function getDarkScreenBrightness(checkinCount: number): number {
  const steps = Math.floor(checkinCount / CHECKINS_PER_STEP);
  return Math.min(BASE_BRIGHTNESS + steps * BRIGHTNESS_STEP, 2);
}
