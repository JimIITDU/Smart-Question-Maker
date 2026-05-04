const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ── DB Connection ──────────────────────────────────────────────────────────
const at = String.fromCharCode(64);
const p1 = 'postgresql://neondb_owner:npg_u9brOpC2xBdo';
const p2 = 'ep-mute-unit-a4nthh29-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || (p1 + at + p2),
  ssl: { rejectUnauthorized: false },
});

// ── Helpers ────────────────────────────────────────────────────────────────
const grade  = p => p>=80?'A+':p>=70?'A':p>=60?'B':p>=50?'C':p>=33?'D':'F';
const passed = p => p>=33?'pass':'fail';
const rnd    = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
const txn    = i => `TXN${Date.now()}${i}`;
const pad    = (n,l=7) => String(n).padStart(l,'0');
const ago    = d => `NOW() - INTERVAL '${d}'`;

// ── Main ───────────────────────────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();
  try {
    console.log('🗑️  Clearing tables...');
    await client.query('BEGIN');
    // Clear in reverse FK order — include all new tables
    for (const t of [
      'notification','result_summary','exam_questions','quiz_exam',
      'question_bank','course_enrollments','teacher_course_assignments',
      'teacher_applications','batch_enrollment','subjects','batch',
      'course','subscription','users','coaching_center',
    ]) await client.query(`DELETE FROM ${t}`);
    console.log('✅ Cleared\n');

    const PASS = await bcrypt.hash('pass@1234', 10);

    // ══════════════════════════════════════════════════════════════════
    // 1. SUPER ADMIN
    // ══════════════════════════════════════════════════════════════════
    const { rows:[{user_id:saId}] } = await client.query(
      `INSERT INTO users (role_id,email,password_hash,name,phone,is_email_verified,status,bio)
       VALUES (1,'super@gmail.com',$1,'Super Admin','01700000001',true,'active',
               'Platform super administrator for Smart Coaching system.')
       RETURNING user_id`, [PASS]
    );
    console.log('✅ Super Admin');

    // ══════════════════════════════════════════════════════════════════
    // 2. COACHING ADMINS (5)
    // ══════════════════════════════════════════════════════════════════
    const adminProfiles = [
      { email:'admin@gmail.com',  name:'Rahim Uddin',    phone:'01711000001', gender:'Male',   dob:'1980-05-15', addr:'Mirpur, Dhaka',         bio:'10 years in education management.'   },
      { email:'admin2@gmail.com', name:'Kamrun Nahar',   phone:'01711000002', gender:'Female', dob:'1983-08-22', addr:'Agrabad, Chittagong',    bio:'Former school principal turned admin.' },
      { email:'admin3@gmail.com', name:'Jahangir Alam',  phone:'01711000003', gender:'Male',   dob:'1978-11-10', addr:'Zindabazar, Sylhet',     bio:'Founded Medhabi Pathshala in 2018.'   },
      { email:'admin4@gmail.com', name:'Monira Begum',   phone:'01711000004', gender:'Female', dob:'1985-03-30', addr:'Shaheb Bazar, Rajshahi', bio:'Passionate about quality education.'  },
      { email:'admin5@gmail.com', name:'Sirajul Islam',  phone:'01711000005', gender:'Male',   dob:'1982-07-18', addr:'Boyra, Khulna',          bio:'Education entrepreneur since 2015.'   },
    ];
    const adminIds = [];
    for (const a of adminProfiles) {
      const { rows:[{user_id}] } = await client.query(
        `INSERT INTO users (role_id,email,password_hash,name,phone,gender,date_of_birth,address,bio,is_email_verified,status)
         VALUES (2,$1,$2,$3,$4,$5,$6,$7,$8,true,'active') RETURNING user_id`,
        [a.email,PASS,a.name,a.phone,a.gender,a.dob,a.addr,a.bio]
      );
      adminIds.push(user_id);
    }
    console.log(`✅ ${adminIds.length} Coaching Admins`);

    // ══════════════════════════════════════════════════════════════════
    // 3. COACHING CENTERS (5)
    // ══════════════════════════════════════════════════════════════════
    const centerProfiles = [
      { name:'Excellence Coaching Center', loc:'Mirpur-10, Dhaka',          email:'admin@gmail.com',  contact:'01711000001', plan:2, est:'2018-01-15' },
      { name:'Alo Coaching Center',        loc:'Agrabad, Chittagong',        email:'admin2@gmail.com', contact:'01711000002', plan:3, est:'2016-06-01' },
      { name:'Medhabi Pathshala',          loc:'Zindabazar, Sylhet',         email:'admin3@gmail.com', contact:'01711000003', plan:1, est:'2019-03-10' },
      { name:'Proshno Coaching Center',    loc:'Shaheb Bazar, Rajshahi',     email:'admin4@gmail.com', contact:'01711000004', plan:2, est:'2020-09-05' },
      { name:'Gyaan Niketan',              loc:'Boyra, Khulna',              email:'admin5@gmail.com', contact:'01711000005', plan:1, est:'2021-01-20' },
    ];
    const centerIds = [];
    for (let i=0;i<centerProfiles.length;i++) {
      const c = centerProfiles[i];
      const { rows:[{coaching_center_id}] } = await client.query(
        `INSERT INTO coaching_center
           (user_id,center_name,location,contact_number,email,established_date,
            access_type,status,current_plan_id,subscription_start,subscription_end)
         VALUES ($1,$2,$3,$4,$5,$6,'paid','active',$7,NOW(),NOW()+INTERVAL '1 year')
         RETURNING coaching_center_id`,
        [adminIds[i],c.name,c.loc,c.contact,c.email,c.est,c.plan]
      );
      centerIds.push(coaching_center_id);
      await client.query(`UPDATE users SET coaching_center_id=$1 WHERE user_id=$2`,[coaching_center_id,adminIds[i]]);
    }
    console.log(`✅ ${centerIds.length} Coaching Centers`);

    // ══════════════════════════════════════════════════════════════════
    // 4. TEACHERS (15)
    // ══════════════════════════════════════════════════════════════════
    const teacherProfiles = [
      { email:'teacher@gmail.com',   name:'Anisur Rahman',    spec:'Mathematics, Physics',    ci:0, sal:45000, exp:10, gender:'Male',   dob:'1988-04-12', emp:'full_time', bio:'PhD candidate in Applied Mathematics.'         },
      { email:'teacher2@gmail.com',  name:'Fatema Begum',     spec:'Chemistry, Biology',      ci:0, sal:38000, exp:7,  gender:'Female', dob:'1991-09-25', emp:'full_time', bio:'M.Sc Chemistry, 7 years teaching experience.'  },
      { email:'teacher3@gmail.com',  name:'Mizanur Rahman',   spec:'English, Bengali',        ci:0, sal:35000, exp:8,  gender:'Male',   dob:'1987-12-03', emp:'full_time', bio:'MA English Literature, experienced coach.'      },
      { email:'teacher4@gmail.com',  name:'Sumaiya Khanam',   spec:'Mathematics',             ci:1, sal:42000, exp:9,  gender:'Female', dob:'1989-06-18', emp:'full_time', bio:'B.Sc Mathematics with Gold Medal.'              },
      { email:'teacher5@gmail.com',  name:'Abdur Rob',        spec:'Physics, Chemistry',      ci:1, sal:40000, exp:11, gender:'Male',   dob:'1985-02-28', emp:'full_time', bio:'Former BUET lecturer, now coaching.'            },
      { email:'teacher6@gmail.com',  name:'Nasrin Akter',     spec:'Biology',                 ci:1, sal:32000, exp:5,  gender:'Female', dob:'1993-07-14', emp:'part_time', bio:'MBBS student with strong biology background.'  },
      { email:'teacher7@gmail.com',  name:'Kamrul Hasan',     spec:'Mathematics, ICT',        ci:2, sal:36000, exp:6,  gender:'Male',   dob:'1990-11-05', emp:'full_time', bio:'Software engineer turned math teacher.'         },
      { email:'teacher8@gmail.com',  name:'Roksana Parvin',   spec:'English, IELTS',          ci:2, sal:30000, exp:4,  gender:'Female', dob:'1994-03-20', emp:'full_time', bio:'IELTS Score 8.5. Certified English trainer.'   },
      { email:'teacher9@gmail.com',  name:'Shahadat Hossain', spec:'History, Civics',         ci:2, sal:28000, exp:3,  gender:'Male',   dob:'1995-08-09', emp:'part_time', bio:'MA History from University of Dhaka.'           },
      { email:'teacher10@gmail.com', name:'Moriom Begum',     spec:'Bengali Literature',      ci:3, sal:31000, exp:6,  gender:'Female', dob:'1990-05-17', emp:'full_time', bio:'Author of three Bengali poetry collections.'   },
      { email:'teacher11@gmail.com', name:'Jahirul Islam',    spec:'Physics',                 ci:3, sal:39000, exp:8,  gender:'Male',   dob:'1986-10-30', emp:'full_time', bio:'M.Sc Physics, specializes in mechanics.'        },
      { email:'teacher12@gmail.com', name:'Tania Sultana',    spec:'Chemistry',               ci:3, sal:37000, exp:7,  gender:'Female', dob:'1989-01-22', emp:'full_time', bio:'Industrial chemist with teaching passion.'      },
      { email:'teacher13@gmail.com', name:'Rafiqul Islam',    spec:'Mathematics, Statistics', ci:4, sal:43000, exp:12, gender:'Male',   dob:'1984-06-08', emp:'full_time', bio:'12 years experience, O/A Level specialist.'    },
      { email:'teacher14@gmail.com', name:'Dilruba Yasmin',   spec:'Biology, English',        ci:4, sal:33000, exp:5,  gender:'Female', dob:'1992-04-15', emp:'full_time', bio:'BSc Biology, CELTA certified English teacher.' },
      { email:'teacher15@gmail.com', name:'Mahbubur Rahman',  spec:'ICT, Mathematics',        ci:4, sal:41000, exp:9,  gender:'Male',   dob:'1987-09-27', emp:'full_time', bio:'BSc CSE, teaches advanced math and ICT.'        },
    ];
    const teacherIds = [];
    for (let i=0;i<teacherProfiles.length;i++) {
      const t = teacherProfiles[i];
      const { rows:[{user_id}] } = await client.query(
        `INSERT INTO users
           (role_id,email,password_hash,name,phone,gender,date_of_birth,bio,
            subject_specialization,employment_status,coaching_center_id,salary,experience,
            is_email_verified,status,joining_date)
         VALUES (3,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,'active','2023-01-01')
         RETURNING user_id`,
        [t.email,PASS,t.name,`017${pad(i+100)}`,t.gender,t.dob,t.bio,
         t.spec,t.emp,centerIds[t.ci],t.sal,t.exp]
      );
      teacherIds.push(user_id);
    }
    console.log(`✅ ${teacherIds.length} Teachers`);

    // ══════════════════════════════════════════════════════════════════
    // 5. STAFF (5)
    // ══════════════════════════════════════════════════════════════════
    const staffProfiles = [
      { email:'staff@gmail.com',  name:'Habibur Rahman', ci:0, gender:'Male',   dob:'1990-03-12', addr:'Mirpur, Dhaka',      bio:'Office manager and student coordinator.' },
      { email:'staff2@gmail.com', name:'Salma Khatun',   ci:1, gender:'Female', dob:'1993-07-25', addr:'Chittagong',         bio:'Handles admissions and fee collection.'  },
      { email:'staff3@gmail.com', name:'Nurul Huda',     ci:2, gender:'Male',   dob:'1988-11-18', addr:'Sylhet',             bio:'Manages scheduling and resources.'       },
      { email:'staff4@gmail.com', name:'Kohinur Begum',  ci:3, gender:'Female', dob:'1992-05-30', addr:'Rajshahi',           bio:'Student records and admin support.'      },
      { email:'staff5@gmail.com', name:'Abul Kashem',    ci:4, gender:'Male',   dob:'1987-09-04', addr:'Khulna',             bio:'IT support and system management.'       },
    ];
    const staffIds = [];
    for (let i=0;i<staffProfiles.length;i++) {
      const s = staffProfiles[i];
      const { rows:[{user_id}] } = await client.query(
        `INSERT INTO users (role_id,email,password_hash,name,phone,gender,date_of_birth,address,bio,
                            is_email_verified,status,coaching_center_id)
         VALUES (4,$1,$2,$3,$4,$5,$6,$7,$8,true,'active',$9) RETURNING user_id`,
        [s.email,PASS,s.name,`018${pad(i+100)}`,s.gender,s.dob,s.addr,s.bio,centerIds[s.ci]]
      );
      staffIds.push(user_id);
    }
    console.log(`✅ ${staffIds.length} Staff`);

    // ══════════════════════════════════════════════════════════════════
    // 6. STUDENTS (30)
    // ══════════════════════════════════════════════════════════════════
    const studentProfiles = [
      // Excellence (ci:0) — students 0-5
      { n:'Alice Ahmed',     g:'Female', dob:'2006-01-10', cls:'11-12(Higher Secondary)', grp:'Science',  roll:'ROLL001', ci:0, addr:'Mirpur, Dhaka',    bio:'Wants to study medicine.' },
      { n:'Bob Hossain',     g:'Male',   dob:'2006-04-22', cls:'11-12(Higher Secondary)', grp:'Commerce', roll:'ROLL002', ci:0, addr:'Pallabi, Dhaka',   bio:'Interested in business.'  },
      { n:'Riya Begum',      g:'Female', dob:'2007-07-15', cls:'11-12(Higher Secondary)', grp:'Arts',     roll:'ROLL003', ci:0, addr:'Dhanmondi, Dhaka', bio:'Aspiring journalist.'     },
      { n:'Sakib Khan',      g:'Male',   dob:'2008-03-08', cls:'9-10 (Secondary)',         grp:'Science',  roll:'ROLL004', ci:0, addr:'Mohammadpur',      bio:'Future engineer.'         },
      { n:'Nadia Islam',     g:'Female', dob:'2008-11-19', cls:'9-10 (Secondary)',         grp:'Commerce', roll:'ROLL005', ci:0, addr:'Uttara, Dhaka',    bio:'Planning finance career.' },
      { n:'Tanvir Ahmed',    g:'Male',   dob:'2008-06-30', cls:'9-10 (Secondary)',         grp:'Arts',     roll:'ROLL006', ci:0, addr:'Gulshan, Dhaka',   bio:'Creative writer.'         },
      // Alo (ci:1) — students 6-11
      { n:'Mitu Akter',      g:'Female', dob:'2006-02-14', cls:'11-12(Higher Secondary)', grp:'Science',  roll:'ROLL007', ci:1, addr:'Agrabad, CTG',     bio:'Wants to be a doctor.'    },
      { n:'Arif Rahman',     g:'Male',   dob:'2006-09-05', cls:'11-12(Higher Secondary)', grp:'Science',  roll:'ROLL008', ci:1, addr:'Nasirabad, CTG',   bio:'Physics enthusiast.'      },
      { n:'Sadia Khanam',    g:'Female', dob:'2007-12-20', cls:'9-10 (Secondary)',         grp:'Commerce', roll:'ROLL009', ci:1, addr:'Halishahar, CTG',  bio:'Loves mathematics.'       },
      { n:'Rakib Hasan',     g:'Male',   dob:'2008-05-17', cls:'9-10 (Secondary)',         grp:'Science',  roll:'ROLL010', ci:1, addr:'Chittagong',       bio:'Coding hobbyist.'         },
      { n:'Lamia Sultana',   g:'Female', dob:'2008-08-25', cls:'9-10 (Secondary)',         grp:'Arts',     roll:'ROLL011', ci:1, addr:'Chittagong',       bio:'Fine arts student.'       },
      { n:'Naim Uddin',      g:'Male',   dob:'2009-01-03', cls:'9-10 (Secondary)',         grp:'Science',  roll:'ROLL012', ci:1, addr:'Chittagong',       bio:'Science olympiad winner.' },
      // Medhabi (ci:2) — students 12-17
      { n:'Tania Akter',     g:'Female', dob:'2005-10-11', cls:'11-12(Higher Secondary)', grp:'Science',  roll:'ROLL013', ci:2, addr:'Sylhet',           bio:'IELTS preparation focus.' },
      { n:'Imran Hossain',   g:'Male',   dob:'2005-07-28', cls:'11-12(Higher Secondary)', grp:'Science',  roll:'ROLL014', ci:2, addr:'Sylhet',           bio:'Plans to study abroad.'   },
      { n:'Rima Begum',      g:'Female', dob:'2006-04-16', cls:'11-12(Higher Secondary)', grp:'Arts',     roll:'ROLL015', ci:2, addr:'Sylhet',           bio:'Wants to teach English.'  },
      { n:'Sabbir Ahmed',    g:'Male',   dob:'2008-02-09', cls:'9-10 (Secondary)',         grp:'Science',  roll:'ROLL016', ci:2, addr:'Sylhet',           bio:'Math competition lover.'  },
      { n:'Puja Rani Das',   g:'Female', dob:'2008-09-22', cls:'9-10 (Secondary)',         grp:'Arts',     roll:'ROLL017', ci:2, addr:'Sylhet',           bio:'Aspiring dancer and student.' },
      { n:'Fahim Islam',     g:'Male',   dob:'2009-06-14', cls:'9-10 (Secondary)',         grp:'Commerce', roll:'ROLL018', ci:2, addr:'Sylhet',           bio:'Interested in economics.' },
      // Proshno (ci:3) — students 18-23
      { n:'Urmi Khatun',     g:'Female', dob:'1998-03-20', cls:'Masters',                  grp:'Science',  roll:'ROLL019', ci:3, addr:'Rajshahi',         bio:'BCS aspirant.'            },
      { n:'Shohel Rana',     g:'Male',   dob:'1997-11-08', cls:'Masters',                  grp:'Science',  roll:'ROLL020', ci:3, addr:'Rajshahi',         bio:'Engineering exam prep.'   },
      { n:'Bristy Das',      g:'Female', dob:'1999-05-25', cls:'Bachelor(hons)',            grp:'Science',  roll:'ROLL021', ci:3, addr:'Rajshahi',         bio:'University student.'      },
      { n:'Mahim Khan',      g:'Male',   dob:'1999-08-12', cls:'Bachelor(hons)',            grp:'Commerce', roll:'ROLL022', ci:3, addr:'Rajshahi',         bio:'Wants to join civil service.' },
      { n:'Suchi Sarkar',    g:'Female', dob:'2000-02-18', cls:'Bachelor(pass)',            grp:'Arts',     roll:'ROLL023', ci:3, addr:'Rajshahi',         bio:'Social science student.'  },
      { n:'Raihan Ali',      g:'Male',   dob:'2000-10-30', cls:'Bachelor(pass)',            grp:'Science',  roll:'ROLL024', ci:3, addr:'Rajshahi',         bio:'Preparing for BUET.'      },
      // Gyaan (ci:4) — students 24-29
      { n:'Poly Begum',      g:'Female', dob:'2005-12-05', cls:'11-12(Higher Secondary)', grp:'Science',  roll:'ROLL025', ci:4, addr:'Khulna',           bio:'O Level achiever.'        },
      { n:'Jewel Hossain',   g:'Male',   dob:'2005-09-19', cls:'11-12(Higher Secondary)', grp:'Science',  roll:'ROLL026', ci:4, addr:'Khulna',           bio:'A Level physics student.' },
      { n:'Mitu Das',        g:'Female', dob:'2006-03-07', cls:'11-12(Higher Secondary)', grp:'Arts',     roll:'ROLL027', ci:4, addr:'Khulna',           bio:'Passionate about literature.' },
      { n:'Kayes Ahmed',     g:'Male',   dob:'2000-07-22', cls:'Masters',                  grp:'Science',  roll:'ROLL028', ci:4, addr:'Khulna',           bio:'GRE preparation.'         },
      { n:'Laboni Akter',    g:'Female', dob:'2001-01-14', cls:'Masters',                  grp:'Commerce', roll:'ROLL029', ci:4, addr:'Khulna',           bio:'MS program aspirant.'     },
      { n:'Tuhin Islam',     g:'Male',   dob:'2001-11-28', cls:'Bachelor(hons)',            grp:'Science',  roll:'ROLL030', ci:4, addr:'Khulna',           bio:'Engineering graduate.'    },
    ];
    const studentIds = [];
    for (let i=0;i<studentProfiles.length;i++) {
      const s = studentProfiles[i];
      const { rows:[{user_id}] } = await client.query(
        `INSERT INTO users
           (role_id,email,password_hash,name,phone,gender,date_of_birth,address,bio,
            roll_number,class,group_name,coaching_center_id,
            guardian_name,guardian_phone,is_email_verified,status)
         VALUES (5,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true,'active')
         RETURNING user_id`,
        [`student${i+1}@gmail.com`,PASS,s.n,`019${pad(i+100)}`,
         s.g,s.dob,s.addr,s.bio,s.roll,s.cls,s.grp,centerIds[s.ci],
         `Parent of ${s.n}`,`016${pad(i+100)}`]
      );
      studentIds.push(user_id);
    }
    console.log(`✅ ${studentIds.length} Students`);

    // ══════════════════════════════════════════════════════════════════
    // 7. PARENTS (10)
    // ══════════════════════════════════════════════════════════════════
    const parentProfiles = [
      { n:'Abdullah Ahmed',  g:'Male',   ci:0, child:'Alice Ahmed'   },
      { n:'Rahima Begum',    g:'Female', ci:0, child:'Bob Hossain'   },
      { n:'Kamal Hossain',   g:'Male',   ci:1, child:'Mitu Akter'    },
      { n:'Sufia Khatun',    g:'Female', ci:1, child:'Arif Rahman'   },
      { n:'Nazrul Islam',    g:'Male',   ci:2, child:'Tania Akter'   },
      { n:'Hosne Ara',       g:'Female', ci:2, child:'Imran Hossain' },
      { n:'Jalal Uddin',     g:'Male',   ci:3, child:'Urmi Khatun'   },
      { n:'Momtaz Begum',    g:'Female', ci:3, child:'Shohel Rana'   },
      { n:'Shamsul Haque',   g:'Male',   ci:4, child:'Poly Begum'    },
      { n:'Firoza Akter',    g:'Female', ci:4, child:'Jewel Hossain' },
    ];
    const parentIds = [];
    for (let i=0;i<parentProfiles.length;i++) {
      const p = parentProfiles[i];
      const { rows:[{user_id}] } = await client.query(
        `INSERT INTO users (role_id,email,password_hash,name,phone,gender,
                            is_email_verified,status,coaching_center_id,
                            bio)
         VALUES (6,$1,$2,$3,$4,$5,true,'active',$6,$7) RETURNING user_id`,
        [`parent${i+1}@gmail.com`,PASS,p.n,`016${pad(i+200)}`,p.g,
         centerIds[p.ci],`Guardian of ${p.child}`]
      );
      parentIds.push(user_id);
    }
    console.log(`✅ ${parentIds.length} Parents`);

    // ══════════════════════════════════════════════════════════════════
    // 8. COURSES (15) — using new schema columns
    // ══════════════════════════════════════════════════════════════════
    const courseProfiles = [
      // Excellence (ci:0)
      { ci:0, title:'HSC Science Complete',         desc:'Full HSC Science: Physics, Chemistry, Biology, Math',                    dur:'12 months', fee:5000,  start:'2024-01-15', end:'2024-12-15', enroll:'open',       status:'active'   },
      { ci:0, title:'SSC General Complete',          desc:'SSC General: all core subjects including Math, Science, English',        dur:'10 months', fee:3500,  start:'2024-02-01', end:'2024-11-30', enroll:'open',       status:'active'   },
      { ci:0, title:'HSC Business Studies',          desc:'Accounting, Business English, Finance, Economics',                       dur:'12 months', fee:4500,  start:'2024-01-20', end:'2024-12-20', enroll:'restricted', status:'active'   },
      // Alo (ci:1)
      { ci:1, title:'JSC Mathematics Special',       desc:'Intensive JSC Math: all chapters with practice sets',                    dur:'6 months',  fee:2000,  start:'2024-06-01', end:'2024-11-30', enroll:'open',       status:'active'   },
      { ci:1, title:'HSC Humanities Complete',       desc:'History, Civics, Bengali Literature, English',                           dur:'12 months', fee:4000,  start:'2024-01-10', end:'2024-12-10', enroll:'open',       status:'active'   },
      { ci:1, title:'SSC Science Intensive',         desc:'Crash course: Physics, Chemistry, Biology, Math for SSC',                dur:'10 months', fee:3800,  start:'2024-03-01', end:'2025-01-01', enroll:'restricted', status:'active'   },
      // Medhabi (ci:2)
      { ci:2, title:'Advanced English Speaking',     desc:'Fluency, pronunciation, communication and confidence building',          dur:'3 months',  fee:1500,  start:'2024-04-01', end:'2024-06-30', enroll:'open',       status:'active'   },
      { ci:2, title:'IELTS Complete Preparation',    desc:'Full IELTS: Reading, Writing, Listening, Speaking — Band 7+ target',    dur:'4 months',  fee:8000,  start:'2024-05-01', end:'2024-08-31', enroll:'restricted', status:'active'   },
      { ci:2, title:'Medical Admission Preparation', desc:'Biology, Chemistry, Physics for medical college entrance exam',          dur:'8 months',  fee:12000, start:'2024-01-01', end:'2024-08-31', enroll:'restricted', status:'active'   },
      // Proshno (ci:3)
      { ci:3, title:'Engineering Admission Prep',    desc:'Higher Math, Physics for BUET and engineering university admission',     dur:'8 months',  fee:10000, start:'2024-02-15', end:'2024-10-15', enroll:'restricted', status:'active'   },
      { ci:3, title:'BCS Complete Preparation',      desc:'GK, Bangla, English, Math, Science for Bangladesh Civil Service exam',   dur:'12 months', fee:6000,  start:'2024-01-05', end:'2024-12-05', enroll:'open',       status:'active'   },
      { ci:3, title:'Primary Education Support',     desc:'Classes 1-5: Math, English, Bangla support and exam coaching',           dur:'6 months',  fee:1200,  start:'2024-07-01', end:'2024-12-31', enroll:'open',       status:'active'   },
      // Gyaan (ci:4)
      { ci:4, title:'O Level Mathematics',           desc:'O Level Pure Mathematics and Statistics — CIE syllabus',                 dur:'9 months',  fee:7000,  start:'2024-03-01', end:'2024-11-30', enroll:'restricted', status:'active'   },
      { ci:4, title:'A Level Physics Complete',      desc:'A Level Mechanics, Waves, Electricity, Fields — CIE syllabus',           dur:'9 months',  fee:7500,  start:'2024-03-01', end:'2024-11-30', enroll:'restricted', status:'active'   },
      { ci:4, title:'GRE Complete Preparation',      desc:'GRE Quantitative Reasoning, Verbal, Analytical Writing',                 dur:'3 months',  fee:9000,  start:'2024-09-01', end:'2024-11-30', enroll:'open',       status:'active'   },
    ];
    const courseIds = [];
    for (const c of courseProfiles) {
      const { rows:[{course_id}] } = await client.query(
        `INSERT INTO course
           (coaching_center_id,course_title,course_description,duration,fee,
            start_date,end_date,enrollment_type,status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING course_id`,
        [centerIds[c.ci],c.title,c.desc,c.dur,c.fee,c.start,c.end,c.enroll,c.status]
      );
      courseIds.push(course_id);
    }
    console.log(`✅ ${courseIds.length} Courses`);

    // ══════════════════════════════════════════════════════════════════
    // 9. BATCHES (20)
    // ══════════════════════════════════════════════════════════════════
    const batchProfiles = [
      { ci:0, co:0,  name:'HSC Science Alpha',      code:'HSC-A-24',  type:'regular', shift:'morning', max:30, status:'running'   },
      { ci:0, co:0,  name:'HSC Science Beta',       code:'HSC-B-24',  type:'regular', shift:'evening', max:25, status:'running'   },
      { ci:0, co:1,  name:'SSC General 2024',       code:'SSC-G-24',  type:'regular', shift:'morning', max:35, status:'running'   },
      { ci:0, co:2,  name:'Business Studies Batch', code:'BUS-A-24',  type:'regular', shift:'day',     max:20, status:'upcoming'  },
      { ci:1, co:3,  name:'JSC Math Morning',       code:'JSC-M-24',  type:'regular', shift:'morning', max:40, status:'running'   },
      { ci:1, co:4,  name:'Humanities Alpha',       code:'HUM-A-24',  type:'regular', shift:'evening', max:25, status:'running'   },
      { ci:1, co:5,  name:'SSC Science Crash',      code:'SSC-C-24',  type:'crash',   shift:'morning', max:30, status:'running'   },
      { ci:2, co:6,  name:'English Batch A',        code:'ENG-A-24',  type:'weekend', shift:'morning', max:20, status:'running'   },
      { ci:2, co:7,  name:'IELTS Batch 1',          code:'IEL-1-24',  type:'regular', shift:'evening', max:15, status:'running'   },
      { ci:2, co:8,  name:'Medical Admission 2024', code:'MED-A-24',  type:'crash',   shift:'morning', max:50, status:'running'   },
      { ci:3, co:9,  name:'Engineering Alpha',      code:'ENG-A-24B', type:'regular', shift:'morning', max:40, status:'running'   },
      { ci:3, co:10, name:'BCS Batch A',            code:'BCS-A-24',  type:'regular', shift:'evening', max:30, status:'upcoming'  },
      { ci:3, co:11, name:'Primary Batch 2024',     code:'PRI-A-24',  type:'regular', shift:'morning', max:25, status:'running'   },
      { ci:4, co:12, name:'O Level Math Batch',     code:'OLM-A-24',  type:'regular', shift:'evening', max:20, status:'running'   },
      { ci:4, co:13, name:'A Level Physics Batch',  code:'ALP-A-24',  type:'regular', shift:'morning', max:15, status:'running'   },
      { ci:4, co:14, name:'GRE 2024 Batch',         code:'GRE-A-24',  type:'weekend', shift:'morning', max:20, status:'upcoming'  },
      { ci:0, co:0,  name:'HSC Science Gamma',      code:'HSC-G-24',  type:'crash',   shift:'night',   max:20, status:'completed' },
      { ci:1, co:5,  name:'SSC Science Batch 2',    code:'SSC-2-24',  type:'crash',   shift:'evening', max:30, status:'completed' },
      { ci:2, co:7,  name:'IELTS Batch 2',          code:'IEL-2-24',  type:'regular', shift:'morning', max:15, status:'upcoming'  },
      { ci:3, co:9,  name:'Engineering Beta',       code:'ENG-B-24',  type:'crash',   shift:'evening', max:35, status:'upcoming'  },
    ];
    const batchIds = [];
    for (const b of batchProfiles) {
      const { rows:[{batch_id}] } = await client.query(
        `INSERT INTO batch
           (course_id,coaching_center_id,batch_name,batch_code,
            start_date,end_date,batch_type,class_shift,max_students,status)
         VALUES ($1,$2,$3,$4,'2024-01-01','2024-12-31',$5,$6,$7,$8)
         RETURNING batch_id`,
        [courseIds[b.co],centerIds[b.ci],b.name,b.code,b.type,b.shift,b.max,b.status]
      );
      batchIds.push(batch_id);
    }
    console.log(`✅ ${batchIds.length} Batches`);

    // ══════════════════════════════════════════════════════════════════
    // 10. BATCH ENROLLMENTS
    // ══════════════════════════════════════════════════════════════════
    const enrollMap = [
      [0,[0,1,2,3,4,5]], [1,[0,1,2]], [2,[3,4,5]],
      [4,[6,7,8,9,10]],  [5,[6,7,8]], [6,[9,10,11]],
      [7,[12,13,14]],    [8,[12,13]], [9,[15,16,17]],
      [10,[18,19,20,21]],[12,[22,23]],[13,[24,25,26]],
      [14,[24,25]],      [16,[0,1]],  [17,[9,10]],
    ];
    for (const [bi,sis] of enrollMap) {
      for (const si of sis) {
        await client.query(
          `INSERT INTO batch_enrollment (batch_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [batchIds[bi],studentIds[si]]
        );
        await client.query(
          `UPDATE batch SET current_students=current_students+1 WHERE batch_id=$1`,[batchIds[bi]]
        );
      }
    }
    console.log('✅ Batch Enrollments');

    // ══════════════════════════════════════════════════════════════════
    // 11. SUBJECTS (30)
    // ══════════════════════════════════════════════════════════════════
    const subjectProfiles = [
      // Excellence ci:0
      { n:'Mathematics',             code:'MATH101', co:0,  ti:0,  ci:0 },
      { n:'Physics',                 code:'PHY101',  co:0,  ti:1,  ci:0 },
      { n:'Chemistry',               code:'CHEM101', co:0,  ti:1,  ci:0 },
      { n:'Biology',                 code:'BIO101',  co:0,  ti:1,  ci:0 },
      { n:'English',                 code:'ENG101',  co:0,  ti:2,  ci:0 },
      { n:'Bengali',                 code:'BEN101',  co:1,  ti:2,  ci:0 },
      { n:'General Mathematics',     code:'GMAT101', co:1,  ti:0,  ci:0 },
      { n:'Accounting',              code:'ACC101',  co:2,  ti:2,  ci:0 },
      { n:'Business English',        code:'BENG101', co:2,  ti:2,  ci:0 },
      // Alo ci:1
      { n:'Higher Mathematics',      code:'HMAT101', co:3,  ti:3,  ci:1 },
      { n:'Physics Advanced',        code:'PHYA101', co:4,  ti:4,  ci:1 },
      { n:'History',                 code:'HIST101', co:4,  ti:5,  ci:1 },
      { n:'SSC Physics',             code:'SPHY101', co:5,  ti:4,  ci:1 },
      { n:'SSC Chemistry',           code:'SCHE101', co:5,  ti:5,  ci:1 },
      // Medhabi ci:2
      { n:'Communication English',   code:'CENG101', co:6,  ti:6,  ci:2 },
      { n:'IELTS Reading',           code:'IREAD101',co:7,  ti:7,  ci:2 },
      { n:'IELTS Writing',           code:'IWRIT101',co:7,  ti:7,  ci:2 },
      { n:'IELTS Listening',         code:'ILIST101',co:7,  ti:6,  ci:2 },
      { n:'Medical Biology',         code:'MBIO101', co:8,  ti:8,  ci:2 },
      { n:'Medical Chemistry',       code:'MCHE101', co:8,  ti:8,  ci:2 },
      // Proshno ci:3
      { n:'Engineering Mathematics', code:'EMAT101', co:9,  ti:9,  ci:3 },
      { n:'Engineering Physics',     code:'EPHY101', co:9,  ti:10, ci:3 },
      { n:'BCS General Knowledge',   code:'BCSGK101',co:10, ti:11, ci:3 },
      { n:'BCS Mathematics',         code:'BCSM101', co:10, ti:9,  ci:3 },
      { n:'Primary Mathematics',     code:'PMAT101', co:11, ti:12, ci:3 },
      // Gyaan ci:4
      { n:'O Level Math Pure',       code:'OLMP101', co:12, ti:12, ci:4 },
      { n:'O Level Math Statistics', code:'OLMS101', co:12, ti:12, ci:4 },
      { n:'A Level Mechanics',       code:'ALPM101', co:13, ti:13, ci:4 },
      { n:'A Level Waves',           code:'ALPW101', co:13, ti:13, ci:4 },
      { n:'GRE Quantitative',        code:'GREQ101', co:14, ti:14, ci:4 },
    ];
    const subjectIds = [];
    for (const s of subjectProfiles) {
      const { rows:[{subject_id}] } = await client.query(
        `INSERT INTO subjects
           (course_id,coaching_center_id,teacher_user_id,subject_name,subject_code,assigned_date,is_active)
         VALUES ($1,$2,$3,$4,$5,NOW(),true) RETURNING subject_id`,
        [courseIds[s.co],centerIds[s.ci],teacherIds[s.ti],s.n,s.code]
      );
      subjectIds.push(subject_id);
    }
    console.log(`✅ ${subjectIds.length} Subjects`);

    // ══════════════════════════════════════════════════════════════════
    // 12. TEACHER APPLICATIONS (new table)
    // ══════════════════════════════════════════════════════════════════
    const appData = [
      { ci:0, ti:0, spec:'Mathematics, Physics',   exp:10, sal:45000, status:'approved', bio:'Experienced math and physics educator seeking position at Excellence.' },
      { ci:0, ti:1, spec:'Chemistry, Biology',     exp:7,  sal:38000, status:'approved', bio:'Chemistry specialist with lab teaching experience.'                    },
      { ci:0, ti:2, spec:'English, Bengali',       exp:8,  sal:35000, status:'approved', bio:'Language arts teacher with coaching experience.'                       },
      { ci:1, ti:3, spec:'Mathematics',            exp:9,  sal:42000, status:'approved', bio:'Mathematics teacher with strong SSC/HSC record.'                       },
      { ci:1, ti:4, spec:'Physics, Chemistry',     exp:11, sal:40000, status:'approved', bio:'Former BUET lecturer applying to Alo.'                                 },
      { ci:1, ti:5, spec:'Biology',                exp:5,  sal:32000, status:'approved', bio:'Part-time biology teacher and MBBS student.'                           },
      { ci:2, ti:6, spec:'Mathematics, ICT',       exp:6,  sal:36000, status:'approved', bio:'Software background, strong in applied math.'                          },
      { ci:2, ti:7, spec:'English, IELTS',         exp:4,  sal:30000, status:'approved', bio:'IELTS 8.5 certified trainer.'                                          },
      { ci:3, ti:9, spec:'Bengali Literature',     exp:6,  sal:31000, status:'approved', bio:'Published author applying to Proshno.'                                 },
      { ci:3, ti:10,spec:'Physics',                exp:8,  sal:39000, status:'approved', bio:'Physics specialist for engineering prep.'                              },
      { ci:4, ti:12,spec:'Mathematics, Statistics',exp:12, sal:43000, status:'approved', bio:'O and A Level math specialist at Gyaan.'                               },
      { ci:4, ti:13,spec:'Biology, English',       exp:5,  sal:33000, status:'approved', bio:'Biology and English for A Level students.'                             },
      // Pending applications
      { ci:0, ti:6, spec:'ICT, Web Development',   exp:3,  sal:28000, status:'pending',  bio:'Web developer seeking to teach ICT at Excellence.'                     },
      { ci:1, ti:7, spec:'English Literature',     exp:2,  sal:25000, status:'pending',  bio:'Recent graduate applying for English position.'                        },
      { ci:2, ti:9, spec:'History, Social Science',exp:3,  sal:27000, status:'rejected', bio:'Applied for history position at Medhabi.'                              },
    ];
    for (const a of appData) {
      await client.query(
        `INSERT INTO teacher_applications
           (coaching_center_id,teacher_user_id,subjects_specialization,
            experience_years,bio,expected_salary,status,reviewed_by,reviewed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT DO NOTHING`,
        [centerIds[a.ci],teacherIds[a.ti],a.spec,a.exp,a.bio,a.sal,a.status,
         a.status!=='pending'?adminIds[a.ci]:null,
         a.status!=='pending'?new Date():null]
      );
    }
    console.log(`✅ ${appData.length} Teacher Applications`);

    // ══════════════════════════════════════════════════════════════════
    // 13. TEACHER COURSE ASSIGNMENTS (new table)
    // ══════════════════════════════════════════════════════════════════
    // Format: [ci, co, subjectIdx, teacherIdx, adminIdx]
    // teacherIdx must be 0-14 (15 teachers total)
    const assignData = [
      // Excellence (ci:0) — teachers 0,1,2
      [0, 0,  0,  0, 0],  // Math     → teacher 0 (Anisur)
      [0, 0,  1,  1, 0],  // Physics  → teacher 1 (Fatema)
      [0, 0,  2,  1, 0],  // Chem     → teacher 1
      [0, 0,  3,  1, 0],  // Bio      → teacher 1
      [0, 0,  4,  2, 0],  // English  → teacher 2 (Mizanur)
      [0, 1,  5,  2, 0],  // Bengali  → teacher 2
      [0, 1,  6,  0, 0],  // Gen Math → teacher 0
      [0, 2,  7,  2, 0],  // Acct     → teacher 2
      [0, 2,  8,  2, 0],  // Biz Eng  → teacher 2
      // Alo (ci:1) — teachers 3,4,5
      [1, 3,  9,  3, 1],  // Higher Math → teacher 3 (Sumaiya)
      [1, 4, 10,  4, 1],  // Physics Adv → teacher 4 (Abdur)
      [1, 4, 11,  5, 1],  // History     → teacher 5 (Nasrin)
      [1, 5, 12,  4, 1],  // SSC Physics → teacher 4
      [1, 5, 13,  5, 1],  // SSC Chem    → teacher 5
      // Medhabi (ci:2) — teachers 6,7,8
      [2, 6, 14,  6, 2],  // Comm Eng → teacher 6 (Kamrul)
      [2, 7, 15,  7, 2],  // IELTS R  → teacher 7 (Roksana)
      [2, 7, 16,  7, 2],  // IELTS W  → teacher 7
      [2, 7, 17,  6, 2],  // IELTS L  → teacher 6
      [2, 8, 18,  8, 2],  // Med Bio  → teacher 8 (Shahadat — using index 8)
      [2, 8, 19,  8, 2],  // Med Chem → teacher 8
      // Proshno (ci:3) — teachers 9,10,11
      [3, 9, 20,  9, 3],  // Eng Math → teacher 9 (Moriom)
      [3, 9, 21, 10, 3],  // Eng Phys → teacher 10 (Jahirul)
      [3,10, 22, 11, 3],  // BCS GK   → teacher 11 (Tania)
      [3,10, 23,  9, 3],  // BCS Math → teacher 9
      [3,11, 24,  9, 3],  // Prim Mat → teacher 9
      // Gyaan (ci:4) — teachers 12,13,14
      [4,12, 25, 12, 4],  // OL Math Pure  → teacher 12 (Rafiqul)
      [4,12, 26, 12, 4],  // OL Math Stats → teacher 12
      [4,13, 27, 13, 4],  // AL Mechanics  → teacher 13 (Dilruba)
      [4,13, 28, 13, 4],  // AL Waves      → teacher 13
      [4,14, 29, 14, 4],  // GRE Quant    → teacher 14 (Mahbubur)
    ];
    // [ci, co, subjectIdx, teacherIdx, adminIdx]
    for (const [ci, co, si, ti, ai] of assignData) {
      await client.query(
        `INSERT INTO teacher_course_assignments
           (teacher_id,course_id,subject_id,assigned_by,status)
         VALUES ($1,$2,$3,$4,'active')
         ON CONFLICT DO NOTHING`,
        [teacherIds[ti], courseIds[co], subjectIds[si], adminIds[ai]]
      );
    }
    console.log(`✅ ${assignData.length} Teacher Course Assignments`);

    // ══════════════════════════════════════════════════════════════════
    // 14. COURSE ENROLLMENTS (new table)
    // ══════════════════════════════════════════════════════════════════
    const ceData = [
      // [co, studentIdx, status, amount]
      [0,0,'active',5000],[0,1,'active',5000],[0,2,'active',5000],
      [0,3,'active',5000],[0,4,'active',5000],[0,5,'active',5000],
      [1,3,'active',3500],[1,4,'active',3500],[1,5,'pending',0],
      [2,0,'active',4500],[2,1,'active',4500],
      [3,6,'active',2000],[3,7,'active',2000],[3,8,'active',2000],
      [3,9,'active',2000],[3,10,'active',2000],
      [4,6,'active',4000],[4,7,'active',4000],[4,8,'active',4000],
      [5,9,'active',3800],[5,10,'active',3800],[5,11,'active',3800],
      [6,12,'active',1500],[6,13,'active',1500],[6,14,'active',1500],
      [7,12,'active',8000],[7,13,'active',8000],
      [8,15,'active',12000],[8,16,'active',12000],[8,17,'active',12000],
      [9,18,'active',10000],[9,19,'active',10000],[9,20,'active',10000],[9,21,'active',10000],
      [10,18,'active',6000],[10,19,'active',6000],[10,22,'active',6000],[10,23,'active',6000],
      [11,22,'active',1200],[11,23,'active',1200],
      [12,24,'active',7000],[12,25,'active',7000],[12,26,'active',7000],
      [13,24,'active',7500],[13,25,'active',7500],
      [14,27,'active',9000],[14,28,'active',9000],[14,29,'active',9000],
    ];
    for (const [co,si,status,amount] of ceData) {
      await client.query(
        `INSERT INTO course_enrollments (course_id,student_id,status,enrolled_at,paid_at,amount_paid,expires_at)
         VALUES ($1,$2,$3,NOW(),$4,$5,NOW()+INTERVAL '1 year')
         ON CONFLICT DO NOTHING`,
        [courseIds[co],studentIds[si],status,
         amount>0?new Date():null, amount]
      );
    }
    console.log(`✅ ${ceData.length} Course Enrollments`);

    // ══════════════════════════════════════════════════════════════════
    // 15. QUESTIONS (160+)
    // ══════════════════════════════════════════════════════════════════
    // Helper to build question rows
    // MCQ:        { ci,si,co,cls,paper,ch,chn,topic,text,diff,a,b,c,d,correct,marks,ti,src,expl }
    // T/F:        { ci,si,co,cls,paper,ch,chn,topic,text,diff,correct,marks,ti,src,expl }
    // Descriptive:{ ci,si,co,cls,paper,ch,chn,topic,text,diff,answer,marks,ti,src }

    const mcqRows = [
      // ─── MATHEMATICS (si:0) HSC ci:0 ──────────────────────────────
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Real Numbers',topic:'Number System',
       text:'Which of the following is an irrational number?',diff:'easy',a:'√4',b:'√9',c:'√2',d:'22/7',correct:'C',marks:1,ti:0,src:'manual',
       expl:'√2 cannot be expressed as p/q. √4=2, √9=3, 22/7 are rational.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Real Numbers',topic:'HCF and LCM',
       text:'HCF of 36 and 48 is:',diff:'easy',a:'6',b:'12',c:'18',d:'24',correct:'B',marks:1,ti:0,src:'manual',
       expl:'36=2²×3², 48=2⁴×3. HCF=2²×3=12.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Real Numbers',topic:'HCF and LCM',
       text:'LCM of 12 and 18 is:',diff:'easy',a:'24',b:'36',c:'48',d:'60',correct:'B',marks:1,ti:0,src:'manual',
       expl:'12=2²×3, 18=2×3². LCM=2²×3²=36.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Algebra',topic:'Quadratic Equations',
       text:'If x²−5x+6=0, the roots are:',diff:'medium',a:'1 and 6',b:'2 and 3',c:'1 and 5',d:'3 and 4',correct:'B',marks:2,ti:0,src:'manual',
       expl:'Factor: (x-2)(x-3)=0 → x=2 or x=3.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Algebra',topic:'Quadratic Equations',
       text:'Discriminant of ax²+bx+c=0 is:',diff:'medium',a:'b²+4ac',b:'b²−4ac',c:'4ac−b²',d:'√(b²−4ac)',correct:'B',marks:2,ti:0,src:'manual',
       expl:'b²−4ac determines the nature of roots.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'3',chn:'Trigonometry',topic:'Identities',
       text:'sin²θ + cos²θ = ?',diff:'easy',a:'0',b:'1',c:'2',d:'-1',correct:'B',marks:1,ti:0,src:'manual',
       expl:'Fundamental Pythagorean identity.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'3',chn:'Trigonometry',topic:'Ratios',
       text:'sin(90°) = ?',diff:'easy',a:'0',b:'1',c:'-1',d:'√2/2',correct:'B',marks:1,ti:0,src:'manual',
       expl:'At 90°, sin reaches its maximum value of 1.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'3',chn:'Trigonometry',topic:'Ratios',
       text:'cos(60°) = ?',diff:'easy',a:'√3/2',b:'1/2',c:'1',d:'0',correct:'B',marks:1,ti:0,src:'manual',
       expl:'Standard trigonometric value.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'4',chn:'Calculus',topic:'Differentiation',
       text:'Derivative of x³ with respect to x is:',diff:'medium',a:'2x',b:'3x²',c:'x²',d:'3x',correct:'B',marks:2,ti:0,src:'manual',
       expl:'Power rule: d/dx(xⁿ) = nxⁿ⁻¹.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'4',chn:'Calculus',topic:'Integration',
       text:'∫sin(x)dx = ?',diff:'medium',a:'cos(x)+C',b:'-cos(x)+C',c:'sin(x)+C',d:'-sin(x)+C',correct:'B',marks:2,ti:0,src:'manual',
       expl:'Standard integral of sin(x).'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'4',chn:'Calculus',topic:'Integration',
       text:'∫x² dx = ?',diff:'medium',a:'x³+C',b:'x³/3+C',c:'2x',d:'x²/2+C',correct:'B',marks:2,ti:0,src:'manual',
       expl:'Power rule of integration: xⁿ⁺¹/(n+1)+C.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'5',chn:'Coordinate Geometry',topic:'Lines',
       text:'Slope of line y = 2x + 5 is:',diff:'easy',a:'5',b:'2',c:'1',d:'3',correct:'B',marks:1,ti:0,src:'manual',
       expl:'In y=mx+c form, m is the slope.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'5',chn:'Coordinate Geometry',topic:'Distance',
       text:'Distance between (0,0) and (3,4) is:',diff:'medium',a:'4',b:'5',c:'7',d:'6',correct:'B',marks:2,ti:0,src:'manual',
       expl:'√(3²+4²)=√25=5. Classic 3-4-5 triangle.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'5',chn:'Coordinate Geometry',topic:'Circle',
       text:'Area of circle with radius 7 is:',diff:'easy',a:'22π',b:'49π',c:'14π',d:'77π',correct:'B',marks:1,ti:0,src:'manual',
       expl:'A = πr² = π × 7² = 49π.'},
      // AI generated math questions
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Algebra',topic:'Logarithms',
       text:'log₂(32) = ?',diff:'medium',a:'4',b:'5',c:'6',d:'3',correct:'B',marks:2,ti:0,src:'ai_generated',
       expl:'2⁵=32, so log₂(32)=5.'},
      {ci:0,si:0,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'4',chn:'Calculus',topic:'Limits',
       text:'lim(x→0) sin(x)/x = ?',diff:'hard',a:'0',b:'1',c:'∞',d:'undefined',correct:'B',marks:3,ti:0,src:'ai_generated',
       expl:'Standard limit result: lim sin(x)/x = 1 as x→0.'},

      // ─── PHYSICS (si:1) HSC ci:0 ─────────────────────────────────
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Mechanics',topic:'Newton\'s Laws',
       text:'Newton\'s 2nd law: F = ?',diff:'easy',a:'mv',b:'ma',c:'m/a',d:'a/m',correct:'B',marks:1,ti:1,src:'manual',
       expl:'F=ma — Force equals mass times acceleration.'},
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Mechanics',topic:'Newton\'s Laws',
       text:'Body of 5kg acted on by 20N. Acceleration = ?',diff:'medium',a:'2 m/s²',b:'4 m/s²',c:'10 m/s²',d:'100 m/s²',correct:'B',marks:2,ti:1,src:'manual',
       expl:'a=F/m=20/5=4 m/s².'},
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Mechanics',topic:'Units',
       text:'SI unit of force is:',diff:'easy',a:'Watt',b:'Newton',c:'Joule',d:'Pascal',correct:'B',marks:1,ti:1,src:'manual',
       expl:'Force is measured in Newtons (N) in SI system.'},
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Mechanics',topic:'Gravity',
       text:'Acceleration due to gravity on Earth is approximately:',diff:'easy',a:'8.9 m/s²',b:'9.8 m/s²',c:'10.8 m/s²',d:'11.8 m/s²',correct:'B',marks:1,ti:1,src:'manual',
       expl:'g ≈ 9.8 m/s² at Earth\'s surface.'},
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Mechanics',topic:'Work Energy',
       text:'Work done = Force × ?',diff:'easy',a:'Time',b:'Displacement',c:'Mass',d:'Velocity',correct:'B',marks:1,ti:1,src:'manual',
       expl:'W = F × d (displacement in direction of force).'},
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Waves',topic:'Sound',
       text:'Speed of sound in air at room temperature is approximately:',diff:'easy',a:'100 m/s',b:'343 m/s',c:'1500 m/s',d:'3×10⁸ m/s',correct:'B',marks:1,ti:1,src:'manual',
       expl:'343 m/s at 20°C. Faster in water (1500), instant in light.'},
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Waves',topic:'Frequency',
       text:'SI unit of frequency is:',diff:'easy',a:'Meter',b:'Hertz',c:'Newton',d:'Pascal',correct:'B',marks:1,ti:1,src:'manual',
       expl:'Frequency = cycles/second = Hertz (Hz).'},
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'3',chn:'Optics',topic:'Refraction',
       text:'Light passes from air into glass. Its speed:',diff:'medium',a:'Increases',b:'Stays same',c:'Decreases',d:'Becomes zero',correct:'C',marks:2,ti:1,src:'manual',
       expl:'Denser medium: lower speed. Glass is denser than air.'},
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'3',chn:'Optics',topic:'Light',
       text:'Speed of light in vacuum is:',diff:'easy',a:'2×10⁸ m/s',b:'3×10⁸ m/s',c:'4×10⁸ m/s',d:'1×10⁸ m/s',correct:'B',marks:1,ti:1,src:'manual',
       expl:'c = 3×10⁸ m/s (approx 300,000 km/s).'},
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'4',chn:'Electricity',topic:'Ohm\'s Law',
       text:'Ohm\'s law: V = ?',diff:'easy',a:'I/R',b:'IR',c:'I+R',d:'I-R',correct:'B',marks:1,ti:1,src:'manual',
       expl:'Voltage = Current × Resistance. V=IR.'},
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'4',chn:'Electricity',topic:'Units',
       text:'SI unit of electric current is:',diff:'easy',a:'Volt',b:'Ampere',c:'Ohm',d:'Watt',correct:'B',marks:1,ti:1,src:'manual',
       expl:'Current is measured in Amperes (A).'},
      {ci:0,si:1,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Mechanics',topic:'Energy',
       text:'Kinetic energy formula is:',diff:'medium',a:'mgh',b:'½mv²',c:'mv',d:'F×d',correct:'B',marks:2,ti:1,src:'ai_generated',
       expl:'KE = ½mv². Depends on mass and square of velocity.'},

      // ─── CHEMISTRY (si:2) HSC ci:0 ───────────────────────────────
      {ci:0,si:2,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Atomic Structure',topic:'Periodic Table',
       text:'Atomic number of Carbon is:',diff:'easy',a:'4',b:'6',c:'8',d:'12',correct:'B',marks:1,ti:1,src:'manual',
       expl:'Carbon has 6 protons, so atomic number = 6.'},
      {ci:0,si:2,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Atomic Structure',topic:'Electron Config',
       text:'Valence electrons of Sodium (Na) is:',diff:'easy',a:'1',b:'2',c:'3',d:'4',correct:'A',marks:1,ti:1,src:'manual',
       expl:'Na configuration: 2,8,1. One valence electron.'},
      {ci:0,si:2,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Atomic Structure',topic:'Periodic Table',
       text:'Chemical symbol for Gold is:',diff:'medium',a:'Go',b:'Au',c:'Ag',d:'Gd',correct:'B',marks:2,ti:1,src:'manual',
       expl:'Au from Latin "Aurum" meaning gold.'},
      {ci:0,si:2,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Chemical Bonding',topic:'Covalent Bond',
       text:'Bond type in H₂O molecule:',diff:'medium',a:'Ionic',b:'Covalent',c:'Metallic',d:'Van der Waals',correct:'B',marks:2,ti:1,src:'manual',
       expl:'Water molecules share electrons — covalent bond.'},
      {ci:0,si:2,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'3',chn:'Acids Bases Salts',topic:'pH Scale',
       text:'pH of pure water at 25°C is:',diff:'easy',a:'5',b:'7',c:'9',d:'11',correct:'B',marks:1,ti:1,src:'manual',
       expl:'Pure water is neutral — pH = 7.'},
      {ci:0,si:2,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'4',chn:'Gases',topic:'Gas Composition',
       text:'Most abundant gas in the atmosphere:',diff:'easy',a:'Oxygen',b:'Nitrogen',c:'CO₂',d:'Hydrogen',correct:'B',marks:1,ti:1,src:'manual',
       expl:'Nitrogen makes up ~78% of atmosphere.'},
      {ci:0,si:2,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'4',chn:'Gases',topic:'Molecular Weight',
       text:'Molecular weight of CO₂:',diff:'medium',a:'40',b:'44',c:'48',d:'52',correct:'B',marks:2,ti:1,src:'manual',
       expl:'C=12, O=16×2=32. Total=44.'},
      {ci:0,si:2,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'5',chn:'Chemical Kinetics',topic:'Catalysts',
       text:'A catalyst works by:',diff:'medium',a:'Increasing temperature',b:'Lowering activation energy',c:'Increasing pressure',d:'Creating products',correct:'B',marks:2,ti:1,src:'manual',
       expl:'Catalyst provides alternative reaction pathway with lower Ea.'},
      {ci:0,si:2,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'6',chn:'Electrochemistry',topic:'Salts',
       text:'NaCl is an example of:',diff:'easy',a:'Acid',b:'Base',c:'Salt',d:'Oxide',correct:'C',marks:1,ti:1,src:'manual',
       expl:'NaCl (Sodium Chloride) = salt from NaOH + HCl.'},
      {ci:0,si:2,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'5',chn:'Chemical Kinetics',topic:'Reaction Rate',
       text:'Increasing temperature generally:',diff:'easy',a:'Decreases reaction rate',b:'Increases reaction rate',c:'Has no effect',d:'Stops reaction',correct:'B',marks:1,ti:1,src:'ai_generated',
       expl:'Higher temperature = more kinetic energy = more successful collisions.'},

      // ─── BIOLOGY (si:3) HSC ci:0 ─────────────────────────────────
      {ci:0,si:3,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Cell Biology',topic:'Cell Organelles',
       text:'Powerhouse of the cell is:',diff:'easy',a:'Nucleus',b:'Mitochondria',c:'Ribosome',d:'Chloroplast',correct:'B',marks:1,ti:1,src:'manual',
       expl:'Mitochondria produce ATP — the cell\'s energy currency.'},
      {ci:0,si:3,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Cell Biology',topic:'Cell Organelles',
       text:'Photosynthesis occurs in:',diff:'easy',a:'Mitochondria',b:'Chloroplast',c:'Nucleus',d:'Ribosome',correct:'B',marks:1,ti:1,src:'manual',
       expl:'Chloroplasts contain chlorophyll for photosynthesis.'},
      {ci:0,si:3,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Genetics',topic:'DNA',
       text:'DNA stands for:',diff:'easy',a:'Deoxyribose Nucleic',b:'Deoxyribonucleic Acid',c:'Diribonucleic Acid',d:'Dinucleic Acid',correct:'B',marks:1,ti:1,src:'manual',
       expl:'DNA = Deoxyribonucleic Acid. Carries genetic information.'},
      {ci:0,si:3,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Genetics',topic:'Chromosomes',
       text:'Normal human body cells have how many chromosomes?',diff:'medium',a:'44',b:'46',c:'48',d:'50',correct:'B',marks:2,ti:1,src:'manual',
       expl:'Humans have 46 chromosomes (23 pairs) in somatic cells.'},
      {ci:0,si:3,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'4',chn:'Cell Division',topic:'Mitosis',
       text:'Mitosis produces:',diff:'medium',a:'4 haploid cells',b:'2 identical diploid cells',c:'2 haploid cells',d:'4 diploid cells',correct:'B',marks:2,ti:1,src:'manual',
       expl:'Mitosis: cell division for growth/repair → 2 identical cells.'},
      {ci:0,si:3,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'3',chn:'Human Biology',topic:'Blood',
       text:'Red blood cells are produced in:',diff:'medium',a:'Liver',b:'Bone marrow',c:'Kidney',d:'Heart',correct:'B',marks:2,ti:1,src:'manual',
       expl:'Erythropoiesis (RBC production) occurs in red bone marrow.'},

      // ─── ENGLISH (si:4) ci:0 ─────────────────────────────────────
      {ci:0,si:4,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Grammar',topic:'Subject-Verb Agreement',
       text:'Which sentence is grammatically correct?',diff:'easy',a:'She go to school',b:'She goes to school',c:'She going to school',d:'She gone to school',correct:'B',marks:1,ti:2,src:'manual',
       expl:'3rd person singular present tense: goes (not go).'},
      {ci:0,si:4,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Grammar',topic:'Tenses',
       text:'"I have eaten" is in which tense?',diff:'medium',a:'Simple Past',b:'Present Perfect',c:'Past Perfect',d:'Future Perfect',correct:'B',marks:2,ti:2,src:'manual',
       expl:'Have/has + past participle = Present Perfect.'},
      {ci:0,si:4,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Vocabulary',topic:'Antonyms',
       text:'Antonym of "happy" is:',diff:'easy',a:'Joyful',b:'Sad',c:'Glad',d:'Pleased',correct:'B',marks:1,ti:2,src:'manual',
       expl:'Antonym = opposite in meaning. Happy ↔ Sad.'},
      {ci:0,si:4,co:0,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Grammar',topic:'Plurals',
       text:'Plural of "child" is:',diff:'easy',a:'childs',b:'children',c:'childes',d:'child',correct:'B',marks:1,ti:2,src:'manual',
       expl:'Irregular plural: child → children.'},
      {ci:0,si:4,co:0,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'3',chn:'Grammar',topic:'Passive Voice',
       text:'Passive voice of "The teacher taught the lesson":',diff:'medium',a:'The lesson taught the teacher',b:'The lesson was taught by the teacher',c:'The lesson is taught',d:'The teacher was teaching',correct:'B',marks:2,ti:2,src:'manual',
       expl:'Active to passive: object becomes subject + was/were + past participle + by + agent.'},

      // ─── BENGALI (si:5) SSC ci:0 ─────────────────────────────────
      {ci:0,si:5,co:1,cls:'9-10 (Secondary)',paper:'1st',ch:'1',chn:'Literature',topic:'Bengali Literature',
       text:'রবীন্দ্রনাথ ঠাকুর নোবেল পুরস্কার পান কত সালে?',diff:'medium',a:'1910',b:'1913',c:'1915',d:'1920',correct:'B',marks:2,ti:2,src:'manual',
       expl:'রবীন্দ্রনাথ ১৯১৩ সালে গীতাঞ্জলির জন্য নোবেল পান।'},
      {ci:0,si:5,co:1,cls:'9-10 (Secondary)',paper:'1st',ch:'1',chn:'Language',topic:'Bengali Alphabet',
       text:'বাংলা বর্ণমালায় স্বরবর্ণ কতটি?',diff:'easy',a:'10',b:'11',c:'12',d:'13',correct:'B',marks:1,ti:2,src:'manual',
       expl:'বাংলা স্বরবর্ণ: অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ = ১১টি।'},
      {ci:0,si:5,co:1,cls:'9-10 (Secondary)',paper:'2nd',ch:'3',chn:'Language',topic:'Grammar',
       text:'বাংলায় কারক কয়টি?',diff:'medium',a:'৪',b:'৬',c:'৮',d:'৫',correct:'B',marks:2,ti:2,src:'manual',
       expl:'বাংলায় ৬টি কারক: কর্তা, কর্ম, করণ, সম্প্রদান, অপাদান, অধিকরণ।'},

      // ─── GENERAL MATHEMATICS (si:6) SSC ci:0 ────────────────────
      {ci:0,si:6,co:1,cls:'9-10 (Secondary)',paper:'1st',ch:'1',chn:'Arithmetic',topic:'Percentage',
       text:'15% of 200 is:',diff:'easy',a:'25',b:'30',c:'35',d:'40',correct:'B',marks:1,ti:0,src:'manual',
       expl:'15/100 × 200 = 30.'},
      {ci:0,si:6,co:1,cls:'9-10 (Secondary)',paper:'1st',ch:'2',chn:'Algebra',topic:'Simple Equations',
       text:'If 2x = 10, then x = ?',diff:'easy',a:'4',b:'5',c:'6',d:'7',correct:'B',marks:1,ti:0,src:'manual',
       expl:'x = 10/2 = 5.'},
      {ci:0,si:6,co:1,cls:'9-10 (Secondary)',paper:'2nd',ch:'4',chn:'Percentage',topic:'Profit and Loss',
       text:'Buy at ৳100, sell at ৳120. Profit % is:',diff:'medium',a:'10%',b:'20%',c:'25%',d:'15%',correct:'B',marks:2,ti:0,src:'manual',
       expl:'Profit=20, Cost=100, Profit%=(20/100)×100=20%.'},

      // ─── ACCOUNTING (si:7) Business ci:0 ────────────────────────
      {ci:0,si:7,co:2,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Double Entry',topic:'Debit Credit',
       text:'In double-entry bookkeeping, every transaction affects at least:',diff:'medium',a:'1 account',b:'2 accounts',c:'3 accounts',d:'4 accounts',correct:'B',marks:2,ti:2,src:'manual',
       expl:'Every debit has a corresponding credit — 2 accounts minimum.'},
      {ci:0,si:7,co:2,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Introduction',topic:'Assets',
       text:'Land and building are examples of:',diff:'easy',a:'Current assets',b:'Fixed assets',c:'Liabilities',d:'Revenue',correct:'B',marks:1,ti:2,src:'manual',
       expl:'Fixed (non-current) assets are long-term tangible assets.'},

      // ─── HIGHER MATHEMATICS (si:9) JSC ci:1 ─────────────────────
      {ci:1,si:9,co:3,cls:'9-10 (Secondary)',paper:'1st',ch:'1',chn:'Arithmetic',topic:'LCM HCF',
       text:'LCM of 12 and 18 is:',diff:'easy',a:'24',b:'36',c:'48',d:'60',correct:'B',marks:1,ti:3,src:'manual',
       expl:'LCM=36. 12=2²×3, 18=2×3². LCM=2²×3²=36.'},
      {ci:1,si:9,co:3,cls:'9-10 (Secondary)',paper:'1st',ch:'1',chn:'Arithmetic',topic:'LCM HCF',
       text:'HCF of 24 and 36 is:',diff:'easy',a:'6',b:'12',c:'18',d:'24',correct:'B',marks:1,ti:3,src:'manual',
       expl:'24=2³×3, 36=2²×3². HCF=2²×3=12.'},
      {ci:1,si:9,co:3,cls:'9-10 (Secondary)',paper:'1st',ch:'2',chn:'Algebra',topic:'Linear Equations',
       text:'3x + 7 = 22. x = ?',diff:'easy',a:'3',b:'5',c:'7',d:'9',correct:'B',marks:1,ti:3,src:'manual',
       expl:'3x=15, x=5.'},
      {ci:1,si:9,co:3,cls:'9-10 (Secondary)',paper:'1st',ch:'3',chn:'Geometry',topic:'Area',
       text:'Area of rectangle 5×8 = ?',diff:'easy',a:'13',b:'40',c:'30',d:'20',correct:'B',marks:1,ti:3,src:'manual',
       expl:'Area = length × width = 5×8 = 40.'},
      {ci:1,si:9,co:3,cls:'9-10 (Secondary)',paper:'2nd',ch:'4',chn:'Statistics',topic:'Mean',
       text:'Mean of 2, 4, 6, 8, 10 is:',diff:'easy',a:'4',b:'5',c:'6',d:'7',correct:'C',marks:1,ti:3,src:'manual',
       expl:'Sum=30, Count=5, Mean=30/5=6.'},

      // ─── PHYSICS ADVANCED (si:10) Humanities ci:1 ───────────────
      {ci:1,si:10,co:4,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Mechanics',topic:'Energy',
       text:'Kinetic energy formula:',diff:'medium',a:'mgh',b:'½mv²',c:'mv',d:'F×d',correct:'B',marks:2,ti:4,src:'manual',
       expl:'KE = ½mv². m=mass, v=velocity.'},
      {ci:1,si:10,co:4,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'4',chn:'Electromagnetism',topic:'Induction',
       text:'Electromagnetic induction was discovered by:',diff:'hard',a:'Newton',b:'Faraday',c:'Ohm',d:'Ampere',correct:'B',marks:3,ti:4,src:'manual',
       expl:'Michael Faraday discovered electromagnetic induction in 1831.'},

      // ─── HISTORY (si:11) Humanities ci:1 ────────────────────────
      {ci:1,si:11,co:4,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'World History',topic:'Revolutions',
       text:'French Revolution began in:',diff:'medium',a:'1776',b:'1789',c:'1800',d:'1815',correct:'B',marks:2,ti:5,src:'manual',
       expl:'French Revolution started 1789 with storming of the Bastille.'},
      {ci:1,si:11,co:4,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'2',chn:'Bangladesh History',topic:'Independence',
       text:'Bangladesh Liberation War ended in:',diff:'easy',a:'March 1971',b:'December 1971',c:'January 1972',d:'August 1971',correct:'B',marks:1,ti:5,src:'manual',
       expl:'Pakistan surrendered on 16 December 1971 — Victory Day.'},

      // ─── SSC PHYSICS (si:12) ci:1 ────────────────────────────────
      {ci:1,si:12,co:5,cls:'9-10 (Secondary)',paper:'1st',ch:'1',chn:'Mechanics',topic:'Motion',
       text:'Velocity = Displacement / ?',diff:'easy',a:'Distance',b:'Time',c:'Force',d:'Mass',correct:'B',marks:1,ti:4,src:'manual',
       expl:'v = s/t. Velocity is displacement per unit time.'},
      {ci:1,si:12,co:5,cls:'9-10 (Secondary)',paper:'1st',ch:'2',chn:'Mechanics',topic:'Pressure',
       text:'SI unit of pressure is:',diff:'easy',a:'Newton',b:'Pascal',c:'Joule',d:'Watt',correct:'B',marks:1,ti:4,src:'manual',
       expl:'Pressure = Force/Area. Unit = Pascal (Pa) = N/m².'},

      // ─── SSC CHEMISTRY (si:13) ci:1 ──────────────────────────────
      {ci:1,si:13,co:5,cls:'9-10 (Secondary)',paper:'1st',ch:'1',chn:'Acids Bases',topic:'pH',
       text:'pH of an acidic solution is:',diff:'easy',a:'Greater than 7',b:'Less than 7',c:'Equal to 7',d:'Greater than 14',correct:'B',marks:1,ti:5,src:'manual',
       expl:'Acids: pH < 7. Neutral: pH = 7. Bases: pH > 7.'},
      {ci:1,si:13,co:5,cls:'9-10 (Secondary)',paper:'1st',ch:'2',chn:'Compounds',topic:'Salts',
       text:'Formula for common salt is:',diff:'easy',a:'HCl',b:'NaCl',c:'NaOH',d:'H₂SO₄',correct:'B',marks:1,ti:5,src:'manual',
       expl:'NaCl = Sodium Chloride = common table salt.'},

      // ─── COMMUNICATION ENGLISH (si:14) ci:2 ─────────────────────
      {ci:2,si:14,co:6,cls:'Bachelor(pass)',paper:'1st',ch:'1',chn:'Advanced Grammar',topic:'Passive Voice',
       text:'Passive of "He wrote a letter":',diff:'medium',a:'A letter wrote',b:'A letter was written by him',c:'A letter is written',d:'He was writing a letter',correct:'B',marks:2,ti:6,src:'manual',
       expl:'Past simple passive: was/were + past participle.'},
      {ci:2,si:14,co:6,cls:'Bachelor(pass)',paper:'1st',ch:'2',chn:'Vocabulary',topic:'Advanced Words',
       text:'"Eloquent" means:',diff:'medium',a:'Quiet',b:'Well-spoken',c:'Angry',d:'Confused',correct:'B',marks:2,ti:6,src:'manual',
       expl:'Eloquent = fluent, persuasive, well-expressed.'},
      {ci:2,si:14,co:6,cls:'Bachelor(pass)',paper:'1st',ch:'3',chn:'Grammar',topic:'Conditionals',
       text:'"If I were rich, I would travel the world." This is:',diff:'hard',a:'Zero conditional',b:'1st conditional',c:'2nd conditional',d:'3rd conditional',correct:'C',marks:3,ti:6,src:'ai_generated',
       expl:'2nd conditional: if + past simple → would + base. Imaginary present/future.'},

      // ─── IELTS READING (si:15) ci:2 ──────────────────────────────
      {ci:2,si:15,co:7,cls:'Bachelor(hons)',paper:'1st',ch:'1',chn:'IELTS Structure',topic:'Reading',
       text:'IELTS Academic Reading has how many passages?',diff:'easy',a:'2',b:'3',c:'4',d:'5',correct:'B',marks:1,ti:7,src:'manual',
       expl:'3 reading passages with 40 questions total.'},
      {ci:2,si:15,co:7,cls:'Bachelor(hons)',paper:'1st',ch:'1',chn:'Scoring',topic:'Band Score',
       text:'IELTS Band 9 describes:',diff:'easy',a:'Expert User',b:'Good User',c:'Very Good User',d:'Non-user',correct:'A',marks:1,ti:7,src:'manual',
       expl:'Band 9 = Expert User. Full command of the language.'},
      {ci:2,si:15,co:7,cls:'Bachelor(hons)',paper:'1st',ch:'2',chn:'Reading Skills',topic:'Question Types',
       text:'IELTS Reading question type NOT tested:',diff:'medium',a:'True/False/Not Given',b:'Matching headings',c:'Sentence translation',d:'Summary completion',correct:'C',marks:2,ti:7,src:'ai_generated',
       expl:'Translation is not an IELTS question type.'},

      // ─── IELTS WRITING (si:16) ci:2 ──────────────────────────────
      {ci:2,si:16,co:7,cls:'Bachelor(hons)',paper:'1st',ch:'1',chn:'Task 1',topic:'Word Count',
       text:'IELTS Academic Task 1 minimum words:',diff:'easy',a:'100',b:'150',c:'200',d:'250',correct:'B',marks:1,ti:7,src:'manual',
       expl:'Task 1: at least 150 words. Task 2: at least 250 words.'},
      {ci:2,si:16,co:7,cls:'Bachelor(hons)',paper:'1st',ch:'2',chn:'Task 2',topic:'Essay Structure',
       text:'IELTS Task 2 essay body should contain:',diff:'medium',a:'1 paragraph',b:'2-3 paragraphs',c:'5 paragraphs',d:'No paragraphs',correct:'B',marks:2,ti:7,src:'manual',
       expl:'Introduction + 2-3 body paragraphs + conclusion.'},

      // ─── MEDICAL BIOLOGY (si:18) ci:2 ────────────────────────────
      {ci:2,si:18,co:8,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Cell Division',topic:'Mitosis',
       text:'Mitosis produces:',diff:'medium',a:'4 haploid',b:'2 identical diploid',c:'2 haploid',d:'4 diploid',correct:'B',marks:2,ti:8,src:'manual',
       expl:'Mitosis = growth/repair. 2 genetically identical diploid cells.'},
      {ci:2,si:18,co:8,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Human Biology',topic:'Blood',
       text:'Red blood cells are produced in:',diff:'medium',a:'Liver',b:'Bone marrow',c:'Kidney',d:'Heart',correct:'B',marks:2,ti:8,src:'manual',
       expl:'Red bone marrow produces RBCs (erythropoiesis).'},
      {ci:2,si:18,co:8,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'3',chn:'Genetics',topic:'Meiosis',
       text:'Meiosis produces:',diff:'hard',a:'2 diploid cells',b:'4 haploid cells',c:'2 haploid cells',d:'4 diploid cells',correct:'B',marks:3,ti:8,src:'ai_generated',
       expl:'Meiosis = sexual reproduction. 4 genetically unique haploid cells (gametes).'},

      // ─── MEDICAL CHEMISTRY (si:19) ci:2 ──────────────────────────
      {ci:2,si:19,co:8,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Chemical Bonding',topic:'Bond Types',
       text:'Strongest type of chemical bond:',diff:'hard',a:'Ionic',b:'Covalent',c:'Hydrogen bond',d:'Van der Waals',correct:'B',marks:3,ti:8,src:'manual',
       expl:'Covalent bonds (sharing electrons) are generally the strongest.'},
      {ci:2,si:19,co:8,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'3',chn:'Biochemistry',topic:'Enzymes',
       text:'Enzymes in biological reactions act as:',diff:'medium',a:'Reactants',b:'Catalysts',c:'Products',d:'Inhibitors',correct:'B',marks:2,ti:8,src:'manual',
       expl:'Enzymes are biological catalysts — speed up reactions without being consumed.'},

      // ─── ENGINEERING MATH (si:20) ci:3 ───────────────────────────
      {ci:3,si:20,co:9,cls:'Bachelor(hons)',paper:'1st',ch:'1',chn:'Calculus',topic:'Integration',
       text:'∫x² dx = ?',diff:'medium',a:'x³+C',b:'x³/3+C',c:'2x',d:'x²/2+C',correct:'B',marks:2,ti:9,src:'manual',
       expl:'Power rule: xⁿ⁺¹/(n+1)+C = x³/3+C.'},
      {ci:3,si:20,co:9,cls:'Bachelor(hons)',paper:'1st',ch:'2',chn:'Linear Algebra',topic:'Determinants',
       text:'det([[1,2],[3,4]]) = ?',diff:'hard',a:'10',b:'-2',c:'2',d:'-10',correct:'B',marks:3,ti:9,src:'manual',
       expl:'det = (1×4)-(2×3) = 4-6 = -2.'},
      {ci:3,si:20,co:9,cls:'Bachelor(hons)',paper:'2nd',ch:'3',chn:'Probability',topic:'Basic Probability',
       text:'P(head) on a fair coin toss:',diff:'easy',a:'1/4',b:'1/2',c:'1',d:'0',correct:'B',marks:1,ti:9,src:'manual',
       expl:'Fair coin: P(H) = 1/2 = 0.5.'},

      // ─── ENGINEERING PHYSICS (si:21) ci:3 ────────────────────────
      {ci:3,si:21,co:9,cls:'Bachelor(hons)',paper:'1st',ch:'1',chn:'Electrostatics',topic:'Coulomb\'s Law',
       text:'Coulomb\'s law deals with:',diff:'medium',a:'Gravity',b:'Electric force between charges',c:'Magnetic force',d:'Nuclear force',correct:'B',marks:2,ti:10,src:'manual',
       expl:'Coulomb\'s law: F = kq₁q₂/r² — force between point charges.'},
      {ci:3,si:21,co:9,cls:'Bachelor(hons)',paper:'1st',ch:'2',chn:'Electromagnetism',topic:'Magnetic Field',
       text:'SI unit of magnetic field (B) is:',diff:'easy',a:'Tesla',b:'Newton',c:'Ampere',d:'Volt',correct:'A',marks:1,ti:10,src:'manual',
       expl:'Magnetic flux density measured in Tesla (T).'},

      // ─── BCS GK (si:22) ci:3 ─────────────────────────────────────
      {ci:3,si:22,co:10,cls:'Masters',paper:'1st',ch:'1',chn:'Bangladesh History',topic:'Independence',
       text:'Bangladesh declared independence in:',diff:'easy',a:'1969',b:'1971',c:'1973',d:'1975',correct:'B',marks:1,ti:11,src:'manual',
       expl:'26 March 1971 — Independence Day.'},
      {ci:3,si:22,co:10,cls:'Masters',paper:'1st',ch:'1',chn:'World Geography',topic:'Capitals',
       text:'Capital of France is:',diff:'easy',a:'London',b:'Paris',c:'Berlin',d:'Rome',correct:'B',marks:1,ti:11,src:'manual',
       expl:'Paris is the capital and largest city of France.'},
      {ci:3,si:22,co:10,cls:'Masters',paper:'1st',ch:'2',chn:'Geography',topic:'Oceans',
       text:'Largest ocean in the world:',diff:'easy',a:'Atlantic',b:'Pacific',c:'Indian',d:'Arctic',correct:'B',marks:1,ti:11,src:'manual',
       expl:'Pacific Ocean covers ~46% of Earth\'s water surface.'},
      {ci:3,si:22,co:10,cls:'Masters',paper:'1st',ch:'2',chn:'International',topic:'UN',
       text:'United Nations was founded in:',diff:'easy',a:'1944',b:'1945',c:'1946',d:'1947',correct:'B',marks:1,ti:11,src:'manual',
       expl:'UN founded 24 October 1945 after WWII.'},
      {ci:3,si:22,co:10,cls:'Masters',paper:'1st',ch:'3',chn:'Science',topic:'General Science',
       text:'Unit of electrical resistance is:',diff:'easy',a:'Ampere',b:'Ohm',c:'Volt',d:'Watt',correct:'B',marks:1,ti:11,src:'manual',
       expl:'Resistance measured in Ohms (Ω). Named after Georg Ohm.'},
      {ci:3,si:22,co:10,cls:'Masters',paper:'2nd',ch:'4',chn:'Computer Science',topic:'ICT',
       text:'Full form of CPU is:',diff:'easy',a:'Central Programming Unit',b:'Central Processing Unit',c:'Core Processing Unit',d:'Central Process Unit',correct:'B',marks:1,ti:11,src:'manual',
       expl:'CPU = Central Processing Unit — the brain of a computer.'},

      // ─── BCS MATHEMATICS (si:23) ci:3 ────────────────────────────
      {ci:3,si:23,co:10,cls:'Masters',paper:'1st',ch:'1',chn:'Percentage',topic:'Calculation',
       text:'40% of 500 is:',diff:'easy',a:'150',b:'200',c:'250',d:'300',correct:'B',marks:1,ti:9,src:'manual',
       expl:'40/100 × 500 = 200.'},
      {ci:3,si:23,co:10,cls:'Masters',paper:'1st',ch:'2',chn:'Finance Math',topic:'Simple Interest',
       text:'Simple interest formula:',diff:'medium',a:'PRT',b:'PRT/100',c:'P+RT',d:'PR/T',correct:'B',marks:2,ti:9,src:'manual',
       expl:'SI = (Principal × Rate × Time) / 100.'},
      {ci:3,si:23,co:10,cls:'Masters',paper:'1st',ch:'1',chn:'Arithmetic',topic:'Ratio',
       text:'Ratio 3:5 as percentage of total (3 parts) is:',diff:'medium',a:'30%',b:'37.5%',c:'50%',d:'60%',correct:'B',marks:2,ti:9,src:'ai_generated',
       expl:'3/(3+5) × 100 = 3/8 × 100 = 37.5%.'},

      // ─── PRIMARY MATHEMATICS (si:24) ci:3 ────────────────────────
      {ci:3,si:24,co:11,cls:'5',paper:'1st',ch:'1',chn:'Basic Arithmetic',topic:'Addition',
       text:'5 + 3 = ?',diff:'easy',a:'6',b:'7',c:'8',d:'9',correct:'C',marks:1,ti:12,src:'manual',
       expl:'5+3=8. Basic addition.'},
      {ci:3,si:24,co:11,cls:'5',paper:'1st',ch:'1',chn:'Basic Arithmetic',topic:'Multiplication',
       text:'7 × 8 = ?',diff:'easy',a:'54',b:'56',c:'58',d:'60',correct:'B',marks:1,ti:12,src:'manual',
       expl:'7×8=56. Multiplication table.'},
      {ci:3,si:24,co:11,cls:'5',paper:'1st',ch:'2',chn:'General Knowledge',topic:'Calendar',
       text:'Days in a week:',diff:'easy',a:'5',b:'6',c:'7',d:'8',correct:'C',marks:1,ti:12,src:'manual',
       expl:'A week has 7 days.'},

      // ─── O LEVEL MATH PURE (si:25) ci:4 ──────────────────────────
      {ci:4,si:25,co:12,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Algebra',topic:'Quadratic Formula',
       text:'Quadratic formula for ax²+bx+c=0:',diff:'hard',a:'x=b/2a',b:'x=(-b±√(b²-4ac))/2a',c:'x=a/b',d:'x=2a/b',correct:'B',marks:3,ti:12,src:'manual',
       expl:'Standard quadratic formula — memorize this.'},
      {ci:4,si:25,co:12,cls:'11-12(Higher Secondary)',paper:'1st',ch:'3',chn:'Geometry',topic:'Pythagoras',
       text:'Right triangle with legs 3 and 4. Hypotenuse = ?',diff:'medium',a:'4',b:'5',c:'7',d:'6',correct:'B',marks:2,ti:12,src:'manual',
       expl:'√(3²+4²) = √(9+16) = √25 = 5.'},
      {ci:4,si:25,co:12,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'4',chn:'Functions',topic:'Domain Range',
       text:'Domain of f(x) = √x is:',diff:'hard',a:'All real numbers',b:'x ≥ 0',c:'x > 0',d:'x ≤ 0',correct:'B',marks:3,ti:12,src:'ai_generated',
       expl:'Square root requires non-negative input. Domain: [0,∞).'},

      // ─── O LEVEL MATH STATS (si:26) ci:4 ─────────────────────────
      {ci:4,si:26,co:12,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Statistics',topic:'Mean',
       text:'Mean of 2, 4, 6, 8, 10 is:',diff:'easy',a:'4',b:'5',c:'6',d:'7',correct:'C',marks:1,ti:12,src:'manual',
       expl:'Sum=30, n=5. Mean=30/5=6.'},
      {ci:4,si:26,co:12,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'2',chn:'Probability',topic:'Events',
       text:'P(impossible event) = ?',diff:'easy',a:'1',b:'0.5',c:'0',d:'-1',correct:'C',marks:1,ti:12,src:'manual',
       expl:'Probability of impossible event = 0.'},

      // ─── A LEVEL MECHANICS (si:27) ci:4 ──────────────────────────
      {ci:4,si:27,co:13,cls:'11-12(Higher Secondary)',paper:'1st',ch:'2',chn:'Rotational Motion',topic:'Moment of Inertia',
       text:'Moment of inertia depends on:',diff:'hard',a:'Mass only',b:'Mass and its distribution',c:'Volume',d:'Velocity',correct:'B',marks:3,ti:13,src:'manual',
       expl:'I = Σmr². Both the mass and how it\'s distributed matter.'},
      {ci:4,si:27,co:13,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Mechanics',topic:'SHM',
       text:'In SHM, acceleration is proportional to:',diff:'hard',a:'Velocity',b:'Displacement from equilibrium',c:'Time',d:'Amplitude',correct:'B',marks:3,ti:13,src:'ai_generated',
       expl:'a = -ω²x. Acceleration ∝ -displacement (directed toward equilibrium).'},

      // ─── A LEVEL WAVES (si:28) ci:4 ──────────────────────────────
      {ci:4,si:28,co:13,cls:'11-12(Higher Secondary)',paper:'1st',ch:'1',chn:'Waves',topic:'Diffraction',
       text:'Diffraction is most noticeable when:',diff:'hard',a:'Wavelength >> slit width',b:'Wavelength ≈ slit width',c:'Wavelength << slit width',d:'No slit present',correct:'B',marks:3,ti:13,src:'manual',
       expl:'Maximum diffraction when wavelength ≈ obstacle/slit size.'},
      {ci:4,si:28,co:13,cls:'11-12(Higher Secondary)',paper:'2nd',ch:'3',chn:'Waves',topic:'Doppler Effect',
       text:'Doppler effect: source moving toward observer — observed frequency is:',diff:'hard',a:'Lower than source',b:'Higher than source',c:'Same as source',d:'Zero',correct:'B',marks:3,ti:13,src:'manual',
       expl:'Approaching source compresses wavefronts → higher frequency.'},

      // ─── GRE QUANTITATIVE (si:29) ci:4 ───────────────────────────
      {ci:4,si:29,co:14,cls:'Masters',paper:'1st',ch:'1',chn:'GRE Structure',topic:'Format',
       text:'GRE Quantitative Reasoning score range:',diff:'easy',a:'0-300',b:'130-170',c:'200-800',d:'0-100',correct:'B',marks:1,ti:14,src:'manual',
       expl:'GRE Quant: 130-170. GRE Verbal: 130-170.'},
      {ci:4,si:29,co:14,cls:'Masters',paper:'1st',ch:'2',chn:'Algebra',topic:'Word Problems',
       text:'Store sells 120 items at $5, giving 15% discount. Total revenue = ?',diff:'medium',a:'$510',b:'$600',c:'$480',d:'$540',correct:'A',marks:2,ti:14,src:'manual',
       expl:'Revenue without discount: 120×5=600. With 15%: 600×0.85=$510.'},
      {ci:4,si:29,co:14,cls:'Masters',paper:'2nd',ch:'3',chn:'Data Analysis',topic:'Statistics',
       text:'Median of 3, 7, 2, 9, 5 is:',diff:'medium',a:'5',b:'7',c:'3',d:'9',correct:'A',marks:2,ti:14,src:'manual',
       expl:'Sorted: 2,3,5,7,9. Middle value = 5.'},
    ];

    const tfRows = [
      // [ci,si,co,cls,paper,ch,chn,topic,text,diff,correct,marks,ti,src,expl]
      [0,0,0,'11-12(Higher Secondary)','1st','1','Real Numbers','Number Theory','√2 is an irrational number.','easy','A',1,0,'manual','√2 cannot be expressed as p/q.'],
      [0,0,0,'11-12(Higher Secondary)','1st','1','Real Numbers','Number Theory','Zero is a positive number.','easy','B',1,0,'manual','Zero is neither positive nor negative.'],
      [0,0,0,'11-12(Higher Secondary)','1st','2','Algebra','Quadratic','A quadratic equation always has two distinct real roots.','medium','B',1,0,'manual','When discriminant <0, roots are complex.'],
      [0,0,0,'11-12(Higher Secondary)','2nd','4','Calculus','Differentiation','The derivative of a constant is always zero.','easy','A',1,0,'manual','d/dx(c) = 0 for any constant c.'],
      [0,0,0,'11-12(Higher Secondary)','2nd','5','Coord Geometry','Lines','Two parallel lines have equal slopes.','easy','A',1,0,'manual','Parallel lines: m₁ = m₂.'],
      [0,1,0,'11-12(Higher Secondary)','1st','1','Mechanics','Newton Laws','Every action has equal and opposite reaction.','easy','A',1,1,'manual','Newton\'s 3rd Law of Motion.'],
      [0,1,0,'11-12(Higher Secondary)','1st','2','Waves','Sound','Sound travels faster than light.','easy','B',1,1,'manual','Light travels at 3×10⁸ m/s, sound at ~343 m/s.'],
      [0,1,0,'11-12(Higher Secondary)','2nd','3','Optics','Light','Light travels in straight line in uniform medium.','easy','A',1,1,'manual','Rectilinear propagation of light.'],
      [0,1,0,'11-12(Higher Secondary)','2nd','4','Electricity','Current','Electric current flows from high to low potential.','easy','A',1,1,'manual','Conventional current flows + to -.'],
      [0,2,0,'11-12(Higher Secondary)','1st','1','Atomic Structure','Oxygen','Oxygen has atomic number 8.','easy','A',1,1,'manual','O: 8 protons, atomic number=8.'],
      [0,2,0,'11-12(Higher Secondary)','1st','3','Acids Bases','pH Scale','An acidic solution has pH less than 7.','easy','A',1,1,'manual','pH<7 = acidic, pH=7 = neutral, pH>7 = basic.'],
      [0,2,0,'11-12(Higher Secondary)','1st','2','Compounds','Water','Water (H₂O) is a compound.','easy','A',1,1,'manual','H₂O contains two elements bonded together = compound.'],
      [0,2,0,'11-12(Higher Secondary)','2nd','5','Kinetics','Catalyst','NaCl is an acid.','easy','B',1,1,'manual','NaCl is a salt, not an acid.'],
      [0,3,0,'11-12(Higher Secondary)','1st','3','Plant Biology','Photosynthesis','6CO₂+6H₂O+light → C₆H₁₂O₆+6O₂ represents photosynthesis.','easy','A',1,1,'manual','Correct equation for photosynthesis.'],
      [0,3,0,'11-12(Higher Secondary)','1st','1','Microbiology','Viruses','Viruses are considered living organisms.','medium','B',1,1,'manual','Viruses are acellular — not classified as living organisms.'],
      [0,3,0,'11-12(Higher Secondary)','2nd','4','Human Biology','Blood','Normal adult heart rate is about 72 beats/minute.','easy','A',1,1,'manual','Normal resting heart rate: 60-100 bpm.'],
      [0,4,0,'11-12(Higher Secondary)','1st','1','Grammar','Agreement','"She don\'t know" is grammatically correct.','easy','B',1,2,'manual','Should be "She doesn\'t know."'],
      [0,5,1,'9-10 (Secondary)','1st','2','Language','Etymology','Bengali is an Indo-European language.','medium','A',1,2,'manual','Bengali belongs to Indo-Aryan branch of Indo-European.'],
      [1,9,3,'9-10 (Secondary)','1st','3','Geometry','Triangles','Sum of angles in a triangle is 180°.','easy','A',1,3,'manual','Interior angles of a triangle sum to 180°.'],
      [1,9,3,'9-10 (Secondary)','1st','1','Number Theory','Primes','All prime numbers are odd.','medium','B',1,3,'manual','2 is the only even prime number.'],
      [1,10,4,'11-12(Higher Secondary)','1st','1','Mechanics','Energy','Conservation of energy: energy is neither created nor destroyed.','easy','A',1,4,'manual','First Law of Thermodynamics.'],
      [1,11,4,'11-12(Higher Secondary)','1st','1','Bangladesh History','Independence','Bangladesh declared independence on 26 March 1971.','easy','A',1,5,'manual','Independence Day is 26 March.'],
      [1,12,5,'9-10 (Secondary)','1st','1','Mechanics','Motion','An object at rest has zero velocity.','easy','A',1,4,'manual','Velocity = 0 when object is stationary.'],
      [1,12,5,'9-10 (Secondary)','2nd','3','Light','Reflection','Angle of incidence equals angle of reflection.','easy','A',1,4,'manual','Law of reflection.'],
      [2,14,6,'Bachelor(pass)','1st','1','Grammar','Articles','"The" is a definite article.','easy','A',1,6,'manual','"The" refers to specific noun. "A/An" = indefinite.'],
      [2,15,7,'Bachelor(hons)','1st','2','Reading Skills','Skimming','Skimming means reading only for specific information.','medium','B',1,7,'manual','Skimming = overall idea. Scanning = specific info.'],
      [2,18,8,'11-12(Higher Secondary)','2nd','3','Genetics','DNA','Photosynthesis releases CO₂.','medium','B',1,8,'manual','Photosynthesis absorbs CO₂ and releases O₂.'],
      [2,19,8,'11-12(Higher Secondary)','1st','2','Organic Chemistry','Organics','All organic compounds contain Carbon.','easy','A',1,8,'manual','Organic chemistry = chemistry of carbon compounds.'],
      [3,20,9,'Bachelor(hons)','1st','2','Linear Algebra','Matrices','A square matrix has equal rows and columns.','easy','A',1,9,'manual','Square matrix: n×n.'],
      [3,21,9,'Bachelor(hons)','2nd','3','Thermodynamics','Laws','Energy cannot be created or destroyed (1st Law).','easy','A',1,10,'manual','Conservation of energy.'],
      [3,22,10,'Masters','1st','1','Bangladesh','Geography','Dhaka is the capital of Bangladesh.','easy','A',1,11,'manual','Dhaka — capital since 1971.'],
      [3,22,10,'Masters','1st','1','General','General Knowledge','The sun rises in the east.','easy','A',1,11,'manual','Earth rotates west to east, so sun appears to rise in east.'],
      [4,25,12,'11-12(Higher Secondary)','1st','1','Linear Algebra','Matrices','A square matrix has equal numbers of rows and columns.','easy','A',1,12,'manual','n×n matrix = square matrix.'],
      [4,26,12,'11-12(Higher Secondary)','1st','1','Statistics','Spread','Standard deviation measures spread of data.','easy','A',1,12,'manual','SD quantifies variation/dispersion.'],
      [4,27,13,'11-12(Higher Secondary)','1st','1','Mechanics','SHM','Simple harmonic motion is periodic about equilibrium.','medium','A',1,13,'manual','SHM: oscillation about fixed equilibrium point.'],
      [4,28,13,'11-12(Higher Secondary)','1st','1','Waves','Doppler','Doppler effect relates to frequency change due to motion.','hard','A',1,13,'manual','Doppler: change in observed frequency due to relative motion.'],
      [4,29,14,'Masters','1st','2','GRE','Data','GRE tests include Data Interpretation questions.','easy','A',1,14,'manual','GRE Quant includes DI section.'],
    ];

    const descRows = [
      // [ci,si,co,cls,paper,ch,chn,topic,text,diff,answer,marks,ti,src]
      [0,0,0,'11-12(Higher Secondary)','1st','1','Real Numbers','Irrational Numbers',
       'Prove that √2 is irrational using proof by contradiction.','hard',
       'Assume √2=p/q (lowest terms). Then p²=2q², so p is even, write p=2k. Then 4k²=2q², q²=2k², so q is even too. This contradicts p/q being in lowest terms. Therefore √2 is irrational. ∎',5,0,'manual'],
      [0,0,0,'11-12(Higher Secondary)','1st','2','Algebra','Quadratic Equations',
       'Solve x²−5x+6=0 by factorization, showing all steps.','medium',
       'Step 1: Find two numbers that multiply to 6 and add to -5: (-2) and (-3). Step 2: Factor: (x-2)(x-3)=0. Step 3: x=2 or x=3. Verification: (2)²-5(2)+6=4-10+6=0 ✓ (3)²-5(3)+6=9-15+6=0 ✓',4,0,'manual'],
      [0,0,0,'11-12(Higher Secondary)','2nd','4','Calculus','Differentiation',
       'Find dy/dx for y = 3x⁴ − 2x² + 5x − 7, showing all steps.','hard',
       'Apply power rule to each term: d/dx(3x⁴)=12x³, d/dx(2x²)=4x, d/dx(5x)=5, d/dx(7)=0. Therefore: dy/dx = 12x³ − 4x + 5.',5,0,'manual'],
      [0,1,0,'11-12(Higher Secondary)','1st','1','Mechanics','Newton Laws',
       'Describe Newton\'s three laws of motion with a real-life example for each.','hard',
       '1st Law (Inertia): A body stays at rest or uniform motion unless acted upon by force. Example: passenger lurches backward when car accelerates. 2nd Law: F=ma. Example: heavier cart needs more force to accelerate. 3rd Law: Every action has equal-opposite reaction. Example: rocket propulsion.',6,1,'manual'],
      [0,1,0,'11-12(Higher Secondary)','1st','2','Waves','Wave Types',
       'Explain the difference between transverse and longitudinal waves with examples.','medium',
       'Transverse waves: particle oscillation perpendicular to wave direction. Example: light, water waves. Can travel in vacuum. Longitudinal waves: particle oscillation parallel to wave direction. Compressions and rarefactions. Example: sound waves. Cannot travel in vacuum.',4,1,'manual'],
      [0,2,0,'11-12(Higher Secondary)','2nd','5','Chemical Kinetics','Catalysts',
       'Explain the role of a catalyst with a specific chemical example.','medium',
       'A catalyst lowers the activation energy of a reaction without being consumed. Example: MnO₂ in decomposition of hydrogen peroxide: 2H₂O₂ → 2H₂O + O₂ (slow without catalyst, fast with MnO₂). After reaction, MnO₂ is recovered unchanged.',4,1,'manual'],
      [0,3,0,'11-12(Higher Secondary)','1st','3','Plant Biology','Photosynthesis',
       'Describe the process of photosynthesis including light and dark reactions.','hard',
       'Overall: 6CO₂+6H₂O+light → C₆H₁₂O₆+6O₂. Light reactions (thylakoid): water split, O₂ released, ATP and NADPH produced. Dark reactions/Calvin cycle (stroma): CO₂ fixed using ATP and NADPH to form glucose. Chlorophyll captures light energy.',6,1,'manual'],
      [0,4,0,'11-12(Higher Secondary)','2nd','3','Writing','Paragraph Writing',
       'Write a paragraph (100 words) on the importance of education.','medium',
       'Education is the cornerstone of national development. It equips individuals with knowledge, critical thinking skills, and the ability to contribute meaningfully to society. In Bangladesh, quality education has been central to economic progress since independence. Access to education reduces poverty, improves health outcomes, and promotes gender equality. Beyond academic knowledge, education builds character, discipline, and civic responsibility. Every child deserves access to quality education regardless of socioeconomic background.',10,2,'manual'],
      [0,5,1,'9-10 (Secondary)','2nd','3','Writing','Essay',
       'বাংলাদেশের স্বাধীনতা দিবস সম্পর্কে একটি অনুচ্ছেদ লেখো।','medium',
       'বাংলাদেশ ১৯৭১ সালের ২৬ মার্চ স্বাধীনতা ঘোষণা করে। বঙ্গবন্ধু শেখ মুজিবুর রহমানের নেতৃত্বে নয় মাসের রক্তক্ষয়ী মুক্তিযুদ্ধের মাধ্যমে ১৬ ডিসেম্বর চূড়ান্ত বিজয় অর্জিত হয়। ত্রিশ লক্ষ শহীদের আত্মত্যাগের বিনিময়ে অর্জিত এই স্বাধীনতা আমাদের জাতীয় গর্ব।',5,2,'manual'],
      [1,9,3,'9-10 (Secondary)','2nd','4','Statistics','Mean Median',
       'Find mean, median, mode of: 5, 3, 8, 1, 9, 4, 7.','medium',
       'Sorted: 1,3,4,5,7,8,9. Mean = (1+3+4+5+7+8+9)/7 = 37/7 ≈ 5.29. Median = 5 (middle value of 7 numbers). Mode = none (each appears once).',4,3,'manual'],
      [1,11,4,'11-12(Higher Secondary)','2nd','2','Bangladesh History','Liberation War',
       'Write a short note on the Liberation War of Bangladesh 1971.','medium',
       'Bangladesh Liberation War: Bangabandhu declared independence 26 March 1971. Pakistani forces launched Operation Searchlight on Dhaka on 25 March. Mukti Bahini guerrillas fought for 9 months. India intervened on 3 December 1971. Pakistan surrendered 16 December 1971 — Victory Day. Approximately 3 million martyred, 200,000 women affected.',8,5,'manual'],
      [2,14,6,'Bachelor(pass)','2nd','3','Speaking','Self Introduction',
       'Write a 100-word self introduction for a job interview.','medium',
       'Good morning. My name is [Name] and I completed my Bachelor\'s degree in [Subject] from [University]. I have [X] years of experience in [field] where I developed strong skills in [skills]. I am known for my attention to detail, teamwork, and problem-solving ability. In my previous role at [Company], I successfully [achievement]. I am particularly drawn to this position because [reason]. I am confident that my background and enthusiasm make me a strong candidate. Thank you for this opportunity.',5,6,'manual'],
      [2,16,7,'Bachelor(hons)','2nd','2','Task 2','Essay Writing',
       'Write an IELTS Task 2 introduction for: "Technology is replacing human workers. Is this a positive or negative development?"','hard',
       'In recent decades, rapid technological advancement has increasingly displaced human workers across manufacturing, service, and even professional sectors. While proponents argue this represents economic progress and efficiency gains, critics contend it creates widespread unemployment and exacerbates social inequality. This essay will examine both perspectives before reaching a reasoned conclusion.',8,7,'manual'],
      [2,18,8,'11-12(Higher Secondary)','2nd','3','Genetics','DNA Structure',
       'Describe the structure of DNA and its role in heredity.','hard',
       'DNA is a double helix made of two antiparallel strands. Each strand is a polymer of nucleotides (phosphate group + deoxyribose sugar + nitrogenous base). Base pairs: A-T (2 bonds), G-C (3 bonds). During cell division, DNA replicates semi-conservatively. Genes are segments of DNA that encode proteins. During reproduction, DNA is passed to offspring via chromosomes, transmitting inherited traits.',6,8,'manual'],
      [2,19,8,'11-12(Higher Secondary)','2nd','3','Biochemistry','Enzymes',
       'Explain the lock-and-key model of enzyme action.','hard',
       'Enzymes are protein catalysts with an active site of specific shape. The substrate (key) fits precisely into the active site (lock) — forming an enzyme-substrate complex. Products are released after reaction. The enzyme is unchanged. Factors affecting activity: temperature (optimum ~37°C for human enzymes), pH, substrate concentration, inhibitors.',6,8,'manual'],
      [3,20,9,'Bachelor(hons)','2nd','3','Differential Equations','ODE',
       'Solve dy/dx = 2x with initial condition y(0) = 3.','hard',
       'Integrate both sides: y = ∫2x dx = x² + C. Apply initial condition: y(0)=3 → 3=0+C → C=3. Therefore: y = x² + 3. Verification: dy/dx = 2x ✓ and y(0)=0+3=3 ✓.',5,9,'manual'],
      [3,22,10,'Masters','2nd','3','Bangladesh History','Liberation War',
       'Write a short note on the Liberation War of Bangladesh (1971).','medium',
       'Bangladesh Liberation War began 26 March 1971 when Bangabandhu Sheikh Mujibur Rahman declared independence after Operation Searchlight. The nine-month war involved Mukti Bahini freedom fighters supported by India from December 1971. Pakistan surrendered 16 December 1971 — celebrated as Victory Day. Approximately 3 million people were martyred and 10 million became refugees.',8,11,'manual'],
      [4,25,12,'11-12(Higher Secondary)','2nd','4','Functions','Functions Concept',
       'Explain the concept of a function and give two real examples.','medium',
       'A function f: A→B assigns exactly ONE output in B to each input in A. Key property: each input has exactly one output (but multiple inputs can share an output). Example 1: f(x)=x² maps each real number to a non-negative real. Example 2: f(x)=2x+1 is a linear function mapping ℝ to ℝ. Counter-example: a circle is NOT a function (one x can give two y values).',5,12,'manual'],
      [4,27,13,'11-12(Higher Secondary)','2nd','3','Mechanics','Circular Motion',
       'Derive the expression for centripetal acceleration.','hard',
       'For an object moving in a circle of radius r at constant speed v: velocity direction changes continuously. Rate of change of velocity = centripetal acceleration. By vector geometry: a = v²/r directed toward center. In terms of angular velocity ω: since v=ωr, a = ω²r. The centripetal force: F = mv²/r = mω²r.',6,13,'manual'],
      [4,28,13,'11-12(Higher Secondary)','2nd','3','Waves','Interference',
       'Explain constructive and destructive interference.','hard',
       'When two coherent waves superpose: Constructive interference: waves in phase (path difference = nλ) → amplitudes add → maximum intensity. Destructive interference: waves out of phase (path difference = (n+½)λ) → amplitudes cancel → zero intensity. Application: Young\'s double slit experiment creates alternating bright and dark fringes.',6,13,'manual'],
    ];

    // ── Insert all questions ──────────────────────────────────────────
    const questionIds = [];

    for (const q of mcqRows) {
      const { rows:[{question_id}] } = await client.query(
        `INSERT INTO question_bank
           (coaching_center_id,subject_id,course_id,class_name,paper,chapter,chapter_name,topic,
            question_text,question_type,difficulty,option_text_a,option_text_b,option_text_c,option_text_d,
            correct_option,max_marks,created_by,source,explanation)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'mcq',$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         RETURNING question_id`,
        [centerIds[q.ci],subjectIds[q.si],courseIds[q.co],
         q.cls,q.paper,q.ch,q.chn,q.topic,q.text,q.diff,
         q.a,q.b,q.c,q.d,q.correct,q.marks,teacherIds[q.ti],q.src,q.expl||null]
      );
      questionIds.push(question_id);
    }

    for (const q of tfRows) {
      const [ci,si,co,cls,paper,ch,chn,topic,text,diff,correct,marks,ti,src,expl] = q;
      const { rows:[{question_id}] } = await client.query(
        `INSERT INTO question_bank
           (coaching_center_id,subject_id,course_id,class_name,paper,chapter,chapter_name,topic,
            question_text,question_type,difficulty,option_text_a,option_text_b,
            correct_option,max_marks,created_by,source,explanation)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'true_false',$10,'True','False',$11,$12,$13,$14,$15)
         RETURNING question_id`,
        [centerIds[ci],subjectIds[si],courseIds[co],cls,paper,ch,chn,topic,
         text,diff,correct,marks,teacherIds[ti],src,expl||null]
      );
      questionIds.push(question_id);
    }

    for (const q of descRows) {
      const [ci,si,co,cls,paper,ch,chn,topic,text,diff,answer,marks,ti,src] = q;
      const { rows:[{question_id}] } = await client.query(
        `INSERT INTO question_bank
           (coaching_center_id,subject_id,course_id,class_name,paper,chapter,chapter_name,topic,
            question_text,question_type,difficulty,expected_answer,max_marks,created_by,source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'descriptive',$10,$11,$12,$13,$14)
         RETURNING question_id`,
        [centerIds[ci],subjectIds[si],courseIds[co],cls,paper,ch,chn,topic,
         text,diff,answer,marks,teacherIds[ti],src]
      );
      questionIds.push(question_id);
    }
    console.log(`✅ ${questionIds.length} Questions`);

    // ══════════════════════════════════════════════════════════════════
    // 16. EXAMS (15) — new schema has course_id column
    // ══════════════════════════════════════════════════════════════════
    const examProfiles = [
      { ci:0, co:0, si:0,  bi:0,  type:'regular',   ti:0,  title:'Mathematics Mid Term 2024',      dur:90,  status:'completed' },
      { ci:0, co:0, si:1,  bi:0,  type:'regular',   ti:1,  title:'Physics Unit Test 1',             dur:60,  status:'completed' },
      { ci:0, co:0, si:2,  bi:1,  type:'regular',   ti:1,  title:'Chemistry Final Exam 2024',       dur:120, status:'scheduled' },
      { ci:0, co:0, si:4,  bi:2,  type:'live_quiz', ti:2,  title:'English Grammar Live Quiz',       dur:30,  status:'completed' },
      { ci:0, co:0, si:0,  bi:0,  type:'regular',   ti:0,  title:'Mathematics Final Exam 2024',     dur:180, status:'scheduled' },
      { ci:1, co:3, si:9,  bi:4,  type:'regular',   ti:3,  title:'JSC Mathematics Chapter Test',    dur:60,  status:'completed' },
      { ci:1, co:4, si:10, bi:5,  type:'regular',   ti:4,  title:'Physics Chapter Test',            dur:45,  status:'scheduled' },
      { ci:1, co:5, si:12, bi:6,  type:'live_quiz', ti:4,  title:'SSC Physics Live Quiz',           dur:20,  status:'completed' },
      { ci:2, co:6, si:14, bi:7,  type:'regular',   ti:6,  title:'English Speaking Assessment',     dur:60,  status:'ongoing'   },
      { ci:2, co:7, si:15, bi:8,  type:'regular',   ti:7,  title:'IELTS Mock Reading Test',         dur:180, status:'completed' },
      { ci:3, co:9, si:20, bi:10, type:'regular',   ti:9,  title:'Engineering Mathematics Test',    dur:90,  status:'scheduled' },
      { ci:3, co:10,si:22, bi:10, type:'live_quiz', ti:11, title:'BCS General Knowledge Quiz',      dur:30,  status:'completed' },
      { ci:4, co:12,si:25, bi:13, type:'regular',   ti:12, title:'O Level Mathematics Paper 1',     dur:120, status:'scheduled' },
      { ci:4, co:13,si:27, bi:14, type:'regular',   ti:13, title:'A Level Physics Test',            dur:90,  status:'completed' },
      { ci:0, co:0, si:0,  bi:0,  type:'live_quiz', ti:0,  title:'Mathematics Live Quiz Session',   dur:20,  status:'ongoing'   },
    ];
    const examIds = [];
    for (const e of examProfiles) {
      const code = e.type==='live_quiz' ? `LQ${rnd(1000,9999)}` : null;
      const { rows:[{exam_id}] } = await client.query(
        `INSERT INTO quiz_exam
           (coaching_center_id,course_id,subject_id,batch_id,exam_type,host_teacher_id,
            title,duration_minutes,start_time,end_time,status,access_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()-INTERVAL '2 days',NOW()+INTERVAL '1 day',$9,$10)
         RETURNING exam_id`,
        [centerIds[e.ci],courseIds[e.co],subjectIds[e.si],batchIds[e.bi],
         e.type,teacherIds[e.ti],e.title,e.dur,e.status,code]
      );
      examIds.push(exam_id);
    }
    console.log(`✅ ${examIds.length} Exams`);

    // ══════════════════════════════════════════════════════════════════
    // 17. EXAM QUESTIONS
    // ══════════════════════════════════════════════════════════════════
    // Map exam index → question indices from questionIds array
    const eqMap = [
      [0,  [0,1,2,3,4,5,6,10,11,12,13,14]],   // Math Mid Term
      [1,  [16,17,18,19,20,21,22,23,24,25]],   // Physics Unit Test
      [2,  [32,33,34,35,36,37,38,39,40,41]],   // Chemistry Final
      [3,  [47,48,49,50,51]],                  // English Live Quiz
      [4,  [0,1,2,3,4,5,6,7,8,9,10,11,12]],   // Math Final
      [5,  [63,64,65,66,67]],                  // JSC Math
      [6,  [70,71]],                           // Physics Chapter
      [7,  [74,75]],                           // SSC Physics Quiz
      [8,  [79,80]],                           // English Speaking
      [9,  [84,85,86]],                        // IELTS Reading
      [10, [103,104,105]],                     // Engineering Math
      [11, [110,111,112,113,114,115]],         // BCS GK Quiz
      [12, [121,122,123]],                     // O Level Math
      [13, [130,131]],                         // A Level Physics
      [14, [0,1,2,3,4]],                       // Math Live Quiz
    ];
    for (const [ei,qis] of eqMap) {
      for (const qi of qis) {
        if (questionIds[qi] && examIds[ei]) {
          await client.query(
            `INSERT INTO exam_questions (exam_id,question_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [examIds[ei],questionIds[qi]]
          );
        }
      }
    }
    console.log('✅ Exam Questions');

    // ══════════════════════════════════════════════════════════════════
    // 18. RESULTS — result_status uses new enum including 'pending'
    // ══════════════════════════════════════════════════════════════════
    const resultRows = [
      // [examIdx, studentIdx, questionIdx, marks, totalMarks]
      [0,0,0,8,10],[0,1,0,7,10],[0,2,0,9,10],[0,3,0,5,10],[0,4,0,6,10],[0,5,0,3,10],
      [0,0,1,7,9], [0,1,1,5,9], [0,2,1,8,9], [0,3,1,4,9], [0,4,1,6,9],
      [1,0,16,7,9],[1,1,16,5,9],[1,2,16,8,9],[1,3,16,4,9],[1,4,16,6,9],
      [1,0,17,1,1],[1,1,17,1,1],[1,2,17,0,1],[1,3,17,1,1],[1,4,17,1,1],
      [3,0,47,3,4],[3,1,47,4,4],[3,2,47,2,4],[3,3,47,1,4],[3,4,47,3,4],
      [5,6,63,2,3],[5,7,63,3,3],[5,8,63,1,3],[5,9,63,2,3],[5,10,63,3,3],
      [7,9,74,2,2],[7,10,74,1,2],[7,11,74,2,2],
      [9,12,84,6,8],[9,13,84,7,8],
      [11,18,110,1,2],[11,19,110,2,2],[11,20,110,1,2],[11,21,110,0,2],
      [13,24,130,6,9],[13,25,130,8,9],[13,26,130,5,9],
      [0,0,2,7,8], [0,1,2,6,8], [0,2,2,8,8], [0,3,2,4,8],
      [1,0,18,2,2],[1,1,18,1,2],[1,2,18,2,2],[1,3,18,0,2],
    ];
    for (const [ei,si,qi,marks,total] of resultRows) {
      if (!examIds[ei]||!studentIds[si]||!questionIds[qi]) continue;
      const pct = Math.round((marks/total)*100);
      await client.query(
        `INSERT INTO result_summary
           (coaching_center_id,exam_id,student_id,question_id,marks_obtained,
            evaluated_by,answer_status,answered_at,evaluated_at,
            total_marks,percentage,grade,result_status,published_at)
         VALUES ($1,$2,$3,$4,$5,'teacher','checked',
                 NOW()-INTERVAL '1 day',NOW()-INTERVAL '12 hours',
                 $6,$7,$8,$9,NOW())`,
        [centerIds[0],examIds[ei],studentIds[si],questionIds[qi],
         marks,total,pct,grade(pct),passed(pct)]
      );
    }
    console.log(`✅ ${resultRows.length} Results`);

    // ══════════════════════════════════════════════════════════════════
    // 19. SUBSCRIPTIONS
    // ══════════════════════════════════════════════════════════════════
    const subData = [
      [0,0,999, 'monthly_subscription','bkash',  'success'],
      [1,1,2999,'monthly_subscription','nagad',  'success'],
      [2,2,0,   'center_creation',     'cash',   'success'],
      [3,3,999, 'monthly_subscription','bank',   'success'],
      [4,4,0,   'center_creation',     'cash',   'success'],
    ];
    for (let i=0;i<subData.length;i++) {
      const [ci,ai,amount,payFor,method,status] = subData[i];
      await client.query(
        `INSERT INTO subscription
           (coaching_center_id,user_id,amount,payment_for,payment_method,transaction_id,status,paid_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
        [centerIds[ci],adminIds[ai],amount,payFor,method,txn(i),status]
      );
    }
    console.log('✅ Subscriptions');

    // ══════════════════════════════════════════════════════════════════
    // 20. NOTIFICATIONS (50+)
    // ══════════════════════════════════════════════════════════════════
    const notifRows = [
      // Super Admin
      [saId,'Platform setup complete. Welcome to Smart Coaching!','system'],
      [saId,'New coaching center application from Excellence Coaching received.','system'],
      [saId,'All 5 coaching centers are now active on the platform.','system'],
      [saId,'Total users reached 50. Platform growing!','system'],
      // Coaching Admins
      [adminIds[0],'Excellence Coaching Center has been approved!','system'],
      [adminIds[0],'Monthly subscription payment confirmed. ৳999 received.','fee'],
      [adminIds[0],'Batch HSC Science Alpha: 6 students enrolled.','system'],
      [adminIds[0],'Teacher Anisur Rahman has been assigned to Mathematics.','system'],
      [adminIds[0],'New teacher application received from Anisur Rahman.','system'],
      [adminIds[1],'Alo Coaching Center is now active on the platform.','system'],
      [adminIds[1],'Pro subscription activated. All features unlocked.','system'],
      [adminIds[1],'JSC Mathematics batch enrollment updated: 5 students.','system'],
      [adminIds[2],'Medhabi Pathshala application approved. Welcome!','system'],
      [adminIds[2],'IELTS Batch 1 enrollment: 2 students.','system'],
      [adminIds[3],'Proshno Coaching Center approved successfully.','system'],
      [adminIds[3],'Monthly subscription payment: ৳999 confirmed.','fee'],
      [adminIds[4],'Gyaan Niketan is now active. Welcome to Smart Coaching!','system'],
      // Teachers
      [teacherIds[0],'Welcome! Your teacher account at Excellence is ready.','system'],
      [teacherIds[0],'You have been assigned to Mathematics (MATH101).','system'],
      [teacherIds[0],'Mathematics Mid Term 2024 results published.','exam'],
      [teacherIds[0],'Mathematics Live Quiz started. Share access code with students.','quiz'],
      [teacherIds[0],'5 students submitted answers for Mathematics Final.','exam'],
      [teacherIds[1],'Welcome to Excellence Coaching Center!','system'],
      [teacherIds[1],'Physics Unit Test 1 completed. 5 submissions received.','exam'],
      [teacherIds[1],'You are assigned to Physics and Chemistry.','system'],
      [teacherIds[2],'English Grammar Live Quiz completed successfully.','quiz'],
      [teacherIds[2],'Welcome to Excellence! You teach English and Bengali.','system'],
      [teacherIds[3],'JSC Mathematics Chapter Test results ready.','exam'],
      [teacherIds[4],'SSC Physics Live Quiz completed. 3 students participated.','quiz'],
      [teacherIds[4],'Welcome to Alo Coaching Center!','system'],
      [teacherIds[7],'IELTS Mock Reading Test results published.','exam'],
      [teacherIds[7],'Welcome to Medhabi Pathshala!','system'],
      [teacherIds[9],'Engineering Mathematics Test scheduled.','exam'],
      [teacherIds[11],'BCS General Knowledge Quiz completed.','quiz'],
      [teacherIds[13],'A Level Physics Test results published.','exam'],
      // Students
      [studentIds[0],'Welcome to Smart Coaching! Account ready.','system'],
      [studentIds[0],'Mathematics Mid Term 2024 result: Grade A+ (80%).','exam'],
      [studentIds[0],'Monthly fee reminder: HSC Science ৳5000 due.','fee'],
      [studentIds[0],'You are enrolled in HSC Science Alpha batch.','system'],
      [studentIds[1],'Welcome to Excellence Coaching Center!','system'],
      [studentIds[1],'Physics Unit Test 1 result: Grade A (70%).','exam'],
      [studentIds[1],'English Grammar Live Quiz starts in 30 minutes!','quiz'],
      [studentIds[2],'Chemistry Final Exam scheduled. Check timetable.','exam'],
      [studentIds[2],'New study material uploaded for Mathematics.','system'],
      [studentIds[3],'Fee payment reminder: ৳5000 overdue.','fee'],
      [studentIds[4],'Your enrollment in HSC Science is confirmed.','system'],
      [studentIds[5],'Math score 3/10. Review chapters 1-2.','exam'],
      [studentIds[6],'Welcome to Alo Coaching Center!','system'],
      [studentIds[7],'JSC Math Test result: Grade A+ (100%).','exam'],
      [studentIds[12],'English Speaking Assessment is now ongoing. Join!','exam'],
      [studentIds[12],'New IELTS study material uploaded.','system'],
      [studentIds[13],'Your IELTS Mock result is ready. Check results.','exam'],
      [studentIds[18],'BCS GK Quiz result published.','quiz'],
      [studentIds[24],'A Level Physics Test result published.','exam'],
      [studentIds[27],'GRE Batch 2024 enrollment confirmed.','system'],
      // Parents
      [parentIds[0],'Alice Ahmed scored 80% in Mathematics Mid Term 2024.','exam'],
      [parentIds[0],'Fee reminder for Alice Ahmed: ৳5000 due this month.','fee'],
      [parentIds[1],'Bob Hossain Physics result: Grade A (70%).','exam'],
      [parentIds[2],'Monthly fee receipt generated for Mitu Akter.','fee'],
      [parentIds[3],'Arif Rahman exam result is now available.','exam'],
      [parentIds[4],'Tania Akter enrolled in Medical Admission 2024 batch.','system'],
      [parentIds[7],'Shohel Rana BCS Quiz result published.','quiz'],
      [parentIds[8],'Poly Begum O Level Math exam scheduled.','exam'],
    ];
    for (const [uid,msg,type] of notifRows) {
      await client.query(
        `INSERT INTO notification (user_id,message,type,status) VALUES ($1,$2,$3,'unread')`,
        [uid,msg,type]
      );
    }
    console.log(`✅ ${notifRows.length} Notifications`);

    await client.query('COMMIT');

    // ── Summary ────────────────────────────────────────────────────────
    const totalQ = mcqRows.length + tfRows.length + descRows.length;
    console.log('\n🎉 Seed Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('ALL PASSWORDS → pass@1234');
    console.log('───────────────────────────────────────────────────────────');
    console.log('ACCOUNTS:');
    console.log('  super@gmail.com          → Super Admin');
    console.log('  admin@gmail.com          → Coaching Admin  (Excellence, Dhaka)');
    console.log('  admin2@gmail.com         → Coaching Admin  (Alo, Chittagong)');
    console.log('  admin3@gmail.com         → Coaching Admin  (Medhabi, Sylhet)');
    console.log('  admin4@gmail.com         → Coaching Admin  (Proshno, Rajshahi)');
    console.log('  admin5@gmail.com         → Coaching Admin  (Gyaan, Khulna)');
    console.log('  teacher@gmail.com        → Teacher  (Math/Physics, Excellence)');
    console.log('  teacher2-15@gmail.com    → Teachers (various subjects/centers)');
    console.log('  staff@gmail.com          → Staff    (Excellence)');
    console.log('  staff2-5@gmail.com       → Staff    (various centers)');
    console.log('  student1@gmail.com       → Student  (Excellence, HSC Science)');
    console.log('  student2-30@gmail.com    → Students (various centers/courses)');
    console.log('  parent1@gmail.com        → Parent   (child: Alice Ahmed)');
    console.log('  parent2-10@gmail.com     → Parents  (various)');
    console.log('───────────────────────────────────────────────────────────');
    console.log('DATA:');
    console.log(`  5   Coaching Centers   (Excellence, Alo, Medhabi, Proshno, Gyaan)`);
    console.log(`  15  Courses`);
    console.log(`  20  Batches`);
    console.log(`  30  Subjects`);
    console.log(`  ${appData.length}  Teacher Applications  (approved + pending + rejected)`);
    console.log(`  ${assignData.length}  Teacher Course Assignments`);
    console.log(`  ${ceData.length}  Course Enrollments`);
    console.log(`  ${totalQ} Questions`);
    console.log(`       MCQ:         ${mcqRows.length}`);
    console.log(`       True/False:  ${tfRows.length}`);
    console.log(`       Descriptive: ${descRows.length}`);
    console.log(`       → All with: class_name, paper, chapter, chapter_name, topic, explanation`);
    console.log(`       → Sources: manual + ai_generated`);
    console.log(`  15  Exams  (completed, scheduled, ongoing, live_quiz)`);
    console.log(`  ${resultRows.length}  Results`);
    console.log(`  ${notifRows.length}  Notifications`);
    console.log('═══════════════════════════════════════════════════════════');

    process.exit(0);
  } catch(err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();