const { execSync } = require('child_process');
const fs = require('fs');

const original = execSync('git show HEAD:smartbarcode-frontend/src/components/layout/Sidebar.jsx', { encoding: 'utf8' });

const logoReplacement = `<div className="sidebar-logo" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
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
      </div>`;

const patched = original.replace(/<div className="sidebar-logo">[\s\S]*?<\/div>\s*<\/div>/, logoReplacement);

fs.writeFileSync('smartbarcode-frontend/src/components/layout/Sidebar.jsx', patched);
console.log('Fixed Sidebar.jsx');
