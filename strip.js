const fs = require('fs');
const decomment = require('decomment');
try {
  let content = fs.readFileSync('server.js', 'utf8');
  fs.writeFileSync('server.js', decomment(content));
  let html = fs.readFileSync('public/pay.html', 'utf8');
  fs.writeFileSync('public/pay.html', decomment.html(html));
  console.log("Done");
} catch (e) {
  console.error(e);
}
