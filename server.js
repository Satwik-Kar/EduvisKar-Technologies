const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

// Load environment variables from .env or .env.local if present
function loadEnvFiles() {
    const files = ['.env', '.env.local', '.env.production'];
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
                        const v = vals.join('=').trim().replace(/^["']|["']$/g, '');
                        if (k) {
                            process.env[k] = v;
                        }
                    }
                });
            } catch (_) {}
        }
    });
}
loadEnvFiles();

const PORT = process.env.PORT || 8080;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.ADMIN_KEY || 'admin123';

// Active cryptographically secure admin session tokens (token -> expireTimestamp)
const activeAdminSessions = new Map();

// Rate limiting tracker for public form submissions (IP -> { count, resetTime })
const ipRateLimiter = new Map();

// Clean up expired admin sessions every 30 minutes
setInterval(() => {
    const now = Date.now();
    for (const [token, expireTime] of activeAdminSessions.entries()) {
        if (now > expireTime) {
            activeAdminSessions.delete(token);
        }
    }
}, 30 * 60 * 1000);

// Ensure data directory exists for SQLite database persistence
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize SQLite database
const dbPath = path.join(dataDir, 'hiring.db');
const db = new DatabaseSync(dbPath);

// Create candidates table schema if not existing
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

// Alter table migrations for existing database files
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
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > 15 * 1024 * 1024) { // 15MB max
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
    // 1. Check Bearer token in Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        const expireTime = activeAdminSessions.get(token);
        if (expireTime && Date.now() < expireTime) {
            return true;
        }
    }

    // 2. Check token in query param
    const queryToken = urlObj.searchParams.get('token');
    if (queryToken) {
        const expireTime = activeAdminSessions.get(queryToken);
        if (expireTime && Date.now() < expireTime) {
            return true;
        }
    }

    // 3. Fallback check for direct API Key header or query param
    const headerKey = req.headers['x-admin-key'];
    if (verifyKeyTimingSafe(headerKey, ADMIN_API_KEY)) return true;

    const queryKey = urlObj.searchParams.get('key');
    if (verifyKeyTimingSafe(queryKey, ADMIN_API_KEY)) return true;

    return false;
}

function checkRateLimit(req) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_ip';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minute window
    const maxRequests = 10; // Max 10 submissions per IP per 15 mins

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

const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = urlObj.pathname;

    // --- API ROUTES ---

    // Admin Login Endpoint (returns secure session token)
    if (pathname === '/api/hiring/admin/login' && req.method === 'POST') {
        try {
            const data = await parseJsonBody(req);
            const passcode = data.passcode || data.key || '';

            if (verifyKeyTimingSafe(passcode, ADMIN_API_KEY)) {
                const sessionToken = crypto.randomBytes(32).toString('hex');
                const expiresAt = Date.now() + (12 * 60 * 60 * 1000); // 12 hours valid
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

    // 1. Submit candidate job application
    if (pathname === '/api/hiring/apply' && req.method === 'POST') {
        if (!checkRateLimit(req)) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Rate limit exceeded. Please wait 15 minutes before submitting again.' }));
        }

        try {
            const data = await parseJsonBody(req);
            const {
                full_name,
                email,
                phone,
                position,
                experience_years,
                github_url,
                linkedin_url,
                portfolio_url,
                social_media_url,
                cover_letter,
                resume_filename,
                resume_mimetype,
                resume_base64
            } = data;

            if (!full_name || !email || !position) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'Full name, email, and position are required fields.' }));
            }

            // Input Validation & Length Constraints
            const cleanEmail = email.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: false, error: 'Invalid email address format.' }));
            }

            const cleanName = full_name.trim().slice(0, 100);
            const cleanPhone = (phone || '').trim().slice(0, 30);
            const cleanPosition = position.trim().slice(0, 100);
            const cleanExp = (experience_years || '').trim().slice(0, 50);
            const cleanGithub = (github_url || '').trim().slice(0, 300);
            const cleanLinkedin = (linkedin_url || '').trim().slice(0, 300);
            const cleanPortfolio = (portfolio_url || '').trim().slice(0, 300);
            const cleanSocial = (social_media_url || '').trim().slice(0, 300);
            const cleanCover = (cover_letter || '').trim().slice(0, 5000);

            // Role-specific validation
            if (cleanPosition === 'Full Stack Development Intern') {
                if (!cleanGithub || !cleanLinkedin) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: 'GitHub and LinkedIn profiles are required for Full Stack Development Interns.' }));
                }
            } else if (cleanPosition === 'Growth & Creator Marketing Intern') {
                if (!cleanSocial) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: false, error: 'Social Media profile link is required for Growth & Creator Marketing Interns.' }));
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
                cleanName,
                cleanEmail,
                cleanPhone,
                cleanPosition,
                cleanExp,
                cleanGithub,
                cleanLinkedin,
                cleanPortfolio,
                cleanSocial,
                cleanCover,
                (resume_filename || '').trim().slice(0, 150),
                (resume_mimetype || 'application/pdf').trim().slice(0, 50),
                resumeBuffer
            );

            res.writeHead(201, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, message: 'Application submitted successfully!' }));
        } catch (err) {
            console.error('Error handling job application submission:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
        }
    }

    // 2. Fetch list of candidates (Admin protected)
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
                FROM candidates 
                ORDER BY id DESC
            `);
            const candidates = stmt.all();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, data: candidates }));
        } catch (err) {
            console.error('Error fetching candidates:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: err.message }));
        }
    }

    // 3. Download stored candidate resume BLOB (Admin protected)
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
            console.error('Error fetching resume blob:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: err.message }));
        }
    }

    // 4. Delete candidate application (Admin protected)
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
            console.error('Error deleting candidate:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: err.message }));
        }
    }

    // --- STATIC FILE SERVING ---

    let requestPath = pathname;

    if (requestPath === '/') {
        requestPath = '/index.html';
    } else if (!path.extname(requestPath)) {
        if (fs.existsSync(path.join(__dirname, requestPath + '.html'))) {
            requestPath += '.html';
        }
    }

    const absolutePath = path.join(__dirname, requestPath);

    // Security check: prevent directory traversal
    if (!absolutePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('403 Forbidden');
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

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
    <meta name="robots" content="noindex, follow">
    <title>404 - Page Not Found | EduvisKar Technologies</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 50px; background-color: #f8f9fa; color: #202124;">
    <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">404 - Page Not Found</h1>
    <p style="font-size: 1.125rem; color: #5f6368; margin-bottom: 2rem;">The requested page <code>${requestPath}</code> does not exist.</p>
    <a href="/" style="display: inline-block; padding: 12px 24px; background-color: #1a73e8; color: #ffffff; text-decoration: none; border-radius: 24px; font-weight: 500;">Return to Home</a>
</body>
</html>`);
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`500 Internal Server Error: ${err.code}`);
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

