-- Postgres schema for Wahab Ahmad portfolio
create table if not exists site_store (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- Ensure main row exists
insert into site_store (id, data) values ('main', '{}'::jsonb) on conflict (id) do nothing;

-- Backup example:
-- pg_dump --table=site_store $DATABASE_URL > backup.sql
