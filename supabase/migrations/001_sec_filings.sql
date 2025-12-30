-- SEC Filings table
CREATE TABLE IF NOT EXISTS sec_filings (
  id TEXT PRIMARY KEY,                    -- Accession number (e.g., 0001730168-24-000139)
  cik TEXT NOT NULL,
  company_name TEXT NOT NULL,
  ticker TEXT,
  form_type TEXT NOT NULL,
  filed_at TIMESTAMPTZ NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'backfill', -- 'rss', 'daily_index', 'backfill'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_filings_filed_at ON sec_filings(filed_at DESC);
CREATE INDEX IF NOT EXISTS idx_filings_form_type ON sec_filings(form_type);
CREATE INDEX IF NOT EXISTS idx_filings_cik ON sec_filings(cik);
CREATE INDEX IF NOT EXISTS idx_filings_company ON sec_filings(company_name);
CREATE INDEX IF NOT EXISTS idx_filings_source ON sec_filings(source);

-- Backfill job tracking table
CREATE TABLE IF NOT EXISTS sec_backfill_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,                 -- 'daily', 'range', 'quarter'
  target_date DATE,                       -- For single day jobs
  target_quarter TEXT,                    -- e.g., '2024-Q4'
  start_date DATE,                        -- For range jobs
  end_date DATE,                          -- For range jobs
  form_types TEXT[],                      -- Filter: ['10-K', '10-Q']
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, cancelled
  progress JSONB DEFAULT '{"processed": 0, "total": 0, "errors": [], "filingsAdded": 0}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for job queries
CREATE INDEX IF NOT EXISTS idx_backfill_jobs_status ON sec_backfill_jobs(status);
CREATE INDEX IF NOT EXISTS idx_backfill_jobs_created ON sec_backfill_jobs(created_at DESC);

-- Function to get form type counts
CREATE OR REPLACE FUNCTION get_form_type_counts()
RETURNS TABLE(form_type TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sf.form_type,
    COUNT(*)::BIGINT as count
  FROM sec_filings sf
  GROUP BY sf.form_type
  ORDER BY count DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (optional, for future use)
ALTER TABLE sec_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sec_backfill_jobs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to sec_filings" ON sec_filings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to sec_backfill_jobs" ON sec_backfill_jobs
  FOR ALL USING (true) WITH CHECK (true);
