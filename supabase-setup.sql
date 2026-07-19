-- Run this once in Supabase: Project → SQL Editor → New query → paste → Run

create table if not exists farm_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table farm_state enable row level security;

-- Single-farm app, no login screen, so we allow the anon key full
-- access to this one table. Anyone with your site link could in
-- theory read/write this data directly via the API — acceptable for
-- a small private farm tool, but avoid sharing the link publicly.
create policy "Allow all access to farm_state"
  on farm_state for all
  using (true)
  with check (true);

insert into farm_state (id, data)
values ('main', '{"cows":[],"calves":[],"beef":[],"vaccines":[],"todos":[]}')
on conflict (id) do nothing;
