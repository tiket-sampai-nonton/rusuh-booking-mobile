import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { SCRAMBLE_CHARS, SCRAMBLE_INTERVAL_MS } from '../constants';

export function useTextScramble(text: string): string {
  const [displayText, setDisplayText] = useState(text);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const originalText = text;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) return originalText[index];
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3; // Prototype: iteration += 1/3
    }, SCRAMBLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [text, reducedMotion]);

  return displayText;
}
