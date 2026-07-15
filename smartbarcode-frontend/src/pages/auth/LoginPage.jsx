import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ScanBarcode, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!forgotEmail) {
      toast.error('Please enter your email')
      return
    }
    setForgotLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail })
      toast.success(res.data.message)
      setForgotStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error requesting OTP')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!forgotOtp || !newPassword) {
      toast.error('Please enter OTP and new password')
      return
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
    if (!passwordRegex.test(newPassword)) {
      toast.error('Password must be at least 6 characters, with one uppercase, lowercase, and number')
      return
    }
    setForgotLoading(true)
    try {
      const res = await api.post('/auth/reset-password', { email: forgotEmail, otp: forgotOtp, newPassword: newPassword })
      toast.success(res.data.message)
      setShowForgotModal(false)
      setForgotStep(1)
      setForgotEmail('')
      setForgotOtp('')
      setNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resetting password')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('Please enter username and password')
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/
    if (!passwordRegex.test(form.password)) {
      toast.error('Password must be at least 6 characters, with one uppercase, one lowercase, and one number')
      return
    }

    setLoading(true)
    try {
      await login(form.username, form.password)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'var(--font-family)',
      background: '#000000'
    }}>
      <style>{`
        @keyframes floatEffect {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-2%, -2%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        
        .login-container {
          display: flex;
          width: 100%;
          min-height: 100vh;
        }
        .login-left {
          flex: 1;
          background-color: #000000;
          display: none;
          position: relative;
          overflow: hidden;
          padding: 60px;
          flex-direction: column;
          justify-content: space-between;
          color: white;
        }

        .login-left-bg {
          position: absolute;
          inset: -10%;
          background-image: url('/login-bg.png');
          background-size: cover;
          background-position: center;
          animation: kenBurns 30s ease-in-out infinite;
          z-index: 1;
          filter: grayscale(100%) brightness(0.6);
        }
        .login-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 20, 0.75) 100%);
          z-index: 2;
        }

        .login-left-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #000000;
          position: relative;
        }
        
        .premium-input {
          width: 100%;
          padding: 14px 16px;
          font-size: 15px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background-color: rgba(255, 255, 255, 0.03);
          color: #ffffff;
          transition: all 0.3s ease;
          outline: none;
        }
        .premium-input:focus {
          background-color: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05);
        }
        .premium-input::placeholder {
          color: #6b7280;
        }
        
        @media (min-width: 992px) {
          .login-left {
            display: flex;
          }
        }
      `}</style>

      <div className="login-container">
        {/* Left Side: Branding & Features */}
        <div className="login-left">
          
          <div className="login-left-bg"></div>
          <div className="login-left-overlay"></div>

          <div className="login-left-content">
            {/* Top Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                <ScanBarcode size={24} color="#e4e4e7" strokeWidth={2.5} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'white' }}>Velora</h1>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: 500, marginTop: '-10vh' }}>
              <h2 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em', color: 'white' }}>
                The Intelligent Retail POS Platform.
              </h2>
              <p style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 48, color: '#a1a1aa' }}>
                Streamline your billing, manage inventory effortlessly, and unlock deep insights with our enterprise-grade management suite.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  'Lightning-fast Barcode Billing',
                  'Real-time Inventory Tracking',
                  'Advanced Role-based Security',
                  'Deep Business Analytics'
                ].map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: 6, borderRadius: '50%', display: 'flex', backdropFilter: 'blur(5px)' }}>
                      <CheckCircle2 size={20} color="#e4e4e7" />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 500, color: 'white' }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Note */}
            <div>
              <p style={{ fontSize: 14, color: '#71717a' }}>
                © {new Date().getFullYear()} Velora Systems Inc.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Premium Login Form */}
        <div className="login-right">
          <div style={{ 
            width: '100%', 
            maxWidth: 440, 
            animation: 'fadeIn 0.6s ease',
            padding: '44px 40px',
            backgroundColor: '#09090b',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
            
            {/* Mobile Header */}
            <div style={{ display: 'block', textAlign: 'center', marginBottom: 32, '@media (minWidth: 992px)': { display: 'none' } }} className="mobile-header">
              <div style={{
                width: 56, height: 56,
                background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
                borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 16px rgba(255, 255, 255, 0.1)'
              }}>
                <ScanBarcode size={28} color="#000000" strokeWidth={2.5} />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12, color: '#ffffff' }}>
                Welcome back
              </h2>
              <p style={{ fontSize: 15, color: '#a1a1aa', fontWeight: 500 }}>
                Please enter your credentials to sign in
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label htmlFor="username" style={{ display: 'block', color: '#a1a1aa', fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: '0.05em' }}>
                  USERNAME
                </label>
                <input
                  id="username"
                  type="text"
                  className="premium-input"
                  placeholder="admin"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label htmlFor="password" style={{ color: '#a1a1aa', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>
                    PASSWORD
                  </label>
                  {form.username !== 'admin' && (
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }} style={{ fontSize: 13, color: '#d4d4d8', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}
                       onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                       onMouseLeave={e => e.currentTarget.style.color = '#d4d4d8'}
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    className="premium-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    autoComplete="current-password"
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#a1a1aa', display: 'flex',
                      padding: 4
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
                <input type="checkbox" id="remember" style={{ 
                  width: 16, height: 16, borderRadius: 4, cursor: 'pointer', accentColor: '#ffffff' 
                }} />
                <label htmlFor="remember" style={{ fontSize: 14, color: '#a1a1aa', cursor: 'pointer', fontWeight: 500, margin: 0 }}>
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                style={{ 
                  width: '100%', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center', 
                  padding: '16px', 
                  fontSize: 16,
                  background: 'linear-gradient(135deg, #ffffff 0%, #d4d4d8 100%)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: 12,
                  boxShadow: '0 8px 20px -6px rgba(255, 255, 255, 0.3)',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.7 : 1
                }}
                disabled={loading}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(255, 255, 255, 0.4)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(255, 255, 255, 0.3)'; }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="loading-spinner" style={{ width: 18, height: 18, borderTopColor: '#000000', borderRightColor: '#000000' }} />
                    Signing in...
                  </span>
                ) : (
                  <span>Sign In to Platform</span>
                )}
              </button>
            </form>

            {/* Forgot Password Modal */}
            {showForgotModal && (
              <div style={{
                position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)'
              }}>
                <div style={{
                  background: '#09090b', padding: 40, borderRadius: 24, width: '90%', maxWidth: 420,
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
                }}>
                  <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#ffffff', letterSpacing: '-0.02em' }}>Reset Password</h3>
                  <p style={{ color: '#a1a1aa', fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>
                    {forgotStep === 1 ? "Enter your registered email to receive an OTP." : "Enter the OTP sent to your email and your new password."}
                  </p>
                  
                  {forgotStep === 1 ? (
                    <form onSubmit={handleRequestOtp}>
                      <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 8, letterSpacing: '0.05em' }}>EMAIL</label>
                        <input
                          type="email" className="premium-input" placeholder="Enter registered email"
                          value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} autoFocus
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button type="button" onClick={() => setShowForgotModal(false)} style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>Cancel</button>
                        <button type="submit" disabled={forgotLoading} style={{ flex: 1, padding: 14, borderRadius: 12, background: 'linear-gradient(135deg, #ffffff 0%, #d4d4d8 100%)', color: '#000000', border: 'none', fontWeight: 700, cursor: forgotLoading ? 'not-allowed' : 'pointer' }}>
                          {forgotLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword}>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 8, letterSpacing: '0.05em' }}>OTP</label>
                        <input
                          type="text" className="premium-input" placeholder="Enter 6-digit OTP"
                          value={forgotOtp} onChange={e => setForgotOtp(e.target.value)} autoFocus
                        />
                      </div>
                      <div style={{ marginBottom: 32 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 8, letterSpacing: '0.05em' }}>NEW PASSWORD</label>
                        <input
                          type="password" className="premium-input" placeholder="••••••••"
                          value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button type="button" onClick={() => setForgotStep(1)} style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>Back</button>
                        <button type="submit" disabled={forgotLoading} style={{ flex: 1, padding: 14, borderRadius: 12, background: 'linear-gradient(135deg, #ffffff 0%, #d4d4d8 100%)', color: '#000000', border: 'none', fontWeight: 700, cursor: forgotLoading ? 'not-allowed' : 'pointer' }}>
                          {forgotLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
