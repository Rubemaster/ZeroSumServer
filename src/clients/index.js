const { AlpacaClient, IndividualAlpacaClient } = require('./alpaca');
const FinnhubClient = require('./finnhub');
const YahooFinanceClient = require('./yahoo-finance');
const SumsubClient = require('./sumsub');
const PolygonClient = require('./polygon');
const SECClient = require('./sec');
const SupabaseClient = require('./supabase');

module.exports = {
  AlpacaClient,
  IndividualAlpacaClient,
  FinnhubClient,
  YahooFinanceClient,
  SumsubClient,
  PolygonClient,
  SECClient,
  SupabaseClient
};
