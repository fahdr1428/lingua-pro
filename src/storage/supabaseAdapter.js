// =============================================================================
// SupabaseAdapter — stub. Implement when you're ready for cloud sync.
// =============================================================================
// To activate:
//   1. npm install @supabase/supabase-js
//   2. Create a Supabase project at supabase.com (free tier)
//   3. In the SQL editor, run:
//
//      create table kv (
//        user_id uuid references auth.users not null,
//        key text not null,
//        value jsonb,
//        updated_at timestamptz default now(),
//        primary key (user_id, key)
//      );
//      alter table kv enable row level security;
//      create policy "users own rows" on kv for all using (auth.uid() = user_id);
//
//   4. Uncomment imports below and the line in storage/index.js
// =============================================================================

// import { createClient } from "@supabase/supabase-js";

export class SupabaseAdapter {
  constructor(client) {
    this.client = client;
  }

  async _userId() {
    const { data } = await this.client.auth.getUser();
    return data?.user?.id;
  }

  async get(key) {
    const userId = await this._userId();
    if (!userId) return null;
    const { data } = await this.client
      .from("kv")
      .select("value")
      .eq("user_id", userId)
      .eq("key", key)
      .maybeSingle();
    return data?.value ?? null;
  }

  async set(key, value) {
    const userId = await this._userId();
    if (!userId) return;
    await this.client.from("kv").upsert({
      user_id: userId,
      key,
      value,
      updated_at: new Date().toISOString(),
    });
  }

  async remove(key) {
    const userId = await this._userId();
    if (!userId) return;
    await this.client.from("kv").delete().eq("user_id", userId).eq("key", key);
  }

  async update(key, fn) {
    const current = await this.get(key);
    const next = fn(current);
    await this.set(key, next);
    return next;
  }
}
