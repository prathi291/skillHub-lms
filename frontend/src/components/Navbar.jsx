import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    LogOut, BookOpen, User, ChevronDown,
    Search, Sun, Moon, Camera, Upload, Trash2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ─────────────────────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_B = MAX_SIZE_MB * 1024 * 1024;

// ─── AvatarDisplay ─────────────────────────────────────────────────────────────
// Renders the avatar image (or gradient-letter fallback) + a camera-icon badge.
// Must stay OUTSIDE Navbar for Vite HMR compliance.
const AvatarDisplay = ({ user, size, radius, fontSize, uploading, showBadge }) => (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>

        {user?.avatar ? (
            <img
                src={user.avatar}
                alt="Profile"
                style={{
                    width: size, height: size, borderRadius: '50%',
                    objectFit: 'cover', display: 'block',
                    border: '2px solid var(--primary)',
                    opacity: uploading ? 0.5 : 1,
                    transition: 'opacity 0.2s'
                }}
            />
        ) : (
            <div style={{
                width: size, height: size, borderRadius: radius,
                background: 'var(--primary-gradient)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize,
                opacity: uploading ? 0.5 : 1,
                transition: 'opacity 0.2s',
                userSelect: 'none'
            }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
        )}

        {/* Small camera badge – indicates the avatar is clickable */}
        {showBadge && !uploading && (
            <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--surface)',
                pointerEvents: 'none'
            }}>
                <Camera size={8} color="#fff" strokeWidth={2.5} />
            </div>
        )}

        {/* Spinner while uploading */}
        {uploading && (
            <div style={{
                position: 'absolute', inset: 0,
                borderRadius: user?.avatar ? '50%' : radius,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{
                    width: 12, height: 12,
                    border: '2px solid #fff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                }} />
            </div>
        )}
    </div>
);

// ─── AvatarMenu ────────────────────────────────────────────────────────────────
// Small floating menu: Upload / Remove / Cancel – shown when the avatar is clicked.
const AvatarMenu = ({ hasAvatar, onUpload, onRemove, onClose }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -6 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-hover)',
            minWidth: '170px',
            display: 'flex', flexDirection: 'column',
            padding: '6px',
            zIndex: 200,
            overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
    >
        {/* Upload Photo */}
        <button
            onClick={onUpload}
            style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 500,
                color: 'var(--text-main)', width: '100%', textAlign: 'left',
                transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <Upload size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            Upload Photo
        </button>

        {/* Remove Photo – only shown when a custom photo exists */}
        {hasAvatar && (
            <button
                onClick={onRemove}
                style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 12px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 500,
                    color: 'var(--error)', width: '100%', textAlign: 'left',
                    transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
                <Trash2 size={15} style={{ flexShrink: 0 }} />
                Remove Photo
            </button>
        )}

        {/* Divider + Cancel */}
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
        <button
            onClick={onClose}
            style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 500,
                color: 'var(--text-muted)', width: '100%', textAlign: 'left',
                transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <X size={15} style={{ flexShrink: 0 }} />
            Cancel
        </button>
    </motion.div>
);

// ─── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = () => {
    const { user, logout, updateAvatar, removeAvatar } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const dropdownRef = useRef(null);
    const avatarMenuRef = useRef(null);
    const fileInputRef = useRef(null);

    // ── Close dropdowns on outside click ──
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
            if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
                setIsAvatarMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Avatar menu actions ──
    const openAvatarMenu = (e) => {
        e.stopPropagation();
        setIsAvatarMenuOpen(prev => !prev);
        setErrorMsg('');
    };

    const handleUploadClick = () => {
        setIsAvatarMenuOpen(false);
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        setIsAvatarMenuOpen(false);
        removeAvatar();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Format check
        if (!ALLOWED_TYPES.includes(file.type)) {
            setErrorMsg('Unsupported format. Please upload a JPG or PNG file.');
            e.target.value = '';
            return;
        }
        // Size check
        if (file.size > MAX_SIZE_B) {
            setErrorMsg(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
            e.target.value = '';
            return;
        }

        setErrorMsg('');
        setUploading(true);
        try {
            await updateAvatar(file);
        } catch {
            setErrorMsg('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
        setIsDropdownOpen(false);
    };

    return (
        <nav className="nav glass-morphism">
            {/* Single hidden file input – triggered from AvatarMenu > Upload Photo */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '100%' }}>

                {/* ── Left: logo + Explore + search ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            textDecoration: 'none',
                            lineHeight: 1,
                        }}
                    >
                        {/* Graduation-cap icon – inline SVG, theme-adaptive */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            height="24"
                            width="24"
                            fill="none"
                            aria-hidden="true"
                            style={{ flexShrink: 0, display: 'block' }}
                        >
                            <defs>
                                <linearGradient id="sh-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7C3AED" />
                                    <stop offset="100%" stopColor="#3B82F6" />
                                </linearGradient>
                            </defs>
                            {/* Cap diamond */}
                            <polygon points="12,2 22,7 12,12 2,7" fill="url(#sh-icon-grad)" />
                            {/* Left book page */}
                            <path d="M4 9v7q4 2 8 2" stroke="url(#sh-icon-grad)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                            {/* Right book page */}
                            <path d="M20 9v7q-4 2 -8 2" stroke="url(#sh-icon-grad)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                            {/* Tassel cord */}
                            <line x1="22" y1="7" x2="22" y2="13" stroke="url(#sh-icon-grad)" strokeWidth="1.6" strokeLinecap="round" />
                            <circle cx="22" cy="14" r="1.2" fill="url(#sh-icon-grad)" />
                        </svg>

                        {/* Wordmark: Skill (plain) + Hub (gradient), same element */}
                        <span style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                            display: 'inline-flex',
                            alignItems: 'baseline',
                        }}>
                            <span style={{ color: 'var(--text-main)' }}>Skill</span><span style={{
                                background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>Hub</span>
                        </span>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link to="/courses" className="btn-outline" style={{ border: 'none', fontSize: '0.9375rem', fontWeight: 500 }}>
                            Explore
                        </Link>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const query = new FormData(e.target).get('search');
                        navigate(query ? `/?search=${encodeURIComponent(query)}` : '/');
                    }} className="search-bar">
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input name="search" type="text" placeholder="What do you want to learn?" className="search-input" />
                    </form>
                </div>

                {/* ── Right: theme toggle + user section ── */}
                <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleTheme}
                        style={{
                            background: 'var(--border)', color: 'var(--text-main)',
                            width: '40px', height: '40px', borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </motion.button>

                    {user ? (
                        <>
                            <Link to="/my-courses" className="btn-outline" style={{ border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                <BookOpen size={20} />
                                <span className="hide-mobile">My Courses</span>
                            </Link>

                            {/* ── Profile button + its dropdown ── */}
                            <div className="profile-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
                                <motion.button
                                    whileHover={{ y: -1 }}
                                    onClick={() => { setIsDropdownOpen(prev => !prev); setIsAvatarMenuOpen(false); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        background: 'var(--surface)', padding: '6px 12px',
                                        borderRadius: '12px', border: '1px solid var(--border)',
                                        boxShadow: 'var(--shadow)'
                                    }}
                                >
                                    <AvatarDisplay user={user} size={28} radius="8px" fontSize="13px" uploading={uploading} showBadge />
                                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>
                                        {user.name.split(' ')[0]}
                                    </span>
                                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                                </motion.button>

                                {/* Profile dropdown panel */}
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            style={{
                                                position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                                                background: 'var(--surface)', border: '1px solid var(--border)',
                                                borderRadius: '12px', boxShadow: 'var(--shadow-hover)',
                                                minWidth: '230px', display: 'flex', flexDirection: 'column',
                                                padding: '8px', zIndex: 100
                                            }}
                                        >
                                            {/* Header: clickable avatar + name + email */}
                                            <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>

                                                {/* Avatar wrapper – clicking opens avatar action menu */}
                                                <div ref={avatarMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        onClick={openAvatarMenu}
                                                        style={{ cursor: 'pointer' }}
                                                        title="Change profile photo"
                                                    >
                                                        <AvatarDisplay
                                                            user={user}
                                                            size={48}
                                                            radius="50%"
                                                            fontSize="19px"
                                                            uploading={uploading}
                                                            showBadge
                                                        />
                                                    </motion.div>

                                                    {/* Avatar action mini-menu */}
                                                    <AnimatePresence>
                                                        {isAvatarMenuOpen && (
                                                            <AvatarMenu
                                                                hasAvatar={!!user.avatar}
                                                                onUpload={handleUploadClick}
                                                                onRemove={handleRemove}
                                                                onClose={() => setIsAvatarMenuOpen(false)}
                                                            />
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <p style={{ fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                                                    {/* Error message */}
                                                    {errorMsg && (
                                                        <p style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px', lineHeight: 1.3 }}>{errorMsg}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <Link
                                                to="/profile"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="btn-outline"
                                                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}
                                            >
                                                <User size={18} /> Profile
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="btn-outline"
                                                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', fontSize: '14px', width: '100%', textAlign: 'left', color: 'var(--error)', fontWeight: 500 }}
                                            >
                                                <LogOut size={18} /> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <Link to="/auth" className="btn btn-primary">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
