import { getPool } from '../config/database.js';

const DATABASE_SCHEMA = `
-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'instructor', 'student') DEFAULT 'student',
  avatar_url VARCHAR(500),
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== CATEGORIES TABLE ====================
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== COURSES TABLE ====================
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  instructor_id INT NOT NULL,
  category_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url VARCHAR(500),
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  duration_hours DECIMAL(5,2),
  language VARCHAR(50) DEFAULT 'English',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_instructor_id (instructor_id),
  INDEX idx_category_id (category_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== SECTIONS TABLE ====================
CREATE TABLE IF NOT EXISTS sections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course_id (course_id),
  INDEX idx_order (order_number),
  UNIQUE KEY unique_course_section (course_id, order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== LESSONS TABLE ====================
CREATE TABLE IF NOT EXISTS lessons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  section_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500) NOT NULL,
  video_id VARCHAR(100),
  duration_minutes INT,
  order_number INT NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  INDEX idx_section_id (section_id),
  INDEX idx_video_url (video_url),
  INDEX idx_order (order_number),
  UNIQUE KEY unique_section_lesson (section_id, order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== ENROLLMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_course (user_id, course_id),
  INDEX idx_user_id (user_id),
  INDEX idx_course_id (course_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== PROGRESS TABLE ====================
CREATE TABLE IF NOT EXISTS progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  course_id INT NOT NULL,
  watched_duration INT DEFAULT 0,
  total_duration INT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_lesson (user_id, lesson_id),
  INDEX idx_user_id (user_id),
  INDEX idx_lesson_id (lesson_id),
  INDEX idx_course_id (course_id),
  INDEX idx_is_completed (is_completed),
  INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== COURSE PROGRESS TABLE ====================
CREATE TABLE IF NOT EXISTS course_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  last_accessed_lesson_id INT,
  last_accessed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (last_accessed_lesson_id) REFERENCES lessons(id),
  UNIQUE KEY unique_user_course (user_id, course_id),
  INDEX idx_user_id (user_id),
  INDEX idx_course_id (course_id),
  INDEX idx_progress_percentage (progress_percentage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== COURSE RATINGS TABLE ====================
CREATE TABLE IF NOT EXISTS course_ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_course_rating (user_id, course_id),
  INDEX idx_course_id (course_id),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== CERTIFICATES TABLE ====================
CREATE TABLE IF NOT EXISTS certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certificate_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_course_cert (user_id, course_id),
  INDEX idx_user_id (user_id),
  INDEX idx_course_id (course_id),
  INDEX idx_issued_date (issued_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== REFRESH TOKENS TABLE ====================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== AUDIT LOGS TABLE ====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  changes JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const runMigrations = async () => {
  const pool = getPool();
  let connection;

  try {
    connection = await pool.getConnection();

    console.log('\n📋 Running database migrations...\n');

    // Split the schema into individual statements
    const statements = DATABASE_SCHEMA.split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    for (let i = 0; i < statements.length; i++) {
      try {
        await connection.query(statements[i]);
        const tableMatch = statements[i].match(/CREATE TABLE.*?(\w+)\s*\(/);
        const tableName = tableMatch ? tableMatch[1] : `Statement ${i + 1}`;
        console.log(`✅ Created/Verified: ${tableName}`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          const tableMatch = statements[i].match(/CREATE TABLE.*?(\w+)\s*\(/);
          const tableName = tableMatch ? tableMatch[1] : `Statement ${i + 1}`;
          console.log(`ℹ️  Already exists: ${tableName}`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Database migrations completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    console.error(error);
    process.exit(1);

  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Run migrations
runMigrations();
