-- Apply once to a new Supabase project. No service-role key is needed by the app.
create table public.user_profiles (
 id uuid primary key references auth.users on delete cascade,
 display_name text not null default '', region text not null default 'NI' check(region ~ '^[A-Z]{2}$'),
 included_only boolean not null default false, created_at timestamptz not null default now()
);
create view public.users with (security_invoker = true) as select id from public.user_profiles;
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.user_profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name','')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
insert into public.user_profiles(id) select id from auth.users on conflict do nothing;
create table public.streaming_providers(id integer primary key, name text not null);
insert into public.streaming_providers values (8,'Netflix'),(337,'Disney+'),(1899,'Max'),(9,'Amazon Prime Video'),(350,'Apple TV+'),(531,'Paramount+'),(283,'Crunchyroll'),(11,'MUBI'),(15,'Hulu'),(386,'Peacock'),(457,'ViX'),(192,'YouTube');
create table public.user_streaming_services (
 user_id uuid not null references auth.users on delete cascade, provider_id integer not null references public.streaming_providers,
 active boolean not null default true, created_at timestamptz not null default now(), primary key(user_id,provider_id)
);
create table public.media (
 tmdb_id integer not null, media_type text not null check(media_type in ('movie','tv')), title text not null,
 metadata jsonb not null default '{}', updated_at timestamptz not null default now(), primary key(tmdb_id,media_type)
);
create table public.media_availability (
 id bigint generated always as identity primary key, tmdb_id integer not null, media_type text not null,
 provider_id integer not null, region text not null check(region ~ '^[A-Z]{2}$'),
 monetization_type text not null check(monetization_type in ('flatrate','rent','buy','free','ads')),
 detected_at timestamptz not null default now(), last_seen_at timestamptz not null default now(),
 foreign key(tmdb_id,media_type) references public.media on delete cascade,
 unique(tmdb_id,media_type,provider_id,region,monetization_type,detected_at)
);
create table public.user_media_state (
 user_id uuid not null references auth.users on delete cascade, tmdb_id integer not null, media_type text not null check(media_type in ('movie','tv')),
 status text check(status in ('want_to_watch','watching','watched','not_interested')),
 liked boolean not null default false, disliked boolean not null default false, personal_rating integer check(personal_rating between 1 and 5),
 watched_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,tmdb_id,media_type), check(not (liked and disliked)),
 check((status = 'watched' and watched_at is not null) or (status is distinct from 'watched' and watched_at is null))
);
create table public.shows (tmdb_id integer primary key, name text not null);
create table public.seasons (show_tmdb_id integer references public.shows on delete cascade, season_number integer not null, name text, primary key(show_tmdb_id,season_number));
create table public.episodes (show_tmdb_id integer not null, season_number integer not null, episode_number integer not null, name text, runtime integer, primary key(show_tmdb_id,season_number,episode_number), foreign key(show_tmdb_id,season_number) references public.seasons on delete cascade);
create table public.user_episode_state (user_id uuid references auth.users on delete cascade, show_tmdb_id integer not null, season_number integer not null, episode_number integer not null, watched boolean not null default false, watched_at timestamptz, primary key(user_id,show_tmdb_id,season_number,episode_number), foreign key(show_tmdb_id,season_number,episode_number) references public.episodes on delete cascade);
create table public.collections (id bigint generated always as identity primary key, tmdb_id integer unique, name text not null);
create table public.collection_members (collection_id bigint references public.collections on delete cascade, tmdb_id integer not null, media_type text not null, release_position integer, chronological_position integer, recommended_position integer, primary key(collection_id,tmdb_id,media_type), foreign key(tmdb_id,media_type) references public.media on delete cascade);
create table public.media_relationships (
 id bigint generated always as identity primary key, source_tmdb_id integer not null, target_tmdb_id integer not null,
 source_media_type text not null, target_media_type text not null,
 relationship_type text not null check(relationship_type in ('sequel_to','prequel_to','remake_of','remade_as','reboot_of','spinoff_of','adaptation_of','inspired_by','same_universe','alternate_version','related_story')),
 confidence numeric not null check(confidence between 0 and 1), source text not null,
 evidence_type text not null check(evidence_type in ('confirmed','inferred','manually_curated')), notes text,
 foreign key(source_tmdb_id,source_media_type) references public.media on delete cascade,
 foreign key(target_tmdb_id,target_media_type) references public.media on delete cascade
);
create table public.watchlist (user_id uuid references auth.users on delete cascade, tmdb_id integer not null, media_type text not null check(media_type in ('movie','tv')), created_at timestamptz not null default now(), primary key(user_id,tmdb_id,media_type));
create table public.recommendation_events (id bigint generated always as identity primary key, user_id uuid not null references auth.users on delete cascade, tmdb_id integer not null, media_type text not null check(media_type in ('movie','tv')), reasons jsonb not null default '[]', created_at timestamptz not null default now());
create table public.provider_links (id bigint generated always as identity primary key, tmdb_id integer not null, media_type text not null check(media_type in ('movie','tv')), provider_id integer not null, region text not null check(region ~ '^[A-Z]{2}$'), url text not null check(url like 'https://%'), source text not null, verified_at timestamptz not null default now(), unique(tmdb_id,media_type,provider_id,region));
-- All personal tables are private to their authenticated owner.
alter table public.user_profiles enable row level security;
create policy own_profile_read on public.user_profiles for select to authenticated using(id=auth.uid());
create policy own_profile_update on public.user_profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
do $$ declare t text; begin
 foreach t in array array['user_streaming_services','user_media_state','user_episode_state','watchlist','recommendation_events'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy own_data on public.%I for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid())',t);
 end loop;
 foreach t in array array['streaming_providers','media','media_availability','shows','seasons','episodes','collections','collection_members','media_relationships','provider_links'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy public_read on public.%I for select using(true)',t);
 end loop;
end $$;
create index availability_region on public.media_availability(region,provider_id,monetization_type);
create index state_user_status on public.user_media_state(user_id,status);
create index relationship_target on public.media_relationships(target_tmdb_id,target_media_type);
