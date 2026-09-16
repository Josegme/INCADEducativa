import type { Json } from "@/lib/supabase/database.types";

export function asJson(value: unknown): Json {
  return value as Json;
}
