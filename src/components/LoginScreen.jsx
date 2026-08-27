import { useState } from 'react';
import { Lock, Mail, ShieldAlert, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import logo from '../assets/logo.png';

/**
 * LoginScreen Component.
 * Props:
 * - onLogin: (email, password) => Promise<void>
 * - error: string error message
 * - loading: boolean
 * - isLive: boolean
 */
export default function LoginScreen({ onLogin, error, loading, isLive }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    onLogin(email.trim(), password);
  };

  return (
    <div className="login-page">
      <div className="login-card-wrapper">
        {/* Glow / Background highlights */}
        <div className="login-backdrop-glow" />

        <div className="login-card">
          <div className="login-header">
            <div className="login-logo-badge">
              <img src={logo} alt="DateDash Logo" className="login-logo-img" />
            </div>
            <h1 className="login-title">DateDash Admin Portal</h1>
            <p className="login-subtitle">
              Sign in with your verified administrator credentials to access dashboard telemetry and management tools.
            </p>
          </div>

          {error && (
            <div className="login-error-banner" role="alert">
              <ShieldAlert size={18} className="login-error-icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label className="login-label">Admin Email</label>
              <div className="login-input-wrapper">
                <Mail size={18} className="login-input-icon" />
                <input
                  type="email"
                  className="login-input"
                  placeholder="admin@datedash.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-form-group">
              <label className="login-label">Password</label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="login-spin-icon" />
                  <span>Verifying Admin Authorization...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer-info">
            <div className="login-security-notice">
              <ShieldCheck size={16} />
              <span>Role-Based Access Control (Admin privilege required)</span>
            </div>

            {!isLive && (
              <div className="login-dev-hint">
                <Sparkles size={14} />
                <span>
                  Demo/Offline mode enabled: Sign in with <code>admin@datedash.com</code> and password <code>admin123</code>.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
