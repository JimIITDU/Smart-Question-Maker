USE smart_question_maker;

-- Drop tables if they exist
DROP TABLE IF EXISTS result_summary;
DROP TABLE IF EXISTS quiz_exam;
DROP TABLE IF EXISTS question_bank;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS batch;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS subscription;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS coaching_center;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS notification;

-- Roles table
CREATE TABLE roles (
  role_id INT PRIMARY KEY AUTO_INCREMENT,
  role_name ENUM(
    'super_admin',
    'coaching_admin',
    'teacher',
    'staff',
    'student',
    'parent'
  ) NOT NULL
);

-- Insert roles
INSERT INTO roles (role_name) VALUES
('super_admin'),
('coaching_admin'),
('teacher'),
('staff'),
('student'),
('parent');

-- Coaching Center table
CREATE TABLE coaching_center (
  coaching_center_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  center_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  contact_number VARCHAR(20),
  email VARCHAR(255),
  established_date DATE,
  access_type ENUM('free', 'paid') DEFAULT 'free',
  status ENUM('pending', 'active', 'inactive') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  coaching_center_id INT,
  role_id INT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  gender VARCHAR(20),
  date_of_birth DATE,
  address TEXT,
  profile_image VARCHAR(255),
  bio TEXT,
  class VARCHAR(50),
  group_name VARCHAR(50),
  roll_number VARCHAR(50),
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(20),
  subject_specialization VARCHAR(255),
  salary DECIMAL(10,2),
  joining_date DATE,
  experience INTEGER,
  employment_status ENUM('full_time', 'part_time'),
  status ENUM('active', 'inactive', 'suspended') 
    DEFAULT 'active',
  otp VARCHAR(6),
  otp_expires_at TIMESTAMP,
  is_email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Subscription table
CREATE TABLE subscription (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  coaching_center_id INT,
  user_id INT,
  amount DECIMAL(10,2),
  payment_for ENUM(
    'center_creation',
    'monthly_subscription',
    'course_purchase'
  ),
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  status ENUM('pending', 'success', 'failed') 
    DEFAULT 'pending',
  paid_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Course table
CREATE TABLE course (
  course_id INT PRIMARY KEY AUTO_INCREMENT,
  coaching_center_id INT,
  course_title VARCHAR(255) NOT NULL,
  course_description TEXT,
  duration VARCHAR(100),
  fee DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batch table
CREATE TABLE batch (
  batch_id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT,
  coaching_center_id INT,
  batch_name VARCHAR(100) NOT NULL,
  batch_code VARCHAR(50),
  start_date DATE,
  end_date DATE,
  batch_type ENUM('regular', 'crash', 'weekend'),
  class_shift ENUM('morning', 'day', 'evening', 'night'),
  max_students INT,
  current_students INT DEFAULT 0,
  status ENUM('upcoming', 'running', 'completed', 'cancelled') 
    DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES course(course_id)
);

-- Subjects table
CREATE TABLE subjects (
  subject_id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT,
  coaching_center_id INT,
  teacher_user_id INT,
  subject_name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(50),
  assigned_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  material_title VARCHAR(255),
  file_type VARCHAR(50),
  file_path TEXT,
  uploaded_by INT,
  uploaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES course(course_id),
  FOREIGN KEY (teacher_user_id) REFERENCES users(user_id)
);

-- Question Bank table
CREATE TABLE question_bank (
  question_id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT,
  course_id INT,
  question_text TEXT NOT NULL,
  question_type ENUM('mcq', 'descriptive', 'true_false') 
    NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
  expected_answer TEXT,
  max_marks INT DEFAULT 1,
  option_text_a TEXT,
  option_text_b TEXT,
  option_text_c TEXT,
  option_text_d TEXT,
  correct_option TEXT,
  created_by INT,
  source ENUM('manual', 'llm') DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Quiz/Exam table
CREATE TABLE quiz_exam (
  exam_id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT,
  batch_id INT,
  exam_type ENUM('regular', 'live_quiz') NOT NULL,
  host_teacher_id INT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status ENUM('scheduled', 'ongoing', 'completed') 
    DEFAULT 'scheduled',
  access_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
  FOREIGN KEY (host_teacher_id) REFERENCES users(user_id)
);

-- Result Summary table
CREATE TABLE result_summary (
  result_id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT,
  student_id INT,
  question_id INT,
  descriptive_answer TEXT,
  marks_obtained DECIMAL(5,2),
  evaluated_by ENUM('llm', 'teacher'),
  feedback TEXT,
  confidence_score DECIMAL(4,2),
  answer_status ENUM('running', 'submitted', 'checked') 
    DEFAULT 'running',
  answered_at TIMESTAMP,
  evaluated_at TIMESTAMP,
  total_marks DECIMAL(6,2),
  percentage DECIMAL(5,2),
  grade VARCHAR(10),
  result_status ENUM('pass', 'fail'),
  published_at TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES quiz_exam(exam_id),
  FOREIGN KEY (student_id) REFERENCES users(user_id),
  FOREIGN KEY (question_id) REFERENCES question_bank(question_id)
);

-- Notification table
CREATE TABLE notification (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  message TEXT NOT NULL,
  type ENUM('system', 'quiz', 'exam', 'fee') NOT NULL,
  status ENUM('read', 'unread') DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

--many to many relationship between exam questions and question bank
CREATE TABLE exam_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  question_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES quiz_exam(exam_id),
  FOREIGN KEY (question_id) REFERENCES question_bank(question_id)
);