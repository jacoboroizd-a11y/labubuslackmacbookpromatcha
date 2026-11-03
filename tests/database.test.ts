import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { it, expect } from "vitest";
it("applies the migration and isolates two users and anonymous access with RLS", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role authenticated; create role anon; create schema auth; create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}'); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`,
    );
    await db.exec(
      readFileSync(
        new URL("../supabase/migrations/001_initial.sql", import.meta.url),
        "utf8",
      ),
    );
    // Emulate Supabase's table grants; policies, not missing grants, must protect data.
    await db.exec(
      `grant usage on schema public to authenticated,anon; grant all on all tables in schema public to authenticated,anon; grant all on all sequences in schema public to authenticated,anon; insert into auth.users(id) values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222'); set role authenticated; set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';`,
    );
    expect((await db.query("select * from user_profiles")).rows).toHaveLength(
      1,
    );
    expect(
      (await db.query<{ region: string }>("select region from user_profiles"))
        .rows[0].region,
    ).toBe("NI");
    await db.exec(
      `insert into watchlist(user_id,tmdb_id,media_type) values(auth.uid(),1,'movie')`,
    );
    await expect(
      db.exec(
        `insert into watchlist(user_id,tmdb_id,media_type) values('22222222-2222-4222-8222-222222222222',2,'movie')`,
      ),
    ).rejects.toThrow();
    await db.exec(
      `set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222'`,
    );
    expect((await db.query("select * from watchlist")).rows).toHaveLength(0);
    expect((await db.query("select * from users")).rows).toHaveLength(1);
    expect(
      (
        await db.query(
          `update user_profiles set region='US' where id='11111111-1111-4111-8111-111111111111' returning id`,
        )
      ).rows,
    ).toHaveLength(0);
    await expect(
      db.exec(`insert into streaming_providers values(9999,'Injected')`),
    ).rejects.toThrow();
    await expect(
      db.exec(
        `insert into user_media_state(user_id,tmdb_id,media_type,liked,disliked) values(auth.uid(),1,'movie',true,true)`,
      ),
    ).rejects.toThrow();
    await expect(
      db.exec(
        `insert into user_media_state(user_id,tmdb_id,media_type,status) values(auth.uid(),1,'movie','watched')`,
      ),
    ).rejects.toThrow();
    await db.exec("set role anon");
    expect((await db.query("select * from watchlist")).rows).toHaveLength(0);
    expect((await db.query("select * from user_profiles")).rows).toHaveLength(
      0,
    );
    expect(
      (await db.query("select * from streaming_providers")).rows.length,
    ).toBeGreaterThan(0);
  } finally {
    await db.close();
  }
}, 20000);
