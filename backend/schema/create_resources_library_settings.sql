-- OMAPI only. Run this against ciprabem_omapi_portal, never against the Cabinet database.
-- This script creates empty API-backed collections. It neither reads nor changes browser localStorage.

CREATE TABLE IF NOT EXISTS content_forms (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category VARCHAR(30) NOT NULL CHECK (category IN ('Marques', 'Brevets', 'Dessins', 'Autres')),
  file_url TEXT NOT NULL,
  file_name VARCHAR(120) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_guides (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_name VARCHAR(30) NOT NULL CHECK (icon_name IN ('tag', 'bulb', 'swatch', 'book', 'globe', 'banknotes')),
  points JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(points) = 'array'),
  color_theme VARCHAR(30) NOT NULL CHECK (color_theme IN ('blue', 'amber', 'purple', 'emerald', 'orange', 'gray')),
  file_url TEXT NOT NULL,
  file_name VARCHAR(120) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_legislation (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(240) NOT NULL,
  category VARCHAR(30) NOT NULL CHECK (category IN ('Fondamental', 'Application', 'Autre')),
  type VARCHAR(30) NOT NULL CHECK (type IN ('Loi', 'Ordonnance', 'Décret', 'Arrêté', 'Autre')),
  display_date VARCHAR(100) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL,
  file_name VARCHAR(120) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(60) PRIMARY KEY CHECK (setting_key IN ('site_config', 'home_resources')),
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_forms_category_idx ON content_forms (category, id);
CREATE INDEX IF NOT EXISTS content_guides_id_idx ON content_guides (id);
CREATE INDEX IF NOT EXISTS content_legislation_category_idx ON content_legislation (category, id);
