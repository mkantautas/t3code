import { HostProcessPlatform } from "@t3tools/shared/hostProcess";
import { SpawnExecutableResolution } from "@t3tools/shared/shell";
import * as Effect from "effect/Effect";

/**
 * Codex CLIs the ChatGPT desktop app ships inside its bundle on macOS, newest
 * layout first. The app does not put either one on PATH.
 */
const MACOS_APP_BUNDLED_CODEX_PATHS = [
  "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex",
  "/Applications/ChatGPT.app/Contents/Resources/codex",
] as const;

/**
 * Resolves the configured Codex binary path for spawning.
 *
 * A path the user set is returned unchanged. The default `codex` stays as is
 * while it resolves on PATH; on macOS, when it does not, the CLI bundled with
 * the ChatGPT desktop app is used instead, so installing ChatGPT is enough to
 * run Codex without setting a Binary path by hand.
 */
export const resolveCodexBinaryPath = Effect.fn("resolveCodexBinaryPath")(function* (
  binaryPath: string,
  environment: NodeJS.ProcessEnv,
): Effect.fn.Return<string> {
  if (binaryPath !== "codex") {
    return binaryPath;
  }
  const platform = yield* HostProcessPlatform;
  if (platform !== "darwin") {
    return binaryPath;
  }
  const resolveExecutable = yield* SpawnExecutableResolution;
  if (resolveExecutable(binaryPath, platform, environment) !== undefined) {
    return binaryPath;
  }
  return (
    MACOS_APP_BUNDLED_CODEX_PATHS.find(
      (candidate) => resolveExecutable(candidate, platform, environment) !== undefined,
    ) ?? binaryPath
  );
});
