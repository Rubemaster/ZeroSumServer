const crypto = require('crypto');
const axios = require('axios');

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

const CLIENT_ID = 'CK2ZQGQM7C7J4OCXWIYMUSSQYJ';
const CLIENT_SECRET = 'ctuUQavkGW8XY3BvryutYCD4gWsDu7wjhe5udkstYP8';

// EC Private Key (optional - for private_key_jwt method)
const PRIVATE_KEY = null;

// Token endpoint (sandbox)
const TOKEN_URL = 'https://authx.sandbox.alpaca.markets/v1/oauth2/token';

// ============================================
// JWT GENERATION CODE
// ============================================

function base64urlEncode(data) {
    let base64;
    if (Buffer.isBuffer(data)) {
        base64 = data.toString('base64');
    } else {
        base64 = Buffer.from(JSON.stringify(data)).toString('base64');
    }
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function derToRaw(derSignature) {
    // DER format: 0x30 [total-length] 0x02 [r-length] [r] 0x02 [s-length] [s]
    let offset = 2; // Skip 0x30 and total length

    // Read R
    if (derSignature[offset] !== 0x02) throw new Error('Invalid DER signature');
    offset++;
    const rLength = derSignature[offset];
    offset++;
    let r = derSignature.slice(offset, offset + rLength);
    offset += rLength;

    // Read S
    if (derSignature[offset] !== 0x02) throw new Error('Invalid DER signature');
    offset++;
    const sLength = derSignature[offset];
    offset++;
    let s = derSignature.slice(offset, offset + sLength);

    // Remove leading zeros and pad to 32 bytes each
    if (r.length > 32) r = r.slice(r.length - 32);
    if (s.length > 32) s = s.slice(s.length - 32);

    const rawSig = Buffer.alloc(64);
    r.copy(rawSig, 32 - r.length);
    s.copy(rawSig, 64 - s.length);

    return rawSig;
}

function generateJWT(audience = TOKEN_URL) {
    // Header
    const header = {
        alg: 'ES256',
        typ: 'JWT',
        kid: CLIENT_ID
    };

    // Payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: CLIENT_ID,
        sub: CLIENT_ID,
        aud: audience,
        iat: now,
        exp: now + 300, // 5 minutes
        jti: crypto.randomUUID()
    };

    // Create signing input
    const headerEncoded = base64urlEncode(header);
    const payloadEncoded = base64urlEncode(payload);
    const signingInput = `${headerEncoded}.${payloadEncoded}`;

    // Sign with ES256 (ECDSA P-256 + SHA-256)
    const sign = crypto.createSign('SHA256');
    sign.update(signingInput);

    // Get DER signature
    const derSignature = sign.sign(PRIVATE_KEY);

    // Convert DER to raw R||S format (64 bytes for P-256)
    const rawSignature = derToRaw(derSignature);
    const signatureEncoded = base64urlEncode(rawSignature);

    return `${signingInput}.${signatureEncoded}`;
}

async function testTokenExchangeWithSecret() {
    console.log('\n========== TESTING CLIENT SECRET AUTH ==========\n');

    const endpoints = [
        { url: 'https://authx.sandbox.alpaca.markets/v1/oauth2/token', name: 'Sandbox' },
        { url: 'https://authx.alpaca.markets/v1/oauth2/token', name: 'Production' }
    ];

    for (const endpoint of endpoints) {
        console.log(`\n--- ${endpoint.name}: ${endpoint.url} ---\n`);

        // Method 1: client_id and client_secret in body
        const params1 = new URLSearchParams();
        params1.append('grant_type', 'client_credentials');
        params1.append('client_id', CLIENT_ID);
        params1.append('client_secret', CLIENT_SECRET);

        console.log('Method 1: client_id + client_secret in body');
        try {
            const response = await axios.post(endpoint.url, params1.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            console.log('SUCCESS!');
            console.log(JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.log('  Failed:', error.response?.status, JSON.stringify(error.response?.data));
        }

        // Method 2: Basic Auth header
        const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        const params2 = new URLSearchParams();
        params2.append('grant_type', 'client_credentials');

        console.log('Method 2: Basic Auth header');
        try {
            const response = await axios.post(endpoint.url, params2.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${basicAuth}`
                }
            });
            console.log('SUCCESS!');
            console.log(JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.log('  Failed:', error.response?.status, JSON.stringify(error.response?.data));
        }

        // Method 3: With scope
        const params3 = new URLSearchParams();
        params3.append('grant_type', 'client_credentials');
        params3.append('client_id', CLIENT_ID);
        params3.append('client_secret', CLIENT_SECRET);
        params3.append('scope', 'general');

        console.log('Method 3: With scope=general');
        try {
            const response = await axios.post(endpoint.url, params3.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            console.log('SUCCESS!');
            console.log(JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.log('  Failed:', error.response?.status, JSON.stringify(error.response?.data));
        }
    }

    throw new Error('All token exchange attempts failed');
}

// Main execution
async function main() {
    try {
        console.log('Client ID:', CLIENT_ID);
        console.log('Client Secret:', CLIENT_SECRET.substring(0, 8) + '...');

        console.log('\n========== CURL COMMAND (client_secret) ==========\n');
        console.log(`curl -X POST "${TOKEN_URL}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=${CLIENT_ID}" \\
  -d "client_secret=${CLIENT_SECRET}"`);

        // Test client secret authentication
        await testTokenExchangeWithSecret();

    } catch (error) {
        console.error('\nError:', error.message);
    }
}

module.exports = { generateJWT, testTokenExchangeWithSecret, CLIENT_ID, TOKEN_URL };

// Run if executed directly
if (require.main === module) {
    main();
}
