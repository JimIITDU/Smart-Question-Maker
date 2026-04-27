-- ============================================
-- Smart Question Maker - PostgreSQL Schema
-- ============================================

-- Drop tables in correct order (reverse FK dependency)
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS result_summary CASCADE;
DROP TABLE IF EXISTS quiz_exam CASCADE;
DROP TABLE IF EXISTS question_bank CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS batch CASCADE;
DROP TABLE IF EXISTS course CASCADE;
DROP TABLE IF EXISTS subscription CASCADE;
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS coaching_center CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Drop ENUM types if they exist
DROP TYPE IF EXISTS role_name_enum CASCADE;
DROP TYPE IF EXISTS access_type_enum CASCADE;
DROP TYPE IF EXISTS center_status_enum CASCADE;
DROP TYPE IF EXISTS user_status_enum CASCADE;
DROP TYPE IF EXISTS employment_status_enum CASCADE;
DROP TYPE IF EXISTS payment_for_enum CASCADE;
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS batch_type_enum CASCADE;
DROP TYPE IF EXISTS class_shift_enum CASCADE;
DROP TYPE IF EXISTS batch_status_enum CASCADE;
DROP TYPE IF EXISTS question_type_enum CASCADE;
DROP TYPE IF EXISTS difficulty_enum CASCADE;
DROP TYPE IF EXISTS source_enum CASCADE;
DROP TYPE IF EXISTS exam_type_enum CASCADE;
DROP TYPE IF EXISTS exam_status_enum CASCADE;
DROP TYPE IF EXISTS evaluated_by_enum CASCADE;
DROP TYPE IF EXISTS answer_status_enum CASCADE;
DROP TYPE IF EXISTS result_status_enum CASCADE;
DROP TYPE IF EXISTS notification_type_enum CASCADE;
DROP TYPE IF EXISTS notification_status_enum CASCADE;

-- Create ENUM types
CREATE TYPE role_name_enum AS ENUM (
  'super_admin', 'coaching_admin', 'teacher', 'staff', 'student', 'parent'
);
CREATE TYPE access_type_enum AS ENUM ('free', 'paid');
CREATE TYPE center_status_enum AS ENUM ('pending', 'active', 'inactive');
CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE employment_status_enum AS ENUM ('full_time', 'part_time');
CREATE TYPE payment_for_enum AS ENUM (
  'center_creation', 'monthly_subscription', 'course_purchase'
);
CREATE TYPE payment_status_enum AS ENUM ('pending', 'success', 'failed');
CREATE TYPE batch_type_enum AS ENUM ('regular', 'crash', 'weekend');
CREATE TYPE class_shift_enum AS ENUM ('morning', 'day', 'evening', 'night');
CREATE TYPE batch_status_enum AS ENUM (
  'upcoming', 'running', 'completed', 'cancelled'
);
CREATE TYPE question_type_enum AS ENUM ('mcq', 'descriptive', 'true_false');
CREATE TYPE difficulty_enum AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE source_enum AS ENUM ('manual', 'llm');
CREATE TYPE exam_type_enum AS ENUM ('regular', 'live_quiz');
CREATE TYPE exam_status_enum AS ENUM ('scheduled', 'ongoing', 'completed');
CREATE TYPE evaluated_by_enum AS ENUM ('llm', 'teacher');
CREATE TYPE answer_status_enum AS ENUM ('running', 'submitted', 'checked');
CREATE TYPE result_status_enum AS ENUM ('pass', 'fail');
CREATE TYPE notification_type_enum AS ENUM ('system', 'quiz', 'exam', 'fee');
CREATE TYPE notification_status_enum AS ENUM ('read', 'unread');

-- ==================
-- Roles Table
-- ==================
CREATE TABLE roles (
  role_id   SERIAL PRIMARY KEY,
  role_name role_name_enum NOT NULL UNIQUE
);

INSERT INTO roles (role_name) VALUES
  ('super_admin'),
  ('coaching_admin'),
  ('teacher'),
  ('staff'),
  ('student'),
  ('parent');

-- ==================
-- Coaching Center Table
-- ==================
CREATE TABLE coaching_center (
  coaching_center_id SERIAL PRIMARY KEY,
  user_id            INTEGER,
  center_name        VARCHAR(255) NOT NULL,
  location           VARCHAR(255),
  contact_number     VARCHAR(20),
  email              VARCHAR(255),
  established_date   DATE,
  access_type        access_type_enum  DEFAULT 'free',
  status             center_status_enum DEFAULT 'pending',
  created_at         TIMESTAMP DEFAULT NOW()
);

-- ==================
-- Users Table
-- ==================
CREATE TABLE users (
  user_id              SERIAL PRIMARY KEY,
  coaching_center_id   INTEGER,
  role_id              INTEGER NOT NULL REFERENCES roles(role_id),
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT NOT NULL,
  name                 VARCHAR(255) NOT NULL,
  phone                VARCHAR(20),
  gender               VARCHAR(20),
  date_of_birth        DATE,
  address              TEXT,
  profile_image        VARCHAR(255),
  bio                  TEXT,
  class                VARCHAR(50),
  group_name           VARCHAR(50),
  roll_number          VARCHAR(50),
  guardian_name        VARCHAR(255),
  guardian_phone       VARCHAR(20),
  subject_specialization VARCHAR(255),
  salary               DECIMAL(10,2),
  joining_date         DATE,
  experience           INTEGER,
  employment_status    employment_status_enum,
  status               user_status_enum DEFAULT 'active',
  otp                  VARCHAR(6),
  otp_expires_at       TIMESTAMP,
  is_email_verified    BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW()
);

-- Add FK from coaching_center -> users (after users table created)
ALTER TABLE coaching_center
  ADD CONSTRAINT fk_center_user
  FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Add FK from users -> coaching_center
ALTER TABLE users
  ADD CONSTRAINT fk_user_center
  FOREIGN KEY (coaching_center_id) REFERENCES coaching_center(coaching_center_id);

-- Function & trigger to auto-update updated_at on users
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================
-- Subscription Table
-- ==================
CREATE TABLE subscription (
  payment_id         SERIAL PRIMARY KEY,
  coaching_center_id INTEGER REFERENCES coaching_center(coaching_center_id),
  user_id            INTEGER REFERENCES users(user_id),
  amount             DECIMAL(10,2),
  payment_for        payment_for_enum,
  payment_method     VARCHAR(50),
  transaction_id     VARCHAR(100),
  status             payment_status_enum DEFAULT 'pending',
  paid_at            TIMESTAMP
);

-- ==================
-- Course Table
-- ==================
CREATE TABLE course (
  course_id          SERIAL PRIMARY KEY,
  coaching_center_id INTEGER REFERENCES coaching_center(coaching_center_id),
  course_title       VARCHAR(255) NOT NULL,
  course_description TEXT,
  duration           VARCHAR(100),
  fee                DECIMAL(10,2),
  created_at         TIMESTAMP DEFAULT NOW()
);

-- ==================
-- Batch Table
-- ==================
CREATE TABLE batch (
  batch_id           SERIAL PRIMARY KEY,
  course_id          INTEGER REFERENCES course(course_id),
  coaching_center_id INTEGER REFERENCES coaching_center(coaching_center_id),
  batch_name         VARCHAR(100) NOT NULL,
  batch_code         VARCHAR(50),
  start_date         DATE,
  end_date           DATE,
  batch_type         batch_type_enum,
  class_shift        class_shift_enum,
  max_students       INTEGER,
  current_students   INTEGER DEFAULT 0,
  status             batch_status_enum DEFAULT 'upcoming',
  created_at         TIMESTAMP DEFAULT NOW()
);

-- ==================
-- Batch Enrollment (many-to-many: students <-> batches)
-- ==================
CREATE TABLE batch_enrollment (
  enrollment_id SERIAL PRIMARY KEY,
  batch_id      INTEGER NOT NULL REFERENCES batch(batch_id),
  user_id       INTEGER NOT NULL REFERENCES users(user_id),
  enrolled_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(batch_id, user_id)
);

-- ==================
-- Subjects Table
-- ==================
CREATE TABLE subjects (
  subject_id         SERIAL PRIMARY KEY,
  course_id          INTEGER REFERENCES course(course_id),
  coaching_center_id INTEGER REFERENCES coaching_center(coaching_center_id),
  teacher_user_id    INTEGER REFERENCES users(user_id),
  subject_name       VARCHAR(255) NOT NULL,
  subject_code       VARCHAR(50),
  assigned_date      DATE,
  is_active          BOOLEAN DEFAULT TRUE,
  material_title     VARCHAR(255),
  file_type          VARCHAR(50),
  file_path          TEXT,
  uploaded_by        INTEGER REFERENCES users(user_id),
  uploaded_at        TIMESTAMP,
  created_at         TIMESTAMP DEFAULT NOW()
);

-- ==================
-- Question Bank Table
-- ==================
CREATE TABLE question_bank (
  question_id     SERIAL PRIMARY KEY,
  subject_id      INTEGER REFERENCES subjects(subject_id),
  course_id       INTEGER REFERENCES course(course_id),
  question_text   TEXT NOT NULL,
  question_type   question_type_enum NOT NULL,
  difficulty      difficulty_enum NOT NULL,
  expected_answer TEXT,
  max_marks       INTEGER DEFAULT 1,
  option_text_a   TEXT,
  option_text_b   TEXT,
  option_text_c   TEXT,
  option_text_d   TEXT,
  correct_option  TEXT,
  created_by      INTEGER REFERENCES users(user_id),
  source          source_enum DEFAULT 'manual',
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ==================
-- Quiz / Exam Table
-- ==================
CREATE TABLE quiz_exam (
  exam_id         SERIAL PRIMARY KEY,
  subject_id      INTEGER REFERENCES subjects(subject_id),
  batch_id        INTEGER REFERENCES batch(batch_id),
  exam_type       exam_type_enum NOT NULL,
  host_teacher_id INTEGER REFERENCES users(user_id),
  title           VARCHAR(255),
  duration_minutes INTEGER,
  start_time      TIMESTAMP,
  end_time        TIMESTAMP,
  status          exam_status_enum DEFAULT 'scheduled',
  access_code     VARCHAR(20),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ==================
-- Exam Questions (many-to-many: exams <-> questions)
-- ==================
CREATE TABLE exam_questions (
  id          SERIAL PRIMARY KEY,
  exam_id     INTEGER NOT NULL REFERENCES quiz_exam(exam_id),
  question_id INTEGER NOT NULL REFERENCES question_bank(question_id),
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(exam_id, question_id)
);

-- ==================
-- Result Summary Table
-- ==================
CREATE TABLE result_summary (
  result_id        SERIAL PRIMARY KEY,
  exam_id          INTEGER REFERENCES quiz_exam(exam_id),
  student_id       INTEGER REFERENCES users(user_id),
  question_id      INTEGER REFERENCES question_bank(question_id),
  descriptive_answer TEXT,
  marks_obtained   DECIMAL(5,2),
  evaluated_by     evaluated_by_enum,
  feedback         TEXT,
  confidence_score DECIMAL(4,2),
  answer_status    answer_status_enum DEFAULT 'running',
  answered_at      TIMESTAMP,
  evaluated_at     TIMESTAMP,
  total_marks      DECIMAL(6,2),
  percentage       DECIMAL(5,2),
  grade            VARCHAR(10),
  result_status    result_status_enum,
  published_at     TIMESTAMP
);

-- ==================
-- Notification Table
-- ==================
CREATE TABLE notification (
  notification_id SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(user_id),
  message         TEXT NOT NULL,
  type            notification_type_enum NOT NULL,
  status          notification_status_enum DEFAULT 'unread',
  created_at      TIMESTAMP DEFAULT NOW()
);