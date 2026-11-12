import { useEffect, useState } from "react";
import FastImage, { type FastImageProps } from "react-native-fast-image";

import { IMAGE_FALLBACK } from "@presentation/constants/image-fallback";

type ImageSource = NonNullable<FastImageProps["source"]>;

export type CachedImageProps = Omit<
  FastImageProps,
  "defaultSource" | "source"
> & {
  readonly source: ImageSource;
  /** Optional first-party image shown when the requested remote image fails. */
  readonly fallbackSource?: ImageSource;
  /** Keep remote-image placeholders off for already-prefetched hero slides. */
  readonly showPlaceholder?: boolean;
};

interface ImageFailure {
  readonly key: string;
  readonly stage: "source" | "fallback";
}

function sourceKey(source: ImageSource): string {
  if (Array.isArray(source)) {
    return source.map((item) => sourceKey(item)).join("|");
  }
  if (typeof source === "number" || typeof source === "string") {
    return String(source);
  }
  return source.cacheKey ?? source.uri ?? JSON.stringify(source);
}

/** FastImage with a bundled placeholder and a visible fallback after load errors. */
export function CachedImage({
  source,
  fallbackSource,
  onError,
  showPlaceholder = true,
  ...props
}: CachedImageProps): React.ReactElement {
  const key = `${sourceKey(source)}|${fallbackSource ? sourceKey(fallbackSource) : ""}`;
  const [failure, setFailure] = useState<ImageFailure | null>(null);

  useEffect(() => {
    setFailure(null);
  }, [key]);

  const stage = failure?.key === key ? failure.stage : undefined;
  const isFallbackSource = stage === "source" && fallbackSource !== undefined;
  const displayedSource =
    stage === "fallback"
      ? IMAGE_FALLBACK
      : isFallbackSource
        ? fallbackSource
        : stage === "source"
          ? IMAGE_FALLBACK
          : source;

  return (
    <FastImage
      {...props}
      defaultSource={
        showPlaceholder && stage !== "fallback" ? IMAGE_FALLBACK : undefined
      }
      source={displayedSource}
      onError={(event) => {
        setFailure({ key, stage: isFallbackSource ? "fallback" : "source" });
        onError?.(event);
      }}
    />
  );
}

export default CachedImage;
