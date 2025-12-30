-- SEC Daily Indices table
-- Stores metadata about SEC daily index files for quick lookups
CREATE TABLE IF NOT EXISTS sec_daily_indices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_date DATE NOT NULL UNIQUE,           -- The date of the index file (e.g., 2025-01-15)
  year INTEGER NOT NULL,                      -- Year extracted for quick filtering
  quarter INTEGER NOT NULL,                   -- Quarter (1-4) extracted for quick filtering
  url TEXT NOT NULL,                          -- Full URL to the index file
  status TEXT NOT NULL DEFAULT 'pending',     -- pending, downloaded, failed, not_available
  filing_count INTEGER,                       -- Number of filings in this index (after download)
  file_size INTEGER,                          -- Size of the index file in bytes
  downloaded_at TIMESTAMPTZ,                  -- When the index was successfully downloaded
  error_message TEXT,                         -- Error message if download failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_daily_indices_date ON sec_daily_indices(index_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_indices_status ON sec_daily_indices(status);
CREATE INDEX IF NOT EXISTS idx_daily_indices_year ON sec_daily_indices(year);
CREATE INDEX IF NOT EXISTS idx_daily_indices_quarter ON sec_daily_indices(year, quarter);

-- SEC Daily Index sync jobs table
CREATE TABLE IF NOT EXISTS sec_daily_index_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,                     -- 'sync_available', 'download_range', 'download_single'
  start_date DATE,                            -- For range jobs
  end_date DATE,                              -- For range jobs
  target_date DATE,                           -- For single date jobs
  status TEXT NOT NULL DEFAULT 'pending',     -- pending, running, completed, failed, cancelled
  progress JSONB DEFAULT '{"processed": 0, "total": 0, "downloaded": 0, "errors": []}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for job queries
CREATE INDEX IF NOT EXISTS idx_daily_index_sync_jobs_status ON sec_daily_index_sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_daily_index_sync_jobs_created ON sec_daily_index_sync_jobs(created_at DESC);

-- Function to get daily index stats
CREATE OR REPLACE FUNCTION get_daily_index_stats()
RETURNS TABLE(
  total_count BIGINT,
  pending_count BIGINT,
  downloaded_count BIGINT,
  failed_count BIGINT,
  not_available_count BIGINT,
  oldest_date DATE,
  newest_date DATE,
  total_filings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_count,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_count,
    COUNT(*) FILTER (WHERE status = 'downloaded')::BIGINT as downloaded_count,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_count,
    COUNT(*) FILTER (WHERE status = 'not_available')::BIGINT as not_available_count,
    MIN(index_date) as oldest_date,
    MAX(index_date) as newest_date,
    COALESCE(SUM(filing_count), 0)::BIGINT as total_filings
  FROM sec_daily_indices;
END;
$$ LANGUAGE plpgsql;

-- Function to get counts by year
CREATE OR REPLACE FUNCTION get_daily_index_counts_by_year()
RETURNS TABLE(year INTEGER, total BIGINT, downloaded BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sdi.year,
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE sdi.status = 'downloaded')::BIGINT as downloaded
  FROM sec_daily_indices sdi
  GROUP BY sdi.year
  ORDER BY sdi.year DESC;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sec_daily_indices_updated_at
  BEFORE UPDATE ON sec_daily_indices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sec_daily_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sec_daily_index_sync_jobs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to sec_daily_indices" ON sec_daily_indices
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to sec_daily_index_sync_jobs" ON sec_daily_index_sync_jobs
  FOR ALL USING (true) WITH CHECK (true);
