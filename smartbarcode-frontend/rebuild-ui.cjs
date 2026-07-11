const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// 1. Create ThemeContext.jsx
const themeContextContent = `import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
`;
fs.mkdirSync(path.join(srcDir, 'context'), { recursive: true });
fs.writeFileSync(path.join(srcDir, 'context', 'ThemeContext.jsx'), themeContextContent);

// 2. Update App.jsx to include ThemeProvider
let appContent = fs.readFileSync(path.join(srcDir, 'App.jsx'), 'utf8');
if (!appContent.includes('ThemeProvider')) {
  appContent = appContent.replace("import { AuthProvider } from './context/AuthContext'", "import { AuthProvider } from './context/AuthContext'\nimport { ThemeProvider } from './context/ThemeContext'");
  appContent = appContent.replace("<AuthProvider>", "<ThemeProvider>\n    <AuthProvider>");
  appContent = appContent.replace("</AuthProvider>", "</AuthProvider>\n    </ThemeProvider>");
  fs.writeFileSync(path.join(srcDir, 'App.jsx'), appContent);
}

// 3. Update index.css to include dark mode variables
let cssContent = fs.readFileSync(path.join(srcDir, 'index.css'), 'utf8');
const darkThemeCSS = `
:root.dark {
  --color-bg: #0f111a;
  --color-surface: #1a1d29;
  --color-surface-elevated: rgba(26, 29, 41, 0.85);
  
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-text-tertiary: #64748b;
  
  --color-border: #334155;
  --color-border-light: #1e293b;
  --color-border-glass: rgba(255, 255, 255, 0.05);

  --color-accent: #8b5cf6;
  --color-brand-secondary: #f59e0b;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  transition: background-color 0.3s, color 0.3s;
}
`;
if (!cssContent.includes(':root.dark')) {
  cssContent += darkThemeCSS;
  fs.writeFileSync(path.join(srcDir, 'index.css'), cssContent);
}

// 4. Update Sidebar.jsx
let sidebarContent = fs.readFileSync(path.join(srcDir, 'components', 'layout', 'Sidebar.jsx'), 'utf8');
sidebarContent = sidebarContent.replace(/<div className="sidebar-logo">[\s\S]*?<\/div>[\s]*<\/div>/, `<div className="sidebar-logo" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
        <div className="sidebar-logo-icon" style={{ background: 'transparent', boxShadow: 'none', width: 'auto' }}>
          <img src="/logo.png" alt="VELORA Logo" style={{ height: 32, width: 'auto', objectFit: 'contain' }} onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }} />
          <div style={{ display: 'none', background: 'var(--gradient-primary)', width: 36, height: 36, borderRadius: 'var(--radius-md)', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: 'var(--shadow-glow)' }}>
            <ScanBarcode size={18} color="white" />
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
            VELORA
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-brand-secondary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {isAdmin() ? 'Commerce Intel' : 'Staff Portal'}
          </div>
        </div>
      </div>`);
fs.writeFileSync(path.join(srcDir, 'components', 'layout', 'Sidebar.jsx'), sidebarContent);

console.log("UI patches applied successfully.");
