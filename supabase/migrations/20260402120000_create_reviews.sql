create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(trim(comment)) between 10 and 600),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

grant select, insert on public.reviews to anon;

create policy "Public can read approved reviews"
on public.reviews
for select
to anon
using (status = 'approved');

create policy "Anonymous users can submit pending reviews"
on public.reviews
for insert
to anon
with check (status = 'pending');
