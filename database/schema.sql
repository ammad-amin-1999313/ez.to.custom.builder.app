-- ============================================================
--  EZ.to — Link-in-Bio Builder  |  Database Schema
--  Engine : PostgreSQL (Supabase)
--  Auth   : Supabase Auth (auth.users)
--  RLS    : Row-Level Security enabled on every table
-- ============================================================

-- ─────────────────────────────────────────────────────────────
--  EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- gen_random_uuid()


-- ============================================================
--  1. USERS  (profile on top of Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle          TEXT        NOT NULL UNIQUE,              -- e.g. "alexmorgan"
  first_name      TEXT        NOT NULL DEFAULT '',
  last_name       TEXT        NOT NULL DEFAULT '',
  bio             TEXT        NOT NULL DEFAULT '',
  avatar_url      TEXT,                                     -- public image URL
  email           TEXT,                                     -- synced from auth.users
  plan            TEXT        NOT NULL DEFAULT 'free'       -- 'free' | 'pro' | 'team'
                              CHECK (plan IN ('free', 'pro', 'team')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own row"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own row"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);


-- ============================================================
--  2. PAGES  (one user can have many pages)
-- ============================================================
CREATE TABLE public.pages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  handle          TEXT        NOT NULL,                   -- e.g. "alexmorgan"
  page_name       TEXT        NOT NULL DEFAULT 'My Page',
  is_published    BOOLEAN     NOT NULL DEFAULT FALSE,
  is_locked       BOOLEAN     NOT NULL DEFAULT FALSE,
  lock_password   TEXT,                                   -- hashed via pgcrypto if needed
  custom_domain   TEXT,                                   -- e.g. "alex.com"
  seo_title       TEXT,
  seo_description TEXT,
  seo_favicon     TEXT,                                   -- URL
  seo_thumbnail   TEXT,                                   -- URL (OG image)
  google_analytics_id TEXT,
  meta_pixel_id   TEXT,
  tiktok_pixel_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, handle)
);

CREATE TRIGGER trg_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can do anything on their pages"
  ON public.pages FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Published pages are publicly readable"
  ON public.pages FOR SELECT
  USING (is_published = TRUE);


-- ============================================================
--  3. APPEARANCE  (one row per page)
-- ============================================================
CREATE TABLE public.appearances (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id           UUID        NOT NULL UNIQUE REFERENCES public.pages(id) ON DELETE CASCADE,

  -- General
  theme_id          TEXT        NOT NULL DEFAULT 'minimal',
  accent_color      TEXT        NOT NULL DEFAULT '#6366f1',
  text_color        TEXT        NOT NULL DEFAULT '#111111',
  button_style      TEXT        NOT NULL DEFAULT 'rounded'
                                CHECK (button_style IN ('rounded', 'sharp', 'pill')),
  font_family       TEXT        NOT NULL DEFAULT 'Inter',

  -- Background
  bg_type           TEXT        NOT NULL DEFAULT 'flat'
                                CHECK (bg_type IN ('flat', 'gradient', 'image')),
  bg_color          TEXT        NOT NULL DEFAULT '#ffffff',
  bg_color2         TEXT        NOT NULL DEFAULT '#c7d2fe',
  bg_color3         TEXT        NOT NULL DEFAULT '#e0e7ff',
  gradient_angle    INTEGER     NOT NULL DEFAULT 135,
  bg_image_url      TEXT,
  brightness        INTEGER     NOT NULL DEFAULT 0,
  blur              NUMERIC     NOT NULL DEFAULT 0,
  noise             BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Effects
  shadow_type       TEXT        NOT NULL DEFAULT 'Soft',
  shadow_color      TEXT        NOT NULL DEFAULT '#00000008',
  animation         TEXT        NOT NULL DEFAULT 'slide-up',
  typography_font   TEXT        NOT NULL DEFAULT 'Outfit',

  -- UI Features
  scroll_to_top     BOOLEAN     NOT NULL DEFAULT FALSE,
  show_menu_button  BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Block-level styles (flexible JSON)
  block_styles      JSONB       NOT NULL DEFAULT '{}',

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_appearances_updated_at
  BEFORE UPDATE ON public.appearances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.appearances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page owner manages appearance"
  ON public.appearances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = appearances.page_id
        AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Published page appearances are public"
  ON public.appearances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = appearances.page_id
        AND pages.is_published = TRUE
    )
  );


-- ============================================================
--  4. BLOCKS  (ordered content blocks on a page)
-- ============================================================
CREATE TYPE public.block_type AS ENUM (
  'profile', 'social', 'link', 'text', 'divider',
  'photo', 'form', 'map', 'timeline', 'testimonial',
  'file', 'popup'
);

CREATE TABLE public.blocks (
  id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     UUID              NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  type        public.block_type NOT NULL,
  position    INTEGER           NOT NULL DEFAULT 0,       -- sort order
  is_visible  BOOLEAN           NOT NULL DEFAULT TRUE,
  data        JSONB             NOT NULL DEFAULT '{}',    -- block-specific content
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blocks_page_id  ON public.blocks(page_id);
CREATE INDEX idx_blocks_position ON public.blocks(page_id, position);

CREATE TRIGGER trg_blocks_updated_at
  BEFORE UPDATE ON public.blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page owner manages blocks"
  ON public.blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = blocks.page_id
        AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Published page blocks are public"
  ON public.blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = blocks.page_id
        AND pages.is_published = TRUE
    )
  );


-- ============================================================
--  5. COLOR PALETTES  (saved brand palettes per user)
-- ============================================================
CREATE TABLE public.color_palettes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,                       -- e.g. "Brand Colors"
  colors      TEXT[]      NOT NULL DEFAULT '{}',          -- hex values, max ~8
  is_global   BOOLEAN     NOT NULL DEFAULT TRUE,          -- available across all pages
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT max_colors CHECK (array_length(colors, 1) <= 12)
);

CREATE INDEX idx_color_palettes_user_id ON public.color_palettes(user_id);

CREATE TRIGGER trg_color_palettes_updated_at
  BEFORE UPDATE ON public.color_palettes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.color_palettes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own palettes"
  ON public.color_palettes FOR ALL
  USING (auth.uid() = user_id);


-- ============================================================
--  6. RECENT COLORS  (last-used colors per user, max 16)
-- ============================================================
CREATE TABLE public.recent_colors (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  colors      TEXT[]      NOT NULL DEFAULT '{}',          -- ordered newest-first, max 16
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_recent_colors_updated_at
  BEFORE UPDATE ON public.recent_colors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.recent_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own recent colors"
  ON public.recent_colors FOR ALL
  USING (auth.uid() = user_id);

-- Helper function: upsert a new color at the front, keep max 16
CREATE OR REPLACE FUNCTION public.push_recent_color(p_user_id UUID, p_color TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.recent_colors (user_id, colors)
  VALUES (p_user_id, ARRAY[p_color])
  ON CONFLICT (user_id) DO UPDATE
    SET colors = (
      SELECT ARRAY_AGG(c ORDER BY ord)
      FROM (
        SELECT p_color AS c, 0 AS ord
        UNION ALL
        SELECT UNNEST(recent_colors.colors), generate_series(1, array_length(recent_colors.colors, 1))
      ) sub
      WHERE c <> p_color OR ord = 0   -- deduplicate
      LIMIT 16
    ),
    updated_at = NOW();
END;
$$;


-- ============================================================
--  7. ANALYTICS — PAGE VIEWS
-- ============================================================
CREATE TABLE public.analytics_pageviews (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     UUID        NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  country     TEXT,                                       -- ISO 3166-1 alpha-2
  city        TEXT,
  device_type TEXT        CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  referrer    TEXT,
  user_agent  TEXT
);

CREATE INDEX idx_pv_page_id   ON public.analytics_pageviews(page_id);
CREATE INDEX idx_pv_viewed_at ON public.analytics_pageviews(viewed_at DESC);

-- RLS: owners read, anyone can insert (public tracking)
ALTER TABLE public.analytics_pageviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a pageview"
  ON public.analytics_pageviews FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Page owner reads pageviews"
  ON public.analytics_pageviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = analytics_pageviews.page_id
        AND pages.user_id = auth.uid()
    )
  );


-- ============================================================
--  8. ANALYTICS — LINK CLICKS
-- ============================================================
CREATE TABLE public.analytics_link_clicks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     UUID        NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  block_id    UUID        REFERENCES public.blocks(id) ON DELETE SET NULL,
  label       TEXT,                                       -- link label shown to visitor
  url         TEXT,                                       -- destination URL
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  country     TEXT,
  device_type TEXT        CHECK (device_type IN ('mobile', 'tablet', 'desktop'))
);

CREATE INDEX idx_lc_page_id    ON public.analytics_link_clicks(page_id);
CREATE INDEX idx_lc_block_id   ON public.analytics_link_clicks(block_id);
CREATE INDEX idx_lc_clicked_at ON public.analytics_link_clicks(clicked_at DESC);

-- RLS
ALTER TABLE public.analytics_link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert a click"
  ON public.analytics_link_clicks FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Page owner reads clicks"
  ON public.analytics_link_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = analytics_link_clicks.page_id
        AND pages.user_id = auth.uid()
    )
  );


-- ============================================================
--  9. ANALYTICS — DAILY AGGREGATES  (materialized for speed)
-- ============================================================
CREATE TABLE public.analytics_daily (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id      UUID    NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  date         DATE    NOT NULL,
  total_views  INTEGER NOT NULL DEFAULT 0,
  unique_views INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,

  UNIQUE (page_id, date)
);

CREATE INDEX idx_ad_page_date ON public.analytics_daily(page_id, date DESC);

-- RLS
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Page owner reads daily analytics"
  ON public.analytics_daily FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = analytics_daily.page_id
        AND pages.user_id = auth.uid()
    )
  );


-- ============================================================
--  10. THEMES  (optional: shared / marketplace themes)
-- ============================================================
CREATE TABLE public.themes (
  id              TEXT        PRIMARY KEY,               -- slug e.g. "midnight"
  name            TEXT        NOT NULL,
  description     TEXT,
  tag             TEXT,                                  -- 'Light' | 'Dark' | 'Gradient'
  bg_color        TEXT        NOT NULL DEFAULT '#ffffff',
  bg_color2       TEXT        NOT NULL DEFAULT '#ffffff',
  bg_color3       TEXT        NOT NULL DEFAULT '#ffffff',
  text_color      TEXT        NOT NULL DEFAULT '#111111',
  accent_color    TEXT        NOT NULL DEFAULT '#6366f1',
  button_style    TEXT        NOT NULL DEFAULT 'rounded',
  bg_type         TEXT        NOT NULL DEFAULT 'flat',
  gradient_angle  INTEGER     NOT NULL DEFAULT 135,
  is_premium      BOOLEAN     NOT NULL DEFAULT FALSE,
  preview_url     TEXT,                                  -- thumbnail image
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public read — no RLS needed (themes are global)
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Themes are publicly readable"
  ON public.themes FOR SELECT
  USING (TRUE);


-- ============================================================
--  HELPFUL VIEWS
-- ============================================================

-- v_page_stats: quick summary per page
CREATE VIEW public.v_page_stats AS
SELECT
  p.id                                              AS page_id,
  p.user_id,
  p.handle,
  COUNT(DISTINCT pv.id)                             AS total_views,
  COUNT(DISTINCT lc.id)                             AS total_clicks,
  MAX(pv.viewed_at)                                 AS last_viewed_at
FROM public.pages p
LEFT JOIN public.analytics_pageviews pv ON pv.page_id = p.id
LEFT JOIN public.analytics_link_clicks lc ON lc.page_id = p.id
GROUP BY p.id, p.user_id, p.handle;

-- v_top_links: most-clicked blocks per page
CREATE VIEW public.v_top_links AS
SELECT
  lc.page_id,
  lc.block_id,
  lc.label,
  lc.url,
  COUNT(*) AS click_count
FROM public.analytics_link_clicks lc
GROUP BY lc.page_id, lc.block_id, lc.label, lc.url
ORDER BY click_count DESC;


-- ============================================================
--  STORAGE BUCKETS  (Supabase Storage)
-- ============================================================
-- Run these in the Supabase Dashboard → Storage or via API:
--
--   INSERT INTO storage.buckets (id, name, public) VALUES ('avatars',    'avatars',    TRUE);
--   INSERT INTO storage.buckets (id, name, public) VALUES ('bg-images',  'bg-images',  TRUE);
--   INSERT INTO storage.buckets (id, name, public) VALUES ('page-assets','page-assets',TRUE);
--
-- Storage RLS (avatar uploads):
--   CREATE POLICY "Users upload own avatar"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
--
--   CREATE POLICY "Avatars are public"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'avatars');


-- ============================================================
--  SEED: DEFAULT THEMES
-- ============================================================
INSERT INTO public.themes (id, name, description, tag, bg_color, bg_color2, bg_color3, text_color, accent_color, button_style, bg_type, gradient_angle) VALUES
  ('minimal',   'Minimal',   'Clean white canvas',      'Light',    '#ffffff', '#f3f4f6', '#e5e7eb', '#111111', '#111111', 'rounded', 'flat',     135),
  ('midnight',  'Midnight',  'Sleek dark mode',         'Dark',     '#0a0a0a', '#1a1a2e', '#16213e', '#f5f5f5', '#a855f7', 'rounded', 'flat',     135),
  ('ocean',     'Ocean',     'Cool blue gradient',      'Gradient', '#0f1f3d', '#1e3a5f', '#1e3a8a', '#e2e8f0', '#38bdf8', 'pill',    'gradient', 160),
  ('sunset',    'Sunset',    'Warm orange glow',        'Gradient', '#1a0800', '#7c2d12', '#881337', '#fef3e2', '#f97316', 'pill',    'gradient', 150),
  ('forest',    'Forest',    'Nature & calm',           'Gradient', '#052e16', '#064e3b', '#134e4a', '#dcfce7', '#4ade80', 'rounded', 'gradient', 160),
  ('neon',      'Neon',      'Vibrant & electric',      'Dark',     '#09090b', '#0e7490', '#0284c7', '#fafafa', '#22d3ee', 'sharp',   'flat',     135),
  ('lavender',  'Lavender',  'Soft & elegant',          'Light',    '#faf5ff', '#f3e8ff', '#fdf4ff', '#4a044e', '#a855f7', 'pill',    'gradient', 140),
  ('sand',      'Sand',      'Warm & minimal',          'Light',    '#fef9f0', '#fef3c7', '#fde68a', '#292524', '#d97706', 'rounded', 'flat',     135),
  ('aurora',    'Aurora',    'Northern lights',         'Dark',     '#030712', '#064e3b', '#1e3a5f', '#f0fdf4', '#34d399', 'pill',    'gradient', 135),
  ('rose',      'Rose',      'Romantic & soft',         'Light',    '#fff1f2', '#ffe4e6', '#fecdd3', '#881337', '#f43f5e', 'pill',    'gradient', 140),
  ('slate',     'Slate',     'Professional & clean',    'Dark',     '#0f172a', '#1e293b', '#334155', '#e2e8f0', '#64748b', 'rounded', 'flat',     135),
  ('copper',    'Copper',    'Rich & metallic',         'Dark',     '#1c0a00', '#431407', '#7c2d12', '#fef3e2', '#b45309', 'rounded', 'gradient', 145)
ON CONFLICT (id) DO NOTHING;
