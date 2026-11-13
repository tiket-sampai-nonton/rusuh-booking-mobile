// Ask Maestro to parse every flow and its dependencies without a device.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const files = ["flows", "helpers", "scenarios"].flatMap((dir) =>
  fs
    .readdirSync(path.join(root, dir))
    .filter((file) => file.endsWith(".yaml"))
    .map((file) => `${dir}/${file}`),
);
const temporary = path.join(root, `.syntax-${process.pid}.yaml`);
try {
  fs.writeFileSync(
    temporary,
    "appId: com.tiketsampainonton.rusuhbooking\n---\n" +
      files.map((file) => `- runFlow: ${file}\n`).join(""),
  );
  const result =
    process.platform === "win32"
      ? spawnSync(
          "cmd.exe",
          [
            "/d",
            "/s",
            "/c",
            `maestro check-syntax ${path.basename(temporary)}`,
          ],
          { stdio: "inherit", cwd: root },
        )
      : spawnSync("maestro", ["check-syntax", temporary], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
  if (!process.exitCode) console.log(`Validated ${files.length} YAML files.`);
} finally {
  fs.unlinkSync(temporary);
}
