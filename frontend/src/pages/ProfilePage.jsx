import React, { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Briefcase, MapPin, CheckCircle, Edit3, Camera, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE_B = 5 * 1024 * 1024; // 5 MB

const ProfilePage = () => {
    const { user, updateProfile, updateAvatar, removeAvatar } = useAuth();

    if (!user) return <Navigate to="/auth" />;

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        bio: user.bio || '',
        occupation: user.occupation || '',
        location: user.location || '',
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [avatarHovered, setAvatarHovered] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatarError, setAvatarError] = useState('');

    const fileInputRef = useRef(null);

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'U';

    // ── Profile form ──────────────────────────────────────────────────────────
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfile(formData);
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    // ── Avatar upload ─────────────────────────────────────────────────────────
    const handleAvatarClick = () => {
        setAvatarError('');
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            setAvatarError('Unsupported format. Please choose a JPG or PNG file.');
            e.target.value = '';
            return;
        }
        if (file.size > MAX_SIZE_B) {
            setAvatarError('File too large. Maximum size is 5MB.');
            e.target.value = '';
            return;
        }

        setAvatarError('');
        setUploading(true);
        try {
            await updateAvatar(file);
        } catch {
            setAvatarError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleRemovePhoto = () => {
        setAvatarError('');
        removeAvatar();
    };

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>

            {/* Page header */}
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        My Profile
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginTop: '4px' }}>
                        Manage your personal information and learning preferences.
                    </p>
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Edit3 size={18} /> Edit Profile
                    </button>
                )}
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ padding: '32px' }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap' }}>

                    {/* ── Avatar column ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        {/* Avatar circle */}
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleAvatarClick}
                            onMouseEnter={() => setAvatarHovered(true)}
                            onMouseLeave={() => setAvatarHovered(false)}
                            style={{ position: 'relative', cursor: 'pointer', width: 120, height: 120 }}
                            title="Click to change profile photo"
                        >
                            {/* Avatar display */}
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="Profile"
                                    style={{
                                        width: 120, height: 120,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        display: 'block',
                                        border: '3px solid var(--primary)',
                                        boxShadow: 'var(--shadow)',
                                        opacity: uploading ? 0.45 : 1,
                                        transition: 'opacity 0.2s'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: 120, height: 120,
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '3rem',
                                    boxShadow: 'var(--shadow)',
                                    opacity: uploading ? 0.45 : 1,
                                    transition: 'opacity 0.2s',
                                    userSelect: 'none'
                                }}>
                                    {getInitial(user.name)}
                                </div>
                            )}

                            {/* Hover / uploading overlay */}
                            <AnimatePresence>
                                {(avatarHovered || uploading) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: 'absolute', inset: 0,
                                            borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.50)',
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            gap: 6, color: '#fff'
                                        }}
                                    >
                                        {uploading ? (
                                            <div style={{
                                                width: 28, height: 28,
                                                border: '3px solid rgba(255,255,255,0.4)',
                                                borderTopColor: '#fff',
                                                borderRadius: '50%',
                                                animation: 'spin 0.7s linear infinite'
                                            }} />
                                        ) : (
                                            <>
                                                <Camera size={26} strokeWidth={1.8} />
                                                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.03em' }}>
                                                    {user.avatar ? 'Change Photo' : 'Upload Photo'}
                                                </span>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Camera badge – always visible when not hovered */}
                            {!avatarHovered && !uploading && (
                                <div style={{
                                    position: 'absolute', bottom: 4, right: 4,
                                    width: 28, height: 28,
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    border: '2px solid var(--surface)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                                }}>
                                    <Camera size={13} color="#fff" strokeWidth={2.5} />
                                </div>
                            )}
                        </motion.div>

                        {/* Upload hint */}
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4, maxWidth: '110px' }}>
                            JPG or PNG · max 5MB
                        </p>

                        {/* Error message */}
                        {avatarError && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ fontSize: '11.5px', color: 'var(--error)', textAlign: 'center', maxWidth: '120px', lineHeight: 1.4 }}
                            >
                                {avatarError}
                            </motion.p>
                        )}

                        {/* Remove Photo link */}
                        {user.avatar && !uploading && (
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={handleRemovePhoto}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    fontSize: '12px', color: 'var(--error)',
                                    fontWeight: 500, background: 'none',
                                    border: 'none', cursor: 'pointer', padding: '2px 6px',
                                    borderRadius: '6px'
                                }}
                            >
                                <Trash2 size={13} /> Remove Photo
                            </motion.button>
                        )}
                    </div>

                    {/* ── Form / display column ── */}
                    <div style={{ flex: 1, width: '100%' }}>
                        {isEditing ? (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" style={{ paddingLeft: '40px' }} required />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Email Address (Cannot be changed)</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', opacity: 0.5 }} />
                                        <input type="email" value={user.email} disabled className="input-field" style={{ paddingLeft: '40px', background: 'var(--bg)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Occupation / Title</label>
                                    <div style={{ position: 'relative' }}>
                                        <Briefcase size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="e.g. Frontend Developer" className="input-field" style={{ paddingLeft: '40px' }} />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Location</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. New York, USA" className="input-field" style={{ paddingLeft: '40px' }} />
                                    </div>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Bio</label>
                                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" placeholder="Tell us a bit about yourself..." className="input-field" style={{ resize: 'vertical' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Save Changes</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ padding: '10px 24px' }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>{user.name}</h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Mail size={16} /> {user.email}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>Occupation</p>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                            <Briefcase size={16} style={{ color: 'var(--text-secondary)' }} />
                                            {user.occupation || 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>Location</p>
                                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                            <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
                                            {user.location || 'Not specified'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>About Me</p>
                                    <p style={{ lineHeight: '1.6', color: user.bio ? 'var(--text-main)' : 'var(--text-secondary)', fontStyle: user.bio ? 'normal' : 'italic', background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        {user.bio || 'No bio provided yet. Click "Edit Profile" to add one!'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Success toast */}
            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    style={{ position: 'fixed', bottom: '30px', right: '30px', background: 'var(--surface)', padding: '16px 24px', borderRadius: '12px', boxShadow: 'var(--shadow-hover)', border: '1px solid var(--success)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000, fontWeight: 600 }}
                >
                    <CheckCircle style={{ color: 'var(--success)' }} />
                    Profile updated successfully!
                </motion.div>
            )}
        </div>
    );
};

export default ProfilePage;
