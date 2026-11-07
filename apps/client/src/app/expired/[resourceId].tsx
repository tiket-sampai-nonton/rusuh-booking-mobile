import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import { Seo } from "@presentation/components/Seo";

/** Keep old links working while new failure links use `/failed`. */
export default function LegacyExpiredRoute() {
  const params = useLocalSearchParams();
  const resourceId =
    typeof params.resourceId === "string" ? params.resourceId : "";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "resourceId") continue;
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (typeof value === "string" && value.length > 0) query.set(key, value);
  }
  const queryString = query.toString();
  const suffix = queryString ? `?${queryString}` : "";
  return (
    <>
      <Seo
        title="Pemesanan gagal"
        description="Pemesanan tidak berhasil diselesaikan."
        path={`/expired/${encodeURIComponent(resourceId)}`}
        noindex
      />
      <Redirect
        href={`/failed/${encodeURIComponent(resourceId)}${suffix}` as Href}
      />
    </>
  );
}
