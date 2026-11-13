import { useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  CachedImage,
  type CachedImageProps,
} from "@presentation/components/CachedImage";

export type LazyCachedImageProps = CachedImageProps & {
  /** Defer browser downloads until the image approaches the visible viewport. */
  readonly deferUntilVisible?: boolean;
};

/** Cached image that can defer below-the-fold web media without affecting native. */
export function LazyCachedImage({
  deferUntilVisible = false,
  style,
  ...imageProps
}: LazyCachedImageProps): React.ReactElement {
  const targetRef = useRef<View>(null);
  const [isVisible, setIsVisible] = useState(
    !deferUntilVisible || Platform.OS !== "web",
  );

  useEffect(() => {
    if (!deferUntilVisible || Platform.OS !== "web") {
      setIsVisible(true);
      return;
    }

    const target = targetRef.current as unknown as Element | null;
    if (!target || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [deferUntilVisible]);

  if (!deferUntilVisible || Platform.OS !== "web") {
    return <CachedImage {...imageProps} style={style} />;
  }

  return (
    <View
      ref={targetRef}
      style={[
        style as unknown as StyleProp<ViewStyle>,
        { position: "relative" },
      ]}
    >
      {isVisible ? (
        <CachedImage
          {...imageProps}
          style={[StyleSheet.absoluteFillObject, style]}
        />
      ) : null}
    </View>
  );
}

export default LazyCachedImage;
