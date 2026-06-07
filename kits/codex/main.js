const CODEX_SESSION_FILES = [
  'data/rollout-2026-04-22T20-16-21-019db51e-b51b-74d2-b6b3-5cd29a491055.jsonl',
];

function main() {
  window.CodexSessionApp.start({
    defaultFile: CODEX_SESSION_FILES[0],
    sampleFiles: CODEX_SESSION_FILES,
  });
}

main();
