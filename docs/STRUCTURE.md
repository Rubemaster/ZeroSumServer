# ZeroSum Server - Project Structure

## Directory Layout

```
ZeroSumServer/
├── index.js                 # Main application entry point
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── .gitattributes           # Git LFS configuration
├── financials.duckdb        # DuckDB database file (Git LFS)
│
├── src/                     # Source code
│   ├── clients/             # External API clients
│   │   ├── index.js         # Client exports
│   │   ├── alpaca.js        # Alpaca Broker API client
│   │   ├── finnhub.js       # Finnhub market data client
│   │   └── yahoo-finance.js # Yahoo Finance historical data client
│   │
│   ├── db/                  # Database related files
│   │   └── financials.sql   # SQL query for financial data
│   │
│   └── routes/              # API route handlers (future use)
│
├── docs/                    # Documentation
│   └── STRUCTURE.md         # This file
│
├── node_modules/            # Dependencies (not in git)
└── .claude/                 # Claude Code settings
```

## Allowed File Locations

### Where to put new files:

| File Type | Location | Example |
|-----------|----------|---------|
| API clients | `src/clients/` | `src/clients/polygon.js` |
| SQL queries | `src/db/` | `src/db/companies.sql` |
| Route handlers | `src/routes/` | `src/routes/market.js` |
| Documentation | `docs/` | `docs/API.md` |
| Database files | Root (`/`) | `financials.duckdb` |
| Config files | Root (`/`) | `.env`, `package.json` |

### Import patterns:

```javascript
// From index.js (root)
const { AlpacaClient, FinnhubClient } = require('./src/clients');
const query = fs.readFileSync('./src/db/financials.sql', 'utf8');

// From within src/clients/
const axios = require('axios');  // External packages

// From within src/routes/ (future)
const { FinnhubClient } = require('../clients');
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         index.js                                 │
│  (Express server, route definitions, client initialization)     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────────┐
│   DuckDB    │   │  Finnhub    │   │  Yahoo Finance  │
│ (SEC Data)  │   │ (Quotes)    │   │  (Historical)   │
└─────────────┘   └─────────────┘   └─────────────────┘
         │                 │                 │
         │                 ▼                 │
         │        ┌─────────────┐            │
         └───────►│   Alpaca    │◄───────────┘
                  │ (Enrichment)│
                  └─────────────┘
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `DATABASE_URL` | No | URL to download database if missing |
| `FINNHUB_API_KEY` | Yes | Finnhub API key for market data |
| `ALPACA_CLIENT_ID` | No | Alpaca Broker API client ID |
| `ALPACA_CLIENT_SECRET` | No | Alpaca Broker API client secret |
| `ALPACA_AUTH_URL` | No | Alpaca auth URL (defaults to sandbox) |
| `ALPACA_BROKER_URL` | No | Alpaca broker URL (defaults to sandbox) |

## API Endpoints

### Financial Data (DuckDB)
- `GET /api/financials?company=<name>` - Search SEC filings
- `GET /api/companies?search=<query>` - List companies

### Market Data (Finnhub)
- `GET /api/market/quote/:symbol` - Real-time quote
- `GET /api/market/profile/:symbol` - Company profile
- `GET /api/market/financials/:symbol` - Financial metrics
- `GET /api/market/search?q=<query>` - Symbol search
- `GET /api/market/news?symbol=<symbol>` - News

### Historical Data (Yahoo Finance)
- `GET /api/history/:symbol` - OHLCV data for charting
- `GET /api/yahoo/quote/:symbol` - Current quote

### System
- `GET /` - Welcome message
- `GET /health` - Health check
