import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ScanBarcode, ArrowRight, Zap, Box, ShieldCheck, BarChart3 } from 'lucide-react'

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
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'var(--font-family)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Effects */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: '#3b82f6', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: '#8b5cf6', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 48px', position: 'relative', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
          }}>
            <ScanBarcode size={22} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', color: 'white' }}>Velora</span>
        </div>
        <div>
          <Link to="/login" style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            padding: '10px 24px', borderRadius: 8, color: 'white', textDecoration: 'none',
            fontWeight: 600, fontSize: 14, transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{
        maxWidth: 1200, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
          padding: '6px 16px', borderRadius: 100, color: '#60a5fa', fontWeight: 600, fontSize: 13,
          marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 8
        }}>
          ✨ The Future of Retail Management
        </div>

        <h1 style={{
          fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em',
          marginBottom: 24, background: 'linear-gradient(to right, #ffffff, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', maxWidth: 800
        }}>
          Supercharge your store with intelligent POS.
        </h1>
        
        <p style={{
          fontSize: 'clamp(18px, 2vw, 20px)', color: '#94a3b8', maxWidth: 600, lineHeight: 1.6, marginBottom: 48
        }}>
          Velora is the all-in-one platform for modern retailers. Effortlessly handle barcode billing, track real-time inventory, and unlock deep analytics.
        </p>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)', color: 'white',
            padding: '16px 32px', borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(79, 70, 229, 0.6)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(79, 70, 229, 0.5)'; }}>
            Go to Platform <ArrowRight size={18} />
          </Link>
          <a href="#features" style={{
            background: 'transparent', color: 'white', padding: '16px 32px', borderRadius: 12,
            fontWeight: 600, fontSize: 16, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
            Explore Features
          </a>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" style={{
        maxWidth: 1200, margin: '80px auto', padding: '0 24px 100px', position: 'relative', zIndex: 10
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { icon: Zap, title: "Lightning-fast Billing", desc: "Scan barcodes and generate beautiful invoices in seconds with our highly optimized POS." },
            { icon: Box, title: "Real-time Inventory", desc: "Never run out of stock. Track everything instantly and get smart low-stock alerts." },
            { icon: ShieldCheck, title: "Role-based Security", desc: "Keep your store safe with granular access controls for admins, managers, and staff." },
            { icon: BarChart3, title: "Deep Analytics", desc: "Understand your business like never before with beautiful, actionable reports and insights." }
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 20, padding: 32, transition: 'all 0.3s', cursor: 'default'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <div style={{
                width: 48, height: 48, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                color: '#60a5fa'
              }}>
                <feature.icon size={24} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'white' }}>{feature.title}</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: 15 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
