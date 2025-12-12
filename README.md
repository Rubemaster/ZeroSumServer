# ZeroSum Server

Express.js server for querying financial data from a DuckDB database with optional Alpaca Markets integration for trading symbols.

## Installation

```bash
npm install
```

Note: The `duckdb` package may take several minutes to install as it compiles native bindings.

## Configuration

Create a `.env` file in the root directory:

```bash
# Database (required for cloud deployment)
DATABASE_URL=https://your-cloud-storage-url/financials.duckdb

# Alpaca credentials (optional)
ALPACA_CLIENT_ID=your_client_id_here
ALPACA_PRIVATE_KEY=your_base64_private_key_here
ALPACA_BASE_URL=https://broker-api.sandbox.alpaca.markets
PORT=3000
```

See `.env.example` for a template.

### Database Setup

**For local development:** The database file (`financials.duckdb`) should already be present in the repository directory. No additional configuration needed.

**For cloud deployment (Render, Heroku, etc.):**
1. Upload `financials.duckdb` to a cloud storage service (Dropbox, Google Drive, AWS S3, etc.)
2. Get a direct download URL for the file
3. Set the `DATABASE_URL` environment variable to this URL
4. The server will automatically download the database on first startup

### Alpaca Integration (Optional)

**Important:** For `ALPACA_PRIVATE_KEY`, copy only the base64 content between the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` delimiters (without the delimiters themselves).

**Note:** Alpaca integration is optional. The server will work without it, but won't include ticker symbols in responses.

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### GET /
Welcome message

### GET /health
Health check endpoint
- Returns: `{ status: 'OK', timestamp: '...' }`

### GET /api/financials?company=<name>&enrichAlpaca=true
Search for financial data by company name (partial match supported)

**Parameters:**
- `company` (required): Partial or full company name to search for
- `enrichAlpaca` (optional): Set to `true` to include Alpaca trading symbols

**Example:**
```bash
# Without Alpaca enrichment
curl "http://localhost:3000/api/financials?company=Apple"

# With Alpaca enrichment (requires API credentials)
curl "http://localhost:3000/api/financials?company=Apple&enrichAlpaca=true"
```

**Response (without Alpaca):**
```json
{
  "query": "Apple",
  "count": 1,
  "alpacaEnriched": false,
  "results": [
    {
      "name": "APPLE INC",
      "date": 20250331,
      "filing_date": "2025-05-02T06:01:00.000Z",
      "cik": 320193,
      "Revenue": 95359000000,
      "Assets": 331233000000,
      "EarningsPerShare": 1.65,
      "GrahamNumber": 12.83,
      ...
    }
  ]
}
```

**Response (with Alpaca enrichment):**
```json
{
  "query": "Apple",
  "count": 1,
  "alpacaEnriched": true,
  "results": [
    {
      "name": "APPLE INC",
      "date": 20250331,
      "cik": 320193,
      "Revenue": 95359000000,
      "EarningsPerShare": 1.65,
      ...,
      "alpaca": {
        "symbol": "AAPL",
        "exchange": "NASDAQ",
        "asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
        "tradable": true,
        "marginable": true,
        "shortable": true,
        "easy_to_borrow": true,
        "fractionable": true
      }
    }
  ]
}
```

### GET /api/companies?search=<partial_name>
Get list of unique company names (optional search filter)

**Parameters:**
- `search` (optional): Partial company name to filter results (max 100 results when filtered)

**Example:**
```bash
# Get all companies
curl "http://localhost:3000/api/companies"

# Search for companies
curl "http://localhost:3000/api/companies?search=tech"
```

**Response:**
```json
{
  "count": 150,
  "companies": [
    "Apple Inc.",
    "Microsoft Corporation",
    "Amazon.com, Inc.",
    ...
  ]
}
```

## Database

The server uses a DuckDB database (`financials.duckdb`) containing financial statement data with the following metrics:

- Revenue
- Assets (Total, Current)
- Liabilities (Total, Current, Long-term Debt)
- Stockholders Equity
- Net Current Assets
- Net Income
- Earnings Per Share
- Shares Outstanding
- Book Value Per Share
- Graham Number (intrinsic value calculation)

## Files

- `index.js` - Main Express server
- `alpaca.js` - Alpaca Markets API integration
- `financials.sql` - SQL query template for financial data
- `financials.duckdb` - DuckDB database file
- `.env` - Environment variables (create from `.env.example`)
- `.env.example` - Environment variables template
