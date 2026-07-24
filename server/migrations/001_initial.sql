BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('OWNER', 'ADMIN')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  sku text NOT NULL UNIQUE,
  name text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  summary text NOT NULL,
  description text NOT NULL,
  material text NOT NULL,
  dimensions text NOT NULL,
  weight text NOT NULL,
  specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  use_cases jsonb NOT NULL DEFAULT '[]'::jsonb,
  price bigint NOT NULL CHECK (price >= 0),
  price_visible boolean NOT NULL DEFAULT false,
  lead_time text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'draft')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_status_category_idx
  ON products (status, category);

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, sort_order)
);

CREATE TABLE IF NOT EXISTS inquiries (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_wechat text,
  customer_company text,
  customer_address text,
  customer_email text,
  customer_note text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'won', 'closed')),
  internal_note text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inquiries_status_submitted_idx
  ON inquiries (status, submitted_at DESC);

CREATE TABLE IF NOT EXISTS inquiry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id text NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  product_id text REFERENCES products(id) ON DELETE SET NULL,
  slug text NOT NULL,
  sku text NOT NULL,
  product_name text NOT NULL,
  image_url text NOT NULL,
  specification text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price bigint NOT NULL CHECK (unit_price >= 0),
  note text
);

CREATE INDEX IF NOT EXISTS inquiry_items_inquiry_idx
  ON inquiry_items (inquiry_id);

CREATE TABLE IF NOT EXISTS site_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  brand_name text NOT NULL,
  legal_name text NOT NULL,
  logo_url text NOT NULL,
  phone text NOT NULL,
  wechat text NOT NULL,
  email text NOT NULL,
  qr_code_url text NOT NULL,
  quote_title text NOT NULL,
  quote_validity_days integer NOT NULL CHECK (quote_validity_days > 0),
  default_sales_note text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_config (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  maintenance_mode boolean NOT NULL DEFAULT false,
  environment_label text NOT NULL DEFAULT 'PRODUCTION',
  api_base_url text NOT NULL DEFAULT '/api',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  sid varchar NOT NULL PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS user_sessions_expire_idx ON user_sessions (expire);

COMMIT;
