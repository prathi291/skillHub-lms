import User from '../../models/User.js';
import Course from '../../models/Course.js';
import Lesson from '../../models/Lesson.js';
import Enrollment from '../../models/Enrollment.js';
import { hashPassword } from '../../utils/passwordHash.js';
import { pickVideoForLesson, isValidYouTubeUrl } from '../../utils/videoFallback.js';

export const seedIfEmpty = async () => {
  try {
    console.log(`🌱 Checking for broken thumbnail links...`);
    // Fix existing broken thumbnails if they were previously seeded
    await Course.updateMany(
      { thumbnail_url: 'https://images.unsplash.com/photo-1620712943543-bcc4628c6750?auto=format&fit=crop&q=80&w=800' },
      { thumbnail_url: '/courses/genai.png' }
    );
    await Course.updateMany(
      { thumbnail_url: 'https://images.unsplash.com/photo-1552824730-147b28c1195e?auto=format&fit=crop&q=80&w=800' },
      { thumbnail_url: '/courses/unity.png' }
    );

    const courseCount = await Course.countDocuments({ deleted_at: null });

    // ── Patch existing lessons with missing / invalid video URLs ──────────
    console.log('🎬 Patching lessons with missing/invalid video URLs...');
    const allLessons = await Lesson.find({});
    let patchedCount = 0;
    for (const lesson of allLessons) {
      if (!isValidYouTubeUrl(lesson.video_url)) {
        const parentCourse = await Course.findById(lesson.course_id).select('category').lean();
        const newUrl = pickVideoForLesson(lesson.title, parentCourse?.category || '');
        await Lesson.findByIdAndUpdate(lesson._id, { video_url: newUrl });
        patchedCount++;
      }
    }
    if (patchedCount > 0) {
      console.log(`✅ Patched ${patchedCount} lesson(s) with valid YouTube URLs`);
    } else {
      console.log('✅ All existing lessons already have valid video URLs');
    }

    if (courseCount >= 19) {
      console.log(`ℹ️  Skipping full seed (Database already has ${courseCount} courses)`);
      return;
    }


    console.log(`🌱 Database has ${courseCount} courses. Seeding additional content...`);

    let instructor = await User.findOne({ role: 'instructor' });

    if (!instructor) {
      console.log('ℹ️  No instructor found. Creating Academy Instructor for content assignment.');
      const password = await hashPassword('Instructor@123');
      instructor = await User.create({
        name: 'Academy Instructor',
        email: 'academy@lms.com',
        password,
        role: 'instructor'
      });
    }

    const courseData = [
      {
        title: 'Introduction to Web Development',
        description: 'Learn HTML, CSS, JavaScript, and more!',
        thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        category: 'Web Development',
        price: 49.99,
        level: 'beginner',
        rating: 4.8,
        reviewCount: 150
      },
      {
        title: 'React Fundamentals',
        description: 'Master React, Hooks, Context, and modern frontend architecture.',
        thumbnail_url: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=800',
        category: 'Development',
        price: 89.99,
        level: 'intermediate',
        rating: 4.9,
        reviewCount: 320
      },
      {
        title: 'Machine Learning A-Z™: Hands-On Python & R',
        description: 'Learn to create Machine Learning Algorithms in Python and R from two Data Science experts.',
        thumbnail_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
        category: 'Machine Learning',
        price: 94.99,
        level: 'beginner',
        rating: 4.9,
        reviewCount: 1250,
        bestseller: true
      },
      {
        title: 'Artificial Intelligence & Deep Learning',
        description: 'Master Neural Networks, Computer Vision, and Generative AI from scratch.',
        thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
        category: 'Artificial Intelligence',
        price: 119.99,
        level: 'intermediate',
        rating: 4.8,
        reviewCount: 430
      },
      {
        title: 'Generative AI Masterclass: Large Language Models',
        description: 'Understand GPT, BERT, and how to build applications using OpenAI API and LangChain.',
        thumbnail_url: '/courses/genai.png',
        category: 'Artificial Intelligence',
        price: 139.99,
        level: 'expert',
        rating: 5.0,
        reviewCount: 85
      },
      {
        title: 'Python for Data Science and Machine Learning',
        description: 'Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, and more!',
        thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
        category: 'Data Science',
        price: 84.99,
        level: 'intermediate',
        rating: 4.7,
        reviewCount: 890
      },
      {
        title: '100 Days of Code: The Complete Python Pro Bootcamp',
        description: 'Master Python by building 100 projects in 100 days. Learn data science, automation, and more.',
        thumbnail_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800',
        category: 'Development',
        price: 12.99,
        level: 'beginner',
        rating: 4.8,
        reviewCount: 15000,
        bestseller: true
      },
      {
        title: 'The Complete 2024 Web Development Bootcamp',
        description: 'Become a Full-Stack Web Developer with just ONE course. HTML, CSS, JS, Node, React, and MongoDB.',
        thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
        category: 'Web Development',
        price: 99.99,
        level: 'beginner',
        rating: 4.9,
        reviewCount: 2500,
        bestseller: true
      },
      {
        title: 'iOS & Swift - The Complete App Development Bootcamp',
        description: 'From beginner to iOS App Developer with just one course! Fully updated for iOS 17.',
        thumbnail_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800',
        category: 'Mobile Development',
        price: 109.99,
        level: 'beginner',
        rating: 4.8,
        reviewCount: 670
      },
      {
        title: 'Unity Game Development Bootcamp',
        description: 'Learn to build professional 2D & 3D games with Unity and C#.',
        thumbnail_url: '/courses/unity.png',
        category: 'Game Development',
        price: 79.99,
        level: 'intermediate',
        rating: 4.7,
        reviewCount: 310
      },
      {
        title: 'Ethical Hacking: From Beginner to Pro',
        description: 'Learn penetration testing and how to secure networks against hackers.',
        thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
        category: 'Cyber Security',
        price: 64.99,
        level: 'intermediate',
        rating: 4.6,
        reviewCount: 190
      },
      {
        title: 'AWS Certified Solutions Architect Associate',
        description: 'Pass the AWS Solutions Architect Associate Certification Cloud exam.',
        thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        category: 'Cloud Computing',
        price: 94.99,
        level: 'intermediate',
        rating: 4.8,
        reviewCount: 540
      },
      // ── Expert-level courses ──────────────────────────────────────────────────
      {
        title: 'Advanced AWS Cloud Architecture & DevOps',
        description: 'Design fault-tolerant, highly available, and cost-optimised cloud architectures. Covers VPC, EKS, Terraform IaC, and multi-region deployments.',
        thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
        category: 'Cloud Computing',
        price: 119.99,
        level: 'expert',
        rating: 4.9,
        reviewCount: 312,
        bestseller: true
      },
      {
        title: 'Advanced Ethical Hacking & Penetration Testing',
        description: 'Go beyond the basics — exploit real vulnerabilities, write custom exploits, and master post-exploitation techniques used by red teams.',
        thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
        category: 'Cyber Security',
        price: 104.99,
        level: 'expert',
        rating: 4.8,
        reviewCount: 218
      },
      {
        title: 'Full-Stack System Design Masterclass',
        description: 'Design Twitter, Netflix, and Uber at scale. Deep dives into distributed systems, CAP theorem, sharding, message queues, and microservices.',
        thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
        category: 'Software Engineering',
        price: 109.99,
        level: 'expert',
        rating: 4.9,
        reviewCount: 475,
        bestseller: true
      },
      {
        title: 'Kubernetes & Service Mesh: Production-Grade Deployments',
        description: 'Master container orchestration at scale — multi-cluster Kubernetes, Istio service mesh, Helm, GitOps with Argo CD, and zero-downtime deployments.',
        thumbnail_url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=800',
        category: 'DevOps',
        price: 114.99,
        level: 'expert',
        rating: 4.7,
        reviewCount: 189
      }
    ];

    // Lesson templates — topic-specific titles that the video picker can match
    const lessonTemplates = [
      { title: 'Course Overview & Introduction' },
      { title: 'Environment Setup & Installation' },
      { title: 'Foundational Concepts' },
      { title: 'Hands-on Project Build' },
      { title: 'Advanced Tips & Best Practices' }
    ];

    const courses = [];
    for (const data of courseData) {
      const course = await Course.create({
        ...data,
        instructor_id: instructor._id
      });
      courses.push(course);

      // Create 3 lessons per course — video URL is chosen by topic + category
      const selectedLessons = lessonTemplates.slice(0, 3);
      const lessonsToCreate = selectedLessons.map((l, index) => ({
        title: l.title,
        video_url: pickVideoForLesson(l.title, data.category),
        duration: 300 + (index * 120),
        order_index: index + 1,
        course_id: course._id
      }));

      await Lesson.create(lessonsToCreate);
    }

    console.log(`✅ Seeding Successfully Completed! Created ${courses.length} courses.`);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
  }
};
