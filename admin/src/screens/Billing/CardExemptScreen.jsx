import { useEffect, useState } from 'react';
import { getCardExemptList, setCardExempt } from '../../api.js';

export default function CardExemptScreen({ caller }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(null); // user id being saved
    const [msg, setMsg] = useState(null); // { text, ok }

    const callerLevel = caller?.level ?? 0;

    useEffect(() => {
        getCardExemptList()
            .then(d => setUsers(d.users || []))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleToggle(user, newValue) {
        setSaving(user.id);
        setMsg(null);
        try {
            await setCardExempt(user.id, newValue);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, card_exempt: newValue } : u));
            setMsg({ text: `${user.username} (ID ${user.id}) — card_exempt set to ${newValue}.`, ok: true });
        } catch (err) {
            setMsg({ text: err.message || 'Failed', ok: false });
        } finally {
            setSaving(null);
        }
    }

    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    function roleBadgeClass(role) {
        if (role === 'owner') return 'badge badge-owner';
        if (role === 'admin') return 'badge badge-admin';
        return 'badge badge-user';
    }

    return (
        <div>
            <h1 className="screen-title">Card Exempt</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 13 }}>
                Exempt users bypass the card requirement for trials and are never subject to upload caps or payment_failed flags.
            </p>
            {error && <div className="screen-error">{error}</div>}
            {msg && (
                <div className={msg.ok ? 'screen-success' : 'screen-error'} style={{ marginBottom: 12 }}>
                    {msg.text}
                </div>
            )}

            <div className="admin-search-row" style={{ marginBottom: 16 }}>
                <input
                    className="admin-input"
                    placeholder="Search by username…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: 280 }}
                />
            </div>

            {loading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Exempt</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => {
                            const canEdit = u.level < callerLevel;
                            const isSaving = saving === u.id;
                            return (
                                <tr key={u.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.id}</td>
                                    <td><strong>{u.username}</strong></td>
                                    <td><span className={roleBadgeClass(u.role)}>{u.role}</span></td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                                            background: u.card_exempt ? 'var(--success-bg, #f0fdf4)' : 'var(--bg-muted, #f3f4f6)',
                                            color: u.card_exempt ? 'var(--success, #16a34a)' : 'var(--text-muted)',
                                        }}>
                                            {u.card_exempt ? 'exempt' : 'not exempt'}
                                        </span>
                                    </td>
                                    <td>
                                        {canEdit ? (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ fontSize: 12, padding: '3px 10px' }}
                                                    disabled={isSaving || u.card_exempt === true}
                                                    onClick={() => handleToggle(u, true)}
                                                >
                                                    {isSaving ? '…' : 'Set exempt'}
                                                </button>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ fontSize: 12, padding: '3px 10px' }}
                                                    disabled={isSaving || u.card_exempt === false}
                                                    onClick={() => handleToggle(u, false)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Not authorised to edit</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={5} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No users found</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
