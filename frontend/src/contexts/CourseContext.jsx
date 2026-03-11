import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CourseContext = createContext();

export const useCourses = () => useContext(CourseContext);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const CourseProvider = ({ children }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${API_URL}/api/courses`);
            const data = await res.json();
            // Map MongoDB _id to id for frontend compatibility
            const mapped = (data.courses || []).map(c => ({
                ...c,
                id: c._id,
                instructor: c.instructor_id?.name || 'Unknown Instructor',
                thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
                reviews: c.reviewCount || 0
            }));
            setCourses(mapped);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchCourses = async (query) => {
        try {
            const res = await fetch(`${API_URL}/api/courses?search=${encodeURIComponent(query)}`);
            const data = await res.json();
            return (data.courses || []).map(c => ({
                ...c,
                id: c._id,
                instructor: c.instructor_id?.name || 'Unknown Instructor',
                thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600',
                reviews: c.reviewCount || 0
            }));
        } catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    };

    const fetchUserCourses = async () => {
        if (!user) {
            setEnrolledCourses([]);
            setEnrollmentsLoading(false);
            return;
        }

        setEnrollmentsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/enrollments`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                // Map to get just the IDs, handling potential population
                const ids = (data.enrollments || []).map(e =>
                    e.courseId ? (typeof e.courseId === 'object' ? e.courseId._id : e.courseId) : null
                ).filter(Boolean);
                setEnrolledCourses(ids);
            }
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
        } finally {
            setEnrollmentsLoading(false);
        }
    };

    const fetchWishlist = async () => {
        if (!user) {
            setWishlist([]);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/wishlist`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setWishlist(data.wishlist || []);
            }
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        fetchUserCourses();
        fetchWishlist();
    }, [user]);

    const enrollUser = async (courseId) => {
        try {
            const res = await fetch(`${API_URL}/api/enroll/${courseId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                await fetchUserCourses();
                return { success: true };
            }
            return { success: false, message: data.error || 'Enrollment failed' };
        } catch (error) {
            return { success: false, message: 'Connection error' };
        }
    };

    const toggleWishlist = async (courseId) => {
        try {
            const res = await fetch(`${API_URL}/api/wishlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId }),
                credentials: 'include'
            });
            if (res.ok) {
                await fetchWishlist();
            }
        } catch (error) {
            console.error('Wishlist error:', error);
        }
    };

    const isEnrolled = (courseId) => enrolledCourses.includes(courseId);
    const isInWishlist = (courseId) => wishlist.some(item => (item._id || item.id) === courseId);

    const fetchCourseDetails = async (courseId) => {
        try {
            const res = await fetch(`${API_URL}/api/courses/${courseId}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                return {
                    course: { ...data.course, id: data.course._id },
                    lessons: (data.lessons || []).map(l => ({ ...l, id: l._id, videoUrl: l.video_url })),
                    progress: data.progress
                };
            }
        } catch (error) {
            console.error('Failed to fetch details:', error);
        }
        return null;
    };

    const markLessonComplete = async (courseId, lessonId) => {
        try {
            const res = await fetch(`${API_URL}/api/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, lessonId }),
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                return data.progress; // { completed_lessons, total_lessons, completion_percentage }
            }
        } catch (error) {
            console.error('Progress error:', error);
        }
        return null;
    };

    const fetchCourseProgress = async (courseId) => {
        try {
            const res = await fetch(`${API_URL}/api/progress/${courseId}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                return data.progress;
            }
        } catch (error) {
            console.error('Fetch progress error:', error);
        }
        return null;
    };

    return (
        <CourseContext.Provider value={{
            courses,
            enrolledCourses,
            wishlist,
            enrollUser,
            isEnrolled,
            toggleWishlist,
            isInWishlist,
            markLessonComplete,
            fetchCourseDetails,
            fetchCourseProgress,
            searchCourses,
            loading,
            enrollmentsLoading
        }}>
            {children}
        </CourseContext.Provider>
    );
};
