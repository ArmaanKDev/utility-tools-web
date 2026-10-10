import { useNavigate } from 'react-router-dom';
import '../styles/LegalPages.css';
import { CONTACT_EMAIL } from '../config/legal';

export default function PrivacyScreen() {
    const navigate = useNavigate();
    return (
        <div className="legal-page">
            <button className="legal-back" onClick={() => navigate(-1)}>← Back</button>
            <h1>Privacy Policy</h1>
            <p className="legal-date">Last updated: October 2026</p>

            <h2>What this app is</h2>
            <p>
                Cashflow is a personal finance tool for categorising bank transactions and visualising
                spending. It is free to use. The data controller is Armaan Khaitan — contact details
                below.
            </p>

            <h2>Lawful basis for processing</h2>
            <p>We rely on three lawful bases under UK/EU GDPR:</p>
            <ul>
                <li>
                    <strong>Contract performance (Art. 6(1)(b)):</strong> Transaction, account, and
                    preference data is processed to provide the service you signed up for.
                </li>
                <li>
                    <strong>Legitimate interests (Art. 6(1)(f)):</strong> IP-level security logs are
                    retained for 90 days to prevent abuse and protect users. This is a proportionate
                    measure that does not override your rights.
                </li>
                <li>
                    <strong>Consent (Art. 6(1)(a)):</strong> If you accept analytics cookies,
                    anonymous usage data is collected via Posthog EU.
                </li>
            </ul>

            <h2>What data we collect</h2>
            <ul>
                <li>
                    <strong>Account credentials</strong> — username, bcrypt-hashed password (plain-text
                    is never stored), and email address.
                </li>
                <li>
                    <strong>Transaction data</strong> — the contents of uploaded CSV/Excel files (date,
                    amount, description). Stored privately and used solely for categorisation and
                    charting.
                </li>
                <li>
                    <strong>Preferences</strong> — column widths, chart settings, and UI state. Stored
                    in encrypted browser storage (IndexedDB) and synced to your account.
                </li>
                <li>
                    <strong>Billing information</strong> — subscription tier and Stripe payment status.
                    Card last 4 digits and brand are stored for display only. Full card numbers are
                    never stored.
                </li>
            </ul>

            <h2>What we do not collect</h2>
            <p>
                We do not collect names, addresses, phone numbers, or any identity information beyond
                your chosen username. We do not sell or share your data with any third parties for
                marketing.
            </p>

            <h2>AI-assisted categorisation</h2>
            <p>
                When simple matching fails, the description text of a transaction is sent to the Google
                Gemini API to suggest a category. Only the description string is sent — no amounts,
                dates, account names, or any other information. Google processes this as a data
                processor under Standard Contractual Clauses. You can always override any AI-suggested
                category manually, and this has no legal or financial effect on you.
            </p>

            <h2>Third-party services</h2>
            <table className="legal-table">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Purpose</th>
                        <th>Location</th>
                        <th>Transfer basis</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Supabase</td>
                        <td>Database hosting</td>
                        <td>EU (Ireland)</td>
                        <td>EEA — no transfer</td>
                    </tr>
                    <tr>
                        <td>Render</td>
                        <td>App hosting</td>
                        <td>United States</td>
                        <td>Standard Contractual Clauses</td>
                    </tr>
                    <tr>
                        <td>Google Gemini</td>
                        <td>AI categorisation</td>
                        <td>United States</td>
                        <td>Standard Contractual Clauses</td>
                    </tr>
                    <tr>
                        <td>Stripe</td>
                        <td>Payment processing</td>
                        <td>United States</td>
                        <td>Standard Contractual Clauses</td>
                    </tr>
                    <tr>
                        <td>Brevo</td>
                        <td>Transactional email</td>
                        <td>EU (France)</td>
                        <td>EEA — no transfer</td>
                    </tr>
                </tbody>
            </table>

            <h2>How data is stored</h2>
            <p>
                Data is stored in a PostgreSQL database on Supabase EU (Ireland). Authentication tokens
                are stored in httpOnly cookies — not accessible to JavaScript, protected against XSS.
                All connections use TLS. UI preferences are encrypted in your browser's IndexedDB
                using a server-issued encryption key.
            </p>

            <h2>Data retention</h2>
            <table className="legal-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Retention</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Account, transactions, preferences</td>
                        <td>Until account deletion</td>
                    </tr>
                    <tr>
                        <td>Encrypted database backups</td>
                        <td>Up to 30 days after deletion</td>
                    </tr>
                    <tr>
                        <td>IP-level security logs</td>
                        <td>90 days (abuse prevention)</td>
                    </tr>
                    <tr>
                        <td>JWT session blocklist</td>
                        <td>Until token expiry</td>
                    </tr>
                    <tr>
                        <td>Billing records</td>
                        <td>Deleted with account (Stripe retains their own records independently)</td>
                    </tr>
                </tbody>
            </table>
            <p>
                Deletion is staged: your account is flagged for deletion immediately (you receive a
                confirmation email), and permanently erased after 48 hours. You can cancel within the
                48-hour window. You will receive a second email when permanent deletion completes.
            </p>

            <h2>Your rights (GDPR Articles 15–21)</h2>
            <ul>
                <li>
                    <strong>Access (Art. 15):</strong> Download a copy of your data from your Profile
                    page (limited to once per hour).
                </li>
                <li>
                    <strong>Portability (Art. 20):</strong> Your export is in machine-readable JSON
                    format.
                </li>
                <li>
                    <strong>Erasure (Art. 17):</strong> Delete your account from your Profile page —
                    all data erased within 48 hours.
                </li>
                <li>
                    <strong>Rectification (Art. 16):</strong> Update your display name and email from
                    your Profile page.
                </li>
                <li>
                    <strong>Restriction (Art. 18):</strong> Contact us to pause processing of your data
                    while you dispute anything — we will apply it within 72 hours.
                </li>
                <li>
                    <strong>Object to processing (Art. 21):</strong> You can decline analytics cookies
                    at any time via the cookie banner.
                </li>
            </ul>

            <h2>What is NOT included in your data export</h2>
            <div className="legal-note">
                Network diagnostic logs (error timings, paths), encryption key material, and internal
                system audit tables are not included in exports. These are operational data with no
                personal content.
            </div>

            <h2>Data breach notification</h2>
            <p>
                If we become aware of a breach affecting your data, we will notify you by email within
                72 hours and report to the relevant supervisory authority.
            </p>

            <h2>Right to complain (Art. 77)</h2>
            <p>
                You have the right to lodge a complaint with your national data protection authority.
                In the UK: Information Commissioner's Office —{' '}
                <a href="https://ico.org.uk" target="_blank" rel="noreferrer">ico.org.uk</a>. In
                Ireland: Data Protection Commission —{' '}
                <a href="https://dataprotection.ie" target="_blank" rel="noreferrer">dataprotection.ie</a>.
            </p>

            <h2>Changes to this policy</h2>
            <p>
                We may update this policy. The date at the top reflects the most recent revision.
                Continued use of the service constitutes acceptance.
            </p>

            <h2>Contact</h2>
            <p>
                Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
        </div>
    );
}
