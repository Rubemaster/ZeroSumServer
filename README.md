# ZeroSum Server

Express.js server for querying financial data from a DuckDB database.

## Installation

```bash
npm install
```

Note: The `duckdb` package may take several minutes to install as it compiles native bindings.

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

### GET /api/financials?company=<name>
Search for financial data by company name (partial match supported)

**Parameters:**
- `company` (required): Partial or full company name to search for

**Example:**
```bash
curl "http://localhost:3000/api/financials?company=Apple"
```

**Response:**
```json
{
  "query": "Apple",
  "count": 42,
  "results": [
    {
      "name": "Apple Inc.",
      "date": "2024-03-31",
      "filing_date": "2024-05-02",
      "cik": "0000320193",
      "Revenue": 123456789,
      "Assets": 987654321,
      "CurrentAssets": 456789123,
      "CurrentLiabilities": 234567890,
      "StockholdersEquity": 654321098,
      "TotalLiabilities": 333333231,
      "LongTermDebt": 98765341,
      "NetCurrentAssets": 222221233,
      "NetIncome": 34567890,
      "EarningsPerShare": 2.34,
      "SharesOutstanding": 14765432109,
      "BookValuePerShare": 44.32,
      "GrahamNumber": 78.56
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
- `financials.sql` - SQL query template for financial data
- `financials.duckdb` - DuckDB database file
- `EX 5.sql` - Original SQL query reference
