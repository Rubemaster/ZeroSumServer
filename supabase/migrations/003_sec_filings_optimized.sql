-- Optimized SEC Filings Schema
-- Reduces storage from ~150 bytes/row to ~20 bytes/row
-- Estimated: 20M filings = ~400MB data + ~400MB indexes = ~800MB total

-- Lookup table for form types (10-K, 8-K, 424B2, etc.)
CREATE TABLE IF NOT EXISTS sec_form_types (
  id SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  code VARCHAR(20) NOT NULL UNIQUE
);

-- Lookup table for file extensions
CREATE TABLE IF NOT EXISTS sec_file_extensions (
  id SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ext VARCHAR(10) NOT NULL UNIQUE
);

-- Companies table (CIK -> name mapping)
CREATE TABLE IF NOT EXISTS sec_companies (
  cik INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

-- Optimized filings table
-- Accession format: 0000950103-25-012593 -> (filer: 950103, seq: 12593)
-- Year is derived from filed_date in the view
CREATE TABLE IF NOT EXISTS sec_filings (
  cik INTEGER NOT NULL,
  form_type_id SMALLINT NOT NULL REFERENCES sec_form_types(id),
  filed_date SMALLINT NOT NULL,           -- Days since 1970-01-01 (valid until 2059)
  accession_filer BIGINT NOT NULL,        -- First part: 0000950103 -> 950103
  accession_seq INTEGER NOT NULL,         -- Last part: 012593 -> 12593
  ext_id SMALLINT NOT NULL REFERENCES sec_file_extensions(id),

  -- Composite primary key
  PRIMARY KEY (filed_date, accession_filer, accession_seq)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_filings_cik ON sec_filings(cik);
CREATE INDEX IF NOT EXISTS idx_filings_date ON sec_filings(filed_date DESC);
CREATE INDEX IF NOT EXISTS idx_filings_form ON sec_filings(form_type_id);
CREATE INDEX IF NOT EXISTS idx_filings_cik_date ON sec_filings(cik, filed_date DESC);

-- Index on companies name for search
CREATE INDEX IF NOT EXISTS idx_companies_name ON sec_companies USING gin(to_tsvector('english', name));

-- Pre-populate common file extensions
INSERT INTO sec_file_extensions (ext) VALUES
  ('txt'), ('htm'), ('html'), ('xml'), ('xsd'), ('json'), ('pdf')
ON CONFLICT (ext) DO NOTHING;

-- Helper function: Convert YYYYMMDD integer to days since epoch
CREATE OR REPLACE FUNCTION date_to_epoch_days(yyyymmdd INTEGER)
RETURNS SMALLINT AS $$
BEGIN
  RETURN ((make_date(yyyymmdd / 10000, (yyyymmdd / 100) % 100, yyyymmdd % 100) - '1970-01-01'::date))::SMALLINT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function: Convert days since epoch to DATE
CREATE OR REPLACE FUNCTION epoch_days_to_date(days SMALLINT)
RETURNS DATE AS $$
BEGIN
  RETURN '1970-01-01'::date + days;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function: Get or create form type ID
CREATE OR REPLACE FUNCTION get_or_create_form_type(form_code VARCHAR(20))
RETURNS SMALLINT AS $$
DECLARE
  type_id SMALLINT;
BEGIN
  SELECT id INTO type_id FROM sec_form_types WHERE code = form_code;
  IF type_id IS NULL THEN
    INSERT INTO sec_form_types (code) VALUES (form_code)
    ON CONFLICT (code) DO NOTHING
    RETURNING id INTO type_id;
    -- If still null (race condition), fetch again
    IF type_id IS NULL THEN
      SELECT id INTO type_id FROM sec_form_types WHERE code = form_code;
    END IF;
  END IF;
  RETURN type_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function: Get or create file extension ID
CREATE OR REPLACE FUNCTION get_or_create_extension(file_ext VARCHAR(10))
RETURNS SMALLINT AS $$
DECLARE
  ext_id SMALLINT;
BEGIN
  SELECT id INTO ext_id FROM sec_file_extensions WHERE ext = file_ext;
  IF ext_id IS NULL THEN
    INSERT INTO sec_file_extensions (ext) VALUES (file_ext)
    ON CONFLICT (ext) DO NOTHING
    RETURNING id INTO ext_id;
    IF ext_id IS NULL THEN
      SELECT id INTO ext_id FROM sec_file_extensions WHERE ext = file_ext;
    END IF;
  END IF;
  RETURN ext_id;
END;
$$ LANGUAGE plpgsql;

-- View to reconstruct full filing data for queries
-- Year is derived from filed_date (mod 100 to get 2-digit year)
CREATE OR REPLACE VIEW sec_filings_view AS
SELECT
  f.cik,
  c.name AS company_name,
  ft.code AS form_type,
  epoch_days_to_date(f.filed_date) AS filed_date,
  LPAD(f.accession_filer::TEXT, 10, '0') || '-' ||
    LPAD((EXTRACT(YEAR FROM epoch_days_to_date(f.filed_date))::INTEGER % 100)::TEXT, 2, '0') || '-' ||
    LPAD(f.accession_seq::TEXT, 6, '0') AS accession_number,
  'edgar/data/' || f.cik || '/' ||
    LPAD(f.accession_filer::TEXT, 10, '0') || '-' ||
    LPAD((EXTRACT(YEAR FROM epoch_days_to_date(f.filed_date))::INTEGER % 100)::TEXT, 2, '0') || '-' ||
    LPAD(f.accession_seq::TEXT, 6, '0') || '.' || e.ext AS file_path
FROM sec_filings f
JOIN sec_companies c ON f.cik = c.cik
JOIN sec_form_types ft ON f.form_type_id = ft.id
JOIN sec_file_extensions e ON f.ext_id = e.id;

-- Enable Row Level Security
ALTER TABLE sec_form_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sec_file_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sec_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sec_filings ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to sec_form_types" ON sec_form_types
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to sec_file_extensions" ON sec_file_extensions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to sec_companies" ON sec_companies
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to sec_filings" ON sec_filings
  FOR ALL USING (true) WITH CHECK (true);
