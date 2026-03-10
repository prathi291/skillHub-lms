import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCourses } from '../contexts/CourseContext';
import { Star, CheckCircle, Filter, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../utils/formatPrice';

// ─── Constants ────────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:5000/api';

const LEVELS = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Expert', value: 'expert' },
];

const RATINGS = [
    { label: '4.5 & up', value: 4.5 },
    { label: '4 & up', value: 4.0 },
    { label: '3.5 & up', value: 3.5 },
];

// Level → colour map for badges
const LEVEL_COLORS = {
    beginner: { bg: 'rgba(16,185,129,0.18)', color: '#10b981' },
    intermediate: { bg: 'rgba(245,158,11,0.18)', color: '#f59e0b' },
    expert: { bg: 'rgba(239,68,68,0.18)', color: '#ef4444' },
};

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const mapCourse = (c) => ({
    ...c,
    id: c._id,
    instructor: c.instructor_id?.name || 'Unknown Instructor',
    thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
    reviews: c.reviewCount || 0,
    level: (c.level || '').toLowerCase(),
});

// ─── StarRow ─────────────────────────────────────────────────────────────────
const StarRow = ({ rating, reviews }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    size={13}
                    fill={i <= Math.round(rating) ? '#febb02' : 'none'}
                    color={i <= Math.round(rating) ? '#febb02' : 'var(--border)'}
                />
            ))}
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-main)' }}>
            {rating ? rating.toFixed(1) : '—'}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({reviews?.toLocaleString()} reviews)
        </span>
    </div>
);

// ─── LevelBadge ──────────────────────────────────────────────────────────────
const LevelBadge = ({ level, position = 'overlay' }) => {
    if (!level || level === 'all levels') return null;
    const colors = LEVEL_COLORS[level] || { bg: 'rgba(99,102,241,0.18)', color: 'var(--primary)' };

    if (position === 'overlay') {
        return (
            <div style={{
                position: 'absolute', top: '10px', right: '10px',
                background: 'rgba(0,0,0,0.62)',
                backdropFilter: 'blur(6px)',
                color: '#fff',
                padding: '3px 10px',
                fontSize: '0.68rem', fontWeight: 700,
                borderRadius: '20px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                border: `1px solid rgba(255,255,255,0.18)`
            }}>
                {capitalize(level)}
            </div>
        );
    }
    return (
        <span style={{
            display: 'inline-block',
            background: colors.bg,
            color: colors.color,
            padding: '2px 9px',
            fontSize: '0.7rem', fontWeight: 700,
            borderRadius: '20px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
        }}>
            {capitalize(level)}
        </span>
    );
};

// ─── CourseCard ───────────────────────────────────────────────────────────────
const CourseCard = ({ course, onOpenDetails, isEnrolled }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -6, boxShadow: 'var(--shadow-hover)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="card"
        style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', overflow: 'hidden' }}
        onClick={() => onOpenDetails(course._id || course.id)}
    >
        {/* Thumbnail */}
        <div style={{ position: 'relative', height: '172px', overflow: 'hidden', flexShrink: 0 }}>
            <img
                src={course.thumbnail}
                alt={course.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            {/* dark gradient for text readability */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)'
            }} />

            {/* Bestseller pill — bottom left */}
            {course.bestseller && (
                <div style={{
                    position: 'absolute', bottom: '10px', left: '10px',
                    background: '#febb02', color: '#1a1a1a',
                    padding: '3px 10px', fontSize: '0.68rem', fontWeight: 800,
                    borderRadius: '20px', letterSpacing: '0.02em'
                }}>
                    Bestseller
                </div>
            )}

            {/* Level badge — top right */}
            <LevelBadge level={course.level} position="overlay" />
        </div>

        {/* Card body */}
        <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
            {/* Title */}
            <h3 style={{
                fontSize: '1rem', fontWeight: 700,
                color: 'var(--text-main)', lineHeight: '1.45',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
                {course.title}
            </h3>

            {/* Rating */}
            <StarRow rating={course.rating} reviews={course.reviews} />

            {/* Description */}
            <p style={{
                color: 'var(--text-secondary)', fontSize: '0.8125rem',
                lineHeight: '1.55', flex: 1,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
                {course.description}
            </p>

            {/* Footer: price + button */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '14px',
                borderTop: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'
            }}>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', lineHeight: 1 }}>
                    {isEnrolled
                        ? <span style={{ color: 'var(--success)', fontSize: '0.875rem', fontWeight: 700 }}>✓ Enrolled</span>
                        : <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {formatPrice(course.price)}
                        </span>
                    }
                </div>
                <motion.button
                    whileTap={{ scale: 0.94 }}
                    className={isEnrolled ? 'btn btn-outline' : 'btn btn-primary'}
                    style={{ padding: '7px 16px', fontSize: '0.8125rem', flexShrink: 0 }}
                    onClick={e => { e.stopPropagation(); onOpenDetails(course._id || course.id); }}
                >
                    {isEnrolled ? 'Open' : 'Details'}
                </motion.button>
            </div>
        </div>
    </motion.div>
);

// ─── FilterPill ───────────────────────────────────────────────────────────────
const FilterPill = ({ label, onRemove }) => (
    <motion.span
        layout
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.75 }}
        style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px 4px 12px',
            background: 'var(--primary-light)', color: 'var(--primary)',
            borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
            border: '1px solid var(--primary)', lineHeight: 1
        }}
    >
        {label}
        <button
            onClick={onRemove}
            style={{
                display: 'flex', alignItems: 'center',
                color: 'var(--primary)', opacity: 0.7,
                lineHeight: 1, padding: '1px'
            }}
        >
            <X size={11} strokeWidth={3} />
        </button>
    </motion.span>
);

// ─── Custom Checkbox ──────────────────────────────────────────────────────────
const CustomCheckbox = ({ checked }) => (
    <div style={{
        width: 17, height: 17, borderRadius: '4px', flexShrink: 0,
        border: `2px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
        background: checked ? 'var(--primary)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease'
    }}>
        {checked && <CheckCircle size={10} color="#fff" strokeWidth={3.5} />}
    </div>
);

// ─── Custom Radio ─────────────────────────────────────────────────────────────
const CustomRadio = ({ selected }) => (
    <div style={{
        width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.15s'
    }}>
        {selected && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />}
    </div>
);

// ─── Courses Page ─────────────────────────────────────────────────────────────
const Courses = () => {
    const { isEnrolled } = useCourses();
    const navigate = useNavigate();
    const location = useLocation();

    const searchQuery = new URLSearchParams(location.search).get('search') || '';

    // Filter state — values are LOWERCASE to match normalised DB field
    const [selectedLevels, setSelectedLevels] = useState([]);
    const [minRating, setMinRating] = useState(null);

    // Course list
    const [courses, setCourses] = useState([]);
    const [isLoading, setLoading] = useState(true);

    // ── Fetch from backend on every filter / search change ────────────────────
    const fetchFiltered = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            if (selectedLevels.length === 1) params.set('level', selectedLevels[0]);
            if (minRating !== null) params.set('rating', String(minRating));

            const res = await fetch(`${API_URL}/courses?${params.toString()}`);
            const data = await res.json();
            const mapped = (data.courses || []).map(mapCourse);

            const filtered = selectedLevels.length > 1
                ? mapped.filter(c => selectedLevels.includes(c.level))
                : mapped;

            setCourses(filtered);
        } catch {
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedLevels, minRating]);

    useEffect(() => { fetchFiltered(); }, [fetchFiltered]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const toggleLevel = (v) =>
        setSelectedLevels(prev => prev.includes(v) ? prev.filter(l => l !== v) : [...prev, v]);

    const clearAllFilters = () => { setSelectedLevels([]); setMinRating(null); };

    const hasActiveFilters = selectedLevels.length > 0 || minRating !== null;

    const handleCourseClick = (id) => {
        if (isEnrolled(id)) navigate(`/learn/${id}`);
        else navigate(`/course/${id}`);
    };

    const activePills = [
        ...selectedLevels.map(l => ({ key: `lv-${l}`, label: capitalize(l), remove: () => toggleLevel(l) })),
        ...(minRating !== null ? [{ key: `rt-${minRating}`, label: `${minRating}★ & up`, remove: () => setMinRating(null) }] : []),
    ];

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>

            {/* ── Hero Header ─────────────────────────────────────────────── */}
            <div style={{
                background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%)',
                borderBottom: '1px solid var(--border)',
                padding: '52px 0 40px',
                marginBottom: '40px'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, marginBottom: '16px' }}
                    >
                        {searchQuery
                            ? <>Results for <span className="text-gradient">"{searchQuery}"</span></>
                            : <>Explore Professional <span className="text-gradient">Courses</span></>
                        }
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.0625rem',
                            maxWidth: '560px',
                            margin: '0 auto',
                            lineHeight: '1.65'
                        }}
                    >
                        Discover high-quality courses designed to build real-world skills and advance your career.
                    </motion.p>
                </div>
            </div>

            {/* ── Body: Sidebar + Grid ─────────────────────────────────────── */}
            <div className="container">
                <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

                    {/* ── Filter Sidebar (22%) ────────────────────────────── */}
                    <aside
                        className="hide-mobile"
                        style={{ width: '240px', flexShrink: 0 }}
                    >
                        <div
                            className="card"
                            style={{
                                padding: '0',
                                position: 'sticky', top: '96px',
                                overflow: 'visible'
                            }}
                        >
                            {/* Sidebar header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '18px 20px 14px',
                                borderBottom: '1px solid var(--border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '0.9375rem' }}>
                                    <Filter size={16} color="var(--primary)" />
                                    Filters
                                </div>
                                <AnimatePresence>
                                    {hasActiveFilters && (
                                        <motion.button
                                            initial={{ opacity: 0, x: 8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 8 }}
                                            onClick={clearAllFilters}
                                            style={{
                                                fontSize: '0.75rem', color: 'var(--primary)',
                                                fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px'
                                            }}
                                        >
                                            <X size={11} strokeWidth={2.5} /> Clear all
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Level section */}
                            <div style={{ padding: '16px 20px 0' }}>
                                <p style={{
                                    fontSize: '0.75rem', fontWeight: 700,
                                    color: 'var(--text-muted)', textTransform: 'uppercase',
                                    letterSpacing: '0.08em', marginBottom: '12px'
                                }}>
                                    Level
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {LEVELS.map(lvl => {
                                        const checked = selectedLevels.includes(lvl.value);
                                        return (
                                            <label
                                                key={lvl.value}
                                                onClick={() => toggleLevel(lvl.value)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                    padding: '8px 6px', borderRadius: '8px',
                                                    cursor: 'pointer', userSelect: 'none',
                                                    background: checked ? 'var(--primary-light)' : 'transparent',
                                                    transition: 'background 0.15s'
                                                }}
                                            >
                                                <CustomCheckbox checked={checked} />
                                                <span style={{
                                                    fontSize: '0.875rem',
                                                    color: checked ? 'var(--primary)' : 'var(--text-secondary)',
                                                    fontWeight: checked ? 600 : 400,
                                                    transition: 'color 0.15s', flex: 1
                                                }}>
                                                    {lvl.label}
                                                </span>
                                                {checked && (
                                                    <div style={{
                                                        width: 6, height: 6, borderRadius: '50%',
                                                        background: 'var(--primary)', flexShrink: 0
                                                    }} />
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ margin: '16px 20px 0', borderTop: '1px solid var(--border)' }} />

                            {/* Rating section */}
                            <div style={{ padding: '16px 20px 20px' }}>
                                <p style={{
                                    fontSize: '0.75rem', fontWeight: 700,
                                    color: 'var(--text-muted)', textTransform: 'uppercase',
                                    letterSpacing: '0.08em', marginBottom: '12px'
                                }}>
                                    Rating
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {RATINGS.map(({ label, value }) => {
                                        const selected = minRating === value;
                                        return (
                                            <label
                                                key={value}
                                                onClick={() => setMinRating(selected ? null : value)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '10px',
                                                    padding: '8px 6px', borderRadius: '8px',
                                                    cursor: 'pointer', userSelect: 'none',
                                                    background: selected ? 'var(--primary-light)' : 'transparent',
                                                    transition: 'background 0.15s'
                                                }}
                                            >
                                                <CustomRadio selected={selected} />
                                                <span style={{
                                                    display: 'flex', alignItems: 'center', gap: '5px',
                                                    fontSize: '0.875rem',
                                                    color: selected ? 'var(--primary)' : 'var(--text-secondary)',
                                                    fontWeight: selected ? 600 : 400,
                                                    transition: 'color 0.15s', flex: 1
                                                }}>
                                                    <Star size={12} fill="#febb02" color="#febb02" />
                                                    {label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ── Right column: active pills + grid ──────────────── */}
                    <div style={{ flex: 1, minWidth: 0 }}>

                        {/* Active filter pills row */}
                        <AnimatePresence>
                            {activePills.length > 0 && (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{
                                        display: 'flex', flexWrap: 'wrap', gap: '8px',
                                        marginBottom: '20px',
                                        padding: '12px 16px',
                                        background: 'var(--surface)',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)'
                                    }}
                                >
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, alignSelf: 'center' }}>Active:</span>
                                    <AnimatePresence>
                                        {activePills.map(pill => (
                                            <FilterPill key={pill.key} label={pill.label} onRemove={pill.remove} />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Loading spinner */}
                        {isLoading ? (
                            <div style={{ padding: '80px 0', textAlign: 'center' }}>
                                <div style={{
                                    width: '44px', height: '44px',
                                    border: '4px solid var(--border)',
                                    borderTopColor: 'var(--primary)',
                                    borderRadius: '50%', margin: '0 auto 16px'
                                }} className="animate-spin" />
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                                    {hasActiveFilters ? 'Filtering courses…' : 'Loading courses…'}
                                </p>
                            </div>

                        ) : courses.length > 0 ? (
                            /* Course grid — 3 cols desktop, 2 tablet, 1 mobile via minmax */
                            <motion.div
                                layout
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '24px'
                                }}
                            >
                                <AnimatePresence mode="popLayout">
                                    {courses.map(course => (
                                        <CourseCard
                                            key={course.id || course._id}
                                            course={course}
                                            isEnrolled={isEnrolled(course.id || course._id)}
                                            onOpenDetails={handleCourseClick}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                        ) : (
                            /* Empty state */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="card"
                                style={{ padding: '72px 40px', textAlign: 'center' }}
                            >
                                <div style={{
                                    width: 72, height: 72, borderRadius: '50%',
                                    background: 'var(--primary-light)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 20px'
                                }}>
                                    <Search size={32} color="var(--primary)" strokeWidth={1.5} />
                                </div>
                                <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '10px' }}>
                                    No courses match the selected filters.
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '380px', margin: '0 auto 28px' }}>
                                    Try adjusting your level or rating filter, or clear all filters to see every course.
                                </p>
                                <button onClick={clearAllFilters} className="btn btn-primary">
                                    Reset All Filters
                                </button>
                            </motion.div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Courses;
