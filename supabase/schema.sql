-- GolfHeroes — run in Supabase SQL Editor.
-- Order: charities → profiles → dependent tables → indexes → RLS.

-- ── CHARITIES ───────────────────────────────────────────────────────────
create table if not exists public.charities (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  images text[] default '{}',
  events jsonb default '[]',
  featured boolean default false,
  created_at timestamptz default now()
);

-- ── PROFILES (extends auth.users) ──────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive' check (
    subscription_status in ('active', 'trialing', 'cancelled', 'lapsed', 'inactive')
  ),
  subscription_plan text check (subscription_plan in ('monthly', 'yearly')),
  subscription_expiry timestamptz,
  charity_id uuid references public.charities(id),
  contribution_percent integer default 10 check (contribution_percent >= 10 and contribution_percent <= 100),
  country text default 'IE',
  currency text default 'EUR',
  account_type text default 'individual' check (account_type in ('individual', 'corporate')),
  created_at timestamptz default now()
);

-- ── SCORES ───────────────────────────────────────────────────────────────
create table if not exists public.scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  value integer not null check (value >= 1 and value <= 45),
  score_date date not null,
  created_at timestamptz default now(),
  unique(user_id, score_date)
);

-- ── DRAWS ───────────────────────────────────────────────────────────────
create table if not exists public.draws (
  id uuid default gen_random_uuid() primary key,
  month integer not null check (month >= 1 and month <= 12),
  year integer not null,
  status text default 'draft' check (status in ('draft', 'simulated', 'published')),
  draw_type text check (draw_type in ('random', 'algorithmic')),
  algorithmic_bias text default 'most',
  numbers integer[],
  prize_pool_total numeric(12, 2) default 0,
  prize_pool_first numeric(12, 2) default 0,
  prize_pool_second numeric(12, 2) default 0,
  prize_pool_third numeric(12, 2) default 0,
  jackpot_rollover numeric(12, 2) default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  unique(month, year)
);

-- ── DRAW RESULTS ───────────────────────────────────────────────────────
create table if not exists public.draw_results (
  id uuid default gen_random_uuid() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_tier integer not null check (match_tier in (3, 4, 5)),
  prize_amount numeric(12, 2) not null,
  created_at timestamptz default now()
);

-- ── WINNERS ────────────────────────────────────────────────────────────
create table if not exists public.winners (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  draw_result_id uuid references public.draw_results(id) on delete cascade not null,
  proof_url text,
  proof_public_id text,
  verification_status text default 'pending' check (
    verification_status in ('pending', 'uploaded', 'approved', 'rejected')
  ),
  payout_status text default 'pending' check (payout_status in ('pending', 'paid')),
  admin_notes text,
  created_at timestamptz default now()
);

-- ── CHARITY CONTRIBUTIONS ───────────────────────────────────────────────
create table if not exists public.charity_contributions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  charity_id uuid references public.charities(id) not null,
  amount numeric(12, 2) not null,
  contribution_type text check (contribution_type in ('subscription', 'independent')),
  created_at timestamptz default now()
);

-- ── INDEXES ───────────────────────────────────────────────────────────
create index if not exists idx_scores_user_date on public.scores(user_id, score_date desc);
create index if not exists idx_profiles_stripe on public.profiles(stripe_customer_id);
create index if not exists idx_profiles_status on public.profiles(subscription_status);
create index if not exists idx_draws_status on public.draws(status, year desc, month desc);
create index if not exists idx_charities_featured on public.charities(featured);

-- ── RLS ─────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.scores enable row level security;
alter table public.charities enable row level security;
alter table public.draws enable row level security;
alter table public.draw_results enable row level security;
alter table public.winners enable row level security;
alter table public.charity_contributions enable row level security;

drop policy if exists "Users view own profile" on public.profiles;
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users manage own scores" on public.scores;
create policy "Users manage own scores" on public.scores for all using (auth.uid() = user_id);

drop policy if exists "Public view charities" on public.charities;
create policy "Public view charities" on public.charities for select using (true);

drop policy if exists "Public view published draws" on public.draws;
create policy "Public view published draws" on public.draws for select using (status = 'published');

drop policy if exists "Users view own winnings" on public.winners;
create policy "Users view own winnings" on public.winners for select using (auth.uid() = user_id);

drop policy if exists "Users view own contributions" on public.charity_contributions;
create policy "Users view own contributions" on public.charity_contributions for select using (auth.uid() = user_id);
