// URL dari env build (EXPO_PUBLIC_*). Aturan bisnis datang dari server, bukan dari sini.
export type MobileConfig = { apiBaseUrl: string; webBaseUrl: string };

export function loadConfig(env: Record<string, string | undefined> = process.env): MobileConfig {
  const apiBaseUrl = (env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:8080/api/v1").replace(/\/$/, "");
  const webBaseUrl = (env.EXPO_PUBLIC_WEB_BASE_URL ?? "http://10.0.2.2:3000").replace(/\/$/, "");
  return { apiBaseUrl, webBaseUrl };
}
