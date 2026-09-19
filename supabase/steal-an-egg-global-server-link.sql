alter table public.shop_settings
  add column if not exists steal_an_egg_server_url text;

comment on column public.shop_settings.steal_an_egg_server_url is
  'Default Roblox private-server invitation shown to all Steal an Egg customers after account selection.';