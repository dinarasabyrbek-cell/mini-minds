-- Shared image cache for Elephant Stories (and future zones)
create table if not exists image_cache (
  id          uuid primary key default gen_random_uuid(),
  zone        text not null,
  book_id     text not null,
  page_index  integer not null,
  kind        text not null check (kind in ('cover', 'page')),
  image_url   text not null,
  prompt      text,
  created_at  timestamptz default now(),
  unique (zone, book_id, page_index, kind)
);

alter table image_cache enable row level security;
create policy "anon_all" on image_cache for all to anon using (true) with check (true);

