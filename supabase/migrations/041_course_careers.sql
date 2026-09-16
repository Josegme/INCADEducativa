-- ============================================================
-- INCADEducativa — 041: course_careers N:M + campos de plan
-- ============================================================
-- Un curso puede vivir en varios planes. Se conserva courses.carrera_id
-- como denormalización de compatibilidad (backfill + trigger).

alter table public.careers
  add column if not exists plan_version text,
  add column if not exists resolucion text,
  add column if not exists duracion_anios numeric(3,1),
  add column if not exists titulo_otorga text;

create table if not exists public.course_careers (
  course_id uuid not null references public.courses(id) on delete cascade,
  career_id uuid not null references public.careers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (course_id, career_id)
);

insert into public.course_careers (course_id, career_id)
select id, carrera_id
from public.courses
where carrera_id is not null
on conflict do nothing;

create or replace function public.sync_course_career_compat()
returns trigger as $$
begin
  if tg_op = 'INSERT' and new.carrera_id is not null then
    insert into public.course_careers (course_id, career_id)
    values (new.id, new.carrera_id)
    on conflict do nothing;
  elsif tg_op = 'UPDATE' and new.carrera_id is distinct from old.carrera_id then
    if old.carrera_id is not null then
      delete from public.course_careers
      where course_id = new.id and career_id = old.carrera_id;
    end if;
    if new.carrera_id is not null then
      insert into public.course_careers (course_id, career_id)
      values (new.id, new.carrera_id)
      on conflict do nothing;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_sync_course_career_compat on public.courses;
create trigger trg_sync_course_career_compat
after insert or update of carrera_id on public.courses
for each row execute function public.sync_course_career_compat();

alter table public.course_careers enable row level security;

create policy course_careers_select on public.course_careers
  for select using (true);

create policy course_careers_admin on public.course_careers
  for all using (public.is_admin()) with check (public.is_admin());
