import { Link, useNavigate } from 'react-router-dom';
import '../styles/LegalScreen.css';

const LEGAL_PAGES = {
    privacy: {
        title: 'Privacy Policy',
        lastUpdated: '1 October 2025',
        sections: [
            {
                heading: 'What we collect',
                body: 'We collect your username, a hashed password, and an email address (if provided for password reset). We also store the transactions you upload and the categories you assign to them.',
            },
            {
                heading: 'How we use it',
                body: 'Your data is used solely to provide the Utility Tools service — transaction tracking, categorisation, and account management. We do not sell, rent, or share your data with third parties for advertising purposes.',
            },
            {
                heading: 'Storage and security',
                body: 'All data is stored in a Supabase (PostgreSQL) database hosted in the EU. Passwords are hashed with bcrypt. Transaction data is encrypted at rest using AES-256-GCM with per-user keys derived from a server-side master key that never leaves our environment.',
            },
            {
                heading: 'Cookies and local storage',
                body: 'We use httpOnly session cookies for authentication. The web app may store UI preferences (theme, column widths) in encrypted IndexedDB. No tracking or advertising cookies are used.',
            },
            {
                heading: 'Data retention',
                body: 'Your account and all associated data are retained until you request deletion. You can delete your account from the Profile page. We will process the deletion within 30 days.',
            },
            {
                heading: 'Your rights',
                body: 'Under UK GDPR you have the right to access, correct, and erase your personal data. Contact us at privacy@utility-tools.app to exercise any of these rights.',
            },
            {
                heading: 'Contact',
                body: 'Questions? Email privacy@utility-tools.app.',
            },
        ],
    },
    terms: {
        title: 'Terms of Service',
        lastUpdated: '1 October 2025',
        sections: [
            {
                heading: 'Acceptance',
                body: 'By creating an account you agree to these Terms. If you do not agree, do not use the service.',
            },
            {
                heading: 'The service',
                body: 'Utility Tools provides personal-finance transaction tracking and related tools ("the Service"). We reserve the right to modify, suspend, or discontinue any part of the Service at any time.',
            },
            {
                heading: 'Accounts',
                body: 'You are responsible for keeping your credentials secure. You must not share your account or use the Service for illegal purposes.',
            },
            {
                heading: 'Subscriptions and trials',
                body: 'Paid plans are billed monthly or annually. A 30-day free trial is available once per billing cycle. You will not be charged during the trial period. Cancel any time from the Profile page.',
            },
            {
                heading: 'Intellectual property',
                body: 'The Service and its content are © Utility Tools. You retain ownership of the data you upload.',
            },
            {
                heading: 'Limitation of liability',
                body: 'The Service is provided "as is". To the fullest extent permitted by law, we exclude all warranties and our liability is limited to the amount you paid in the 12 months preceding the claim.',
            },
            {
                heading: 'Governing law',
                body: 'These Terms are governed by the laws of England and Wales.',
            },
        ],
    },
    accessibility: {
        title: 'Accessibility Statement',
        lastUpdated: '1 October 2025',
        sections: [
            {
                heading: 'Our commitment',
                body: 'We are committed to making Utility Tools accessible to everyone. We aim to meet WCAG 2.1 Level AA.',
            },
            {
                heading: 'Known issues',
                body: 'We are aware of some areas that need improvement, including keyboard navigation in the transaction table and colour contrast in some chart labels. We are working to fix these.',
            },
            {
                heading: 'Feedback',
                body: 'If you experience any accessibility barriers, please email accessibility@utility-tools.app and we will respond within 5 working days.',
            },
        ],
    },
    cookies: {
        title: 'Cookie Policy',
        lastUpdated: '1 October 2025',
        sections: [
            {
                heading: 'What are cookies?',
                body: 'Cookies are small files placed on your device by your browser when you visit a website.',
            },
            {
                heading: 'Cookies we use',
                body: 'We use two httpOnly cookies: "access_token_cookie" (short-lived JWT, expires every 15 minutes) and "refresh_token_cookie" (longer-lived JWT, expires after 30 days). These are strictly necessary for authentication and cannot be disabled without breaking the service.',
            },
            {
                heading: 'Cookies we do NOT use',
                body: 'We do not use analytics cookies, advertising cookies, or any third-party tracking cookies.',
            },
            {
                heading: 'Managing cookies',
                body: 'You can delete cookies at any time through your browser settings. Deleting the session cookies will log you out.',
            },
        ],
    },
    'data-security': {
        title: 'Data Security',
        lastUpdated: '1 October 2025',
        sections: [
            {
                heading: 'Encryption in transit',
                body: 'All traffic between your browser and our servers is encrypted using TLS 1.2 or higher.',
            },
            {
                heading: 'Encryption at rest',
                body: 'Transaction data is encrypted using AES-256-GCM. Each user has a unique Data Encryption Key (DEK) that is itself encrypted with a server-side Key Encryption Key (KEK) stored outside the database.',
            },
            {
                heading: 'Authentication',
                body: 'Passwords are hashed with bcrypt (work factor 12). Sessions use short-lived JWT access tokens (15 min) and longer-lived refresh tokens (30 days), both stored as httpOnly, Secure, SameSite=Strict cookies. Admin accounts require TOTP multi-factor authentication.',
            },
            {
                heading: 'Request integrity',
                body: 'Mutations are protected by CSRF tokens. Admin API calls are additionally protected by HMAC request signing.',
            },
            {
                heading: 'Vulnerability disclosure',
                body: 'Found a security issue? Please email security@utility-tools.app responsibly and we will respond within 48 hours.',
            },
        ],
    },
};

export default function LegalScreen({ page }) {
    const navigate = useNavigate();
    const content = LEGAL_PAGES[page];

    if (!content) {
        return (
            <div className="legal-page">
                <div className="legal-container">
                    <p>Page not found.</p>
                    <Link to="/">← Back home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="legal-page">
            <div className="legal-container">
                <button className="legal-back-btn" onClick={() => navigate(-1)}>← Back</button>
                <h1 className="legal-title">{content.title}</h1>
                <p className="legal-updated">Last updated: {content.lastUpdated}</p>
                {content.sections.map((s) => (
                    <section key={s.heading} className="legal-section">
                        <h2 className="legal-heading">{s.heading}</h2>
                        <p className="legal-body">{s.body}</p>
                    </section>
                ))}
                <div className="legal-footer-links">
                    <Link to="/privacy">Privacy</Link>
                    <Link to="/terms">Terms</Link>
                    <Link to="/accessibility">Accessibility</Link>
                    <Link to="/cookies">Cookies</Link>
                    <Link to="/data-security">Data Security</Link>
                </div>
            </div>
        </div>
    );
}
