CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('Portero', 'Defensa', 'Centrocampista', 'Delantero')),
  real_team TEXT,
  purchase_price NUMERIC(10, 2) NOT NULL CHECK (purchase_price >= 0),
  purchase_date DATE NOT NULL,
  sale_price NUMERIC(10, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
  sale_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS players_status_idx ON players (status);
