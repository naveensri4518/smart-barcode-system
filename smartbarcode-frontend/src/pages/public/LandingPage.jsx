import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ScanBarcode, ArrowRight, Zap, Box, ShieldCheck, BarChart3, Users, Clock, RotateCcw, FileText } from 'lucide-react'

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Auto redirect if already logged in
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/dashboard')
      } else {
        navigate('/billing')
      }
    }
  }, [user, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000', // Pure black
      color: '#f8fafc',
      fontFamily: 'var(--font-family)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Effects - Silver/White Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: '#ffffff', filter: 'blur(200px)', opacity: 0.05, borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: '#a1a1aa', filter: 'blur(150px)', opacity: 0.07, borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', top: '40%', left: '40%', width: '30vw', height: '30vw', background: '#e4e4e7', filter: 'blur(200px)', opacity: 0.04, borderRadius: '50%' }}></div>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 48px', position: 'relative', zIndex: 10,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, background: 'linear-gradient(135deg, #e4e4e7 0%, #a1a1aa 100%)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)'
          }}>
            <ScanBarcode size={22} color="#000000" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'white' }}>Velora</span>
        </div>
        <div>
          <Link to="/login" style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            padding: '10px 24px', borderRadius: 8, color: '#e4e4e7', textDecoration: 'none',
            fontWeight: 600, fontSize: 14, transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#e4e4e7'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{
        maxWidth: 1200, margin: '0 auto', padding: '100px 24px', position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '6px 16px', borderRadius: 100, color: '#d4d4d8', fontWeight: 600, fontSize: 13,
          marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <span style={{ color: '#ffffff' }}>✨</span> The Pinnacle of Retail Intelligence
        </div>

        <h1 style={{
          fontSize: 'clamp(52px, 7vw, 84px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em',
          marginBottom: 24, background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', maxWidth: 900
        }}>
          Command your store with absolute precision.
        </h1>
        
        <p style={{
          fontSize: 'clamp(18px, 2vw, 22px)', color: '#a1a1aa', maxWidth: 700, lineHeight: 1.6, marginBottom: 48,
          fontWeight: 400
        }}>
          Velora is the ultimate enterprise-grade POS platform. Execute lightning-fast billing, orchestrate inventory in real-time, and dominate with advanced analytics.
        </p>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #d4d4d8 100%)', color: '#000000',
            padding: '18px 36px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 10px 30px -5px rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 40px -5px rgba(255, 255, 255, 0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(255, 255, 255, 0.2)'; }}>
            Launch Platform <ArrowRight size={20} strokeWidth={2.5} />
          </Link>
          <a href="#features" style={{
            background: 'transparent', color: '#ffffff', padding: '18px 36px', borderRadius: 12,
            fontWeight: 600, fontSize: 16, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)',
            transition: 'all 0.3s', backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}>
            View Capabilities
          </a>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" style={{
        maxWidth: 1300, margin: '40px auto 100px', padding: '0 24px', position: 'relative', zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 16, letterSpacing: '-0.02em' }}>Enterprise Capabilities</h2>
          <p style={{ color: '#a1a1aa', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>Everything you need to scale your retail operations effortlessly.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { icon: Zap, title: "Lightning-fast Billing", desc: "Scan barcodes and generate beautiful invoices in milliseconds with our highly optimized POS." },
            { icon: Box, title: "Real-time Inventory", desc: "Never run out of stock. Track everything instantly with automated smart low-stock alerts." },
            { icon: ShieldCheck, title: "Role-based Security", desc: "Military-grade access controls. Create strict permission boundaries for admins and cashiers." },
            { icon: BarChart3, title: "Deep Analytics", desc: "Understand your business like never before with beautiful, actionable interactive reports." },
            { icon: Users, title: "Customer Management", desc: "Track purchase histories, identify top buyers, and build lasting customer relationships." },
            { icon: Clock, title: "Shift Management", desc: "Flawlessly track cashier shifts, opening/closing cash balances, and performance metrics." },
            { icon: RotateCcw, title: "Instant Returns", desc: "Process complex refunds and exchanges effortlessly while automatically restocking inventory." },
            { icon: FileText, title: "Invoice History", desc: "Access all past transactions securely and reprint professional A4 or Thermal receipts on demand." }
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 24, padding: 32, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default',
              position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'; 
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.8)';
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'; 
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                width: 56, height: 56, background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)', 
                borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <feature.icon size={26} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#f4f4f5', letterSpacing: '-0.01em' }}>{feature.title}</h3>
              <p style={{ color: '#a1a1aa', lineHeight: 1.6, fontSize: 15 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 24px', textAlign: 'center', color: '#71717a', fontSize: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <ScanBarcode size={18} color="#71717a" />
          <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>VELORA SYSTEMS</span>
        </div>
        <p>© {new Date().getFullYear()} Velora Commerce Intel. All rights reserved.</p>
      </footer>
    </div>
  )
}
