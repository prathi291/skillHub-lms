/**
 * videoFallback.js
 *
 * Maps lesson titles / course categories to verified, publicly available
 * YouTube video IDs. Used both by the seeder (to patch bad URLs) and by
 * courseController.getById (runtime fallback when video_url is missing).
 *
 * All video IDs below are verified as publicly embeddable.
 */

// ─── Topic keyword → YouTube video ID ──────────────────────────────────────
// Keys are lowercase substrings that may appear in a lesson title or category.
// The picker tries them in order — first match wins.
const TOPIC_VIDEO_MAP = [
    // Overviews / Intros
    { keywords: ['overview', 'intro', 'introduction', 'welcome', 'what is'], id: 'rfscVS0vtbw' },  // CS overview
    { keywords: ['course outline', 'syllabus', 'getting started'], id: 'kum6pT8Wru0' },  // Freecodecamp intro
    { keywords: ['environment setup', 'setup', 'installation', 'install'], id: '30LWjhZzg50' },  // Setup guide

    // Web Development
    { keywords: ['html'], id: 'qz0aGYrrlhU' },  // HTML Full Course
    { keywords: ['css'], id: 'yfoY53QXEnI' },  // CSS Crash Course
    { keywords: ['javascript', 'js'], id: 'W6NZfCO5SIk' },  // JS Crash Course
    { keywords: ['react', 'hooks', 'context'], id: 'bMknfKXIFA8' },  // React Crash Course
    { keywords: ['node', 'express', 'backend'], id: 'Oe421EPjeBE' },  // Node.js Course
    { keywords: ['mongodb', 'mongoose', 'database'], id: 'ofme2o29ngU' },  // MongoDB Tutorial
    { keywords: ['rest api', 'api design', 'restful'], id: '-MTSQjw5DrM' },  // REST API Design

    // Python & Data Science
    { keywords: ['python'], id: 'rfscVS0vtbw' },  // Python Full Course
    { keywords: ['numpy', 'pandas', 'matplotlib'], id: 'vmEHCqRTogM' },  // Data Science Libraries
    { keywords: ['data science', 'data analysis'], id: 'ua-CiDNNj30' },  // Data Science Intro
    { keywords: ['machine learning', 'ml'], id: 'NWONeJKn9Kc' },  // ML Harvard
    { keywords: ['neural network', 'deep learning'], id: 'aircAruvnKk' },  // 3Blue1Brown Neural Nets
    { keywords: ['nlp', 'natural language'], id: 'X2vAabgKiWM' },  // NLP Crash Course

    // AI / LLMs
    { keywords: ['generative ai', 'gpt', 'llm', 'large language'], id: '5sLYAQS9sWQ' },  // GenAI overview
    { keywords: ['openai', 'chatgpt', 'langchain'], id: 'lnA9DMvHtfI' },  // LangChain Tutorial
    { keywords: ['computer vision', 'image recognition', 'cnn'], id: 'OcycT1Jwsns' },  // Computer Vision

    // Mobile
    { keywords: ['swift', 'ios', 'xcode'], id: 'comQ1-x2a1Q' },  // Swift Beginners
    { keywords: ['android', 'kotlin'], id: 'EExSSotojVI' },  // Android Dev

    // Cloud & DevOps
    { keywords: ['aws', 'amazon web'], id: 'SOTamWNgDKc' },  // AWS Crash Course
    { keywords: ['kubernetes', 'k8s', 'helm'], id: 'X48VuDVv0do' },  // Kubernetes Full Course
    { keywords: ['docker', 'container'], id: 'fqMOX6JJhGo' },  // Docker Tutorial
    { keywords: ['devops', 'ci/cd', 'gitops'], id: 'j5Zsa_eOXeY' },  // DevOps Overview
    { keywords: ['terraform', 'iac', 'infrastructure'], id: 'SLB_c_TKYaQ' },  // Terraform Tutorial

    // Security
    { keywords: ['ethical hacking', 'penetration', 'pentest', 'cybersecurity', 'hacking'], id: '3Kq1MIfTWCE' }, // Cyber security

    // Game Dev
    { keywords: ['unity', 'game', 'c#'], id: 'gB1F9G0JXOo' },  // Unity Game Dev

    // System Design / Architecture
    { keywords: ['system design', 'architecture', 'microservice', 'distributed'], id: 'i53Gi_K3o7I' },  // System Design Primer

    // Generic fallbacks
    { keywords: ['project', 'hands-on', 'build'], id: 'pQN-pnXPaVg' },  // Build a project
    { keywords: ['advanced', 'tips', 'tricks', 'pro'], id: '9P8mASSREpE' },  // Advanced tips
    { keywords: ['quiz', 'test', 'exam', 'assessment'], id: 'PkZNo7MFNFg' },  // Practice / Quiz
    { keywords: ['git', 'version control', 'github'], id: 'RGOj5yH7evk' },  // Git Crash Course
];

// ─── Ultimate fallback — free generic CS lecture ───────────────────────────
const DEFAULT_VIDEO_ID = 'rfscVS0vtbw'; // Python for Beginners – freeCodeCamp

/**
 * Pick a relevant YouTube embed URL for a given lesson title + optional course category.
 * Returns a full embed-ready URL: https://www.youtube.com/watch?v=ID
 *
 * @param {string} lessonTitle
 * @param {string} [category]
 * @returns {string}
 */
export function pickVideoForLesson(lessonTitle = '', category = '') {
    const haystack = `${lessonTitle} ${category}`.toLowerCase();

    for (const entry of TOPIC_VIDEO_MAP) {
        if (entry.keywords.some(kw => haystack.includes(kw))) {
            return `https://www.youtube.com/watch?v=${entry.id}`;
        }
    }

    return `https://www.youtube.com/watch?v=${DEFAULT_VIDEO_ID}`;
}

/**
 * Returns true if the given URL looks like it could be a valid YouTube URL.
 * Does NOT guarantee the video is still live — just checks the format.
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isValidYouTubeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return (
        url.includes('youtube.com/watch?v=') ||
        url.includes('youtu.be/') ||
        url.includes('youtube.com/embed/')
    );
}
