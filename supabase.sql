create extension if not exists pgcrypto;

create table if not exists settings (
  key text primary key,
  value jsonb not null
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  mobile text not null,
  email text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  month text not null,
  amount numeric(12,2) not null,
  paid_at timestamptz not null default now(),
  unique(member_id, month)
);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  program_name text not null,
  event_date date,
  cost numeric(12,2) not null default 0,
  received numeric(12,2) not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  audience text not null,
  recipients integer not null default 0,
  sent_at timestamptz,
  status text not null,
  error text
);

insert into settings(key,value)
values('monthly_fee','100')
on conflict(key) do nothing;

insert into achievements(year,title,description)
select '2026','KFA Royal Trophy Winners','KFA Royal Trophy winners in 2026.'
where not exists (select 1 from achievements where title='KFA Royal Trophy Winners');

insert into achievements(year,title,description)
select '2015–16','KFA League Runner Up','Runner-up in the KFA League 2015–16.'
where not exists (select 1 from achievements where title='KFA League Runner Up');

insert into achievements(year,title,description)
select '2021','FIT India Freedom Run 2.0','Successfully organized the FIT India Freedom Run 2.0 from 13 August to 2 October 2021.'
where not exists (select 1 from achievements where title='FIT India Freedom Run 2.0');

insert into achievements(year,title,description)
select '2022','73rd Republic Day Certificate of Commitment','Certificate of Commitment issued for showing solidarity for the 73rd Republic Day.'
where not exists (select 1 from achievements where title='73rd Republic Day Certificate of Commitment');

insert into achievements(year,title,description)
select 'Certificate','Central Vigilance Commission Certificate of Commitment','Certificate confirming adoption of the Integrity Pledge and commitment to integrity and good governance.'
where not exists (select 1 from achievements where title='Central Vigilance Commission Certificate of Commitment');

insert into achievements(year,title,description)
select 'Certificate','FIT India Certificate of Recognition','Certificate recognizing the club as a FIT INDIA Youth Club and its eligibility to use the FIT INDIA flag and logo.'
where not exists (select 1 from achievements where title='FIT India Certificate of Recognition');
