const fs = require('fs');
const path = require('path');
const distFiles = fs.readdirSync('dist');
const cssFile = distFiles.find(f => f.endsWith('.css'));
const jsFile = distFiles.find(f => f.endsWith('.js'));
const css = fs.readFileSync(path.join('dist', cssFile), 'utf8');
let js = fs.readFileSync(path.join('dist', jsFile), 'utf8');
// Escape any </script> patterns inside JS so they don't close the inline script tag
js = js.replace(/<\/script/gi, '<\\/script');

const parts = [];
parts.push('<!DOCTYPE html>');
parts.push('<html lang="en">');
parts.push('<head>');
parts.push('  <meta charset="UTF-8">');
parts.push("  <link rel=\"icon\" href=\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='28' font-size='28'>⚡</text></svg>\">");
parts.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
parts.push('  <title>SuperNetrix — Outcome Driven Engineering</title>');
parts.push('  <link rel="preconnect" href="https://fonts.googleapis.com">');
parts.push('  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
parts.push('  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">');
parts.push('  <style>');
parts.push(css);
parts.push('  </style>');
parts.push('</head>');
parts.push('<body>');
parts.push('  <div id="root"></div>');
parts.push('  <script type="module">');
parts.push(js);
parts.push('  <\/script>');
parts.push('</body>');
parts.push('</html>');

const html = parts.join('\n');
fs.writeFileSync('bundle.html', html);
fs.copyFileSync('bundle.html', '../mnt/outputs/supernetrix-landing.html');
console.log('Bundle: ' + Math.round(html.length / 1024) + 'KB — copied to outputs');
