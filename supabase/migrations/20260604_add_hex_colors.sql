create table public.hex_colors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hex_code text not null,
  project_id uuid references public.projects(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.hex_colors enable row level security;

create policy "public read hex_colors" on public.hex_colors for select using (true);
create policy "public insert hex_colors" on public.hex_colors for insert with check (true);
create policy "public update hex_colors" on public.hex_colors for update using (true);
create policy "public delete hex_colors" on public.hex_colors for delete using (true);
