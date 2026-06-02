create table public.hex_codes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hex text not null,
  project_id uuid references public.projects(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.hex_codes enable row level security;

create policy "public read hex_codes" on public.hex_codes for select using (true);
create policy "public insert hex_codes" on public.hex_codes for insert with check (true);
create policy "public update hex_codes" on public.hex_codes for update using (true);
create policy "public delete hex_codes" on public.hex_codes for delete using (true);

-- ADDED: Ensure the API has permission to see and interact with the table
GRANT ALL ON public.hex_codes TO anon, authenticated, service_role;

-- ADDED: Force the Supabase API to reload its schema cache so it knows the table exists
NOTIFY pgrst, 'reload schema';
