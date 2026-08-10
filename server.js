const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

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
    '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    let requestPath = req.url.split('?')[0];

    if (requestPath === '/') {
        requestPath = '/index.html';
    } else if (!path.extname(requestPath)) {
        if (fs.existsSync(path.join(__dirname, requestPath + '.html'))) {
            requestPath += '.html';
        }
    }

    const absolutePath = path.join(__dirname, requestPath);
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
