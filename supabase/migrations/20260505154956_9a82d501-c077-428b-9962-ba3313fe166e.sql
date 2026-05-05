
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  file_type text not null,
  file_url text not null,
  storage_path text not null,
  size bigint not null default 0,
  project_id uuid references public.projects(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.assets enable row level security;

create policy "public read projects" on public.projects for select using (true);
create policy "public insert projects" on public.projects for insert with check (true);
create policy "public update projects" on public.projects for update using (true);
create policy "public delete projects" on public.projects for delete using (true);

create policy "public read assets" on public.assets for select using (true);
create policy "public insert assets" on public.assets for insert with check (true);
create policy "public update assets" on public.assets for update using (true);
create policy "public delete assets" on public.assets for delete using (true);

insert into storage.buckets (id, name, public) values ('assets', 'assets', true);

create policy "public read assets bucket" on storage.objects for select using (bucket_id = 'assets');
create policy "public upload assets bucket" on storage.objects for insert with check (bucket_id = 'assets');
create policy "public update assets bucket" on storage.objects for update using (bucket_id = 'assets');
create policy "public delete assets bucket" on storage.objects for delete using (bucket_id = 'assets');
