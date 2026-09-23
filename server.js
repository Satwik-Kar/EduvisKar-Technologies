const http = require('http');
const fs = require('fs');
const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

function loadEnvFiles() {
    const files = ['.env', '.env.production'];
    files.forEach(filename => {
        const filePath = path.join(__dirname, filename);
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                content.split('\n').forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                        const [key, ...vals] = trimmed.split('=');
                        const k = key.trim();
                        // FIX: Restored empty string replacement
                        const v = vals.join('=').trim().replace(/^["']|["']$/g, '');
                        if (k && !process.env[k]) {
                            process.env[k] = v;
                        }
                    }
                });
            } catch (_) {}
        }
    });
}
loadEnvFiles();

const PORT = process.env.PORT || 8081;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.ADMIN_KEY || 'admin123';

const activeAdminSessions = new Map();
const ipRateLimiter = new Map();

setInterval(() => {
    const now = Date.now();
    for (const [token, expireTime] of activeAdminSessions.entries()) {
        if (now > expireTime) {
            activeAdminSessions.delete(token);
        }
    }
}, 30 * 60 * 1000);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'hiring.db');
const db = new DatabaseSync(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        position TEXT NOT NULL,
        experience_years TEXT,
        github_url TEXT,
        linkedin_url TEXT,
        portfolio_url TEXT,
        social_media_url TEXT,
        cover_letter TEXT,
        resume_filename TEXT,
        resume_mimetype TEXT,
        resume_blob BLOB,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

try { db.exec(`ALTER TABLE candidates ADD COLUMN github_url TEXT`); } catch (_) {}
try { db.exec(`ALTER TABLE candidates ADD COLUMN linkedin_url TEXT`); } catch (_) {}
try { db.exec(`ALTER TABLE candidates ADD COLUMN social_media_url TEXT`); } catch (_) {}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.pdf': 'application/pdf'
};

function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        // FIX: Restored empty string
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 15 * 1024 * 1024) {
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

function verifyKeyTimingSafe(inputKey, targetKey) {
    if (!inputKey || !targetKey) return false;
    const bufA = Buffer.from(String(inputKey));
    const bufB = Buffer.from(String(targetKey));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

function checkAdminAuth(req, urlObj) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        const expireTime = activeAdminSessions.get(token);
        if (expireTime && Date.now() < expireTime) {
            return true;
        }
    }
    const queryToken = urlObj.searchParams.get('token');
    if (queryToken) {
        const expireTime = activeAdminSessions.get(queryToken);
        if (expireTime && Date.now() < expireTime) {
            return true;
        }
    }
    const headerKey = req.headers['x-admin-key'];
    if (verifyKeyTimingSafe(headerKey, ADMIN_API_KEY)) return true;
    const queryKey = urlObj.searchParams.get('key');
    if (verifyKeyTimingSafe(queryKey, ADMIN_API_KEY)) return true;
    return false;
}

function checkRateLimit(req) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_ip';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 10;
    let record = ipRateLimiter.get(ip);
    if (!record || now > record.resetTime) {
        record = { count: 1, resetTime: now + windowMs };
        ipRateLimiter.set(ip, record);
        return true;
    }
    if (record.count >= maxRequests) {
        return false;
    }
    record.count++;
    return true;
}

const expressApp = express();
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const API_SECRET = process.env.API_SECRET;
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL || 'https://api.phonepe.com/apis/pg';

expressApp.post('/api/pay/create-intent', async (req, res) => {
  const { amount, userId, sourceApp, returnUrl, webhookUrl } = req.body;
  if (req.headers['x-api-secret'] !== API_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const transactionId = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO transactions (transaction_id, user_id, source_app, return_url, webhook_url, status, amount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING token`,
      [transactionId, userId, sourceApp, returnUrl, webhookUrl, 'PENDING', amount]
    );
    res.json({ checkout_token: result.rows[0].token });
  } catch (err) { res.status(500).json({ error: 'Internal Server Error' }); }
});

expressApp.post('/api/pay/initiate', async (req, res) => {
  const { token } = req.body;
  try {
    const tx = await pool.query('SELECT * FROM transactions WHERE token = $1', [token]);
    if (tx.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    const authString = Buffer.from(`${PHONEPE_CLIENT_ID}:${PHONEPE_CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await axios.post(`${PHONEPE_BASE_URL}/v1/oauth/token`, 
      new URLSearchParams({ grant_type: 'client_credentials' }),
      { headers: { 'Authorization': `Basic ${authString}` } }
    );
    const accessToken = tokenResponse.data.access_token;
    const checkoutResponse = await axios.post(`${PHONEPE_BASE_URL}/checkout/v2/pay`,
      {
        merchantOrderId: tx.rows[0].transaction_id,
        amount: Math.round(tx.rows[0].amount * 100),
        paymentFlow: { type: "PG_CHECKOUT", merchantUrls: { redirectUrl: `https://eduviskar.com/api/pay/callback` } }
      },
      { headers: { 'Authorization': `O-Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );
    res.json({ url: checkoutResponse.data.redirectUrl });
  } catch (err) { res.status(500).json({ error: 'Initiate Failed' }); }
});

expressApp.all('/api/pay/callback', async (req, res) => {
  const merchantOrderId = req.query.merchantOrderId || req.body.merchantOrderId || req.query.transactionId || req.body.transactionId;
  if (!merchantOrderId) return res.status(400).send('Missing Order ID');
  try {
    const authString = Buffer.from(`${PHONEPE_CLIENT_ID}:${PHONEPE_CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await axios.post(`${PHONEPE_BASE_URL}/v1/oauth/token`, 
      new URLSearchParams({ grant_type: 'client_credentials' }),
      { headers: { 'Authorization': `Basic ${authString}` } }
    );
    const accessToken = tokenResponse.data.access_token;
    const statusResponse = await axios.get(`${PHONEPE_BASE_URL}/checkout/v2/order/${merchantOrderId}/status`, {
      headers: { 'Authorization': `O-Bearer ${accessToken}` }
    });
    const phonepeState = statusResponse.data.state;
    const finalStatus = phonepeState === 'COMPLETED' ? 'SUCCESS' : 'FAILED';
    const tx = await pool.query('UPDATE transactions SET status = $1 WHERE transaction_id = $2 RETURNING *', [finalStatus, merchantOrderId]);
    if (tx.rowCount === 0) return res.status(400).send('Transaction not found');
    await axios.post(tx.rows[0].webhook_url, { transactionId: merchantOrderId, status: finalStatus, userId: tx.rows[0].user_id, amount: tx.rows[0].amount }, { headers: { 'x-api-secret': API_SECRET } });
    
    const delimiter = tx.rows[0].return_url.includes('?') ? '&' : '?';
    res.redirect(`${tx.rows[0].return_url}${delimiter}status=${finalStatus}&txnId=${merchantOrderId}`);
  } catch (err) { res.status(500).send('Callback Verification Error'); }
});

const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/api/pay')) {
        return expressApp(req, res);
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = urlObj.pathname;

    if (pathname === '/api/hiring/admin/login' && req.method === 'POST') {
        try {
            const data = await parseJsonBody(req);
            // FIX: Restored empty string
            const passcode = data.passcode || data.key || '';

            if (verifyKeyTimingSafe(passcode, ADMIN_API_KEY)) {
                const sessionToken = crypto.randomBytes(32).toString('hex');
                const expiresAt = Date.now() + (12 * 60 * 60 * 1000);
                activeAdminSessions.set(sessionToken, expiresAt);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    success: true,
                    token: sessionToken,
                    expires_at: expiresAt
                }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'Invalid admin passcode or API key.' }));
            }
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Invalid request payload.' }));
        }
    }

    if (pathname === '/api/hiring/apply' && req.method === 'POST') {
        if (!checkRateLimit(req)) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Rate limit exceeded. Please wait 15 minutes before submitting again.' }));
        }

        try {
            const data = await parseJsonBody(req);
            const {
                full_name, email, phone, position, experience_years, github_url, 
                linkedin_url, portfolio_url, social_media_url, cover_letter, 
                resume_filename, resume_mimetype, resume_base64
            } = data;

            if (!full_name || !email || !position) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'Full name, email, and position are required fields.' }));
            }

            const cleanEmail = email.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'Invalid email address format.' }));
            }

            // FIX: Restored empty strings across all sanitization logic
            const cleanName = full_name.trim().slice(0, 100);
            const cleanPhone = (phone || '').trim().slice(0, 30);
            const cleanPosition = position.trim().slice(0, 100);
            const cleanExp = (experience_years || '').trim().slice(0, 50);
            const cleanGithub = (github_url || '').trim().slice(0, 300);
            const cleanLinkedin = (linkedin_url || '').trim().slice(0, 300);
            const cleanPortfolio = (portfolio_url || '').trim().slice(0, 300);
            const cleanSocial = (social_media_url || '').trim().slice(0, 300);
            const cleanCover = (cover_letter || '').trim().slice(0, 5000);

            if (cleanPosition === 'Full Stack Development Intern') {
                if (!cleanGithub || !cleanLinkedin) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: 'GitHub and LinkedIn profiles are required for Full Stack Development Interns.' }));
                }
            } else if (cleanPosition === 'Digital Marketing Intern') {
                if (!cleanSocial) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: 'Social Media profile link is required for Digital Marketing Interns.' }));
                }
            }

            let resumeBuffer = null;
            if (resume_base64) {
                resumeBuffer = Buffer.from(resume_base64, 'base64');
            }

            const stmt = db.prepare(`
                INSERT INTO candidates 
                (full_name, email, phone, position, experience_years, github_url, linkedin_url, portfolio_url, social_media_url, cover_letter, resume_filename, resume_mimetype, resume_blob)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            stmt.run(
                cleanName, cleanEmail, cleanPhone, cleanPosition, cleanExp, cleanGithub, 
                cleanLinkedin, cleanPortfolio, cleanSocial, cleanCover,
                // FIX: Restored empty string
                (resume_filename || '').trim().slice(0, 150),
                (resume_mimetype || 'application/pdf').trim().slice(0, 50),
                resumeBuffer
            );

            res.writeHead(201, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, message: 'Application submitted successfully!' }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
        }
    }

    if (pathname === '/api/hiring/applications' && req.method === 'GET') {
        if (!checkAdminAuth(req, urlObj)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Unauthorized. Invalid admin passcode.' }));
        }
        try {
            const stmt = db.prepare(`
                SELECT 
                    id, full_name, email, phone, position, experience_years, 
                    github_url, linkedin_url, portfolio_url, social_media_url, 
                    cover_letter, resume_filename, resume_mimetype, status, created_at,
                    (CASE WHEN resume_blob IS NOT NULL THEN 1 ELSE 0 END) AS has_resume
                FROM candidates ORDER BY id DESC
            `);
            const candidates = stmt.all();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, data: candidates }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: err.message }));
        }
    }

    if (pathname.match(/^\/api\/hiring\/applications\/\d+\/resume$/) && req.method === 'GET') {
        if (!checkAdminAuth(req, urlObj)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Unauthorized.' }));
        }
        try {
            const id = pathname.split('/')[4];
            const stmt = db.prepare(`SELECT resume_filename, resume_mimetype, resume_blob FROM candidates WHERE id = ?`);
            const row = stmt.get(id);
            if (!row || !row.resume_blob) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'Resume not found for this candidate.' }));
            }
            const filename = row.resume_filename || `candidate_${id}_resume.pdf`;
            const mimeType = row.resume_mimetype || 'application/pdf';
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
                'Content-Length': row.resume_blob.length
            });
            return res.end(row.resume_blob);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: err.message }));
        }
    }

    if (pathname.match(/^\/api\/hiring\/applications\/\d+$/) && req.method === 'DELETE') {
        if (!checkAdminAuth(req, urlObj)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Unauthorized.' }));
        }
        try {
            const id = pathname.split('/')[4];
            const stmt = db.prepare(`DELETE FROM candidates WHERE id = ?`);
            stmt.run(id);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, message: 'Candidate deleted successfully.' }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: err.message }));
        }
    }

    if (pathname === '/legal') {
        const tab = urlObj.searchParams.get('tab');
        const redirectTarget = tab === 'privacy' ? '/privacy' : '/terms';
        res.writeHead(301, { 'Location': redirectTarget, 'Cache-Control': 'public, max-age=31536000' });
        return res.end();
    }

    if (pathname === '/features' || pathname === '/features/') {
        res.writeHead(301, { 'Location': '/#features', 'Cache-Control': 'public, max-age=31536000' });
        return res.end();
    }

    if (pathname.endsWith('.html') && pathname !== '/admin-hiring.html') {
        const cleanPath = pathname === '/index.html' ? '/' : pathname.slice(0, -5);
        res.writeHead(301, { 'Location': cleanPath + urlObj.search, 'Cache-Control': 'public, max-age=31536000' });
        return res.end();
    }

    let requestPath = pathname;
    if (requestPath === '/') {
        requestPath = '/index.html';
    } else if (!path.extname(requestPath)) {
        if (fs.existsSync(path.join(__dirname, requestPath + '.html'))) {
            requestPath += '.html';
        }
    }

    const absolutePath = path.join(__dirname, requestPath);
    if (!absolutePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('403 Forbidden');
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    if (
        pathname.startsWith('/_next/') || pathname.startsWith('/api/') ||
        pathname === '/admin-hiring' || pathname === '/admin-hiring.html' ||
        ['.woff', '.woff2', '.ttf', '.eot', '.json'].includes(ext)
    ) {
        res.setHeader('X-Robots-Tag', 'noindex, follow');
    }

    if (requestPath.startsWith('/assets/') && process.env.NODE_ENV === 'production' && !requestPath.endsWith('.js')) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }

    fs.readFile(absolutePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, {
                    'Content-Type': 'text/html; charset=utf-8',
                    'X-Robots-Tag': 'noindex, follow'
                });
                res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
</head>
<body style="text-align: center; padding: 50px; font-family: sans-serif;">
    <h1>404 - Page Not Found</h1>
    <a href="/">Return to Home</a>
</body>
</html>`);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`500 Internal Server Error`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
    server.close();
});