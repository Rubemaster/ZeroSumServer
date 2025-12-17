const crypto = require('crypto');
const https = require('https');

class SumsubClient {
  constructor(appToken, secretKey) {
    this.appToken = appToken;
    this.secretKey = secretKey;
  }

  /**
   * Generate HMAC signature for Sumsub API requests
   */
  createSignature(ts, method, path, bodyString = '') {
    const data = ts + method.toUpperCase() + path + bodyString;
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');
  }

  /**
   * Make authenticated request to Sumsub API
   */
  async request(method, path, body = null) {
    const ts = Math.floor(Date.now() / 1000).toString();

    // Stringify body once and use for both signature and request
    const bodyString = body ? JSON.stringify(body) : '';
    const signature = this.createSignature(ts, method, path, bodyString);

    const headers = {
      'Accept': 'application/json',
      'X-App-Token': this.appToken,
      'X-App-Access-Sig': signature,
      'X-App-Access-Ts': ts,
    };

    if (bodyString) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyString);
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.sumsub.com',
        port: 443,
        path: path,
        method: method,
        headers: headers,
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              const error = new Error(parsed.description || 'Sumsub API error');
              error.response = { status: res.statusCode, data: parsed };
              reject(error);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', reject);

      if (bodyString) {
        req.write(bodyString);
      }
      req.end();
    });
  }

  /**
   * Create or get an applicant
   * @param {string} externalUserId - Unique user ID from your system (e.g., Clerk user ID)
   * @param {string} levelName - Verification level name
   */
  async createApplicant(externalUserId, levelName) {
    const path = `/resources/applicants?levelName=${encodeURIComponent(levelName)}`;
    const body = {
      externalUserId,
    };

    try {
      return await this.request('POST', path, body);
    } catch (error) {
      // If applicant already exists, get them instead
      if (error.response?.status === 409) {
        return this.getApplicantByExternalId(externalUserId);
      }
      throw error;
    }
  }

  /**
   * Get applicant by external user ID
   */
  async getApplicantByExternalId(externalUserId) {
    const path = `/resources/applicants/-;externalUserId=${encodeURIComponent(externalUserId)}/one`;
    return this.request('GET', path);
  }

  /**
   * Generate access token for Web SDK
   * @param {string} externalUserId - Unique user ID
   * @param {string} levelName - Verification level name
   * @param {number} ttlInSecs - Token time-to-live in seconds (default: 1 hour)
   */
  async generateAccessToken(externalUserId, levelName, ttlInSecs = 3600) {
    // First, ensure applicant exists
    await this.createApplicant(externalUserId, levelName);

    // Generate access token (POST with no body)
    const path = `/resources/accessTokens?userId=${encodeURIComponent(externalUserId)}&levelName=${encodeURIComponent(levelName)}&ttlInSecs=${ttlInSecs}`;
    return this.request('POST', path, null);
  }

  /**
   * Get applicant verification status
   */
  async getApplicantStatus(applicantId) {
    const path = `/resources/applicants/${applicantId}/requiredIdDocsStatus`;
    return this.request('GET', path);
  }

  /**
   * Get full applicant data including verification results
   */
  async getApplicant(applicantId) {
    const path = `/resources/applicants/${applicantId}`;
    return this.request('GET', path);
  }
}

module.exports = SumsubClient;
