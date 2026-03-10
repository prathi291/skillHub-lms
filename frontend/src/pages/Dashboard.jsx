import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCourses } from '../contexts/CourseContext';
import { useAuth } from '../contexts/AuthContext';
import { Play, CheckCircle, Star, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '../utils/formatPrice';

const CourseCard = ({ course, onOpenDetails, isEnrolled }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -10 }}
            className="card"
            style={{ display: 'flex', flexDirection: 'column' }}
            onClick={() => onOpenDetails(course._id || course.id)}
        >
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                />
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)'
                }} />
                {course.bestseller && (
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        color: '#b4690e',
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <Sparkles size={12} /> Bestseller
                    </div>
                )}
                {isEnrolled && (
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'var(--success)',
                        color: '#fff',
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '20px',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <CheckCircle size={12} /> Enrolled
                    </div>
                )}
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)', lineHeight: '1.3' }}>
                    {course.title}
                </h3>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {course.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                            {course.instructor.charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{course.instructor}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={14} fill="#febb02" color="#febb02" />
                        <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{course.rating.toFixed(1)}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {isEnrolled ? (
                            <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 700 }}>Free for you</span>
                        ) : (
                            formatPrice(course.price)
                        )}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={isEnrolled ? "btn btn-outline" : "btn btn-primary"}
                        style={{ padding: '8px 16px', fontSize: '0.875rem', border: isEnrolled ? '1px solid var(--success)' : 'none', color: isEnrolled ? 'var(--success)' : '#fff' }}
                    >
                        {isEnrolled ? 'Open' : 'Details'}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const { courses, isEnrolled, loading: initialLoading, searchCourses } = useCourses();
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';

    const [searchResults, setSearchResults] = React.useState([]);
    const [searching, setSearching] = React.useState(false);

    React.useEffect(() => {
        const performSearch = async () => {
            if (searchQuery) {
                setSearching(true);
                const results = await searchCourses(searchQuery);
                setSearchResults(results);
                setSearching(false);
            } else {
                setSearchResults([]);
            }
        };
        performSearch();
    }, [searchQuery, searchCourses]);

    const displayCourses = searchQuery ? searchResults : courses;
    const isLoading = searchQuery ? searching : initialLoading;

    const handleCourseClick = (id) => {
        if (isEnrolled(id)) navigate(`/learn/${id}`);
        else navigate(`/course/${id}`);
    };

    return (
        <div style={{ paddingBottom: '80px' }}>
            {!searchQuery && (
                <div className="container" style={{ paddingTop: '40px' }}>
                    <div className="modern-hero" style={{ height: '480px', display: 'flex', alignItems: 'center', padding: '0 60px' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', zIndex: 0 }}>
                            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200" alt="Learning" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, var(--surface) 0%, rgba(255,255,255,0) 100%)' }} />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            style={{ maxWidth: '500px', position: 'relative', zIndex: 1 }}
                        >
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 700, marginBottom: '24px' }}>
                                <TrendingUp size={16} /> Over 500,000+ students enrolled
                            </div>
                            <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '20px', fontWeight: 800 }}>
                                Master Any Skill, <span className="text-gradient">Anytime.</span>
                            </h1>
                            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
                                Explore thousands of world-class courses from industry experts. Start your journey today and unlock your potential.
                            </p>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="btn btn-primary"
                                    style={{ padding: '16px 32px', fontSize: '1rem' }}
                                >
                                    Get Started Free
                                </button>
                            </div>
                        </motion.div>
                    </div>

                </div>
            )}

            <div className="container" style={{ marginTop: '80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
                            {searchQuery ? `Search Results for "${searchQuery}"` : 'Recommended for you'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>Quality courses hand-picked by our curators</p>
                    </div>
                    {!searchQuery && (
                        <button onClick={() => navigate('/courses')} className="btn btn-outline" style={{ border: 'none', color: 'var(--primary)', fontWeight: 700 }}>
                            View all <TrendingUp size={16} />
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div style={{ padding: '100px 0', textAlign: 'center' }}>
                        <div style={{ width: '50px', height: '50px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 20px' }} className="animate-spin"></div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Gathering the best content for you...</p>
                    </div>
                ) : displayCourses.length > 0 ? (
                    <motion.div
                        layout
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '32px'
                        }}
                    >
                        {displayCourses.map(course => (
                            <CourseCard
                                key={course.id || course._id}
                                course={course}
                                isEnrolled={isEnrolled(course.id || course._id)}
                                onOpenDetails={handleCourseClick}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <div style={{ padding: '100px 0', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>No courses found.</h3>
                        <button onClick={() => navigate('/')} className="btn btn-primary">Discover More</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
