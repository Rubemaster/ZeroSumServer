const axios = require('axios');

// Force axios to use http adapter instead of fetch (fixes Node 22+ compatibility)
axios.defaults.adapter = 'http';

class SECClient {
  constructor(supabaseClient = null) {
    this.edgarURL = 'https://www.sec.gov/cgi-bin/browse-edgar';
    this.archivesURL = 'https://www.sec.gov/Archives/edgar';
    this.db = supabaseClient;
    this.userAgent = 'ZeroSum/1.0 (contact@zerosum.com)';
  }

  // ============ RSS Feed Methods (Real-time) ============

  async fetchFromRSS(limit = 100, formType = '') {
    try {
      const response = await axios.get(this.edgarURL, {
        params: {
          action: 'getcurrent',
          type: formType,
          company: '',
          dateb: '',
          owner: 'include',
          count: limit,
          output: 'atom'
        },
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/atom+xml'
        },
        timeout: 30000
      });

      return this.parseAtomFeed(response.data);
    } catch (error) {
      console.error('SEC RSS fetch error:', error.message);
      return [];
    }
  }

  // Poll for new filings from RSS and store in Supabase
  async pollForNewFilings(limit = 100) {
    try {
      const freshFilings = await this.fetchFromRSS(limit);
      if (!freshFilings.length) return [];

      // Check which filings are new
      const ids = freshFilings.map(f => f.id);
      const existingIds = await this.db.hasFilingIds(ids);

      const newFilings = freshFilings.filter(f => !existingIds.has(f.id));
      if (!newFilings.length) return [];

      // Convert to DB format and insert
      const dbFilings = newFilings.map(f => this.toDbFormat(f, 'rss'));
      await this.db.insertFilings(dbFilings);

      return newFilings;
    } catch (error) {
      console.error('Error polling for new filings:', error.message);
      return [];
    }
  }

  // ============ Daily Index Methods (Backfill) ============

  // Fetch filings from a daily index file
  async fetchDailyIndex(date, formTypes = []) {
    const year = date.getFullYear();
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    const dateStr = this.formatDateForIndex(date);

    // Use form.YYYYMMDD.idx format (sorted by form type)
    const url = `${this.archivesURL}/daily-index/${year}/QTR${quarter}/form.${dateStr}.idx`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Encoding': 'gzip, deflate'
        },
        timeout: 60000,
        family: 4,
        responseType: 'text'
      });

      return this.parseIndexFile(response.data, date, formTypes);
    } catch (error) {
      if (error.response?.status === 404) {
        // No filings for this date (weekend/holiday)
        return [];
      }
      console.error(`Error fetching daily index for ${dateStr}:`, error.message);
      throw error;
    }
  }

  // Fetch filings from a quarter index file
  async fetchQuarterIndex(year, quarter, formTypes = []) {
    const url = `${this.archivesURL}/daily-index/${year}/QTR${quarter}/form.idx`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Encoding': 'gzip, deflate'
        },
        timeout: 120000
      });

      return this.parseIndexFile(response.data, null, formTypes);
    } catch (error) {
      console.error(`Error fetching quarter index for ${year}-Q${quarter}:`, error.message);
      throw error;
    }
  }

  // Parse SEC index file format
  parseIndexFile(data, filingDate = null, formTypes = []) {
    const lines = data.split('\n');
    const filings = [];

    // Skip header lines (first 10 lines typically)
    let dataStarted = false;
    const formTypesUpper = formTypes.map(f => f.toUpperCase());

    for (const line of lines) {
      // Look for the separator line (dashes)
      if (line.startsWith('----')) {
        dataStarted = true;
        continue;
      }

      if (!dataStarted || line.trim().length === 0) continue;

      // Parse fixed-width format:
      // Form Type   Company Name                                                  CIK         Date Filed  File Name
      // Columns are roughly: 0-12 form, 12-74 company, 74-86 cik, 86-96 date, 96+ filename
      const formType = line.substring(0, 12).trim();
      const companyName = line.substring(12, 74).trim();
      const cik = line.substring(74, 86).trim();
      const dateFiled = line.substring(86, 96).trim();
      const fileName = line.substring(96).trim();

      if (!formType || !companyName || !fileName) continue;

      // Apply form type filter
      if (formTypesUpper.length > 0) {
        const formUpper = formType.toUpperCase();
        if (!formTypesUpper.some(f => formUpper.startsWith(f))) {
          continue;
        }
      }

      // Extract accession number from filename
      const accessionMatch = fileName.match(/(\d{10}-\d{2}-\d{6})/);
      const accessionNumber = accessionMatch ? accessionMatch[1] : null;

      if (!accessionNumber) continue;

      // Parse date
      let filedAt;
      if (dateFiled && dateFiled.length === 8) {
        filedAt = `${dateFiled.substring(0, 4)}-${dateFiled.substring(4, 6)}-${dateFiled.substring(6, 8)}`;
      } else if (filingDate) {
        filedAt = filingDate.toISOString().split('T')[0];
      } else {
        filedAt = new Date().toISOString().split('T')[0];
      }

      filings.push({
        id: accessionNumber,
        formType,
        companyName,
        cik,
        filedAt: new Date(filedAt).toISOString(),
        url: `https://www.sec.gov/Archives/${fileName.replace('.txt', '-index.htm')}`,
        ticker: null,
        description: `${formType} filing by ${companyName}`
      });
    }

    return filings;
  }

  // ============ Backfill Job Execution ============

  // Execute a backfill job
  async executeBackfillJob(job, onProgress = null) {
    const { id, job_type, target_date, start_date, end_date, target_quarter, form_types } = job;

    try {
      // Mark job as running
      await this.db.updateBackfillJob(id, {
        status: 'running',
        started_at: new Date().toISOString()
      });

      let totalFilings = 0;
      let processedDays = 0;
      let errors = [];

      if (job_type === 'daily' && target_date) {
        // Single day
        const result = await this.backfillDate(new Date(target_date), form_types || []);
        totalFilings = result.inserted;
      } else if (job_type === 'range' && start_date && end_date) {
        // Date range
        const dates = this.getDateRange(new Date(start_date), new Date(end_date));
        const totalDays = dates.length;

        for (const date of dates) {
          try {
            const result = await this.backfillDate(date, form_types || []);
            totalFilings += result.inserted;
            processedDays++;

            // Update progress
            if (onProgress) {
              onProgress({
                processed: processedDays,
                total: totalDays,
                filingsAdded: totalFilings
              });
            }

            await this.db.updateBackfillJob(id, {
              progress: {
                processed: processedDays,
                total: totalDays,
                filingsAdded: totalFilings,
                errors
              }
            });

            // Rate limit: 10 requests per second max
            await this.delay(150);
          } catch (error) {
            errors.push({ date: date.toISOString().split('T')[0], error: error.message });
          }
        }
      } else if (job_type === 'quarter' && target_quarter) {
        // Full quarter
        const [yearStr, qStr] = target_quarter.split('-Q');
        const year = parseInt(yearStr);
        const quarter = parseInt(qStr);

        const filings = await this.fetchQuarterIndex(year, quarter, form_types || []);

        if (filings.length > 0) {
          // Check which are new
          const ids = filings.map(f => f.id);
          const existingIds = await this.db.hasFilingIds(ids);
          const newFilings = filings.filter(f => !existingIds.has(f.id));

          if (newFilings.length > 0) {
            const dbFilings = newFilings.map(f => this.toDbFormat(f, 'daily_index'));
            await this.db.insertFilings(dbFilings);
            totalFilings = newFilings.length;
          }
        }
      }

      // Mark job as completed
      await this.db.updateBackfillJob(id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: {
          processed: processedDays || 1,
          total: processedDays || 1,
          filingsAdded: totalFilings,
          errors
        }
      });

      return { success: true, filingsAdded: totalFilings };
    } catch (error) {
      // Mark job as failed
      await this.db.updateBackfillJob(id, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message
      });

      throw error;
    }
  }

  // Backfill a single date
  async backfillDate(date, formTypes = []) {
    const filings = await this.fetchDailyIndex(date, formTypes);

    if (!filings.length) {
      return { inserted: 0 };
    }

    // Check which are new
    const ids = filings.map(f => f.id);
    const existingIds = await this.db.hasFilingIds(ids);
    const newFilings = filings.filter(f => !existingIds.has(f.id));

    if (!newFilings.length) {
      return { inserted: 0 };
    }

    // Insert new filings
    const dbFilings = newFilings.map(f => this.toDbFormat(f, 'daily_index'));
    const result = await this.db.insertFilings(dbFilings);

    return { inserted: result.inserted };
  }

  // ============ Query Methods ============

  async getFilings(options = {}) {
    return this.db.getFilings(options);
  }

  async getFilingsCount(formType = null) {
    return this.db.getFilingsCount(formType);
  }

  async getFilingStats() {
    return this.db.getFilingStats();
  }

  // For backwards compatibility - alias for getFilings
  async getCachedFilings(offset = 0, limit = 100, formType = null) {
    const result = await this.db.getFilings({ offset, limit, formType });
    return result.filings;
  }

  async getCachedFilingsCount(formType = null) {
    return this.db.getFilingsCount(formType);
  }

  // ============ Helper Methods ============

  toDbFormat(filing, source) {
    return {
      id: filing.id,
      cik: filing.cik || 'Unknown',
      company_name: filing.companyName,
      ticker: filing.ticker || null,
      form_type: filing.formType,
      filed_at: filing.filedAt,
      description: filing.description || null,
      url: filing.url,
      source
    };
  }

  formatDateForIndex(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  getDateRange(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      // Skip weekends (SEC doesn't publish on weekends)
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============ Atom Feed Parsing ============

  parseAtomFeed(xml) {
    const filings = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];

      const getId = (tag) => {
        const m = entry.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
        return m ? m[1].trim() : '';
      };

      const title = getId('title');
      const accessionNumber = this.extractAccessionNumber(getId('id'));

      filings.push({
        id: accessionNumber || `rss-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        companyName: this.extractCompanyName(title),
        ticker: this.extractTicker(title),
        formType: this.extractFormType(title),
        filedAt: getId('updated') || new Date().toISOString(),
        description: this.cleanDescription(getId('summary') || title),
        url: this.extractLink(entry),
        cik: this.extractCIK(entry)
      });
    }

    return filings;
  }

  extractAccessionNumber(idString) {
    const match = idString.match(/accession-number=(\d{10}-\d{2}-\d{6})/);
    return match ? match[1] : idString;
  }

  extractCompanyName(title) {
    const match = title.match(/^[\w\-\/]+\s*-\s*(.+?)\s*\(/);
    return match ? match[1].trim() : title.split('-')[0].trim();
  }

  extractTicker(title) {
    const match = title.match(/\(([A-Z]{1,5})\)/);
    return match ? match[1] : null;
  }

  extractFormType(title) {
    const match = title.match(/^([\w\-\/]+)\s*-/);
    return match ? match[1].trim() : 'Unknown';
  }

  cleanDescription(summary) {
    return summary
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractLink(entry) {
    const match = entry.match(/<link[^>]*href="([^"]+)"/);
    return match ? match[1] : 'https://www.sec.gov';
  }

  extractCIK(entry) {
    const patterns = [
      /\/data\/(\d+)\//,
      /CIK[=:]?\s*(\d+)/i,
      /\((\d{7,10})\)/
    ];

    for (const pattern of patterns) {
      const match = entry.match(pattern);
      if (match) return match[1];
    }
    return 'Unknown';
  }

  // ============ Daily Index Discovery & Management ============

  // Discover available daily index files for a year
  async discoverDailyIndicesForYear(year) {
    const indices = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    for (let quarter = 1; quarter <= 4; quarter++) {
      // Skip future quarters
      if (year > currentYear) continue;
      if (year === currentYear) {
        const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
        if (quarter > currentQuarter) continue;
      }

      // Get quarter start and end dates
      const quarterStart = new Date(year, (quarter - 1) * 3, 1);
      const quarterEnd = new Date(year, quarter * 3, 0);

      // For current quarter, don't go past today
      const endDate = year === currentYear && quarter === Math.ceil((currentDate.getMonth() + 1) / 3)
        ? currentDate
        : quarterEnd;

      // Generate all weekdays in the quarter
      const date = new Date(quarterStart);
      while (date <= endDate) {
        const day = date.getDay();
        // Skip weekends
        if (day !== 0 && day !== 6) {
          const dateStr = this.formatDateForIndex(date);
          const url = `${this.archivesURL}/daily-index/${year}/QTR${quarter}/form.${dateStr}.idx`;

          indices.push({
            indexDate: date.toISOString().split('T')[0],
            year,
            quarter,
            url,
            status: 'pending'
          });
        }
        date.setDate(date.getDate() + 1);
      }
    }

    return indices;
  }

  // Discover available daily indices for a date range
  async discoverDailyIndicesForRange(startDate, endDate) {
    const indices = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const day = current.getDay();
      // Skip weekends
      if (day !== 0 && day !== 6) {
        const year = current.getFullYear();
        const quarter = Math.ceil((current.getMonth() + 1) / 3);
        const dateStr = this.formatDateForIndex(current);
        const url = `${this.archivesURL}/daily-index/${year}/QTR${quarter}/form.${dateStr}.idx`;

        indices.push({
          indexDate: current.toISOString().split('T')[0],
          year,
          quarter,
          url,
          status: 'pending'
        });
      }
      current.setDate(current.getDate() + 1);
    }

    return indices;
  }

  // Check if a daily index file exists and get its metadata
  async checkDailyIndexExists(date) {
    const year = date.getFullYear();
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    const dateStr = this.formatDateForIndex(date);
    const url = `${this.archivesURL}/daily-index/${year}/QTR${quarter}/form.${dateStr}.idx`;

    try {
      const response = await axios.head(url, {
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 10000
      });

      return {
        exists: true,
        url,
        fileSize: parseInt(response.headers['content-length'] || '0', 10),
        lastModified: response.headers['last-modified'] || null
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return { exists: false, url, fileSize: 0, lastModified: null };
      }
      throw error;
    }
  }

  // Download daily index file and insert filings into sec_filings table
  async downloadDailyIndex(indexDate, insertFilings = true) {
    const date = new Date(indexDate);
    const year = date.getFullYear();
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    const dateStr = this.formatDateForIndex(date);
    const url = `${this.archivesURL}/daily-index/${year}/QTR${quarter}/form.${dateStr}.idx`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Encoding': 'gzip, deflate'
        },
        timeout: 60000,
        family: 4,
        responseType: 'text'
      });

      const content = response.data;
      const fileSize = Buffer.byteLength(content, 'utf8');

      // Parse filings from the index file
      const filings = this.parseIndexFile(content, date, []);

      let filingsInserted = 0;

      // Insert filings into sec_filings table if requested and db is available
      if (insertFilings && this.db && filings.length > 0) {
        // Check which filings are new
        const ids = filings.map(f => f.id);
        const existingIds = await this.db.hasFilingIds(ids);
        const newFilings = filings.filter(f => !existingIds.has(f.id));

        if (newFilings.length > 0) {
          // Convert to DB format and insert
          const dbFilings = newFilings.map(f => this.toDbFormat(f, 'daily_index'));
          const result = await this.db.insertFilings(dbFilings);
          filingsInserted = result.inserted;
        }
      }

      return {
        success: true,
        url,
        fileSize,
        filingCount: filings.length,
        filingsInserted,
        filings
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: false,
          url,
          notAvailable: true,
          error: 'Index file not available for this date'
        };
      }
      if (error.response?.status === 403) {
        return {
          success: false,
          url,
          notAvailable: false,
          error: 'SEC rate limit exceeded. Please wait a few seconds and try again.'
        };
      }
      console.error('SEC downloadDailyIndex error:', error.code, error.message, error.cause);
      return {
        success: false,
        url,
        notAvailable: false,
        error: error.cause?.message || error.message
      };
    }
  }

  // Execute a daily index sync job
  async executeDailyIndexSyncJob(job, onProgress = null) {
    const { id, job_type, start_date, end_date, target_date } = job;

    try {
      // Mark job as running
      await this.db.updateDailyIndexSyncJob(id, {
        status: 'running',
        started_at: new Date().toISOString()
      });

      let indices = [];
      let processedCount = 0;
      let downloadedCount = 0;
      let totalFilingsInserted = 0;
      let errors = [];

      if (job_type === 'sync_available') {
        // Sync all available indices from 1994 to now
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 1994; year--) {
          const yearIndices = await this.discoverDailyIndicesForYear(year);
          indices = indices.concat(yearIndices);
        }
      } else if (job_type === 'download_range' && start_date && end_date) {
        indices = await this.discoverDailyIndicesForRange(
          new Date(start_date),
          new Date(end_date)
        );
      } else if (job_type === 'download_single' && target_date) {
        const date = new Date(target_date);
        const year = date.getFullYear();
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        const dateStr = this.formatDateForIndex(date);
        const url = `${this.archivesURL}/daily-index/${year}/QTR${quarter}/form.${dateStr}.idx`;

        indices = [{
          indexDate: target_date,
          year,
          quarter,
          url,
          status: 'pending'
        }];
      }

      const totalIndices = indices.length;

      // First, upsert all discovered indices as pending
      if (indices.length > 0) {
        await this.db.upsertDailyIndices(indices);
      }

      // Now download each index file and insert filings
      for (const index of indices) {
        try {
          const result = await this.downloadDailyIndex(index.indexDate, true);

          if (result.success) {
            await this.db.updateDailyIndex(index.indexDate, {
              status: 'downloaded',
              filing_count: result.filingCount,
              file_size: result.fileSize,
              downloaded_at: new Date().toISOString(),
              error_message: null
            });
            downloadedCount++;
            totalFilingsInserted += result.filingsInserted || 0;
          } else if (result.notAvailable) {
            await this.db.updateDailyIndex(index.indexDate, {
              status: 'not_available',
              error_message: result.error
            });
          } else {
            await this.db.updateDailyIndex(index.indexDate, {
              status: 'failed',
              error_message: result.error
            });
            errors.push({ date: index.indexDate, error: result.error });
          }

          processedCount++;

          // Update progress
          if (onProgress) {
            onProgress({
              processed: processedCount,
              total: totalIndices,
              downloaded: downloadedCount,
              filingsInserted: totalFilingsInserted
            });
          }

          await this.db.updateDailyIndexSyncJob(id, {
            progress: {
              processed: processedCount,
              total: totalIndices,
              downloaded: downloadedCount,
              filingsInserted: totalFilingsInserted,
              errors
            }
          });

          // Rate limit: respect SEC's 10 requests/second limit
          await this.delay(150);
        } catch (error) {
          errors.push({ date: index.indexDate, error: error.message });
          processedCount++;
        }
      }

      // Mark job as completed
      await this.db.updateDailyIndexSyncJob(id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: {
          processed: processedCount,
          total: totalIndices,
          downloaded: downloadedCount,
          filingsInserted: totalFilingsInserted,
          errors
        }
      });

      return { success: true, processed: processedCount, downloaded: downloadedCount, filingsInserted: totalFilingsInserted };
    } catch (error) {
      // Mark job as failed
      await this.db.updateDailyIndexSyncJob(id, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message
      });

      throw error;
    }
  }

  // Get available years from SEC
  getAvailableYears() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1994; year--) {
      years.push(year);
    }
    return years;
  }
}

module.exports = SECClient;
