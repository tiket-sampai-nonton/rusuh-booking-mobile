// Local STDIO client for the installed Maestro MCP server. No dependencies.
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const tool = process.argv[2] || "list_devices";
const argument = process.argv[3] || "{}";
const args = JSON.parse(
  argument === "-" ? fs.readFileSync(0, "utf8") : argument,
);
const child =
  process.platform === "win32"
    ? spawn("cmd.exe", ["/d", "/s", "/c", "maestro mcp --no-viewer"])
    : spawn("maestro", ["mcp", "--no-viewer"]);
let buffer = "",
  nextId = 0;
const pending = new Map();
child.stderr.pipe(process.stderr);
child.stdout.on("data", (data) => {
  buffer += data;
  let end;
  while ((end = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, end);
    buffer = buffer.slice(end + 1);
    try {
      const response = JSON.parse(line);
      const resolve = pending.get(response.id);
      if (resolve) {
        pending.delete(response.id);
        resolve(response);
      }
    } catch {
      /* Ignore startup diagnostics outside JSON-RPC. */
    }
  }
});
function call(method, params) {
  return new Promise((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    child.stdin.write(
      JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n",
    );
  });
}
const timeout = setTimeout(() => {
  child.kill();
  process.exit(1);
}, 7200000);
child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
child.on("exit", () => {
  if (pending.size) process.exit(1);
});
(async () => {
  await call("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "rusuh-maestro", version: "1" },
  });
  child.stdin.write(
    JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) +
      "\n",
  );
  const result = await call("tools/call", { name: tool, arguments: args });
  console.log(JSON.stringify(result, null, 2));
  if (tool === "run" && result.result?.isError && args.device_id) {
    const screen = await call("tools/call", {
      name: "inspect_screen",
      arguments: { device_id: args.device_id },
    });
    for (const block of screen.result?.content ?? []) {
      if (!block.text) continue;
      try {
        const tree = JSON.parse(block.text);
        const visible = [];
        function visit(node) {
          if (node.rid || node.txt || node.a11y)
            visible.push({
              id: node.rid,
              text: node.txt,
              label: node.a11y,
              checked: node.checked,
            });
          for (const child of node.c ?? []) visit(child);
        }
        for (const node of tree.elements ?? []) visit(node);
        console.log(JSON.stringify({ failureScreen: visible }, null, 2));
      } catch {
        console.log(block.text);
      }
    }
  }
  clearTimeout(timeout);
  child.kill();
  process.exit(result.error || result.result?.isError ? 1 : 0);
})();
