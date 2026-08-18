-- =====================================================================
-- Graduate opportunity-matching app - schema
-- Richfield Hackathon 2026, qualification round (focus: opportunity matching)
--
-- Run against project kepnlabcvbylqgnibwrv.
-- Destructive: drops the previous PartyFinder tables first. The project
-- holds no real data, so this is a clean rebuild rather than a migration.
-- =====================================================================

-- ============ 0. TEAR DOWN THE OLD APP ============

drop table if exists public.ad_impressions      cascade;
drop table if exists public.ads                 cascade;
drop table if exists public.promoted_listings   cascade;
drop table if exists public.story_views         cascade;
drop table if exists public.stories             cascade;
drop table if exists public.review_replies      cascade;
drop table if exists public.reviews             cascade;
drop table if exists public.reports             cascade;
drop table if exists public.venue_claims        cascade;
drop table if exists public.event_messages      cascade;
drop table if exists public.saved_events        cascade;
drop table if exists public.event_attendance    cascade;
drop table if exists public.events              cascade;
drop table if exists public.friendships         cascade;
drop table if exists public.notifications       cascade;
drop table if exists public.push_tokens         cascade;
drop table if exists public.users               cascade;

drop function if exists public.friend_count(uuid)              cascade;
drop function if exists public.friends_attending(uuid, uuid)   cascade;
drop function if exists public.increment_view_count(uuid)      cascade;
drop function if exists public.increment_story_views(uuid)     cascade;
drop function if exists public.track_ad_impression(uuid)       cascade;
drop function if exists public.track_ad_click(uuid)            cascade;
drop function if exists public.sync_attendance_count()         cascade;

-- ============ 1. PROFILES ============
-- One row per signed-up user. `account_type` splits students from employers;
-- the student-facing columns are what the matching engine reads.

create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text,
  account_type     text default 'student',      -- 'student' | 'employer'
  full_name        text,
  headline         text,                        -- "Final-year BSc student | aspiring data analyst"
  avatar_url       text,
  bio              text,
  location         text,
  phone            text,

  -- student fields
  university       text,
  qualification    text,                        -- e.g. "BSc Information Technology"
  field_of_study   text,
  graduation_year  integer,
  skills           text[] default '{}',
  target_roles     text[] default '{}',
  years_experience integer default 0,
  cv_url           text,
  portfolio_url    text,
  linkedin_url     text,
  open_to_work     boolean default true,

  -- employer fields
  company_name     text,
  company_website  text,
  company_size     text,
  is_verified      boolean default false,

  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============ 2. OPPORTUNITIES ============

create table if not exists public.opportunities (
  id                  uuid primary key default gen_random_uuid(),
  employer_id         uuid references public.profiles(id) on delete cascade,

  title               text not null,
  company_name        text,
  logo_url            text,
  description         text,
  responsibilities    text,

  opportunity_type    text default 'job',        -- 'job' | 'internship' | 'learnership' | 'graduate_programme' | 'bursary'
  experience_level    text default 'entry',      -- 'entry' | 'graduate' | 'junior' | 'mid'
  employment_type     text default 'full_time',  -- 'full_time' | 'part_time' | 'contract' | 'temporary'

  location            text,
  is_remote           boolean default false,

  -- what the matching engine scores against
  required_skills     text[] default '{}',
  nice_to_have_skills text[] default '{}',
  min_qualification   text,
  field_of_study      text,

  salary_min          numeric,
  salary_max          numeric,
  salary_period       text default 'month',      -- 'month' | 'year' | 'hour'
  is_salary_hidden    boolean default false,

  application_url     text,
  closing_date        date,
  start_date          date,

  is_active           boolean default true,
  view_count          integer default 0,
  application_count   integer default 0,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============ 3. APPLICATIONS ============
-- Doubles as the saved list (status = 'saved') and the pipeline tracker.
-- match_score / match_reasons are written by the matching engine - today a
-- deterministic scorer in src/lib/matching.js, later the AI model.

create table if not exists public.applications (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  student_id     uuid references public.profiles(id) on delete cascade,

  status         text default 'saved',       -- 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn'
  match_score    numeric,                    -- 0-100
  match_reasons  jsonb default '{}'::jsonb,  -- { matched: [], missing: [], summary: "" }
  cover_note     text,

  applied_at     timestamptz,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (opportunity_id, student_id)
);

-- ============ 4. CONNECTIONS ============

create table if not exists public.connections (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade,
  addressee_id uuid references public.profiles(id) on delete cascade,
  status       text default 'pending',       -- 'pending' | 'accepted' | 'declined'
  created_at   timestamptz default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

-- ============ 5. NOTIFICATIONS & PUSH ============

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade,
  type       text,                            -- 'match' | 'connection' | 'application_update' | 'closing_soon'
  title      text,
  body       text,
  data       jsonb default '{}'::jsonb,
  is_read    boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.push_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade,
  token      text unique,
  platform   text,
  is_active  boolean default true,
  created_at timestamptz default now()
);

-- ============ 6. SKILL REFERENCE ============
-- Backs autocomplete now; gives the AI a controlled vocabulary later so
-- "React.js" and "ReactJS" collapse to one concept.

create table if not exists public.skills (
  id       uuid primary key default gen_random_uuid(),
  name     text unique not null,
  category text
);

-- ============ 7. INDEXES ============

create index if not exists idx_opps_active     on public.opportunities(is_active, closing_date);
create index if not exists idx_opps_type       on public.opportunities(opportunity_type);
create index if not exists idx_opps_employer   on public.opportunities(employer_id);
create index if not exists idx_opps_skills     on public.opportunities using gin (required_skills);
create index if not exists idx_profiles_skills on public.profiles using gin (skills);
create index if not exists idx_apps_student    on public.applications(student_id, status);
create index if not exists idx_apps_opp        on public.applications(opportunity_id);
create index if not exists idx_conn_req        on public.connections(requester_id);
create index if not exists idx_conn_addr       on public.connections(addressee_id);
create index if not exists idx_notif_user      on public.notifications(user_id, is_read);

-- ============ 8. FUNCTIONS ============

create or replace function public.connection_count(target_user_id uuid)
returns integer language sql stable security definer set search_path = public as $fn$
  select count(*)::int from public.connections
  where status = 'accepted'
    and (requester_id = target_user_id or addressee_id = target_user_id);
$fn$;

create or replace function public.increment_opportunity_views(target_opportunity_id uuid)
returns void language sql volatile security definer set search_path = public as $fn$
  update public.opportunities
     set view_count = coalesce(view_count, 0) + 1
   where id = target_opportunity_id;
$fn$;

-- Server-side skill overlap. The app scores in JS for explainability, but
-- this lets the feed pre-rank at the database when the catalogue grows.
create or replace function public.skill_overlap_score(student_skills text[], required_skills text[])
returns numeric language sql immutable as $fn$
  select case
    when required_skills is null or array_length(required_skills, 1) is null then 50
    else round(
      100.0 * cardinality(array(
        select unnest(lower(student_skills::text)::text[])
        intersect
        select unnest(lower(required_skills::text)::text[])
      )) / cardinality(required_skills)
    )
  end;
$fn$;

create or replace function public.sync_application_count()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  if tg_op = 'INSERT' and new.status <> 'saved' then
    update public.opportunities
       set application_count = coalesce(application_count, 0) + 1
     where id = new.opportunity_id;
  elsif tg_op = 'UPDATE' and old.status = 'saved' and new.status <> 'saved' then
    update public.opportunities
       set application_count = coalesce(application_count, 0) + 1
     where id = new.opportunity_id;
  elsif tg_op = 'DELETE' and old.status <> 'saved' then
    update public.opportunities
       set application_count = greatest(coalesce(application_count, 0) - 1, 0)
     where id = old.opportunity_id;
  end if;
  return null;
end;
$fn$;

drop trigger if exists trg_application_count on public.applications;
create trigger trg_application_count
  after insert or update or delete on public.applications
  for each row execute function public.sync_application_count();

-- ============ 9. ROW LEVEL SECURITY ============

do $do$
declare t text;
begin
  foreach t in array array[
    'profiles','opportunities','applications','connections',
    'notifications','push_tokens','skills'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists read_all on public.%I', t);
    execute format('create policy read_all on public.%I for select to authenticated using (true)', t);
  end loop;
end
$do$;

do $do$
declare r record;
begin
  for r in select * from (values
      ('profiles','id'), ('opportunities','employer_id'), ('applications','student_id'),
      ('notifications','user_id'), ('push_tokens','user_id')
    ) as v(tbl, col)
  loop
    execute format('drop policy if exists own_insert on public.%I', r.tbl);
    execute format('drop policy if exists own_update on public.%I', r.tbl);
    execute format('drop policy if exists own_delete on public.%I', r.tbl);
    execute format('create policy own_insert on public.%I for insert to authenticated with check (auth.uid() = %I)', r.tbl, r.col);
    execute format('create policy own_update on public.%I for update to authenticated using (auth.uid() = %I)', r.tbl, r.col);
    execute format('create policy own_delete on public.%I for delete to authenticated using (auth.uid() = %I)', r.tbl, r.col);
  end loop;
end
$do$;

-- applications are private to the student and the employer who posted the role
drop policy if exists read_all on public.applications;
create policy app_read on public.applications for select to authenticated
  using (
    auth.uid() = student_id
    or auth.uid() in (select employer_id from public.opportunities o where o.id = opportunity_id)
  );

-- connections: either side may respond or remove
drop policy if exists conn_insert on public.connections;
drop policy if exists conn_update on public.connections;
drop policy if exists conn_delete on public.connections;
create policy conn_insert on public.connections for insert to authenticated
  with check (auth.uid() = requester_id);
create policy conn_update on public.connections for update to authenticated
  using (auth.uid() in (requester_id, addressee_id));
create policy conn_delete on public.connections for delete to authenticated
  using (auth.uid() in (requester_id, addressee_id));

-- ============ 10. STORAGE ============

insert into storage.buckets (id, name, public) values
  ('avatars',  'avatars',  true),
  ('logos',    'logos',    true),
  ('cvs',      'cvs',      false)
on conflict (id) do nothing;

-- Old PartyFinder buckets (event-images, stories, claim-documents) are removed
-- via the Storage API - direct deletes from storage.buckets are blocked.

drop policy if exists public_read on storage.objects;
create policy public_read on storage.objects for select to public
  using (bucket_id in ('avatars', 'logos'));

drop policy if exists auth_upload on storage.objects;
create policy auth_upload on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars', 'logos', 'cvs'));

drop policy if exists own_object_update on storage.objects;
create policy own_object_update on storage.objects for update to authenticated
  using (owner = auth.uid());

drop policy if exists own_object_delete on storage.objects;
create policy own_object_delete on storage.objects for delete to authenticated
  using (owner = auth.uid());

-- CVs are private: only the owner reads them.
drop policy if exists cv_read on storage.objects;
create policy cv_read on storage.objects for select to authenticated
  using (bucket_id = 'cvs' and owner = auth.uid());

-- ============ 11. SEED SKILLS ============

insert into public.skills (name, category) values
  ('JavaScript','Programming'), ('Python','Programming'), ('Java','Programming'),
  ('C#','Programming'), ('SQL','Data'), ('React','Programming'),
  ('Excel','Data'), ('Power BI','Data'), ('Data Analysis','Data'),
  ('Machine Learning','Data'), ('Networking','IT'), ('Cybersecurity','IT'),
  ('Technical Support','IT'), ('Cloud Computing','IT'), ('Git','Programming'),
  ('Project Management','Business'), ('Accounting','Business'),
  ('Marketing','Business'), ('Sales','Business'), ('Customer Service','Business'),
  ('Communication','Soft Skills'), ('Teamwork','Soft Skills'),
  ('Problem Solving','Soft Skills'), ('Time Management','Soft Skills'),
  ('Leadership','Soft Skills'), ('Adaptability','Soft Skills')
on conflict (name) do nothing;
