import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../appState';
import { useBilling } from '../appState/BillingContext';
import {
    updateProfile, changePassword, deleteAccount,
    sendVerificationEmail, logout, exportUserData,
} from '../api';
import '../styles/ProfileScreen.css';

export default function ProfileScreen() {
    const { userRole, endSession } = useAuth();
    const { billing, tier, hasPro, activeTrial } = useBilling();
    const navigate = useNavigate();

    // Display name
    const [displayName, setDisplayName] = useState('');
    const [savingName, setSavingName] = useState(false);
    const [nameMsg, setNameMsg] = useState(null); // {text, ok}

    // Email change
    const [newEmail, setNewEmail] = useState('');
    const [savingEmail, setSavingEmail] = useState(false);
    const [emailMsg, setEmailMsg] = useState(null);
    const [emailSendCount, setEmailSendCount] = useState(0);

    // Verification resend
    const [resending, setResending] = useState(false);
    const [resendMsg, setResendMsg] = useState(null);

    // Password change
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [savingPw, setSavingPw] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);

    // Data export
    const [exporting, setExporting] = useState(false);
    const [exportMsg, setExportMsg] = useState('');
    const [exportMsgColor, setExportMsgColor] = useState('var(--text-secondary, #666)');

    // Delete account
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteMsg, setDeleteMsg] = useState(null);
    const [showDeleteForm, setShowDeleteForm] = useState(false);

    useEffect(() => {
        if (userRole) {
            setDisplayName(userRole.display_name || userRole.username || '');
        }
    }, [userRole]);

    const email = userRole?.email;
    const emailVerified = userRole?.email_verified;
    const pendingEmail = userRole?.pending_email;
    const EMAIL_DAILY_CAP = 5;

    async function handleSaveName(e) {
        e.preventDefault();
        if (!displayName.trim()) return;
        setSavingName(true);
        setNameMsg(null);
        try {
            await updateProfile({ display_name: displayName.trim() });
            setNameMsg({ text: 'Display name updated.', ok: true });
        } catch (err) {
            setNameMsg({ text: err.message || 'Failed to update name.', ok: false });
        } finally {
            setSavingName(false);
        }
    }

    async function handleChangeEmail(e) {
        e.preventDefault();
        if (!newEmail.trim()) return;
        setSavingEmail(true);
        setEmailMsg(null);
        try {
            await updateProfile({ email: newEmail.trim() });
            setEmailSendCount(c => c + 1);
            setEmailMsg({ text: `Verification email sent to ${newEmail.trim()}. Check your inbox — the link expires in 5 minutes.`, ok: true });
            setNewEmail('');
        } catch (err) {
            setEmailMsg({ text: err.message || 'Failed to update email.', ok: false });
        } finally {
            setSavingEmail(false);
        }
    }

    async function handleResendVerification() {
        if (resending) return;
        setResending(true);
        setResendMsg(null);
        try {
            await sendVerificationEmail();
            setEmailSendCount(c => c + 1);
            setResendMsg({ text: 'Verification email sent. Check your inbox.', ok: true });
        } catch (err) {
            setResendMsg({ text: err.message || 'Failed to resend.', ok: false });
        } finally {
            setResending(false);
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        if (!currentPw || !newPw || !confirmPw) { setPwMsg({ text: 'Please fill in all fields.', ok: false }); return; }
        if (newPw !== confirmPw) { setPwMsg({ text: 'New passwords do not match.', ok: false }); return; }
        if (newPw.length < 8) { setPwMsg({ text: 'Password must be at least 8 characters.', ok: false }); return; }
        setSavingPw(true);
        setPwMsg(null);
        try {
            await changePassword(currentPw, newPw);
            setPwMsg({ text: 'Password changed successfully.', ok: true });
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (err) {
            setPwMsg({ text: err.message || 'Failed to change password.', ok: false });
        } finally {
            setSavingPw(false);
        }
    }

    async function handleDeleteAccount(e) {
        e.preventDefault();
        if (deleteConfirm !== 'DELETE') { setDeleteMsg({ text: 'Type DELETE to confirm.', ok: false }); return; }
        setDeleting(true);
        setDeleteMsg(null);
        try {
            await deleteAccount();
            setDeleteMsg({ text: 'Deletion scheduled. Check your email for a cancellation link — you have 48 hours. Logging you out…', ok: true });
            setTimeout(async () => {
                await logout();
                endSession();
                const loginUrl = import.meta.env.PROD ? '/utility-tools-web/login' : 'http://localhost:5174/login';
                window.location.href = loginUrl;
            }, 4000);
        } catch (err) {
            setDeleteMsg({ text: err.message || 'Failed to schedule deletion.', ok: false });
            setDeleting(false);
        }
    }

    const handleExport = async () => {
        setExporting(true);
        setExportMsg('');
        try {
            await exportUserData(); // triggers browser download
            setExportMsg('Export downloaded successfully.');
            setExportMsgColor('var(--success, #16a34a)');
        } catch (err) {
            if (err?.status === 429) {
                setExportMsg('Export is limited to once per hour. Please try again later.');
            } else {
                setExportMsg('Export failed. Please try again.');
            }
            setExportMsgColor('var(--error, #dc2626)');
        } finally {
            setExporting(false);
        }
    };

    const atEmailCap = emailSendCount >= EMAIL_DAILY_CAP;
    const nearEmailCap = emailSendCount === EMAIL_DAILY_CAP - 1;

    return (
        <div className="profile-page">
            <div className="profile-back">
                <button className="profile-back-btn" onClick={() => navigate(-1)}>← Back</button>
            </div>

            <div className="profile-card">
                <h1 className="profile-title">Profile</h1>

                {/* ── Display name ── */}
                <section className="profile-section">
                    <h2 className="profile-section-heading">Display name</h2>
                    <form onSubmit={handleSaveName} className="profile-row">
                        <input
                            className="profile-input"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder="Display name"
                            maxLength={50}
                        />
                        <button className="profile-btn-save" type="submit" disabled={savingName}>
                            {savingName ? '…' : 'Save'}
                        </button>
                    </form>
                    {nameMsg && <p className={`profile-msg ${nameMsg.ok ? 'ok' : 'err'}`}>{nameMsg.text}</p>}
                </section>

                {/* ── Email ── */}
                <section className="profile-section">
                    <h2 className="profile-section-heading">Email</h2>

                    {email ? (
                        <div className="profile-email-current">
                            <span className="profile-email-addr">{email}</span>
                            {emailVerified
                                ? <span className="profile-email-badge verified">✓ verified</span>
                                : <span className="profile-email-badge unverified">unverified</span>}
                        </div>
                    ) : (
                        <p className="profile-email-none">No email address on your account.</p>
                    )}

                    {pendingEmail && (
                        <p className="profile-pending-note">
                            Pending change to <strong>{pendingEmail}</strong> — check your inbox to verify.
                        </p>
                    )}

                    {email && !emailVerified && (
                        <div className="profile-resend-wrap">
                            {nearEmailCap && <p className="profile-warn">1 send remaining today.</p>}
                            {atEmailCap
                                ? <p className="profile-warn">Daily email limit reached. Try again tomorrow.</p>
                                : <button className="profile-btn-secondary" onClick={handleResendVerification} disabled={resending}>
                                    {resending ? '…' : 'Resend verification email'}
                                  </button>
                            }
                            {resendMsg && <p className={`profile-msg ${resendMsg.ok ? 'ok' : 'err'}`}>{resendMsg.text}</p>}
                        </div>
                    )}

                    <form onSubmit={handleChangeEmail} className="profile-row" style={{ marginTop: 12 }}>
                        <input
                            className="profile-input"
                            type="email"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            placeholder={email ? 'New email address' : 'Add email address'}
                        />
                        {atEmailCap
                            ? <span className="profile-btn-save profile-btn-disabled">Limit reached</span>
                            : <button className="profile-btn-save" type="submit" disabled={savingEmail || !newEmail.trim()}>
                                {savingEmail ? '…' : (email ? 'Change' : 'Add')}
                              </button>
                        }
                    </form>
                    {nearEmailCap && !atEmailCap && (!email || emailVerified) && <p className="profile-warn" style={{ marginTop: 4 }}>1 send remaining today.</p>}
                    {emailMsg && <p className={`profile-msg ${emailMsg.ok ? 'ok' : 'err'}`}>{emailMsg.text}</p>}
                </section>

                {/* ── Password ── */}
                <section className="profile-section">
                    <h2 className="profile-section-heading">Password</h2>
                    <form onSubmit={handleChangePassword} className="profile-col">
                        <input className="profile-input" type="password" placeholder="Current password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} autoComplete="current-password" />
                        <input className="profile-input" type="password" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password" />
                        <input className="profile-input" type="password" placeholder="Confirm new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} autoComplete="new-password" />
                        {pwMsg && <p className={`profile-msg ${pwMsg.ok ? 'ok' : 'err'}`}>{pwMsg.text}</p>}
                        <button className="profile-btn-save" type="submit" disabled={savingPw} style={{ alignSelf: 'flex-start' }}>
                            {savingPw ? '…' : 'Change password'}
                        </button>
                    </form>
                </section>

                {/* ── Plan ── */}
                {billing !== null && (
                    <section className="profile-section">
                        <h2 className="profile-section-heading">Plan</h2>
                        <div className="profile-plan-row">
                            <span className={`profile-tier-badge tier-${tier || 'base'}`}>
                                {tier === 'pro' ? '✦ Pro'
                                    : tier === 'proplus' ? '✦ Pro+'
                                    : tier === 'business' ? '✦ Business'
                                    : tier === 'enterprise' ? '✦ Enterprise'
                                    : 'Base'}
                            </span>
                            {activeTrial && (() => {
                                const daysLeft = Math.max(0, Math.ceil((new Date(activeTrial.ends_at) - Date.now()) / 86400000));
                                return <span className="profile-trial-days">Trial: {daysLeft}d left</span>;
                            })()}
                        </div>
                        <button
                            className="profile-btn-secondary"
                            style={{ marginTop: 10 }}
                            onClick={() => navigate('/pricing')}
                        >
                            {hasPro && !activeTrial ? 'Manage plan →' : activeTrial ? 'Upgrade plan →' : 'View plans →'}
                        </button>
                    </section>
                )}

                {/* ── Danger zone ── */}
                <section className="profile-section profile-danger-zone">
                    <h2 className="profile-section-heading danger">Danger zone</h2>
                    {!showDeleteForm ? (
                        <button className="profile-btn-danger" onClick={() => setShowDeleteForm(true)}>
                            Delete account
                        </button>
                    ) : (
                        <form onSubmit={handleDeleteAccount} className="profile-col">
                            <p className="profile-delete-warning">
                                Your account and all data will be <strong>permanently deleted in 48 hours</strong>.
                                You'll receive an email with a link to cancel within that window.
                            </p>
                            <input
                                className="profile-input profile-input-danger"
                                placeholder='Type DELETE to confirm'
                                value={deleteConfirm}
                                onChange={e => setDeleteConfirm(e.target.value)}
                                autoComplete="off"
                            />
                            {deleteMsg && <p className={`profile-msg ${deleteMsg.ok ? 'ok' : 'err'}`}>{deleteMsg.text}</p>}
                            <div className="profile-row">
                                <button className="profile-btn-danger" type="submit" disabled={deleting}>
                                    {deleting ? '…' : 'Confirm deletion'}
                                </button>
                                <button className="profile-btn-secondary" type="button" onClick={() => { setShowDeleteForm(false); setDeleteConfirm(''); setDeleteMsg(null); }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {/* ── Your data ── */}
                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border, #e5e7eb)' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px', color: 'var(--text-primary, #1a1a1a)' }}>
                        Your data
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #666)', margin: '0 0 12px' }}>
                        Download a copy of all data we hold about you (transactions, categories, billing history, preferences). Limited to once per hour.
                    </p>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        style={{
                            padding: '8px 16px', fontSize: '13px', cursor: exporting ? 'default' : 'pointer',
                            background: exporting ? 'var(--bg-muted, #f3f4f6)' : 'var(--accent, #2563eb)',
                            color: exporting ? 'var(--text-secondary, #666)' : '#fff',
                            border: 'none', borderRadius: '6px', fontWeight: 500
                        }}
                    >
                        {exporting ? 'Preparing export…' : 'Download your data'}
                    </button>
                    {exportMsg && <p style={{ fontSize: '13px', marginTop: '8px', color: exportMsgColor }}>{exportMsg}</p>}
                </div>
            </div>
        </div>
    );
}
