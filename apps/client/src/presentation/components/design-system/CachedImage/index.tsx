import { useEffect, useState } from "react";
import FastImage, { type FastImageProps } from "react-native-fast-image";

import { IMAGE_FALLBACK } from "@presentation/constants/image-fallback";

type ImageSource = NonNullable<FastImageProps["source"]>;

export type CachedImageProps = Omit<
  FastImageProps,
  "defaultSource" | "source"
> & {
  readonly source: ImageSource;
  /** Keep remote-image placeholders off for already-prefetched hero slides. */
  readonly showPlaceholder?: boolean;
};

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
  onError,
  showPlaceholder = true,
  ...props
}: CachedImageProps): React.ReactElement {
  const key = sourceKey(source);
  const [failedSource, setFailedSource] = useState<string | null>(null);

  useEffect(() => {
    setFailedSource(null);
  }, [key]);

  const failed = failedSource === key;

  return (
    <FastImage
      {...props}
      defaultSource={showPlaceholder ? IMAGE_FALLBACK : undefined}
      source={failed ? IMAGE_FALLBACK : source}
      onError={(event) => {
        setFailedSource(key);
        onError?.(event);
      }}
    />
  );
}

export default CachedImage;
