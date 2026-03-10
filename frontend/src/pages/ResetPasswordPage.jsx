import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 chars with uppercase, lowercase, number, and special character');
            return;
        }

        setSubmitting(true);
        try {
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate('/auth'), 3000);
        } catch (err) {
            setError(err.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '400px', background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: 'var(--shadow)' }}
            >
                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#15803d' }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Password Reset!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your password has been updated successfully. Redirecting you to login...</p>
                        <Link to="/auth" className="btn btn-primary" style={{ width: '100%' }}>Go to Login Now</Link>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Set New Password</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '32px' }}>Choose a strong password to secure your account.</p>

                        {error && (
                            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '4px', fontSize: '0.875rem', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px' }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none' }}
                                    />
                                </div>
                                <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', paddingLeft: '20px', lineHeight: '1.4' }}>
                                    <li>Minimum 8 characters</li>
                                    <li>At least 1 uppercase & 1 lowercase letter</li>
                                    <li>At least 1 number and 1 special character</li>
                                </ul>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                            >
                                {submitting ? <><Loader className="animate-spin" size={18} /> Updating...</> : 'Update Password'}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
