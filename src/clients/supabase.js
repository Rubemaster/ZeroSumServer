const { createClient } = require('@supabase/supabase-js');
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

// File to store the database connection string
const DB_CONNECTION_FILE = path.join(__dirname, '../../.db-connection');

class SupabaseClient {
  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      console.warn('Supabase credentials not configured - database features disabled');
      this.client = null;
      return;
    }

    this.client = createClient(url, key);

    // Extract project ref for direct postgres connection
    this.projectRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  }

  // Create a postgres connection with provided connection string
  createPostgresConnection(connectionString) {
    if (!connectionString) return null;
    return postgres(connectionString, { ssl: 'require' });
  }

  // Get or create a persistent postgres connection pool
  getPooledConnection() {
    if (this._pool) return this._pool;

    const connectionString = this.loadConnectionString();
    if (!connectionString) {
      throw new Error('No database connection string configured. Please run setup first.');
    }

    // Create a pooled connection that stays open
    this._pool = postgres(connectionString, {
      ssl: 'require',
      max: 10,  // max connections in pool
      idle_timeout: 30  // close idle connections after 30s
    });

    return this._pool;
  }

  // Get a postgres connection using the stored connection string
  // For backwards compat - creates new connection each time
  getStoredPostgresConnection() {
    const connectionString = this.loadConnectionString();
    if (!connectionString) {
      throw new Error('No database connection string configured. Please run setup first.');
    }
    return this.createPostgresConnection(connectionString);
  }

  isConfigured() {
    return this.client !== null;
  }

  isPostgresConfigured() {
    return this.hasStoredConnectionString();
  }

  // ============ Connection String Storage ============

  saveConnectionString(connectionString) {
    try {
      fs.writeFileSync(DB_CONNECTION_FILE, connectionString, 'utf8');
      return true;
    } catch (error) {
      console.error('Failed to save connection string:', error.message);
      return false;
    }
  }

  loadConnectionString() {
    try {
      if (fs.existsSync(DB_CONNECTION_FILE)) {
        return fs.readFileSync(DB_CONNECTION_FILE, 'utf8').trim();
      }
    } catch (error) {
      console.error('Failed to load connection string:', error.message);
    }
    return null;
  }

  hasStoredConnectionString() {
    return fs.existsSync(DB_CONNECTION_FILE);
  }

  // ============ Schema Management ============

  async checkTableExists(tableName) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from(tableName)
      .select('*')
      .limit(1);

    // If no error, table exists
    if (!error) return true;

    // Check if error is "table not found"
    if (error.message?.includes('Could not find the table') ||
        error.message?.includes('relation') && error.message?.includes('does not exist')) {
      return false;
    }

    // Some other error
    throw error;
  }

  // ============ Optimized SEC Filings Schema (v2) ============

  async checkOptimizedTablesExist() {
    if (!this.hasStoredConnectionString()) {
      return {
        tablesExist: false,
        configured: false,
        error: 'No database connection configured'
      };
    }

    const sql = this.getStoredPostgresConnection();
    try {
      const result = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('sec_filings', 'sec_companies', 'sec_form_types', 'sec_file_extensions')
      `;

      const tables = result.map(r => r.table_name);
      return {
        tablesExist: tables.length === 4,
        configured: true,
        sec_filings: tables.includes('sec_filings'),
        sec_companies: tables.includes('sec_companies'),
        sec_form_types: tables.includes('sec_form_types'),
        sec_file_extensions: tables.includes('sec_file_extensions')
      };
    } catch (error) {
      return {
        tablesExist: false,
        configured: true,
        error: error.message
      };
    } finally {
      await sql.end();
    }
  }

  async createOptimizedTables(connectionString = null) {
    // Use provided connection string or fall back to stored one
    const connStr = connectionString || this.loadConnectionString();
    if (!connStr) {
      throw new Error('Connection string is required');
    }

    const sql = this.createPostgresConnection(connStr);
    if (!sql) {
      throw new Error('Could not create database connection');
    }

    // Save connection string if a new one was provided
    if (connectionString) {
      this.saveConnectionString(connectionString);
    }

    try {
      // Lookup table for form types
      await sql`
        CREATE TABLE IF NOT EXISTS sec_form_types (
          id SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          code VARCHAR(20) NOT NULL UNIQUE
        )
      `;

      // Lookup table for file extensions
      await sql`
        CREATE TABLE IF NOT EXISTS sec_file_extensions (
          id SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          ext VARCHAR(10) NOT NULL UNIQUE
        )
      `;

      // Companies table
      await sql`
        CREATE TABLE IF NOT EXISTS sec_companies (
          cik INTEGER PRIMARY KEY,
          name TEXT NOT NULL
        )
      `;

      // Main optimized filings table
      await sql`
        CREATE TABLE IF NOT EXISTS sec_filings (
          cik INTEGER NOT NULL,
          form_type_id SMALLINT NOT NULL REFERENCES sec_form_types(id),
          filed_date SMALLINT NOT NULL,
          accession_filer BIGINT NOT NULL,
          accession_seq INTEGER NOT NULL,
          ext_id SMALLINT NOT NULL REFERENCES sec_file_extensions(id),
          PRIMARY KEY (filed_date, accession_filer, accession_seq)
        )
      `;

      // Create indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_filings_cik ON sec_filings(cik)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_filings_date ON sec_filings(filed_date DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_filings_form ON sec_filings(form_type_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_filings_cik_date ON sec_filings(cik, filed_date DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_companies_name ON sec_companies USING gin(to_tsvector('english', name))`;

      // Pre-populate common file extensions
      await sql`
        INSERT INTO sec_file_extensions (ext) VALUES
          ('txt'), ('htm'), ('html'), ('xml'), ('xsd'), ('json'), ('pdf')
        ON CONFLICT (ext) DO NOTHING
      `;

      // Helper function: Convert YYYYMMDD to days since epoch
      await sql`
        CREATE OR REPLACE FUNCTION date_to_epoch_days(yyyymmdd INTEGER)
        RETURNS SMALLINT AS $$
        BEGIN
          RETURN ((make_date(yyyymmdd / 10000, (yyyymmdd / 100) % 100, yyyymmdd % 100) - '1970-01-01'::date))::SMALLINT;
        END;
        $$ LANGUAGE plpgsql IMMUTABLE
      `;

      // Helper function: Convert days to DATE
      await sql`
        CREATE OR REPLACE FUNCTION epoch_days_to_date(days SMALLINT)
        RETURNS DATE AS $$
        BEGIN
          RETURN '1970-01-01'::date + days;
        END;
        $$ LANGUAGE plpgsql IMMUTABLE
      `;

      // Helper function: Get or create form type ID
      await sql`
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
            IF type_id IS NULL THEN
              SELECT id INTO type_id FROM sec_form_types WHERE code = form_code;
            END IF;
          END IF;
          RETURN type_id;
        END;
        $$ LANGUAGE plpgsql
      `;

      // Helper function: Get or create file extension ID
      await sql`
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
        $$ LANGUAGE plpgsql
      `;

      // View to reconstruct full filing data
      // Year is derived from filed_date (mod 100 to get 2-digit year)
      await sql`
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
        JOIN sec_file_extensions e ON f.ext_id = e.id
      `;

      // Enable RLS
      await sql`ALTER TABLE sec_form_types ENABLE ROW LEVEL SECURITY`;
      await sql`ALTER TABLE sec_file_extensions ENABLE ROW LEVEL SECURITY`;
      await sql`ALTER TABLE sec_companies ENABLE ROW LEVEL SECURITY`;
      await sql`ALTER TABLE sec_filings ENABLE ROW LEVEL SECURITY`;

      // Create policies
      await sql`DROP POLICY IF EXISTS "Service role full access sec_form_types" ON sec_form_types`;
      await sql`CREATE POLICY "Service role full access sec_form_types" ON sec_form_types FOR ALL USING (true) WITH CHECK (true)`;

      await sql`DROP POLICY IF EXISTS "Service role full access sec_file_extensions" ON sec_file_extensions`;
      await sql`CREATE POLICY "Service role full access sec_file_extensions" ON sec_file_extensions FOR ALL USING (true) WITH CHECK (true)`;

      await sql`DROP POLICY IF EXISTS "Service role full access sec_companies" ON sec_companies`;
      await sql`CREATE POLICY "Service role full access sec_companies" ON sec_companies FOR ALL USING (true) WITH CHECK (true)`;

      await sql`DROP POLICY IF EXISTS "Service role full access sec_filings" ON sec_filings`;
      await sql`CREATE POLICY "Service role full access sec_filings" ON sec_filings FOR ALL USING (true) WITH CHECK (true)`;

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to create optimized tables: ${error.message}`);
    } finally {
      await sql.end();
    }
  }

  async dropLegacyTables(connectionString = null) {
    const connStr = connectionString || this.loadConnectionString();
    if (!connStr) {
      throw new Error('Connection string is required');
    }

    const sql = this.createPostgresConnection(connStr);
    if (!sql) {
      throw new Error('Could not create database connection');
    }

    try {
      // Drop legacy tables from old schema (not the current optimized ones)
      await sql`DROP TABLE IF EXISTS sec_daily_index_sync_jobs CASCADE`;
      await sql`DROP TABLE IF EXISTS sec_daily_indices CASCADE`;
      await sql`DROP TABLE IF EXISTS sec_backfill_jobs CASCADE`;

      // Drop old functions
      await sql`DROP FUNCTION IF EXISTS get_daily_index_stats()`;
      await sql`DROP FUNCTION IF EXISTS get_daily_index_counts_by_year()`;
      await sql`DROP FUNCTION IF EXISTS get_form_type_counts()`;
      await sql`DROP FUNCTION IF EXISTS update_updated_at_column()`;

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to drop legacy tables: ${error.message}`);
    } finally {
      await sql.end();
    }
  }

  async dropAllTables(connectionString = null) {
    const connStr = connectionString || this.loadConnectionString();
    if (!connStr) {
      throw new Error('Connection string is required');
    }

    const sql = this.createPostgresConnection(connStr);
    if (!sql) {
      throw new Error('Could not create database connection');
    }

    try {
      // Increase statement timeout for large table drops (5 minutes)
      await sql`SET statement_timeout = '300000'`;

      // Drop ALL tables, views, and functions in public schema
      await sql`
        DO $$
        DECLARE
          r RECORD;
        BEGIN
          -- Drop all views
          FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE';
          END LOOP;

          -- Drop all tables
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;

          -- Drop all functions
          FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args
                    FROM pg_proc
                    INNER JOIN pg_namespace ns ON (pg_proc.pronamespace = ns.oid)
                    WHERE ns.nspname = 'public') LOOP
            EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
          END LOOP;
        END $$;
      `;

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to drop all tables: ${error.message}`);
    } finally {
      await sql.end();
    }
  }

  async getOptimizedStats() {
    if (!this.hasStoredConnectionString()) {
      throw new Error('No database connection configured');
    }

    const sql = this.getStoredPostgresConnection();
    try {
      const [filingsCount] = await sql`SELECT COUNT(*)::INTEGER as count FROM sec_filings`;
      const [companiesCount] = await sql`SELECT COUNT(*)::INTEGER as count FROM sec_companies`;
      const [formTypesCount] = await sql`SELECT COUNT(*)::INTEGER as count FROM sec_form_types`;

      return {
        filings: filingsCount.count,
        companies: companiesCount.count,
        formTypes: formTypesCount.count
      };
    } finally {
      await sql.end();
    }
  }

  async bulkInsertFilings(filings) {
    if (!this.hasStoredConnectionString()) {
      throw new Error('No database connection configured');
    }
    if (!filings.length) return { inserted: 0 };

    const sql = this.getPooledConnection();
    // Insert in batches for performance
    const batchSize = 1000;
    let totalInserted = 0;

    for (let i = 0; i < filings.length; i += batchSize) {
      const batch = filings.slice(i, i + batchSize);

      const result = await sql`
        INSERT INTO sec_filings ${sql(batch, 'cik', 'form_type_id', 'filed_date', 'accession_filer', 'accession_seq', 'ext_id')}
        ON CONFLICT (filed_date, accession_filer, accession_seq) DO NOTHING
      `;

      totalInserted += result.count;
    }

    return { inserted: totalInserted };
  }

  async bulkUpsertCompanies(companies) {
    if (!this.hasStoredConnectionString()) {
      throw new Error('No database connection configured');
    }
    if (!companies.length) return { upserted: 0 };

    const sql = this.getPooledConnection();
    // Insert in batches for performance
    const batchSize = 1000;
    let totalUpserted = 0;

    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize);

      const result = await sql`
        INSERT INTO sec_companies ${sql(batch, 'cik', 'name')}
        ON CONFLICT (cik) DO UPDATE SET name = EXCLUDED.name
      `;

      totalUpserted += result.count;
    }

    return { upserted: totalUpserted };
  }

  async getFormTypeMap() {
    if (!this.hasStoredConnectionString()) {
      throw new Error('No database connection configured');
    }

    const sql = this.getStoredPostgresConnection();
    try {
      const result = await sql`SELECT id, code FROM sec_form_types`;
      const map = {};
      for (const row of result) {
        map[row.code] = row.id;
      }
      return map;
    } finally {
      await sql.end();
    }
  }

  async getExtensionMap() {
    if (!this.hasStoredConnectionString()) {
      throw new Error('No database connection configured');
    }

    const sql = this.getStoredPostgresConnection();
    try {
      const result = await sql`SELECT id, ext FROM sec_file_extensions`;
      const map = {};
      for (const row of result) {
        map[row.ext] = row.id;
      }
      return map;
    } finally {
      await sql.end();
    }
  }

  async ensureFormTypes(codes) {
    if (!this.hasStoredConnectionString()) {
      throw new Error('No database connection configured');
    }
    if (!codes.length) return {};

    const sql = this.getPooledConnection();
    // Insert any new codes
    const values = codes.map(code => ({ code }));
    await sql`
      INSERT INTO sec_form_types ${sql(values, 'code')}
      ON CONFLICT (code) DO NOTHING
    `;

    // Return full map
    const result = await sql`SELECT id, code FROM sec_form_types WHERE code = ANY(${codes})`;
    const map = {};
    for (const row of result) {
      map[row.code] = row.id;
    }
    return map;
  }

  async ensureExtensions(exts) {
    if (!this.hasStoredConnectionString()) {
      throw new Error('No database connection configured');
    }
    if (!exts.length) return {};

    const sql = this.getPooledConnection();
    const values = exts.map(ext => ({ ext }));
    await sql`
      INSERT INTO sec_file_extensions ${sql(values, 'ext')}
      ON CONFLICT (ext) DO NOTHING
    `;

    const result = await sql`SELECT id, ext FROM sec_file_extensions WHERE ext = ANY(${exts})`;
    const map = {};
    for (const row of result) {
      map[row.ext] = row.id;
    }
    return map;
  }

  async checkDailyIndicesTablesExist() {
    if (!this.hasStoredConnectionString()) {
      return {
        tablesExist: false,
        configured: false,
        error: 'No database connection configured'
      };
    }

    const sql = this.getStoredPostgresConnection();
    try {
      const result = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('sec_daily_indices', 'sec_daily_index_sync_jobs')
      `;

      const tables = result.map(r => r.table_name);
      const indicesExists = tables.includes('sec_daily_indices');
      const jobsExists = tables.includes('sec_daily_index_sync_jobs');

      return {
        tablesExist: indicesExists && jobsExists,
        configured: true,
        sec_daily_indices: indicesExists,
        sec_daily_index_sync_jobs: jobsExists
      };
    } catch (error) {
      return {
        tablesExist: false,
        configured: true,
        error: error.message
      };
    } finally {
      await sql.end();
    }
  }

  async createDailyIndicesTables(connectionString) {
    if (!this.client) throw new Error('Supabase not configured');

    if (!connectionString) {
      throw new Error('Connection string is required');
    }

    const sql = this.createPostgresConnection(connectionString);
    if (!sql) {
      throw new Error('Could not create database connection');
    }

    try {
      // Execute DDL statements one by one for reliability
      // Create sec_daily_indices table
      await sql`
        CREATE TABLE IF NOT EXISTS sec_daily_indices (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          index_date DATE NOT NULL UNIQUE,
          year INTEGER NOT NULL,
          quarter INTEGER NOT NULL,
          url TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          filing_count INTEGER,
          file_size INTEGER,
          downloaded_at TIMESTAMPTZ,
          error_message TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // Create indices
      await sql`CREATE INDEX IF NOT EXISTS idx_daily_indices_date ON sec_daily_indices(index_date DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_daily_indices_status ON sec_daily_indices(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_daily_indices_year ON sec_daily_indices(year)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_daily_indices_quarter ON sec_daily_indices(year, quarter)`;

      // Create sec_daily_index_sync_jobs table
      await sql`
        CREATE TABLE IF NOT EXISTS sec_daily_index_sync_jobs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          job_type TEXT NOT NULL,
          start_date DATE,
          end_date DATE,
          target_date DATE,
          status TEXT NOT NULL DEFAULT 'pending',
          progress JSONB DEFAULT '{"processed": 0, "total": 0, "downloaded": 0, "errors": []}',
          started_at TIMESTAMPTZ,
          completed_at TIMESTAMPTZ,
          error_message TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // Create indices for sync jobs
      await sql`CREATE INDEX IF NOT EXISTS idx_daily_index_sync_jobs_status ON sec_daily_index_sync_jobs(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_daily_index_sync_jobs_created ON sec_daily_index_sync_jobs(created_at DESC)`;

      // Create stats function
      await sql`
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
            COUNT(*)::BIGINT,
            COUNT(*) FILTER (WHERE status = 'pending')::BIGINT,
            COUNT(*) FILTER (WHERE status = 'downloaded')::BIGINT,
            COUNT(*) FILTER (WHERE status = 'failed')::BIGINT,
            COUNT(*) FILTER (WHERE status = 'not_available')::BIGINT,
            MIN(index_date),
            MAX(index_date),
            COALESCE(SUM(filing_count), 0)::BIGINT
          FROM sec_daily_indices;
        END;
        $$ LANGUAGE plpgsql
      `;

      // Create year counts function
      await sql`
        CREATE OR REPLACE FUNCTION get_daily_index_counts_by_year()
        RETURNS TABLE(year INTEGER, total BIGINT, downloaded BIGINT) AS $$
        BEGIN
          RETURN QUERY
          SELECT
            sdi.year,
            COUNT(*)::BIGINT,
            COUNT(*) FILTER (WHERE sdi.status = 'downloaded')::BIGINT
          FROM sec_daily_indices sdi
          GROUP BY sdi.year
          ORDER BY sdi.year DESC;
        END;
        $$ LANGUAGE plpgsql
      `;

      // Create update trigger function
      await sql`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `;

      // Create trigger (drop first if exists to avoid errors)
      await sql`DROP TRIGGER IF EXISTS update_sec_daily_indices_updated_at ON sec_daily_indices`;
      await sql`
        CREATE TRIGGER update_sec_daily_indices_updated_at
          BEFORE UPDATE ON sec_daily_indices
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
      `;

      // Enable RLS
      await sql`ALTER TABLE sec_daily_indices ENABLE ROW LEVEL SECURITY`;
      await sql`ALTER TABLE sec_daily_index_sync_jobs ENABLE ROW LEVEL SECURITY`;

      // Create policies (drop first if exists)
      await sql`DROP POLICY IF EXISTS "Service role has full access to sec_daily_indices" ON sec_daily_indices`;
      await sql`
        CREATE POLICY "Service role has full access to sec_daily_indices" ON sec_daily_indices
          FOR ALL USING (true) WITH CHECK (true)
      `;

      await sql`DROP POLICY IF EXISTS "Service role has full access to sec_daily_index_sync_jobs" ON sec_daily_index_sync_jobs`;
      await sql`
        CREATE POLICY "Service role has full access to sec_daily_index_sync_jobs" ON sec_daily_index_sync_jobs
          FOR ALL USING (true) WITH CHECK (true)
      `;

      // Save connection string for future use
      this.saveConnectionString(connectionString);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to create tables: ${error.message}`);
    } finally {
      await sql.end();
    }
  }

  // ============ SEC Filings ============

  async insertFilings(filings) {
    if (!this.client) throw new Error('Supabase not configured');
    if (!filings.length) return { inserted: 0 };

    const { data, error } = await this.client
      .from('sec_filings')
      .upsert(filings, {
        onConflict: 'id',
        ignoreDuplicates: true
      })
      .select();

    if (error) throw error;
    return { inserted: data?.length || 0 };
  }

  async getFilings({ limit = 50, offset = 0, formType = null, startDate = null, endDate = null } = {}) {
    if (!this.client) throw new Error('Supabase not configured');

    let query = this.client
      .from('sec_filings')
      .select('*', { count: 'exact' })
      .order('filed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (formType) {
      query = query.ilike('form_type', `${formType}%`);
    }
    if (startDate) {
      query = query.gte('filed_at', startDate);
    }
    if (endDate) {
      query = query.lte('filed_at', endDate);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return { filings: data || [], total: count || 0 };
  }

  async getFilingsCount(formType = null) {
    if (!this.client) throw new Error('Supabase not configured');

    let query = this.client
      .from('sec_filings')
      .select('*', { count: 'exact', head: true });

    if (formType) {
      query = query.ilike('form_type', `${formType}%`);
    }

    const { count, error } = await query;
    if (error) throw error;

    return count || 0;
  }

  async getFilingStats() {
    if (!this.client) throw new Error('Supabase not configured');

    // Get total count
    const { count: total } = await this.client
      .from('sec_filings')
      .select('*', { count: 'exact', head: true });

    // Get date range
    const { data: oldest } = await this.client
      .from('sec_filings')
      .select('filed_at')
      .order('filed_at', { ascending: true })
      .limit(1)
      .single();

    const { data: newest } = await this.client
      .from('sec_filings')
      .select('filed_at')
      .order('filed_at', { ascending: false })
      .limit(1)
      .single();

    // Get counts by form type (top 10)
    const { data: formTypeCounts } = await this.client
      .rpc('get_form_type_counts');

    return {
      total: total || 0,
      oldestDate: oldest?.filed_at || null,
      newestDate: newest?.filed_at || null,
      formTypeCounts: formTypeCounts || []
    };
  }

  async hasFilingId(id) {
    if (!this.client) throw new Error('Supabase not configured');

    const { count } = await this.client
      .from('sec_filings')
      .select('*', { count: 'exact', head: true })
      .eq('id', id);

    return count > 0;
  }

  async hasFilingIds(ids) {
    if (!this.client) throw new Error('Supabase not configured');
    if (!ids.length) return new Set();

    const { data } = await this.client
      .from('sec_filings')
      .select('id')
      .in('id', ids);

    return new Set((data || []).map(d => d.id));
  }

  // ============ Backfill Jobs ============

  async createBackfillJob(job) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('sec_backfill_jobs')
      .insert({
        job_type: job.type,
        target_date: job.targetDate || null,
        target_quarter: job.targetQuarter || null,
        start_date: job.startDate || null,
        end_date: job.endDate || null,
        form_types: job.formTypes || null,
        status: 'pending',
        progress: { processed: 0, total: 0, errors: [] }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateBackfillJob(id, updates) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('sec_backfill_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBackfillJob(id) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('sec_backfill_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getBackfillJobs({ status = null, limit = 50, offset = 0 } = {}) {
    if (!this.client) throw new Error('Supabase not configured');

    let query = this.client
      .from('sec_backfill_jobs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return { jobs: data || [], total: count || 0 };
  }

  async getActiveBackfillJobs() {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('sec_backfill_jobs')
      .select('*')
      .in('status', ['pending', 'running'])
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async cancelBackfillJob(id) {
    if (!this.client) throw new Error('Supabase not configured');

    const { data, error } = await this.client
      .from('sec_backfill_jobs')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .in('status', ['pending', 'running'])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ============ SEC Daily Indices ============

  async upsertDailyIndex(index) {
    const sql = this.getStoredPostgresConnection();
    try {
      const result = await sql`
        INSERT INTO sec_daily_indices (index_date, year, quarter, url, status, filing_count, file_size, downloaded_at, error_message)
        VALUES (${index.indexDate}, ${index.year}, ${index.quarter}, ${index.url}, ${index.status || 'pending'}, ${index.filingCount || null}, ${index.fileSize || null}, ${index.downloadedAt || null}, ${index.errorMessage || null})
        ON CONFLICT (index_date) DO UPDATE SET
          year = EXCLUDED.year,
          quarter = EXCLUDED.quarter,
          url = EXCLUDED.url,
          status = EXCLUDED.status,
          filing_count = EXCLUDED.filing_count,
          file_size = EXCLUDED.file_size,
          downloaded_at = EXCLUDED.downloaded_at,
          error_message = EXCLUDED.error_message
        RETURNING *
      `;
      return result[0];
    } finally {
      await sql.end();
    }
  }

  async upsertDailyIndices(indices) {
    if (!indices.length) return { inserted: 0 };

    const sql = this.getStoredPostgresConnection();
    try {
      let inserted = 0;
      for (const index of indices) {
        await sql`
          INSERT INTO sec_daily_indices (index_date, year, quarter, url, status, filing_count, file_size, downloaded_at, error_message)
          VALUES (${index.indexDate}, ${index.year}, ${index.quarter}, ${index.url}, ${index.status || 'pending'}, ${index.filingCount || null}, ${index.fileSize || null}, ${index.downloadedAt || null}, ${index.errorMessage || null})
          ON CONFLICT (index_date) DO UPDATE SET
            year = EXCLUDED.year,
            quarter = EXCLUDED.quarter,
            url = EXCLUDED.url,
            status = EXCLUDED.status,
            filing_count = EXCLUDED.filing_count,
            file_size = EXCLUDED.file_size,
            downloaded_at = EXCLUDED.downloaded_at,
            error_message = EXCLUDED.error_message
        `;
        inserted++;
      }
      return { inserted };
    } finally {
      await sql.end();
    }
  }

  async updateDailyIndex(indexDate, updates) {
    const sql = this.getStoredPostgresConnection();
    try {
      const setClauses = [];
      const values = { index_date: indexDate };

      if (updates.status !== undefined) values.status = updates.status;
      if (updates.filing_count !== undefined) values.filing_count = updates.filing_count;
      if (updates.file_size !== undefined) values.file_size = updates.file_size;
      if (updates.downloaded_at !== undefined) values.downloaded_at = updates.downloaded_at;
      if (updates.error_message !== undefined) values.error_message = updates.error_message;

      const result = await sql`
        UPDATE sec_daily_indices SET
          status = COALESCE(${values.status}, status),
          filing_count = COALESCE(${values.filing_count}, filing_count),
          file_size = COALESCE(${values.file_size}, file_size),
          downloaded_at = COALESCE(${values.downloaded_at}, downloaded_at),
          error_message = COALESCE(${values.error_message}, error_message),
          updated_at = NOW()
        WHERE index_date = ${indexDate}
        RETURNING *
      `;
      return result[0];
    } finally {
      await sql.end();
    }
  }

  async getDailyIndex(indexDate) {
    const sql = this.getStoredPostgresConnection();
    try {
      const result = await sql`
        SELECT * FROM sec_daily_indices WHERE index_date = ${indexDate}
      `;
      return result[0] || null;
    } finally {
      await sql.end();
    }
  }

  async getDailyIndices({ limit = 50, offset = 0, status = null, year = null, quarter = null } = {}) {
    const sql = this.getStoredPostgresConnection();
    try {
      let data, countResult;

      if (status && year && quarter) {
        data = await sql`
          SELECT * FROM sec_daily_indices
          WHERE status = ${status} AND year = ${year} AND quarter = ${quarter}
          ORDER BY index_date DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countResult = await sql`
          SELECT COUNT(*)::int as count FROM sec_daily_indices
          WHERE status = ${status} AND year = ${year} AND quarter = ${quarter}
        `;
      } else if (status && year) {
        data = await sql`
          SELECT * FROM sec_daily_indices
          WHERE status = ${status} AND year = ${year}
          ORDER BY index_date DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countResult = await sql`
          SELECT COUNT(*)::int as count FROM sec_daily_indices
          WHERE status = ${status} AND year = ${year}
        `;
      } else if (status && quarter) {
        data = await sql`
          SELECT * FROM sec_daily_indices
          WHERE status = ${status} AND quarter = ${quarter}
          ORDER BY index_date DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countResult = await sql`
          SELECT COUNT(*)::int as count FROM sec_daily_indices
          WHERE status = ${status} AND quarter = ${quarter}
        `;
      } else if (year && quarter) {
        data = await sql`
          SELECT * FROM sec_daily_indices
          WHERE year = ${year} AND quarter = ${quarter}
          ORDER BY index_date DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countResult = await sql`
          SELECT COUNT(*)::int as count FROM sec_daily_indices
          WHERE year = ${year} AND quarter = ${quarter}
        `;
      } else if (status) {
        data = await sql`
          SELECT * FROM sec_daily_indices
          WHERE status = ${status}
          ORDER BY index_date DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countResult = await sql`
          SELECT COUNT(*)::int as count FROM sec_daily_indices WHERE status = ${status}
        `;
      } else if (year) {
        data = await sql`
          SELECT * FROM sec_daily_indices
          WHERE year = ${year}
          ORDER BY index_date DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countResult = await sql`
          SELECT COUNT(*)::int as count FROM sec_daily_indices WHERE year = ${year}
        `;
      } else if (quarter) {
        data = await sql`
          SELECT * FROM sec_daily_indices
          WHERE quarter = ${quarter}
          ORDER BY index_date DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countResult = await sql`
          SELECT COUNT(*)::int as count FROM sec_daily_indices WHERE quarter = ${quarter}
        `;
      } else {
        data = await sql`
          SELECT * FROM sec_daily_indices
          ORDER BY index_date DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countResult = await sql`
          SELECT COUNT(*)::int as count FROM sec_daily_indices
        `;
      }

      return { indices: data || [], total: countResult[0]?.count || 0 };
    } finally {
      await sql.end();
    }
  }

  async getDailyIndexStats() {
    const sql = this.getStoredPostgresConnection();
    try {
      const result = await sql`SELECT * FROM get_daily_index_stats()`;
      return result[0] || {
        total_count: 0,
        pending_count: 0,
        downloaded_count: 0,
        failed_count: 0,
        not_available_count: 0,
        oldest_date: null,
        newest_date: null,
        total_filings: 0
      };
    } finally {
      await sql.end();
    }
  }

  async getDailyIndexCountsByYear() {
    const sql = this.getStoredPostgresConnection();
    try {
      const result = await sql`SELECT * FROM get_daily_index_counts_by_year()`;
      return result || [];
    } finally {
      await sql.end();
    }
  }

  async getPendingDailyIndices(limit = 100) {
    const sql = this.getStoredPostgresConnection();
    try {
      const result = await sql`
        SELECT * FROM sec_daily_indices
        WHERE status = 'pending'
        ORDER BY index_date DESC
        LIMIT ${limit}
      `;
      return result || [];
    } finally {
      await sql.end();
    }
  }

  // ============ SEC Daily Index Sync Jobs ============

  async createDailyIndexSyncJob(job) {
    const sql = this.getStoredPostgresConnection();
    try {
      const progress = JSON.stringify({ processed: 0, total: 0, downloaded: 0, errors: [] });
      const result = await sql`
        INSERT INTO sec_daily_index_sync_jobs (job_type, start_date, end_date, target_date, status, progress)
        VALUES (${job.type}, ${job.startDate || null}, ${job.endDate || null}, ${job.targetDate || null}, 'pending', ${progress}::jsonb)
        RETURNING *
      `;
      return result[0];
    } finally {
      await sql.end();
    }
  }

  async updateDailyIndexSyncJob(id, updates) {
    const sql = this.getStoredPostgresConnection();
    try {
      const values = {};
      if (updates.status !== undefined) values.status = updates.status;
      if (updates.progress !== undefined) values.progress = JSON.stringify(updates.progress);
      if (updates.started_at !== undefined) values.started_at = updates.started_at;
      if (updates.completed_at !== undefined) values.completed_at = updates.completed_at;
      if (updates.error_message !== undefined) values.error_message = updates.error_message;

      const result = await sql`
        UPDATE sec_daily_index_sync_jobs SET
          status = COALESCE(${values.status || null}, status),
          progress = COALESCE(${values.progress || null}::jsonb, progress),
          started_at = COALESCE(${values.started_at || null}, started_at),
          completed_at = COALESCE(${values.completed_at || null}, completed_at),
          error_message = COALESCE(${values.error_message || null}, error_message)
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } finally {
      await sql.end();
    }
  }

  async getDailyIndexSyncJobs({ status = null, limit = 50, offset = 0 } = {}) {
    const sql = this.getStoredPostgresConnection();
    try {
      let data, countResult;

      if (status) {
        data = await sql`
          SELECT * FROM sec_daily_index_sync_jobs
          WHERE status = ${status}
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countResult = await sql`
          SELECT COUNT(*)::int as count FROM sec_daily_index_sync_jobs WHERE status = ${status}
        `;
      } else {
        data = await sql`
          SELECT * FROM sec_daily_index_sync_jobs
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
        countResult = await sql`
          SELECT COUNT(*)::int as count FROM sec_daily_index_sync_jobs
        `;
      }

      return { jobs: data || [], total: countResult[0]?.count || 0 };
    } finally {
      await sql.end();
    }
  }

  async getActiveDailyIndexSyncJobs() {
    const sql = this.getStoredPostgresConnection();
    try {
      const result = await sql`
        SELECT * FROM sec_daily_index_sync_jobs
        WHERE status IN ('pending', 'running')
        ORDER BY created_at ASC
      `;
      return result || [];
    } finally {
      await sql.end();
    }
  }

  async cancelDailyIndexSyncJob(id) {
    const sql = this.getStoredPostgresConnection();
    try {
      const result = await sql`
        UPDATE sec_daily_index_sync_jobs
        SET status = 'cancelled', completed_at = NOW()
        WHERE id = ${id} AND status IN ('pending', 'running')
        RETURNING *
      `;
      return result[0];
    } finally {
      await sql.end();
    }
  }
}

module.exports = SupabaseClient;
