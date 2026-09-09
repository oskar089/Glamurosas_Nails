create table public.review_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.review_admins enable row level security;

grant select on public.review_admins to authenticated;
grant select, update on public.reviews to authenticated;

create policy "Review admins can read their admin record"
on public.review_admins
for select
to authenticated
using (user_id = auth.uid());

create policy "Review admins can read all reviews"
on public.reviews
for select
to authenticated
using (
  exists (
    select 1
    from public.review_admins
    where review_admins.user_id = auth.uid()
  )
);

create policy "Review admins can moderate reviews"
on public.reviews
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
  status in ('approved', 'rejected')
  and exists (
    select 1
    from public.review_admins
    where review_admins.user_id = auth.uid()
  )
);
