import { describe, expect, it } from "@effect/vitest";
import { HostProcessPlatform } from "@t3tools/shared/hostProcess";
import { SpawnExecutableResolution } from "@t3tools/shared/shell";
import * as Effect from "effect/Effect";

import { resolveCodexBinaryPath } from "./CodexExecutable.ts";

const BUNDLED_CLI = "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex";
const OLDER_BUNDLED_CLI = "/Applications/ChatGPT.app/Contents/Resources/codex";

function withMacExecutables(executables: ReadonlyArray<string>) {
  const existing = new Set(executables);
  return <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    effect.pipe(
      Effect.provideService(HostProcessPlatform, "darwin"),
      Effect.provideService(SpawnExecutableResolution, (command) =>
        existing.has(command) ? command : undefined,
      ),
    );
}

describe("resolveCodexBinaryPath", () => {
  it.effect("keeps the default command while it resolves on PATH", () =>
    Effect.gen(function* () {
      expect(
        yield* resolveCodexBinaryPath("codex", {}).pipe(withMacExecutables(["codex", BUNDLED_CLI])),
      ).toBe("codex");
    }),
  );

  it.effect("uses the CLI bundled with ChatGPT when codex is not on PATH", () =>
    Effect.gen(function* () {
      expect(
        yield* resolveCodexBinaryPath("codex", {}).pipe(
          withMacExecutables([BUNDLED_CLI, OLDER_BUNDLED_CLI]),
        ),
      ).toBe(BUNDLED_CLI);
    }),
  );

  it.effect("finds the older ChatGPT bundle layout", () =>
    Effect.gen(function* () {
      expect(
        yield* resolveCodexBinaryPath("codex", {}).pipe(withMacExecutables([OLDER_BUNDLED_CLI])),
      ).toBe(OLDER_BUNDLED_CLI);
    }),
  );

  it.effect("keeps the default command when no bundled CLI exists either", () =>
    Effect.gen(function* () {
      expect(yield* resolveCodexBinaryPath("codex", {}).pipe(withMacExecutables([]))).toBe("codex");
    }),
  );

  it.effect("returns a configured path unchanged", () =>
    Effect.gen(function* () {
      expect(
        yield* resolveCodexBinaryPath("/opt/codex/bin/codex", {}).pipe(
          withMacExecutables([BUNDLED_CLI]),
        ),
      ).toBe("/opt/codex/bin/codex");
    }),
  );

  it.effect("leaves other platforms alone", () =>
    Effect.gen(function* () {
      expect(
        yield* resolveCodexBinaryPath("codex", {}).pipe(
          Effect.provideService(HostProcessPlatform, "linux"),
          Effect.provideService(SpawnExecutableResolution, () => {
            throw new Error("must not resolve outside macOS");
          }),
        ),
      ).toBe("codex");
    }),
  );
});
