"""Record five clean Home/Browse cycles and per-cycle native metrics."""

from pathlib import Path
import subprocess
import sys
import time


EVIDENCE = Path(__file__).resolve().parent
DEVICE = "T1AIGF005808BV4"
PACKAGE = "com.tiketsampainonton.rusuhbooking.rbt130"
ADB = ["adb", "-s", DEVICE]
DEVICE_VIDEO = "/sdcard/rbt130-final-scroll-120hz.mp4"
LABEL = sys.argv[1] if len(sys.argv) > 1 else "120hz"
TARGET_REFRESH_RATE = 120 if LABEL.startswith("120hz-") else None


def adb(*args: str, capture: bool = False) -> str:
    result = subprocess.run(
        [*ADB, *args],
        check=True,
        text=True,
        stdout=subprocess.PIPE if capture else subprocess.DEVNULL,
    )
    return result.stdout or ""


adb("shell", "input", "keyevent", "3")
adb("shell", "am", "force-stop", PACKAGE)
adb("shell", "monkey", "-p", PACKAGE, "-c", "android.intent.category.LAUNCHER", "1")
time.sleep(8)
if TARGET_REFRESH_RATE:
    adb("shell", "settings", "put", "system", "min_refresh_rate", str(TARGET_REFRESH_RATE))
    adb("shell", "settings", "put", "system", "peak_refresh_rate", str(TARGET_REFRESH_RATE))
    time.sleep(1)
    display_start = adb("shell", "dumpsys", "display", capture=True)
    if f"physical: ({TARGET_REFRESH_RATE}.0 {TARGET_REFRESH_RATE}.0)" not in display_start:
        raise RuntimeError(
            f"Could not set the device to {TARGET_REFRESH_RATE} Hz before recording."
        )
    (EVIDENCE / f"final-display-before-{LABEL}.txt").write_text(
        display_start, encoding="utf-8"
    )
adb("shell", "screencap", "-p", "/sdcard/rbt130-final-start.png")
adb(
    "pull",
    "/sdcard/rbt130-final-start.png",
    str(EVIDENCE / f"final-android-start-{LABEL}.png"),
    capture=True,
)
(EVIDENCE / f"final-android-meminfo-before-{LABEL}.txt").write_text(
    adb("shell", "dumpsys", "meminfo", PACKAGE, capture=True), encoding="utf-8"
)
recorder = subprocess.Popen(
    [*ADB, "shell", "screenrecord", "--time-limit", "40", DEVICE_VIDEO],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.PIPE,
    text=True,
)
time.sleep(0.5)

cycle_metrics = []
memory_metrics = []
for cycle in range(1, 6):
    adb("shell", "dumpsys", "gfxinfo", PACKAGE, "reset")
    cycle_started = time.perf_counter()
    # Home: vertical feed and horizontal event carousel.
    adb("shell", "input", "swipe", "540", "1850", "540", "650", "650")
    adb("shell", "input", "swipe", "940", "1900", "210", "1900", "650")
    adb("shell", "input", "swipe", "210", "1900", "940", "1900", "650")
    adb("shell", "input", "swipe", "540", "650", "540", "1850", "650")
    time.sleep(0.2)

    # Browse: enter, scroll through the event grid, then return Home.
    adb("shell", "input", "tap", "540", "2200")
    time.sleep(0.35)
    adb("shell", "input", "swipe", "540", "1850", "540", "650", "650")
    adb("shell", "input", "swipe", "540", "1850", "540", "650", "650")
    adb("shell", "input", "swipe", "540", "1850", "540", "650", "650")
    time.sleep(0.2)
    adb("shell", "input", "tap", "180", "2200")
    time.sleep(0.35)
    cycle_duration = time.perf_counter() - cycle_started
    cycle_metrics.append(
        f"===== CYCLE {cycle} ({cycle_duration:.2f}s) =====\n"
        + adb("shell", "dumpsys", "gfxinfo", PACKAGE, capture=True)
    )
    memory_metrics.append(
        f"===== CYCLE {cycle} =====\n"
        + adb("shell", "dumpsys", "meminfo", PACKAGE, capture=True)
    )
    if cycle < 5:
        time.sleep(0.2)

recorder.wait(timeout=60)
if recorder.returncode != 0:
    raise RuntimeError(recorder.stderr.read() if recorder.stderr else "screenrecord failed")

adb("pull", DEVICE_VIDEO, str(EVIDENCE / f"final-scroll-android-{LABEL}.mp4"), capture=True)
(EVIDENCE / f"final-gfxinfo-cycles-{LABEL}.txt").write_text("\n".join(cycle_metrics), encoding="utf-8")
(EVIDENCE / f"final-meminfo-cycles-{LABEL}.txt").write_text("\n".join(memory_metrics), encoding="utf-8")
(EVIDENCE / f"final-android-meminfo-after-{LABEL}.txt").write_text(
    adb("shell", "dumpsys", "meminfo", PACKAGE, capture=True), encoding="utf-8"
)
(EVIDENCE / f"final-android-end-{LABEL}.png").write_bytes(
    subprocess.run(
        [*ADB, "exec-out", "screencap", "-p"], check=True, stdout=subprocess.PIPE
    ).stdout
)
(EVIDENCE / f"final-display-{LABEL}.txt").write_text(
    adb("shell", "dumpsys", "display", capture=True),
    encoding="utf-8",
)
