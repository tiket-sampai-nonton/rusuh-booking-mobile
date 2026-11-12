# Native Maestro suite

Run from the repository root on branch maestro/dev. The app ID for both platforms is com.tiketsampainonton.rusuhbooking. Use an installed development/preview build with EXPO_PUBLIC_USE_MOCKS=true; Expo Go is not supported. No npm dependency is added. Tests are local/manual, never a cloud CI gate.

## Run with Maestro MCP

The installed Maestro CLI exposes its own STDIO MCP server. Configure your client with command maestro and arguments ["mcp", "--no-viewer"], working directory set to this repository. The dependency-free client below also talks to that server:

```powershell
node .maestro/tools/mcp.cjs list_devices
'{"device_id":"emulator-5554"}' | node .maestro/tools/mcp.cjs inspect_screen -
'{"device_id":"emulator-5554","dir":".maestro","exclude_tags":["slow","native-share"]}' | node .maestro/tools/mcp.cjs run -
```

Use the device ID returned by list_devices. Run device operations sequentially: multiple Maestro servers controlling one device can interrupt each other. MCP cheat_sheet documents syntax; inspect_screen supplies selectors. The helper client uses JSON arguments and exits nonzero on MCP errors.

Run `node .maestro/tools/check-syntax.cjs` to parse all flows and helpers without a device.

## CLI alternative

```powershell
maestro test --exclude-tags slow,native-share .maestro
maestro test .maestro/flows/10-guest-payment-success.yaml
maestro test --include-tags slow .maestro
```

Helpers are excluded from suite discovery by config.yaml. Each top-level flow clears app state/keychain and grants notification permission. Use synthetic identities only. Payment methods and simulator outcomes are exercised through UI, followed by backend-port status verification and issued ticket assertions.

For a debug build, start Metro from apps/client with EXPO_PUBLIC_USE_MOCKS=true, then run adb reverse tcp:8081 tcp:8081. The development app must connect to Metro before the flow can reach Home. Preview builds should embed the mock bundle. No artifacts are uploaded.

## Coverage

| Flows      | Coverage                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| 01-02      | Home, browse, history, event detail, filter apply/reset                                              |
| 03-04      | Invalid email, OTP, registration consent, profile edit, logout                                       |
| 05-06      | Anonymous queue, automatic claim/checkout, leave confirmation                                        |
| 07-09      | Required checkout fields, leave/stay, ticket cap/removal                                             |
| 10-12      | Guest booking, successful payment, failure/retry with another method, unknown then verified result   |
| 13         | Native e-ticket download/share handoff (native-share tag; OS sheet needs device-specific inspection) |
| 14         | BNI, BRI, Permata, QRIS, GoPay; BCA is covered by 10                                                 |
| 15         | Recovery UI for hold, payment, queue, missed turn; route tests are not simulated server transitions  |
| 16-17      | Real checkout/payment deadline expiry (slow tag; up to 5/10 minutes)                                 |
| 18-19      | Registered attendee NIK and exhausted checks warning                                                 |
| 20-21      | Guest ticket history, unpaid success deep link cannot show a ticket                                  |
| 22-24      | Returning login, mandatory consent, payment leave/stay                                               |
| scenarios/ | Immediate admission, sold-out queue, rejected missed claim                                           |

The demo catalog has fixed November/December 2026 dates. Keep the test device in the fixture sales period or update the fixture dates deliberately; tests do not change the clock. Timer tests use server deadlines, not device clock changes.

## Queue scenario builds

The mock queue accepts EXPO_PUBLIC_MAESTRO_QUEUE_SCENARIO at the composition root. Leave unset for the normal suite. For each scenario, rebuild/reload the mock JS bundle with the matching value and run only its scenario file:

| Value       | File                             |
| ----------- | -------------------------------- |
| admitted    | scenarios/queue-admitted.yaml    |
| sold-out    | scenarios/queue-sold-out.yaml    |
| turn-missed | scenarios/queue-turn-missed.yaml |

These files deliberately stay outside default discovery because their fixtures are mutually exclusive. Restore the unset/default value afterward. The variable is ignored by real adapter wiring. It is build-time Expo configuration, not a Maestro -e runtime variable.

## Limits and evidence

Syntax checks alone do not prove a device pass. Consult VALIDATION.md for observed results. OTP delivery, real SNAP/WebView redirects, push delivery, cross-process mock queue/session restoration, and backend conflict responses need a test backend or dedicated platform fixture. The in-memory mocks cannot establish persistence across process death. Cloud CI and real payments are outside this local suite.
