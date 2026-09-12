create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  email text not null check (
    char_length(trim(email)) between 3 and 254
    and trim(email) ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  phone text not null check (
    char_length(trim(phone)) between 7 and 30
    and trim(phone) ~ '^[0-9+()[:space:]-]{7,30}$'
  ),
  service text not null check (char_length(trim(service)) between 1 and 80),
  notes text not null check (char_length(trim(notes)) between 10 and 600),
  status text not null default 'pending' check (status in ('pending', 'followed_up', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.booking_requests enable row level security;

grant insert on public.booking_requests to anon;
grant select, update on public.booking_requests to authenticated;

create policy "Anonymous users can submit pending booking requests"
on public.booking_requests
for insert
to anon
with check (status = 'pending');

create policy "Review admins can read booking requests"
on public.booking_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.review_admins
    where review_admins.user_id = auth.uid()
  )
);

create policy "Review admins can update booking requests"
on public.booking_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.review_admins
    where review_admins.user_id = auth.uid()
  )
)
with check (
  status in ('pending', 'followed_up', 'closed')
  and exists (
    select 1
    from public.review_admins
    where review_admins.user_id = auth.uid()
  )
);
