# Measurement evidence for t3code issue #22350

This package contains the instrument used for the reported iPhone measurements, the two recorded logs, the gesture sequence, an analysis script and a content-free message profile. It is a partial evidence handoff, not a self-contained reproduction: the original database, a seeding script and the private gesture driver are not included.

## Correction to the original comparison

The reported 12-swipe numbers, table and before.mp4 did not compare a separate main build with the PR. Both modes used the first fix build, commit 1ed789d2 on base 67c0fc0cda.

- log-film-nodefer.jsonl: touch deferral disabled through a probe-only flag and an edit to the installed LegendList package. This exercised the original relative scrollBy correction path.
- log-film-defer.jsonl: the same build with touch deferral enabled.

The media's existing main/before labels refer to the disabled mode. A separate main-build iOS capture is still missing. The historical measurements do not test the subsequent detached-target fix or later upstream merges.

## Included files

| File | Provenance |
| --- | --- |
| probe/__probe.js | Reconstructed verbatim from the original session commands after the temporary file was deleted. The filmed logs have matching event kinds. |
| probe/beacon-server.mjs | Original local beacon collector. |
| steps/swipe-12-up.json | Original action sequence with the thread URL replaced by placeholders. The private driver is not included. |
| analysis/analyse_logs.py | Original analysis logic with file-path arguments replacing fixed temporary paths. |
| logs/log-film-nodefer.jsonl | Recorded data from the filmed deferral-disabled run. |
| logs/log-film-defer.jsonl | Recorded data from the filmed deferral-enabled run. |
| fixture/row-profile.json | Newly derived message roles, character/line/markdown counts and per-run event counts. No message text or original identifiers. |

The earlier probe, chart generator and incomplete historical scrubber are omitted from this package.

## Recorded setup and gestures

- iPhone 17 simulator, iOS 26.3, Mobile Safari, local web development server.
- A 637-message thread: 84 user messages and 553 assistant messages across 63 runs.
- Open the thread, wait 35 seconds, then twelve XCUIElement.swipeDown() calls on Safari's web view, 1.5 seconds apart. The finger moves down to reveal older messages.
- Load probe/__probe.js before bootstrap.ts via a script tag in apps/web/index.html, with the file served from apps/web/public/.

The probe tracks scrollBy calls on .messages-timeline-scroll, touch state, scrollend and per-frame movement of a text element near the middle of the viewport. It sends numeric/boolean measurements and event kinds to the loopback collector. It reads text to track the selected element but does not emit the text.

The nodefer URL flag in the probe does not disable the fix in a normal checkout. It only worked together with the temporary edit to the installed package in the original session. Those modes must not be described as two independent builds.

## Read the supplied measurements

From this directory:

    python3 analysis/analyse_logs.py logs/log-film-nodefer.jsonl logs/log-film-defer.jsonl

| Measurement | Deferral disabled | Deferral enabled |
| --- | --- | --- |
| scrollBy calls | 16 | 0 |
| Calls with a finger down | 9 | 0 |
| Frames with backward movement greater than 10 px | 8 | 0 |
| Largest backward movement | 382 px | None |

The eight backward movements were 382, 259, 189, 146, 92, 26, 26 and 23 px. These counts reproduce the saved analysis. Each file contains two page loads with timestamps restarting at zero. The totals above do not rely on event ordering; do not interpret the script's sorted forward-spike calculation as a continuous cross-load timeline.

## Use the probe for a new capture

1. Use an isolated development database and a long thread with older rows not yet measured.
2. Install the probe before the app bootstrap as described above.
3. Run node probe/beacon-server.mjs run.jsonl on the simulator host. It listens only on 127.0.0.1:47999.
4. Open the thread in Mobile Safari, wait for loading, then perform the documented gestures.
5. Stop the collector and analyse run.jsonl with the script above. Remove the temporary probe and script tag afterwards.

For a fresh main-versus-fix comparison, use separately built checkouts and record their commits. Merely adding nodefer to a normal checkout does not create a baseline.

## Fixture availability and limits

The original fixture was a development-database copy with selected fields replaced in one thread. It was not fully sanitized, and the database contains other unsanitized data. Neither the database nor the incomplete scrubber is included.

There was no seeding script. The message profile supplies approximate structural information only. Character and markdown counts cannot reproduce exact text wrapping, row heights or rendering behavior; fixture import and equivalence have not been tested.

The probe and collector were smoke-tested on 2026-10-22 in headless Chromium with real CDP touch input on a LegendList scroller. That checks the instrumentation, not iOS behavior. The original iOS runs have not been replayed. Only one simulator session per mode was measured, so variance is unknown.
