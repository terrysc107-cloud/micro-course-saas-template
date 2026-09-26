// Local HTTP smoke checks. Runs without service credentials and never contacts Stripe.
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const port = Number(process.env.LAB_TEST_PORT ?? 3199),
  origin = `http://127.0.0.1:${port}`;
const env = {
  ...process.env,
  NEXT_PUBLIC_SITE_URL: origin,
  NEXT_PUBLIC_SUPABASE_URL: "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
  SUPABASE_SERVICE_ROLE_KEY: "",
  LAB_STRIPE_WEBHOOK_SECRET: "",
  STRIPE_SECRET_KEY: "",
};
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  { env, stdio: ["ignore", "pipe", "pipe"] },
);
let logs = "";
server.stdout.on("data", (b) => (logs += b));
server.stderr.on("data", (b) => (logs += b));
try {
  let ready = false;
  for (let n = 0; n < 100; n++) {
    if (server.exitCode !== null) throw new Error(logs);
    try {
      await fetch(origin + "/api/labs/cohorts");
      ready = true;
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  assert.ok(ready, "server must start");
  for (const path of [
    "/build-lab",
    "/build-lab/privacy",
    "/lab-studio",
    "/lab-studio/instructor",
  ]) {
    const r = await fetch(origin + path);
    assert.equal(r.status, 200, path);
    const html = await r.text();
    assert.ok(!html.includes("Application error:"));
    console.log("PASS page", path);
  }
  for (const path of [
    "/api/labs/workspace",
    "/api/labs/instructor",
    "/api/labs/document?applicationId=invalid",
  ])
    assert.equal((await fetch(origin + path)).status, 503, path);
  const denied = await fetch(origin + "/api/labs/interest", {
    method: "POST",
    headers: {
      Origin: "https://foreign.example",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(denied.status, 403);
  const noConfig = await fetch(origin + "/api/labs/interest", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(noConfig.status, 503);
  assert.equal(
    (await fetch(origin + "/api/labs/webhook", { method: "POST", body: "{}" }))
      .status,
    503,
  );
  assert.deepEqual(await (await fetch(origin + "/api/labs/cohorts")).json(), {
    cohorts: [],
  });
  console.log(
    "PASS private routes, cross-origin rejection and unavailable-service handling",
  );
} finally {
  server.kill("SIGTERM");
}
