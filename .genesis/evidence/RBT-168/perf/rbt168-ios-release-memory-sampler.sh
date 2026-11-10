#!/bin/zsh

set -euo pipefail

output=".genesis/evidence/RBT-168/perf/rbt168-ios-release-footprint-samples.txt"
device="E80F96A4-1DF0-42CC-85EC-DE5B27B0333E"

for sample in {1..32}; do
  date -u '+%Y-%m-%d %H:%M:%S UTC' >> "$output"
  pid=$(ps -A -o pid,comm | awk -v device="$device" 'index($0, device) > 0 && /RusuhBooking.app\/RusuhBooking$/ && !pid { pid = $1 } END { print pid }')
  if [[ -n "$pid" ]]; then
    footprint -p "$pid" | awk '/Footprint:/ && !found { line = $0; found = 1 } END { print line }' >> "$output"
  else
    print 'RusuhBooking Release process not present' >> "$output"
  fi
  sleep 5
done
