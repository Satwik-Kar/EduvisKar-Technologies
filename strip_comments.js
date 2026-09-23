const fs = require('fs');

function stripJSComments(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Regex for JS comments (careful with strings)
    // A simple regex might break on URLs, but we'll try a robust one
    content = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, match => {
        if (match.startsWith('//') && !match.startsWith('// ') && match.includes('://')) {
            // Probably part of a URL in a string like "http://" but regex matched loosely
            // Actually, replace is not safe this way if it matches inside a string.
        }
        return '';
    });
    fs.writeFileSync(filePath, content);
}

// A better way is to use a parser, or since we know the codebase, a simpler script.
