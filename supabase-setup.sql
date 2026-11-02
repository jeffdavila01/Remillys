-- Run in Supabase SQL Editor. Use Supabase email/password Auth.
-- No owner password is embedded in the website.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null,
 full_name text not null default '',
 role text not null default 'staff' check (role in ('owner','staff')),
 status text not null default 'pending' check (status in ('pending','approved','disabled')),
 permissions jsonb not null default '{"dashboard":false,"reports":false,"documents":false,"report_codes":[]}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists idx_profiles_status on public.profiles(status);

create or replace function public.new_user_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,email,full_name)
 values (new.id,coalesce(new.email,''),left(coalesce(new.raw_user_meta_data->>'full_name',''),160))
 on conflict (id) do nothing;
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.new_user_profile();

-- Backfill any existing registered accounts (they stay pending staff by default).
insert into public.profiles(id,email,full_name)
select id,coalesce(email,''),left(coalesce(raw_user_meta_data->>'full_name',''),160) from auth.users
on conflict (id) do nothing;

create or replace function public.is_remillys_owner()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='owner' and p.status='approved');
$$;
revoke all on function public.is_remillys_owner() from public;
grant execute on function public.is_remillys_owner() to authenticated;

alter table public.profiles enable row level security;
drop policy if exists "read self or owner" on public.profiles;
create policy "read self or owner" on public.profiles for select to authenticated
using (id=auth.uid() or public.is_remillys_owner());
drop policy if exists "owner manages staff" on public.profiles;
create policy "owner manages staff" on public.profiles for update to authenticated
using (public.is_remillys_owner() and role='staff')
with check (public.is_remillys_owner() and role='staff');
-- Users cannot insert, delete, promote themselves, or edit profiles via client APIs.
revoke all on public.profiles from anon;
revoke insert,delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
-- Owner can update only status and permissions. Not role or other account fields.
revoke update on public.profiles from authenticated;
grant update(status,permissions) on public.profiles to authenticated;

-- AFTER you register your owner's email in the website (email should be verified),
-- run this once in SQL Editor, replacing the email with your actual email:
-- update public.profiles set role='owner', status='approved',
-- permissions='{"dashboard":true,"reports":true,"documents":true,"report_codes":["0619E","1601E","2550M","2550Q","1601C","Sales Declaration"]}'::jsonb
-- where id=(select id from auth.users where email='YOUR_OWNER_EMAIL@example.com');
-- IMPORTANT: perform this using Supabase SQL Editor, never in browser JavaScript.
