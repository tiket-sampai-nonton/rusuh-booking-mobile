import { Easing } from "react-native-reanimated";

import { designEasing } from "@presentation/theme";

export const LOADER_EASE = Easing.bezier(...designEasing.primary);
export const LOADER_LETTER_DURATION_MS = 600;
export const LOADER_LETTER_DELAY_MS = 100;
export const LOADER_EXIT_DURATION_MS = 800;
export const LOADER_MAX_LETTERS = 10;
export const LOADER_PROGRESS_DURATION_MS = 900;
