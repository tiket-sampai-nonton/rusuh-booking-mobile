import { Children, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

import { Reveal } from "../Reveal";

export interface RevealStaggerProps {
  readonly children: ReactNode;
  readonly step?: number;
  readonly baseDelay?: number;
  readonly testID?: string;
}

export function RevealStagger({
  children,
  step = 80,
  baseDelay = 0,
  testID,
}: RevealStaggerProps) {
  const items = Children.toArray(children);
  return (
    <>
      {items.map((child, index) => {
        const key = isValidElement(child) ? ((child as ReactElement).key ?? index) : index;
        return (
          <Reveal
            key={key}
            delay={baseDelay + index * step}
            testID={testID ? `${testID}-${index}` : undefined}
          >
            {isValidElement(child) ? cloneElement(child as ReactElement) : child}
          </Reveal>
        );
      })}
    </>
  );
}
