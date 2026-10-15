import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { CASHFLOW_URL } from '../../shared/site-urls.js';
import RoleBadge from './components/RoleBadge';
import StartupScreen from './components/StartupScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import CancelDeletionScreen from './screens/CancelDeletionScreen';
import ProfileScreen from './screens/ProfileScreen';
import PricingScreen from './screens/PricingScreen';
import TierSelectionScreen from './screens/TierSelectionScreen';
import LegalScreen from './screens/LegalScreen';

const tools = [
  {
    id: 'cashflow',
    name: 'Cashflow',
    description: 'Track and categorize your bank transactions. Upload CSV or Excel statements and get instant spending breakdowns.',
    icon: '💸',
    status: 'live',
    href: import.meta.env.DEV ? 'http://localhost:5173' : `${CASHFLOW_URL}/`,
    accentColor: '#4f8ef7',
  },
  {
    id: 'utility-2',
    name: 'Utility 2',
    description: 'A new tool is on its way. Stay tuned for updates.',
    icon: '🔧',
    status: 'soon',
  },
  {
    id: 'utility-3',
    name: 'Utility 3',
    description: 'A new tool is on its way. Stay tuned for updates.',
    icon: '📊',
    status: 'soon',
  },
  {
    id: 'utility-4',
    name: 'Utility 4',
    description: 'A new tool is on its way. Stay tuned for updates.',
    icon: '📁',
    status: 'soon',
  },
  {
    id: 'utility-5',
    name: 'Utility 5',
    description: 'A new tool is on its way. Stay tuned for updates.',
    icon: '🔍',
    status: 'soon',
  },
  {
    id: 'utility-6',
    name: 'Utility 6',
    description: 'A new tool is on its way. Stay tuned for updates.',
    icon: '⚙️',
    status: 'soon',
  },
];

function ToolCard({ tool, locked }) {
  const isLive = tool.status === 'live';

  const card = (
    <div
      className={`tool-card ${isLive ? 'tool-card--live' : 'tool-card--soon'}${locked ? ' tool-card--locked' : ''}`}
      style={isLive && !locked ? { '--accent': tool.accentColor } : undefined}
    >
      {!isLive && <span className="badge">Coming soon</span>}
      {locked && <span className="badge badge--upgrade">Upgrade to access</span>}
      <div className="tool-card__icon">{tool.icon}</div>
      <h2 className="tool-card__name">{tool.name}</h2>
      <p className="tool-card__desc">{tool.description}</p>
      {isLive && !locked && (
        <span className="tool-card__cta">
          Open <span className="cta-arrow">→</span>
        </span>
      )}
      {locked && (
        <Link to="/pricing" className="tool-card__upgrade-link">View plans →</Link>
      )}
    </div>
  );

  if (isLive && !locked) {
    return <a href={tool.href} className="tool-card-link">{card}</a>;
  }
  return <div className="tool-card-link tool-card-link--disabled">{card}</div>;
}

function RequireAuth({ children }) {
  const { isLoggedIn, isChecking } = useAuth();
  if (isChecking) return <StartupScreen />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

const PAID_TIERS = ['pro', 'proplus', 'business', 'enterprise'];

function LandingPage() {
  const { userRole } = useAuth();

  // Derive billing access from /auth/me response (no separate billing context on landing)
  const billing  = userRole?.billing ?? null;
  const tier     = billing?.tier ?? null;
  const trial    = billing?.active_trial ?? null;
  const hasPro   = PAID_TIERS.includes(tier) || !!trial;

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="header__brand">
            <span className="header__logo">⚡</span>
            <span className="header__title">Utility Tools</span>
          </div>
          <p className="header__sub">A growing collection of personal productivity tools.</p>
        </div>
        <div className="header__actions">
          <RoleBadge />
        </div>
      </header>

      <main className="main">
        <div className="grid">
          {tools.map((tool) => {
            // Lock live tools when the user has no active plan or trial
            const locked = tool.status === 'live' && !hasPro;
            return <ToolCard key={tool.id} tool={tool} locked={locked} />;
          })}
        </div>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Utility Tools. All rights reserved.</p>
        <p className="footer-links">
          <Link to="/pricing">Plans &amp; Pricing</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/accessibility">Accessibility</Link>
          <Link to="/cookies">Cookies</Link>
          <Link to="/data-security">Data Security</Link>
        </p>
      </footer>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />
      <Route path="/verify-email" element={<VerifyEmailScreen />} />
      <Route path="/cancel-deletion" element={<CancelDeletionScreen />} />
      <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
      <Route path="/pricing" element={<PricingScreen />} />
      <Route path="/tier-select" element={<RequireAuth><TierSelectionScreen /></RequireAuth>} />
      <Route path="/privacy" element={<LegalScreen page="privacy" />} />
      <Route path="/terms" element={<LegalScreen page="terms" />} />
      <Route path="/accessibility" element={<LegalScreen page="accessibility" />} />
      <Route path="/cookies" element={<LegalScreen page="cookies" />} />
      <Route path="/data-security" element={<LegalScreen page="data-security" />} />
      <Route path="/" element={<RequireAuth><LandingPage /></RequireAuth>} />
      {/* Unknown paths (this app is also the site 404 page) go home instead of rendering nothing. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.PROD ? '/utility-tools-web' : '/'}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
