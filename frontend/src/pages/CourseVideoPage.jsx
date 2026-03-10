import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useCourses } from '../contexts/CourseContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Play, CheckCircle, Circle, Loader, Trophy, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIChatWidget from '../components/AIChatWidget';
import { formatPrice } from '../utils/formatPrice';

// ─── Inject YouTube IFrame API script once ─────────────────────────────────
function loadYouTubeAPI() {
    return new Promise((resolve) => {
        if (window.YT && window.YT.Player) { resolve(window.YT); return; }
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    });
}

// ─── Extract YouTube video ID from any URL format ─────────────────────────
function extractVideoId(url) {
    if (!url) return null;
    try {
        if (url.includes('youtube.com/watch')) return new URL(url).searchParams.get('v');
        if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
        if (url.includes('youtube.com/embed/')) return url.split('embed/')[1].split('?')[0];
    } catch { /* pass */ }
    return null;
}

// ──────────────────────────────────────────────────────────────────────────
const CourseVideoPage = () => {
    const { id } = useParams();
    const { fetchCourseDetails, fetchCourseProgress, isEnrolled, markLessonComplete, courses, enrollmentsLoading } = useCourses();
    const { user } = useAuth();

    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState(null);
    const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
    const [progressData, setProgressData] = useState({ completed_lessons: 0, total_lessons: 0, completion_percentage: 0 });
    const [showCelebration, setShowCelebration] = useState(false);
    const [watchPercent, setWatchPercent] = useState(0);   // 0-100 live watch %
    const [autoCompleting, setAutoCompleting] = useState(false);

    // ─── YouTube player refs ────────────────────────────────────────────
    const playerContainerRef = useRef(null);   // <div> the YT player mounts into
    const ytPlayerRef = useRef(null);   // YT.Player instance
    const pollIntervalRef = useRef(null);   // setInterval handle
    const activeLessonRef = useRef(null);   // always up-to-date inside callbacks
    const completedRef = useRef(new Set()); // mirror of completedLessonIds for callbacks

    // Keep refs in sync with state
    activeLessonRef.current = activeLesson;
    completedRef.current = completedLessonIds;

    // ─── Load course details ────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            const data = await fetchCourseDetails(id);
            if (data) { setDetails(data); setActiveLesson(data.lessons?.[0]); }
            setLoading(false);
        };
        load();
    }, [id]);

    // ─── Load saved progress from backend ──────────────────────────────
    useEffect(() => {
        if (!details || !user) return;
        const load = async () => {
            const prog = await fetchCourseProgress(id);
            if (prog) {
                setProgressData({ completed_lessons: prog.completed_lessons, total_lessons: prog.total_lessons, completion_percentage: prog.completion_percentage });
                const ids = new Set(prog.completed_lesson_ids || []);
                setCompletedLessonIds(ids);
            }
        };
        load();
    }, [details, user, id]);

    // ─── Core: build / rebuild YT Player whenever activeLesson changes ─
    useEffect(() => {
        if (!activeLesson) return;
        const videoId = extractVideoId(activeLesson.videoUrl);

        // Clear old poll
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setWatchPercent(0);

        const init = async () => {
            const YT = await loadYouTubeAPI();

            // Destroy old player if any
            if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
                try { ytPlayerRef.current.destroy(); } catch { /* ignore */ }
                ytPlayerRef.current = null;
            }

            if (!playerContainerRef.current || !videoId) return;

            // Create fresh mounting div each time (YT.Player replaces the element)
            const mountId = `yt-mount-${Date.now()}`;
            const mountDiv = document.createElement('div');
            mountDiv.id = mountId;
            playerContainerRef.current.innerHTML = '';
            playerContainerRef.current.appendChild(mountDiv);

            ytPlayerRef.current = new YT.Player(mountId, {
                videoId,
                width: '100%',
                height: '100%',
                playerVars: {
                    rel: 0,
                    modestbranding: 1,
                    controls: 1,
                    enablejsapi: 1,
                },
                events: {
                    onStateChange: (event) => {
                        // 1 = playing, 2 = paused/ended
                        if (event.data === YT.PlayerState.PLAYING) {
                            startPolling();
                        } else {
                            stopPolling();
                        }
                    },
                }
            });
        };

        init();

        return () => {
            stopPolling();
        };
    }, [activeLesson]);

    // ─── Polling: check watch % every 2 s ──────────────────────────────
    const startPolling = () => {
        if (pollIntervalRef.current) return; // already running
        pollIntervalRef.current = setInterval(() => {
            const player = ytPlayerRef.current;
            if (!player || typeof player.getCurrentTime !== 'function') return;

            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            if (!duration || duration <= 0) return;

            const pct = (currentTime / duration) * 100;
            setWatchPercent(Math.round(pct));

            // 90% threshold — auto-complete
            if (pct >= 90) {
                const lesson = activeLessonRef.current;
                if (lesson && !completedRef.current.has(String(lesson.id))) {
                    stopPolling();
                    triggerAutoComplete(lesson);
                }
            }
        }, 2000);
    };

    const stopPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    // ─── Auto-complete a lesson ─────────────────────────────────────────
    const triggerAutoComplete = async (lesson) => {
        setAutoCompleting(true);
        try {
            const updated = await markLessonComplete(details?.course?.id, lesson.id);
            if (updated) {
                setCompletedLessonIds(prev => new Set([...prev, String(lesson.id)]));
                setProgressData({
                    completed_lessons: updated.completed_lessons,
                    total_lessons: updated.total_lessons,
                    completion_percentage: updated.completion_percentage
                });
                if (updated.completion_percentage === 100) {
                    setShowCelebration(true);
                    setTimeout(() => setShowCelebration(false), 5000);
                }
            }
        } finally {
            setAutoCompleting(false);
        }
    };

    // ─── Cleanup on unmount ─────────────────────────────────────────────
    useEffect(() => {
        return () => {
            stopPolling();
            if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
                try { ytPlayerRef.current.destroy(); } catch { /* ignore */ }
            }
        };
    }, []);

    // ─── Guards ─────────────────────────────────────────────────────────
    if (!user) return <Navigate to="/auth" />;
    if (loading || enrollmentsLoading) return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
            <Loader className="animate-spin" size={40} color="var(--primary)" />
            <p style={{ color: 'var(--text-secondary)' }}>Loading course content and your progress...</p>
        </div>
    );
    if (!details || (!isEnrolled(id) && user.role !== 'admin')) return <Navigate to="/" />;

    const { course, lessons } = details;
    const totalLessons = lessons?.length || 0;
    const pct = progressData.completion_percentage;
    const completedCount = progressData.completed_lessons;

    const isLessonCompleted = (lessonId) => completedLessonIds.has(String(lessonId));
    const isActiveLessonDone = activeLesson ? isLessonCompleted(activeLesson.id) : false;
    const videoId = activeLesson ? extractVideoId(activeLesson.videoUrl) : null;

    const handleLessonClick = (lesson) => {
        if (lesson.id === activeLesson?.id) return;
        setWatchPercent(0);
        setActiveLesson(lesson);
    };

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '24px', fontSize: '0.875rem' }}>
                <ArrowLeft size={16} /> Back to Courses
            </Link>

            {/* 🎉 Course Completion Banner */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            borderRadius: '16px', padding: '20px 28px',
                            display: 'flex', alignItems: 'center', gap: '16px',
                            marginBottom: '28px', color: 'white',
                            boxShadow: '0 8px 32px rgba(16,185,129,0.35)'
                        }}
                    >
                        <Trophy size={36} />
                        <div>
                            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>🎉 Course Complete!</h3>
                            <p style={{ margin: '4px 0 0', opacity: 0.9 }}>
                                Congratulations! You've completed all lessons in <strong>{course.title}</strong>.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '32px' }}
            >
                {/* ════════ LEFT — VIDEO PLAYER ════════ */}
                <div>
                    {/* Video frame */}
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                        {videoId ? (
                            /* YT.Player mounts here — we manage it via ref */
                            <div
                                ref={playerContainerRef}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            />
                        ) : (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '8px' }}>
                                <Eye size={32} opacity={0.4} />
                                <span style={{ opacity: 0.6 }}>No video available</span>
                            </div>
                        )}
                    </div>

                    {/* Live watch-progress bar */}
                    {!isActiveLessonDone && videoId && (
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                <span>Watch progress</span>
                                <span style={{ color: watchPercent >= 90 ? '#10b981' : 'var(--text-secondary)', fontWeight: 600 }}>
                                    {watchPercent}% watched {watchPercent >= 90 ? '✓' : `(complete at 90%)`}
                                </span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                <motion.div
                                    animate={{ width: `${watchPercent}%` }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        background: watchPercent >= 90
                                            ? '#10b981'
                                            : 'linear-gradient(90deg, var(--primary), #6366f1)',
                                        borderRadius: '2px'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Lesson Info */}
                    {activeLesson && (
                        <div style={{ marginTop: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 14px', borderRadius: '20px' }}>
                                    <Play size={13} fill="currentColor" /> Now Playing
                                </span>

                                {/* Status badge — replaces manual button */}
                                {isActiveLessonDone ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)' }}>
                                        <CheckCircle size={15} /> Lesson Completed
                                    </span>
                                ) : autoCompleting ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '6px 14px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                        <Loader size={14} className="animate-spin" /> Saving progress...
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '6px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <Eye size={14} /> Auto-completes at 90% watched
                                    </span>
                                )}
                            </div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '6px' }}>{activeLesson.title}</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>{course.title}</p>
                        </div>
                    )}
                </div>

                {/* ════════ RIGHT — SIDEBAR ════════ */}
                <div>
                    <div className="card" style={{ padding: '24px', position: 'sticky', top: '88px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Course Content</h3>

                        {/* Overall progress bar */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                                <span style={{ fontWeight: 600, color: pct === 100 ? '#10b981' : 'var(--text-secondary)' }}>
                                    {pct}% Complete
                                </span>
                                <span style={{ color: 'var(--text-secondary)' }}>{completedCount}/{totalLessons} lessons</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={false}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        background: pct === 100
                                            ? 'linear-gradient(90deg, #10b981, #059669)'
                                            : 'linear-gradient(90deg, var(--primary), #6366f1)',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Lesson list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {lessons.map((lesson, index) => {
                                const isActive = activeLesson?.id === lesson.id;
                                const isDone = isLessonCompleted(lesson.id);
                                return (
                                    <motion.button
                                        key={lesson.id}
                                        whileHover={{ x: 2 }}
                                        onClick={() => handleLessonClick(lesson)}
                                        style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                                            padding: '10px 12px', borderRadius: '10px',
                                            background: isActive ? 'var(--primary-light)' : 'transparent',
                                            border: `1px solid ${isActive ? 'var(--primary)' : isDone ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                                            textAlign: 'left', cursor: 'pointer', width: '100%',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ marginTop: '1px', flexShrink: 0 }}>
                                            {isDone ? (
                                                <CheckCircle size={18} color="#10b981" fill="rgba(16,185,129,0.15)" />
                                            ) : isActive ? (
                                                <Play size={18} color="var(--primary)" fill="var(--primary)" />
                                            ) : (
                                                <Circle size={18} color="var(--text-secondary)" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                fontSize: '0.8125rem', fontWeight: isActive ? 600 : 500, margin: 0,
                                                color: isActive ? 'var(--primary)' : isDone ? '#10b981' : 'var(--text-main)',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                            }}>
                                                {index + 1}. {lesson.title}
                                            </p>
                                            {isDone && (
                                                <span style={{ fontSize: '0.6875rem', color: '#10b981', opacity: 0.8 }}>✓ Completed</span>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ════════ SUGGESTED COURSES ════════ */}
            <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Suggested Courses for You</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {courses.filter(c => c.id !== id).slice(0, 4).map(suggested => (
                        <Link key={suggested.id} to={isEnrolled(suggested.id) ? `/learn/${suggested.id}` : `/course/${suggested.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <motion.div whileHover={{ y: -5 }} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <img src={suggested.thumbnail} alt={suggested.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px', lineHeight: 1.4 }}>{suggested.title}</h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{suggested.description}</p>
                                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700 }}>{formatPrice(suggested.price)}</span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>{isEnrolled(suggested.id) ? 'Continue' : 'Enroll'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            <AIChatWidget />
        </div>
    );
};

export default CourseVideoPage;
