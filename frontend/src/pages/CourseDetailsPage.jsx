import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourses } from '../contexts/CourseContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, PlayCircle, Star, Clock, FileText, ChevronRight, Globe, Award, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice, formatOriginalPrice } from '../utils/formatPrice';

const CourseDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { courses, enrollUser, isEnrolled, fetchCourseDetails, enrollmentsLoading } = useCourses();
    const { user } = useAuth();

    const courseBasic = courses.find((c) => c.id === id);

    const [details, setDetails] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [enrolling, setEnrolling] = React.useState(false);


    React.useEffect(() => {
        const loadDetails = async () => {
            const data = await fetchCourseDetails(id);
            setDetails(data);
            setLoading(false);
        };
        loadDetails();
    }, [id]);

    if (loading || enrollmentsLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', marginBottom: '20px' }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading course excellence...</p>
            </div>
        );
    }

    const courseData = details?.course;
    const lessonsData = details?.lessons || [];

    if (!courseData) {
        return (
            <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Oops! Course missing.</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.25rem' }}>The requested course might have been moved or removed.</p>
                <button onClick={() => navigate('/')} className="btn btn-primary">Back to Catalog</button>
            </div>
        );
    }

    const course = { ...courseBasic, ...courseData, instructor: courseData?.instructor_id?.name || courseBasic?.instructor };
    const enrolled = isEnrolled(course.id);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/auth', { state: { from: `/course/${course.id}` } });
            return;
        }
        if (enrolled) {
            navigate(`/learn/${course.id}`);
            return;
        }

        setEnrolling(true);
        try {
            const result = await enrollUser(course.id);
            if (result.success) navigate(`/learn/${course.id}`);
            else alert(result.message);
        } catch (error) {
            console.error('Enrollment error:', error);
            alert('An error occurred during enrollment.');
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <div style={{ paddingBottom: '100px' }}>
            {/* Header / Hero Section */}
            <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '60px 0' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '60px', alignItems: 'start' }}>

                    {/* Left: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '24px', fontWeight: 700 }}>
                            <Link to="/courses" style={{ color: 'var(--primary)' }}>Courses</Link>
                            <ChevronRight size={14} />
                            <span style={{ color: 'var(--text-muted)' }}>{course.title.split(' ')[0]}</span>
                        </div>

                        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', lineHeight: 1.1, tracking: '-0.02em' }}>
                            {course.title}
                        </h1>

                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
                            {course.description}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Star size={18} fill="#febb02" color="#febb02" />
                                <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>{course.rating.toFixed(1)}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>({course.reviews.toLocaleString()} reviews)</span>
                            </div>
                            <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: 'var(--border)' }}></div>
                            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                By <span className="text-gradient" style={{ fontWeight: 700 }}>{course.instructor}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '36px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <Clock size={18} /> Last updated Aug 2024
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <Globe size={18} /> English [Auto]
                            </div>
                        </div>

                    </motion.div>

                    {/* Right: Floating Action Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ position: 'relative' }}
                    >
                        <div id="enrollment-card" className="card glass-morphism" style={{ border: '1px solid var(--border)', position: 'sticky', top: '120px', zIndex: 10 }}>
                            <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                                <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', cursor: 'pointer' }}>
                                        <PlayCircle size={32} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{formatPrice(course.price)}</span>
                                    <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatOriginalPrice(8299)}</span>
                                    <span style={{ color: 'var(--error)', fontWeight: 700, fontSize: '0.875rem' }}>85% OFF</span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '18px', fontSize: '1rem', marginBottom: '16px' }}
                                >
                                    {enrolling ? 'Processing...' : enrolled ? 'Continue Learning' : 'Enroll Now'}
                                </motion.button>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>This course includes:</p>
                                    {[
                                        { icon: <PlayCircle size={18} />, text: '16.5 hours on-demand video' },
                                        { icon: <FileText size={18} />, text: '8 downloadable resources' },
                                        { icon: <ShieldCheck size={18} />, text: 'Full lifetime access' },
                                        { icon: <Award size={18} />, text: 'Certificate of completion' }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                            {item.icon}
                                            {item.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container" style={{ marginTop: '60px' }}>
                <div style={{ maxWidth: '800px' }}>
                    {/* What you'll learn */}
                    <section className="card" style={{ padding: '32px', marginBottom: '48px', background: 'var(--surface)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>What you'll learn</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {[
                                'Build professional-grade projects for your portfolio',
                                'Master industry-standard tools and workflows',
                                'Understand core concepts from the ground up',
                                'Become job-ready for junior and mid-level roles'
                            ].map((text, i) => (
                                <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0 }} /> {text}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Course Curriculum */}
                    <section style={{ marginBottom: '60px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Course Content</h2>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>1 Section • {lessonsData.length} Lessons • 2h 15m</span>
                        </div>

                        <div className="card" style={{ overflow: 'hidden' }}>
                            <div style={{ background: 'var(--bg)', padding: '16px 24px', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>
                                Essential Lessons
                            </div>
                            <div>
                                {lessonsData.map((lesson, idx) => (
                                    <motion.div
                                        key={lesson.id}
                                        whileHover={{ background: 'var(--bg)' }}
                                        style={{
                                            padding: '16px 24px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderBottom: idx === lessonsData.length - 1 ? 'none' : '1px solid var(--border)',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => enrolled && navigate(`/learn/${course.id}`)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <PlayCircle size={18} style={{ color: 'var(--text-muted)' }} />
                                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{lesson.title}</span>
                                        </div>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>10:00</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsPage;
