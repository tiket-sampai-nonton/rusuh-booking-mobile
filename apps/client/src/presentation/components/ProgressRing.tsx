/**
 * ProgressRing — the waiting-room position ring (prototype waiting.html).
 *
 * An SVG ring with an ember→red gradient stroke; `progress` (0..1) sweeps the
 * arc. The big position number + "Posisimu" label sit in the center (passed as
 * children). Pure presentation; reduced-motion is irrelevant (static arc).
 */
import React from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { brand } from "@presentation/theme";

export interface ProgressRingProps {
  /** 0..1 — fraction of the ring filled (1 = admitted/front). */
  readonly progress: number;
  readonly size?: number;
  readonly children?: React.ReactNode;
}

export function ProgressRing({ progress, size = 200, children }: ProgressRingProps) {
  const r = 90;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const dash = circumference * clamped;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute" }}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={brand.ember} />
            <Stop offset="1" stopColor={brand.red} />
          </LinearGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={9} fill="none" />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={{ alignItems: "center" }}>{children}</View>
    </View>
  );
}
