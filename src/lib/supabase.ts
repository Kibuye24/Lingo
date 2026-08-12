"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Optional Supabase client.
 *
 * Sync is strictly additive to the app: if these env vars are absent the
 * client is `null`, every sync call becomes a no-op, and the app behaves
 * exactly as it did before — localStorage only, fully offline. That's
 * deliberate. Learning must never depend on a network round-trip.
 *
 * The anon key is safe to ship in the browser bundle: it grants no data
 * access on its own. Every table has Row Level Security scoped to
 * `auth.uid()`, so without a signed-in session it can read and write nothing.
 * See supabase/migrations/0001_init.sql.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

/** Whether cloud sync is even configured for this build. */
export function syncConfigured(): boolean {
  return Boolean(url && anonKey);
}
