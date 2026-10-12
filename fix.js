const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(full, 'utf8');
      if (!content.includes('use client') && !content.includes('export const dynamic')) {
        content = "export const dynamic = 'force-dynamic';\n" + content;
        fs.writeFileSync(full, content);
        console.log(`Added to ${full}`);
      }
    }
  });
}

walk('app');
