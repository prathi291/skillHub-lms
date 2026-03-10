import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, BookOpen, Sparkles, Star, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FEATURES = [
    { icon: <BookOpen size={20} />, text: '100,000+ world-class courses' },
    { icon: <Sparkles size={20} />, text: 'AI-powered learning assistant' },
    { icon: <Star size={20} />, text: 'Learn from expert instructors' },
    { icon: <ArrowRight size={20} />, text: 'Earn certificates & advance your career' }
];

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgot, setIsForgot] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login, signup, forgotPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setSubmitting(true);

        try {
            if (isForgot) {
                // ── Simulated reset flow (no real email sent) ──────────────────────
                // Fake a short network delay so the spinner is visible
                await new Promise(resolve => setTimeout(resolve, 1500));
                setSuccessMsg('Reset link sent! Please check your email to create a new password.');
                // After 3s, take the user back to the Login tab automatically
                setTimeout(() => {
                    setIsForgot(false);
                    setIsLogin(true);
                    setSuccessMsg('');
                }, 3000);
            } else if (isLogin) {
                await login(formData.email, formData.password);
                navigate(location.state?.from || '/', { replace: true });
            } else {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                if (!passwordRegex.test(formData.password)) {
                    throw new Error('Password needs 8+ chars with uppercase, number & special character');
                }
                await signup(formData.name, formData.email, formData.password, formData.role);
                navigate(location.state?.from || '/', { replace: true });
            }
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const switchMode = (toLogin) => {
        setIsLogin(toLogin);
        setIsForgot(false);
        setError('');
        setSuccessMsg('');
    };

    return (
        <div className="auth-wrapper">
            {/* ── Left Panel ── */}
            <div className="auth-panel-left">
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ position: 'relative', zIndex: 1, maxWidth: '380px' }}
                >
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', marginBottom: '48px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={22} />
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>LearnHub</span>
                    </Link>

                    <h2 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px', color: '#fff' }}>
                        Turn your ambition into a success story
                    </h2>
                    <p style={{ fontSize: '1.125rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', marginBottom: '40px' }}>
                        Choose from thousands of online courses taught by real professionals.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.9)' }}
                            >
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {f.icon}
                                </div>
                                <span style={{ fontSize: '1rem', fontWeight: 500 }}>{f.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Right Panel ── */}
            <div className="auth-panel-right">
                <motion.div
                    key={isLogin ? 'login' : isForgot ? 'forgot' : 'signup'}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ width: '100%', maxWidth: '420px' }}
                >
                    {/* Tab Toggle */}
                    {!isForgot && (
                        <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: '12px', padding: '4px', marginBottom: '36px' }}>
                            {['Log in', 'Sign up'].map((label, i) => {
                                const active = i === 0 ? isLogin : !isLogin;
                                return (
                                    <button
                                        key={label}
                                        onClick={() => switchMode(i === 0)}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700,
                                            fontSize: '0.9375rem', transition: 'all 0.25s',
                                            background: active ? 'var(--surface)' : 'transparent',
                                            color: active ? 'var(--primary)' : 'var(--text-muted)',
                                            boxShadow: active ? 'var(--shadow)' : 'none',
                                            border: 'none'
                                        }}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ marginBottom: '28px' }}>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '8px' }}>
                            {isForgot ? 'Reset your password' : isLogin ? 'Welcome back 👋' : 'Create your account'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {isForgot ? "Enter your email and we'll send you a reset link." :
                                isLogin ? 'Enter your credentials to access your dashboard.' :
                                    'Start learning from top instructors today.'}
                        </p>
                    </div>

                    {/* Alerts */}
                    <AnimatePresence>
                        {successMsg && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                style={{ padding: '14px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: '#065f46', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 500 }}>
                                ✅ {successMsg}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                style={{ padding: '14px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', color: '#b91c1c', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 500 }}>
                                ⚠️ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <AnimatePresence>
                            {!isLogin && !isForgot && (
                                <motion.div key="name-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <label className="input-label">Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input name="name" type="text" autoComplete="name" className="input-field" style={{ paddingLeft: '44px' }} placeholder="Jane Doe" required onChange={handleChange} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="input-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input name="email" type="email" autoComplete="email" className="input-field" style={{ paddingLeft: '44px' }} placeholder="name@example.com" required onChange={handleChange} />
                            </div>
                        </div>

                        {!isLogin && !isForgot && (
                            <div>
                                <label className="input-label">I want to join as</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['student', 'instructor'].map(role => (
                                        <button key={role} type="button" onClick={() => setFormData({ ...formData, role })}
                                            style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9375rem', border: `1.5px solid ${formData.role === role ? 'var(--primary)' : 'var(--border)'}`, background: formData.role === role ? 'var(--primary-light)' : 'var(--bg)', color: formData.role === role ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isForgot && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label className="input-label" style={{ margin: 0 }}>Password</label>
                                    {isLogin && (
                                        <button type="button" onClick={() => { setIsForgot(true); setError(''); setSuccessMsg(''); }} style={{ background: 'none', color: 'var(--primary)', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input name="password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} className="input-field" style={{ paddingLeft: '44px' }} placeholder={isLogin ? '••••••••' : '8+ chars, uppercase & symbol'} required onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '16px', fontSize: '1rem', marginTop: '4px', opacity: submitting ? 0.75 : 1 }}
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }}></div>
                                    {isForgot ? 'Sending...' : isLogin ? 'Logging in...' : 'Creating account...'}
                                </>
                            ) : (
                                isForgot ? 'Send reset link' : isLogin ? 'Log in' : 'Create account'
                            )}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <div style={{ marginTop: '28px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        {isForgot ? (
                            <button onClick={() => { setIsForgot(false); setIsLogin(true); setError(''); }} style={{ background: 'none', color: 'var(--primary)', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                ← Back to Log in
                            </button>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                <button onClick={() => switchMode(!isLogin)} style={{ background: 'none', color: 'var(--primary)', fontWeight: 700, border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                    {isLogin ? 'Sign up for free' : 'Log in'}
                                </button>
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;
