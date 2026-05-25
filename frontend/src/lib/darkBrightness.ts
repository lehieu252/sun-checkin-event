const BASE_BRIGHTNESS = 0.3;
const BRIGHTNESS_STEP = 0.01;
const CHECKINS_PER_STEP = 2;

/** Dark screen starts at 30% brightness; +1% every 2 check-ins (max 200%). */
export function getDarkScreenBrightness(checkinCount: number): number {
  const steps = Math.floor(checkinCount / CHECKINS_PER_STEP);
  return Math.min(BASE_BRIGHTNESS + steps * BRIGHTNESS_STEP, 2);
}

/** Light screen sun starts at 30% opacity; +1% every 2 check-ins (max 100%). */
export function getLightScreenSunOpacity(checkinCount: number): number {
  const steps = Math.floor(checkinCount / CHECKINS_PER_STEP);
  return Math.min(BASE_BRIGHTNESS + steps * BRIGHTNESS_STEP, 1);
}
