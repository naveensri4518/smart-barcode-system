const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Update primary blue variables to orange in :root
css = css.replace(/--color-accent:\s*#3b82f6;/, '--color-accent: #ff9f0a;');
css = css.replace(/--color-accent-hover:\s*#2563eb;/, '--color-accent-hover: #ffb340;');
css = css.replace(/--color-accent-light:\s*#eff6ff;/, '--color-accent-light: #fff3e0;');
css = css.replace(/--color-accent-dark:\s*#1d4ed8;/, '--color-accent-dark: #cc7a00;');
css = css.replace(/--shadow-glow:\s*0 0 20px rgba\(59, 130, 246, 0.35\);/, '--shadow-glow: 0 0 20px rgba(255, 159, 10, 0.35);');
css = css.replace(/--gradient-primary:\s*linear-gradient\(135deg, #3b82f6 0%, #6366f1 100%\);/, '--gradient-primary: linear-gradient(135deg, #ff9f0a 0%, #ff3b30 100%);');

// 2. Remove solid background from .app-layout so mesh is visible
css = css.replace(/\.app-layout\s*\{\s*display:\s*flex;\s*min-height:\s*100vh;\s*background:\s*var\(--color-bg\);\s*\}/, '.app-layout {\n  display: flex;\n  min-height: 100vh;\n  background: transparent;\n}');

// 3. Optional: Make body background transparent so apple-mesh-bg acts as the main background
css = css.replace(/body\s*\{[\s\S]*?background-color:\s*var\(--color-bg\)[\s\S]*?\}/, (match) => {
  return match.replace(/background-color:\s*var\(--color-bg\);/, 'background-color: transparent;');
});

fs.writeFileSync(cssPath, css);
console.log('Fixed accent colors and layout background transparency.');
