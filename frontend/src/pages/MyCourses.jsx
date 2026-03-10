import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useCourses } from '../contexts/CourseContext';
import { useAuth } from '../contexts/AuthContext';
import { Play, ArrowRight, CheckCircle, BookOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const MyCourses = () => {
    const { courses, enrolledCourses, isLessonComplete } = useCourses();
    const { user } = useAuth();

    if (!user) return <Navigate to="/auth" />;

    const myCourses = courses.filter(c => enrolledCourses.includes(c.id || c._id));

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Header Banner */}
            <div style={{ background: 'var(--primary-gradient)', padding: '60px 0', marginBottom: '60px' }}>
                <div className="container">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                            My Learning
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.25rem' }}>
                            Welcome back, <strong>{user.name}</strong>! Pick up where you left off.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container">
                {myCourses.length > 0 ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {myCourses.length} Course{myCourses.length !== 1 ? 's' : ''} Enrolled
                            </h2>
                            <Link to="/courses" className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
                                Browse more <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
                            {myCourses.map((course, i) => {
                                const totalLessons = course.lessons?.length || 0;
                                const completedLessons = course.lessons?.filter(l => isLessonComplete(l.id)).length || 0;
                                const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

                                return (
                                    <motion.div
                                        key={course.id || course._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ y: -6 }}
                                        className="card"
                                        style={{ display: 'flex', flexDirection: 'column' }}
                                    >
                                        {/* Thumbnail */}
                                        <div style={{ position: 'relative', height: '160px' }}>
                                            <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
                                            {progress === 100 && (
                                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--success)', color: '#fff', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
                                                    <CheckCircle size={14} /> Completed
                                                </div>
                                            )}
                                            {/* Progress bar on image bottom */}
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.3)' }}>
                                                <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#10b981' : '#fff', transition: 'width 0.5s ease' }} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>{course.title}</h3>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{course.instructor}</p>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <BookOpen size={14} />
                                                    <span>{completedLessons}/{totalLessons} lessons</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Layers size={14} />
                                                    <span>{progress}% complete</span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div>
                                                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                                        style={{ height: '100%', background: progress === 100 ? 'var(--success)' : 'var(--primary-gradient)', borderRadius: '10px' }}
                                                    />
                                                </div>
                                            </div>

                                            <Link
                                                to={`/learn/${course.id || course._id}`}
                                                className="btn btn-primary"
                                                style={{ width: '100%', marginTop: 'auto' }}
                                            >
                                                <Play size={16} fill="currentColor" />
                                                {progress === 0 ? 'Start Course' : progress === 100 ? 'Review Course' : 'Continue'}
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '100px 20px' }}
                    >
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                            <BookOpen size={36} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>No courses yet</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '32px' }}>
                            Find a course you love and start learning today!
                        </p>
                        <Link to="/courses" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                            Browse Catalog
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
