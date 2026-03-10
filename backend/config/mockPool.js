// Mock data for the LMS platform session fallback

const MOCK_USERS = [
    { id: 1, name: "Instructor User", email: "instructor@lms.com", password: "$2b$10$k34/pboG47e.IFDQi1/c9.0k7pf9HpUNrFnU8XhhrmIbwqwRYg0KC", role: "instructor", is_active: 1 },
    { id: 2, name: "Student User", email: "student@lms.com", password: "$2b$10$k34/pboG47e.IFDQi1/c9.0k7pf9HpUNrFnU8XhhrmIbwqwRYg0KC", role: "student", is_active: 1 },
    { id: 3, name: "Admin User", email: "admin@lms.com", password: "$2b$10$k34/pboG47e.IFDQi1/c9.0k7pf9HpUNrFnU8XhhrmIbwqwRYg0KC", role: "admin", is_active: 1 }
];

const MOCK_COURSES = [
    {
        id: 1,
        instructor_id: 1,
        category_id: 1,
        title: "The Ultimate Next.js 15 Masterclass",
        slug: "nextjs-masterclass",
        description: "Learn Next.js 15 from the ground up, including Server Components, Server Actions, and advanced patterns. Build a real-world LMS platform and more!",
        thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
        level: "intermediate",
        price: 99.99,
        rating: 4.8,
        instructor_name: "Jane Smith",
        created_at: new Date()
    },
    {
        id: 2,
        instructor_id: 1,
        category_id: 2,
        title: "Mastering Python for Data Science",
        slug: "python-data-science",
        description: "Master NumPy, Pandas, Matplotlib, Seaborn, and Scikit-Learn. Go from beginner to expert in data analytics!",
        thumbnail_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
        level: "beginner",
        price: 79.99,
        rating: 4.9,
        instructor_name: "Jane Smith",
        created_at: new Date()
    }
];

const MOCK_SECTIONS = [
    { id: 1, course_id: 1, title: "Getting Started", order_number: 1 },
    { id: 2, course_id: 1, title: "Next.js Core Concepts", order_number: 2 }
];

const MOCK_LESSONS = [
    { id: 1, section_id: 1, course_id: 1, title: "Course Overview", order_number: 1, youtube_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 300 },
    { id: 2, section_id: 1, course_id: 1, title: "What is Next.js?", order_number: 2, youtube_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: 600 }
];

const MOCK_ENROLLMENTS = [
    { id: 1, user_id: 2, course_id: 1, status: 'active', enrolled_at: new Date() }
];

class MockPool {
    async query(sql, params = []) {
        const q = sql.toLowerCase().replace(/\s+/g, ' ').trim();
        console.log(`[MOCK DB] → ${q.substring(0, 100)}...`);

        // 1. SELECT * FROM users WHERE email = ? (Auth)
        if (q.includes('from users') && q.includes('email = ?')) {
            const user = MOCK_USERS.find(u => u.email === params[0]);
            return [user ? [user] : []];
        }

        // 2. Course Detail: SELECT c.*, u.name ... FROM courses c WHERE c.id = ?
        if (q.includes('from courses c') && q.includes('where c.id = ?')) {
            const course = MOCK_COURSES.find(c => c.id == params[0]);
            return [course ? [course] : []];
        }

        // 3. Simple ID lookup: SELECT * FROM X WHERE id = ?
        if (q.includes('where id = ?')) {
            if (q.includes('from sections')) {
                const section = MOCK_SECTIONS.find(s => s.id == params[0]);
                return [section ? [section] : []];
            }
            if (q.includes('from courses')) {
                const course = MOCK_COURSES.find(c => c.id == params[0]);
                return [course ? [course] : []];
            }
            if (q.includes('from lessons')) {
                const lesson = MOCK_LESSONS.find(l => l.id == params[0]);
                return [lesson ? [lesson] : []];
            }
        }

        // 4. Enrollment Check: SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?
        if (q.includes('from enrollments') && q.includes('user_id = ?')) {
            if (q.includes('where user_id = ? and course_id = ?')) {
                const enrollment = MOCK_ENROLLMENTS.find(e => e.user_id == params[0] && e.course_id == params[1]);
                return [enrollment ? [enrollment] : []];
            }
            if (q.includes('where e.user_id = ?')) { // e.* from enrollments e
                return [MOCK_ENROLLMENTS.filter(e => e.user_id == params[0]).map(e => {
                    const course = MOCK_COURSES.find(c => c.id == e.course_id);
                    return { ...e, course_title: course?.title, thumbnail_url: course?.thumbnail_url, instructor_name: course?.instructor_name };
                })];
            }
        }

        // 5. Course List: SELECT c.*, u.name as instructor_name FROM courses c
        if (q.includes('select c.*') && q.includes('from courses c')) {
            return [MOCK_COURSES];
        }

        // 6. SELECT * FROM sections WHERE course_id = ?
        if (q.includes('from sections') && q.includes('course_id = ?')) {
            return [MOCK_SECTIONS.filter(s => s.course_id == params[0])];
        }

        // 7. SELECT * FROM lessons WHERE section_id = ?
        if (q.includes('from lessons') && q.includes('section_id = ?')) {
            return [MOCK_LESSONS.filter(l => l.section_id == params[0])];
        }

        // 8. INSERT queries (simulate success)
        if (q.startsWith('insert into')) {
            return [{ insertId: Math.floor(Math.random() * 1000) }];
        }

        // 9. COUNT(*) queries
        if (q.includes('count(*) as count')) {
            if (q.includes('from courses')) return [[{ count: MOCK_COURSES.length }]];
            if (q.includes('from enrollments')) return [[{ count: MOCK_ENROLLMENTS.length }]];
            if (q.includes('from lessons')) return [[{ count: MOCK_LESSONS.length }]];
            if (q.includes('from sections')) return [[{ count: MOCK_SECTIONS.length }]];
            if (q.includes('from progress')) return [[{ count: 0 }]];
            return [[{ count: 0 }]];
        }

        // 10. Progress Check: SELECT * FROM progress WHERE user_id = ? AND course_id = ?
        if (q.includes('from progress') && q.includes('user_id = ?')) {
            return [[]]; // Start with empty progress
        }

        // 11. Generic SELECT all for any table
        if (q.includes('from categories')) return [[{ id: 1, name: "Web Development", slug: "web-dev" }]];

        return [[]]; // Default empty
    }

    async getConnection() {
        return {
            ping: async () => true,
            query: this.query.bind(this),
            release: () => { }
        };
    }

    async end() {
        process.exit(0);
    }
}

export const mockPool = new MockPool();
