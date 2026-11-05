import { Easing } from 'react-native-reanimated';

import { designEasing } from '@presentation/theme';

export const EASE = Easing.bezier(...designEasing.primary);
export const SLIDE_DURATION_MS = 6000;
export const FADE_DURATION_MS = 1000;
export const ZOOM_DURATION_MS = 20000;
export const SCRAMBLE_INTERVAL_MS = 30;
export const SCROLL_INDICATOR_DELAY_MS = 1500;
export const INFO_FADE_DELAY_MS = 600;
export const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const FRAME_PADDING = 24;
export const SPACE_L = 48;
export const SPACE_M = 24;
export const SPACE_S = 16;
export const SPACE_XS = 8;
export const TEXT_HERO_MIN = 48;
export const TEXT_HERO_MAX = 160;
export const TEXT_XL = 32;
export const TEXT_L = 20;
export const TEXT_M = 16;
export const TEXT_S = 14;
export const TEXT_XS = 12;
export const ICON_SIZE = 18;
