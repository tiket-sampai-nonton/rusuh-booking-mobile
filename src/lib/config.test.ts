import { loadConfig } from "./config";

it("default ke host emulator Android dan membuang slash akhir", () => {
  expect(loadConfig({}).webBaseUrl).toBe("http://10.0.2.2:3000");
  expect(loadConfig({ EXPO_PUBLIC_WEB_BASE_URL: "https://staging.example/" }).webBaseUrl).toBe("https://staging.example");
});
