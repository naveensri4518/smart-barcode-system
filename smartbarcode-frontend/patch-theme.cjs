const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const indexCssPath = path.join(srcDir, 'index.css');
const layoutPath = path.join(srcDir, 'components', 'layout', 'Layout.jsx');

// 1. Update index.css for pure black + orange dark mode and apple mesh bg
let css = fs.readFileSync(indexCssPath, 'utf8');

const darkThemeRegex = /:root\.dark\s*\{[\s\S]*?\}/;
const newDarkTheme = `:root.dark {
  --color-bg: #000000;
  --color-surface: #111111;
  --color-surface-elevated: rgba(20, 20, 20, 0.85);
  
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-text-tertiary: #64748b;
  
  --color-border: #222222;
  --color-border-light: #181818;
  --color-border-glass: rgba(255, 255, 255, 0.05);

  --color-accent: #ff9f0a;
  --color-accent-hover: #ffb340;
  --color-brand-secondary: #ff3b30;
}`;

if (darkThemeRegex.test(css)) {
  css = css.replace(darkThemeRegex, newDarkTheme);
} else {
  css += '\n' + newDarkTheme + '\n';
}

const meshCss = `
.apple-mesh-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: -1;
  overflow: hidden;
  background: var(--color-bg);
  transition: background 0.5s ease;
}
.mesh-blob {
  position: absolute;
  filter: blur(120px);
  opacity: 0.15;
  border-radius: 50%;
  animation: float 20s infinite ease-in-out alternate;
}
:root.dark .mesh-blob {
  opacity: 0.25;
}
.mesh-blob-1 {
  width: 50vw; height: 50vw;
  background: var(--color-accent);
  top: -15vw; left: -10vw;
}
.mesh-blob-2 {
  width: 45vw; height: 45vw;
  background: var(--color-brand-secondary);
  bottom: -10vw; right: -10vw;
  animation-delay: -5s;
}
.mesh-blob-3 {
  width: 40vw; height: 40vw;
  background: #bf5af2;
  top: 20vh; left: 40vw;
  animation-delay: -10s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(50px, -50px) scale(1.1); }
  66% { transform: translate(-30px, 30px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}
`;

if (!css.includes('.apple-mesh-bg')) {
  css += '\n' + meshCss;
}

fs.writeFileSync(indexCssPath, css);

// 2. Update Layout.jsx to include the mesh bg
let layout = fs.readFileSync(layoutPath, 'utf8');
if (!layout.includes('apple-mesh-bg')) {
  const meshDiv = `
      <div className="apple-mesh-bg">
        <div className="mesh-blob mesh-blob-1"></div>
        <div className="mesh-blob mesh-blob-2"></div>
        <div className="mesh-blob mesh-blob-3"></div>
      </div>`;
  layout = layout.replace('<div className="app-layout">', '<div className="app-layout">' + meshDiv);
  fs.writeFileSync(layoutPath, layout);
}

console.log('Applied Apple-styled animation and dark mode tweaks.');
