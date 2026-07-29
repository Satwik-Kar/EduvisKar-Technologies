const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Standard MIME types for web files
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    
    // Route root to index.html
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Remove query strings if any
    filePath = filePath.split('?')[0];
    
    // Construct the absolute path
    const absolutePath = path.join(__dirname, filePath);
    
    // Determine content type based on extension
    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Read and serve the file
    fs.readFile(absolutePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.error(`404 File not found: ${absolutePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                console.error(`500 Server error: ${err.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Node.js Development Server started!`);
    console.log(`👉 View your site at: http://localhost:${PORT}`);
    console.log(`=========================================`);
    console.log(`Press Ctrl+C to stop the server.\n`);
});
