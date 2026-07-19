import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "../../.env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^"(.*)"$/, "$1");
    }
  }
}

loadEnvLocal();

/** Cliente admin (service_role) — solo para setup/teardown de fixtures en tests E2E, nunca para las aserciones del flujo (esas van por la UI). */
export function createAdminTestClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
