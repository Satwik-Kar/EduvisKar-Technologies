const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

// Standard MIME types for web files
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
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    // Basic Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Clean URL routing & path normalization
    let requestPath = req.url.split('?')[0];

    // Normalize route endings
    if (requestPath === '/') {
        requestPath = '/index.html';
    } else if (!path.extname(requestPath)) {
        // If route has no extension, try appending .html (e.g., /privacy -> /privacy.html)
        if (fs.existsSync(path.join(__dirname, requestPath + '.html'))) {
            requestPath += '.html';
        }
    }

    const absolutePath = path.join(__dirname, requestPath);
    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Static asset caching header
    if (requestPath.startsWith('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
    } else {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }

    // Read and serve file securely
    fs.readFile(absolutePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.error(`[404] Not Found: ${requestPath}`);
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head><title>404 - Page Not Found</title></head>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h1>404 - Page Not Found</h1>
                        <p>The page <code>${requestPath}</code> does not exist.</p>
                        <a href="/">Return to Home</a>
                    </body>
                    </html>
                `);
            } else {
                console.error(`[500] Server Error: ${err.code}`);
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
    console.log(`=========================================`);
    console.log(`🚀 EduvisKar Technologies Production Server`);
    console.log(`👉 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`👉 Server Port: ${PORT}`);
    console.log(`👉 Access URL:  http://localhost:${PORT}`);
    console.log(`=========================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: Closing HTTP server...');
    server.close(() => {
        console.log('HTTP server closed.');
    });
});
