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
const grade  = (pct) => pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 33 ? 'D' : 'F';
const passed = (pct) => pct >= 33 ? 'pass' : 'fail';
const rnd    = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const txn    = (i) => `TXN${Date.now()}${i}`;
const pad    = (n, len=7) => String(n).padStart(len, '0');

// ── Main Seed ──────────────────────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();
  try {
    console.log('🗑️  Clearing all existing data...');
    await client.query('BEGIN');
    await client.query('DELETE FROM notification');
    await client.query('DELETE FROM result_summary');
    await client.query('DELETE FROM exam_questions');
    await client.query('DELETE FROM quiz_exam');
    await client.query('DELETE FROM question_bank');
    await client.query('DELETE FROM batch_enrollment');
    await client.query('DELETE FROM subjects');
    await client.query('DELETE FROM batch');
    await client.query('DELETE FROM course');
    await client.query('DELETE FROM subscription');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM coaching_center');
    console.log('✅ Cleared!\n');

    // All passwords → pass@1234
    const PASS = await bcrypt.hash('pass@1234', 10);

    // ── 1. SUPER ADMIN ─────────────────────────────────────────────────────
    const { rows: [{ user_id: saId }] } = await client.query(
      `INSERT INTO users (role_id,email,password_hash,name,phone,is_email_verified,status)
       VALUES (1,'super@gmail.com',$1,'Super Admin','01700000001',true,'active')
       RETURNING user_id`, [PASS]
    );
    console.log('✅ Super Admin');

    // ── 2. COACHING ADMINS (5) ─────────────────────────────────────────────
    const adminData = [
      { email:'admin@gmail.com',  name:'Rahim Uddin',    phone:'01711000001' },
      { email:'admin2@gmail.com', name:'Karim Hossain',  phone:'01711000002' },
      { email:'admin3@gmail.com', name:'Jahangir Alam',  phone:'01711000003' },
      { email:'admin4@gmail.com', name:'Monir Ahmed',    phone:'01711000004' },
      { email:'admin5@gmail.com', name:'Sirajul Islam',  phone:'01711000005' },
    ];
    const adminIds = [];
    for (const a of adminData) {
      const { rows:[{user_id}] } = await client.query(
        `INSERT INTO users (role_id,email,password_hash,name,phone,is_email_verified,status)
         VALUES (2,$1,$2,$3,$4,true,'active') RETURNING user_id`,
        [a.email, PASS, a.name, a.phone]
      );
      adminIds.push(user_id);
    }
    console.log(`✅ ${adminIds.length} Coaching Admins`);

    // ── 3. COACHING CENTERS (5) ────────────────────────────────────────────
    const centerData = [
      { name:'Excellence Coaching Center', loc:'Dhaka, Mirpur',         email:'admin@gmail.com',  contact:'01711000001', plan:2 },
      { name:'Alo Coaching Center',        loc:'Chittagong, Agrabad',    email:'admin2@gmail.com', contact:'01711000002', plan:3 },
      { name:'Medhabi Pathshala',          loc:'Sylhet, Zindabazar',     email:'admin3@gmail.com', contact:'01711000003', plan:1 },
      { name:'Proshno Coaching',           loc:'Rajshahi, Shaheb Bazar', email:'admin4@gmail.com', contact:'01711000004', plan:2 },
      { name:'Gyaan Niketan',              loc:'Khulna, Boyra',          email:'admin5@gmail.com', contact:'01711000005', plan:1 },
    ];
    const centerIds = [];
    for (let i = 0; i < centerData.length; i++) {
      const cd = centerData[i];
      const { rows:[{coaching_center_id}] } = await client.query(
        `INSERT INTO coaching_center
           (user_id,center_name,location,contact_number,email,established_date,
            access_type,status,current_plan_id,subscription_start,subscription_end)
         VALUES ($1,$2,$3,$4,$5,'2020-01-01','paid','active',$6,NOW(),NOW()+INTERVAL '1 year')
         RETURNING coaching_center_id`,
        [adminIds[i], cd.name, cd.loc, cd.contact, cd.email, cd.plan]
      );
      centerIds.push(coaching_center_id);
      await client.query('UPDATE users SET coaching_center_id=$1 WHERE user_id=$2', [coaching_center_id, adminIds[i]]);
    }
    console.log(`✅ ${centerIds.length} Coaching Centers`);

    // ── 4. TEACHERS (15) ───────────────────────────────────────────────────
    const teacherData = [
      { email:'teacher@gmail.com',   name:'Anisur Rahman',    spec:'Mathematics, Physics',   ci:0, sal:45000, exp:10 },
      { email:'teacher2@gmail.com',  name:'Fatema Begum',     spec:'Chemistry, Biology',     ci:0, sal:38000, exp:7  },
      { email:'teacher3@gmail.com',  name:'Mizanur Rahman',   spec:'English, Bengali',       ci:0, sal:35000, exp:8  },
      { email:'teacher4@gmail.com',  name:'Sumaiya Khanam',   spec:'Mathematics',            ci:1, sal:42000, exp:9  },
      { email:'teacher5@gmail.com',  name:'Abdur Rob',        spec:'Physics, Chemistry',     ci:1, sal:40000, exp:11 },
      { email:'teacher6@gmail.com',  name:'Nasrin Akter',     spec:'Biology',                ci:1, sal:32000, exp:5  },
      { email:'teacher7@gmail.com',  name:'Kamrul Hasan',     spec:'Mathematics, ICT',       ci:2, sal:36000, exp:6  },
      { email:'teacher8@gmail.com',  name:'Roksana Parvin',   spec:'English',                ci:2, sal:30000, exp:4  },
      { email:'teacher9@gmail.com',  name:'Shahadat Hossain', spec:'History, Civics',        ci:2, sal:28000, exp:3  },
      { email:'teacher10@gmail.com', name:'Moriom Begum',     spec:'Bengali Literature',     ci:3, sal:31000, exp:6  },
      { email:'teacher11@gmail.com', name:'Jahirul Islam',    spec:'Physics',                ci:3, sal:39000, exp:8  },
      { email:'teacher12@gmail.com', name:'Tania Sultana',    spec:'Chemistry',              ci:3, sal:37000, exp:7  },
      { email:'teacher13@gmail.com', name:'Rafiqul Islam',    spec:'Mathematics',            ci:4, sal:43000, exp:12 },
      { email:'teacher14@gmail.com', name:'Dilruba Yasmin',   spec:'Biology, English',       ci:4, sal:33000, exp:5  },
      { email:'teacher15@gmail.com', name:'Mahbubur Rahman',  spec:'ICT, Mathematics',       ci:4, sal:41000, exp:9  },
    ];
    const teacherIds = [];
    for (let i = 0; i < teacherData.length; i++) {
      const t = teacherData[i];
      const { rows:[{user_id}] } = await client.query(
        `INSERT INTO users
           (role_id,email,password_hash,name,phone,is_email_verified,status,
            subject_specialization,employment_status,coaching_center_id,salary,experience)
         VALUES (3,$1,$2,$3,$4,true,'active',$5,'full_time',$6,$7,$8) RETURNING user_id`,
        [t.email, PASS, t.name, `017${pad(i+100)}`, t.spec, centerIds[t.ci], t.sal, t.exp]
      );
      teacherIds.push(user_id);
    }
    console.log(`✅ ${teacherIds.length} Teachers`);

    // ── 5. STAFF (5) ────────────────────────────────────────────────────────
    const staffData = [
      { email:'staff@gmail.com',  name:'Habibur Rahman', ci:0 },
      { email:'staff2@gmail.com', name:'Salma Khatun',   ci:1 },
      { email:'staff3@gmail.com', name:'Nurul Huda',     ci:2 },
      { email:'staff4@gmail.com', name:'Kohinur Begum',  ci:3 },
      { email:'staff5@gmail.com', name:'Abul Kashem',    ci:4 },
    ];
    const staffIds = [];
    for (let i = 0; i < staffData.length; i++) {
      const s = staffData[i];
      const { rows:[{user_id}] } = await client.query(
        `INSERT INTO users (role_id,email,password_hash,name,phone,is_email_verified,status,coaching_center_id)
         VALUES (4,$1,$2,$3,$4,true,'active',$5) RETURNING user_id`,
        [s.email, PASS, s.name, `018${pad(i+100)}`, centerIds[s.ci]]
      );
      staffIds.push(user_id);
    }
    console.log(`✅ ${staffIds.length} Staff`);

    // ── 6. STUDENTS (30) ────────────────────────────────────────────────────
    const studentNames = [
      'Alice Ahmed','Bob Hossain','Riya Begum','Sakib Khan','Nadia Islam',
      'Tanvir Ahmed','Mitu Akter','Arif Rahman','Sadia Khanam','Rakib Hasan',
      'Lamia Sultana','Naim Uddin','Tania Akter','Imran Hossain','Rima Begum',
      'Sabbir Ahmed','Puja Rani Das','Fahim Islam','Urmi Khatun','Shohel Rana',
      'Bristy Das','Mahim Khan','Suchi Sarkar','Raihan Ali','Poly Begum',
      'Jewel Hossain','Mitu Das','Kayes Ahmed','Laboni Akter','Tuhin Islam',
    ];
    const studentCi   = [0,0,0,0,0,0, 1,1,1,1,1,1, 2,2,2,2,2,2, 3,3,3,3,3,3, 4,4,4,4,4,4];
    const studentClass = [
      '11-12(Higher Secondary)','11-12(Higher Secondary)','11-12(Higher Secondary)',
      '9-10 (Secondary)','9-10 (Secondary)','9-10 (Secondary)',
      '11-12(Higher Secondary)','11-12(Higher Secondary)','9-10 (Secondary)',
      '9-10 (Secondary)','9-10 (Secondary)','9-10 (Secondary)',
      '11-12(Higher Secondary)','11-12(Higher Secondary)','11-12(Higher Secondary)',
      '9-10 (Secondary)','9-10 (Secondary)','9-10 (Secondary)',
      '11-12(Higher Secondary)','11-12(Higher Secondary)','9-10 (Secondary)',
      '9-10 (Secondary)','11-12(Higher Secondary)','11-12(Higher Secondary)',
      '9-10 (Secondary)','9-10 (Secondary)','11-12(Higher Secondary)',
      '11-12(Higher Secondary)','9-10 (Secondary)','9-10 (Secondary)',
    ];
    const studentIds = [];
    for (let i = 0; i < 30; i++) {
      const email = `student${i+1}@gmail.com`;
      const gn    = i % 3 === 0 ? 'Science' : i % 3 === 1 ? 'Commerce' : 'Arts';
      const { rows:[{user_id}] } = await client.query(
        `INSERT INTO users
           (role_id,email,password_hash,name,phone,is_email_verified,status,
            roll_number,class,group_name,coaching_center_id,gender,guardian_name,guardian_phone)
         VALUES (5,$1,$2,$3,$4,true,'active',$5,$6,$7,$8,$9,$10,$11) RETURNING user_id`,
        [email, PASS, studentNames[i], `019${pad(i+100)}`,
         `ROLL${String(i+1).padStart(3,'0')}`, studentClass[i], gn,
         centerIds[studentCi[i]], i%2===0?'Male':'Female',
         `Parent of ${studentNames[i]}`, `016${pad(i+100)}`]
      );
      studentIds.push(user_id);
    }
    console.log(`✅ ${studentIds.length} Students`);

    // ── 7. PARENTS (10) ─────────────────────────────────────────────────────
    const parentNames = [
      'Abdullah Ahmed','Rahima Begum','Kamal Hossain','Sufia Khatun','Nazrul Islam',
      'Hosne Ara','Jalal Uddin','Momtaz Begum','Shamsul Haque','Firoza Akter',
    ];
    const parentIds = [];
    for (let i = 0; i < 10; i++) {
      const { rows:[{user_id}] } = await client.query(
        `INSERT INTO users (role_id,email,password_hash,name,phone,is_email_verified,status,coaching_center_id)
         VALUES (6,$1,$2,$3,$4,true,'active',$5) RETURNING user_id`,
        [`parent${i+1}@gmail.com`, PASS, parentNames[i], `016${pad(i+200)}`, centerIds[Math.floor(i/2)]]
      );
      parentIds.push(user_id);
    }
    console.log(`✅ ${parentIds.length} Parents`);

    // ── 8. COURSES (15) ─────────────────────────────────────────────────────
    const courseData = [
      { title:'HSC Science Complete',        desc:'Full HSC Science with Physics, Chemistry, Biology, Math',  dur:'12 months', fee:5000,  ci:0 },
      { title:'SSC General Complete',         desc:'SSC General with all core subjects',                       dur:'10 months', fee:3500,  ci:0 },
      { title:'HSC Business Studies',         desc:'Accounting, Business English, Economics',                  dur:'12 months', fee:4500,  ci:0 },
      { title:'JSC Mathematics Special',      desc:'JSC Mathematics intensive preparation',                    dur:'6 months',  fee:2000,  ci:1 },
      { title:'HSC Humanities',               desc:'History, Civics, Bengali, English',                        dur:'12 months', fee:4000,  ci:1 },
      { title:'SSC Science',                  desc:'SSC Physics, Chemistry, Biology, Math',                    dur:'10 months', fee:3800,  ci:1 },
      { title:'English Speaking Course',      desc:'Advanced English communication and grammar',               dur:'3 months',  fee:1500,  ci:2 },
      { title:'IELTS Preparation Complete',   desc:'Full IELTS Reading, Writing, Listening, Speaking',         dur:'4 months',  fee:8000,  ci:2 },
      { title:'Medical Admission Prep',       desc:'Biology, Chemistry for medical college admission',         dur:'8 months',  fee:12000, ci:2 },
      { title:'Engineering Admission Prep',   desc:'Math, Physics for engineering university admission',       dur:'8 months',  fee:10000, ci:3 },
      { title:'BCS Preparation Complete',     desc:'GK, Math, English, Bangla for BCS',                       dur:'12 months', fee:6000,  ci:3 },
      { title:'Primary Education Support',    desc:'Classes 1-5 all subjects support',                        dur:'6 months',  fee:1200,  ci:3 },
      { title:'O Level Mathematics',          desc:'O Level Pure Math and Statistics',                         dur:'9 months',  fee:7000,  ci:4 },
      { title:'A Level Physics Complete',     desc:'A Level Mechanics, Waves, Electricity',                   dur:'9 months',  fee:7500,  ci:4 },
      { title:'GRE Preparation',              desc:'GRE Quantitative and Verbal Reasoning',                   dur:'3 months',  fee:9000,  ci:4 },
    ];
    const courseIds = [];
    for (const c of courseData) {
      const { rows:[{course_id}] } = await client.query(
        `INSERT INTO course (coaching_center_id,course_title,course_description,duration,fee)
         VALUES ($1,$2,$3,$4,$5) RETURNING course_id`,
        [centerIds[c.ci], c.title, c.desc, c.dur, c.fee]
      );
      courseIds.push(course_id);
    }
    console.log(`✅ ${courseIds.length} Courses`);

    // ── 9. BATCHES (20) ─────────────────────────────────────────────────────
    const batchData = [
      { ci:0, co:0,  name:'HSC Science Batch A',      code:'HSCA2024', type:'regular', shift:'morning', max:30, status:'running'   },
      { ci:0, co:0,  name:'HSC Science Batch B',      code:'HSCB2024', type:'regular', shift:'evening', max:25, status:'running'   },
      { ci:0, co:1,  name:'SSC General Batch 2024',   code:'SSC2024',  type:'regular', shift:'morning', max:35, status:'running'   },
      { ci:0, co:2,  name:'Business Studies Batch',   code:'BBA2024',  type:'regular', shift:'day',     max:20, status:'upcoming'  },
      { ci:1, co:3,  name:'JSC Math Morning',         code:'JSC2024',  type:'regular', shift:'morning', max:40, status:'running'   },
      { ci:1, co:4,  name:'Humanities Batch',         code:'HUM2024',  type:'regular', shift:'evening', max:25, status:'running'   },
      { ci:1, co:5,  name:'SSC Science Crash',        code:'SSCC2024', type:'crash',   shift:'morning', max:30, status:'running'   },
      { ci:2, co:6,  name:'English Batch A',          code:'ENGA2024', type:'weekend', shift:'morning', max:20, status:'running'   },
      { ci:2, co:7,  name:'IELTS Batch 1',            code:'IEL2024A', type:'regular', shift:'evening', max:15, status:'running'   },
      { ci:2, co:8,  name:'Medical Admission 2024',   code:'MED2024',  type:'crash',   shift:'morning', max:50, status:'running'   },
      { ci:3, co:9,  name:'Engineering Batch A',      code:'ENGA2024', type:'regular', shift:'morning', max:40, status:'running'   },
      { ci:3, co:10, name:'BCS Batch A',              code:'BCS2024A', type:'regular', shift:'evening', max:30, status:'upcoming'  },
      { ci:3, co:11, name:'Primary Batch',            code:'PRI2024',  type:'regular', shift:'morning', max:25, status:'running'   },
      { ci:4, co:12, name:'O Level Math Batch',       code:'OLM2024',  type:'regular', shift:'evening', max:20, status:'running'   },
      { ci:4, co:13, name:'A Level Physics Batch',    code:'ALP2024',  type:'regular', shift:'morning', max:15, status:'running'   },
      { ci:4, co:14, name:'GRE 2024 Batch',           code:'GRE2024',  type:'weekend', shift:'morning', max:20, status:'upcoming'  },
      { ci:0, co:0,  name:'HSC Science Batch C',      code:'HSCC2024', type:'crash',   shift:'night',   max:20, status:'completed' },
      { ci:1, co:5,  name:'SSC Science Batch 2',      code:'SSCB2024', type:'crash',   shift:'evening', max:30, status:'completed' },
      { ci:2, co:7,  name:'IELTS Batch 2',            code:'IEL2024B', type:'regular', shift:'morning', max:15, status:'upcoming'  },
      { ci:3, co:9,  name:'Engineering Batch B',      code:'ENGB2024', type:'crash',   shift:'evening', max:35, status:'upcoming'  },
    ];
    const batchIds = [];
    for (const b of batchData) {
      const { rows:[{batch_id}] } = await client.query(
        `INSERT INTO batch
           (course_id,coaching_center_id,batch_name,batch_code,
            start_date,end_date,batch_type,class_shift,max_students,status)
         VALUES ($1,$2,$3,$4,'2024-01-01','2024-12-31',$5,$6,$7,$8) RETURNING batch_id`,
        [courseIds[b.co], centerIds[b.ci], b.name, b.code, b.type, b.shift, b.max, b.status]
      );
      batchIds.push(batch_id);
    }
    console.log(`✅ ${batchIds.length} Batches`);

    // ── 10. BATCH ENROLLMENTS ────────────────────────────────────────────────
    const enrollMap = [
      [0, [0,1,2,3,4,5]], [1, [0,1,2]], [2, [3,4,5]], [3, [0,1]],
      [4, [6,7,8,9,10]],  [5, [6,7,8]], [6, [9,10,11]],
      [7, [12,13,14]],    [8, [12,13]], [9, [15,16,17]],
      [10,[18,19,20,21]], [11,[18,19]], [12,[22,23]],
      [13,[24,25,26]],    [14,[24,25]], [16,[0,1]],    [17,[9,10]],
    ];
    for (const [bi, sis] of enrollMap) {
      for (const si of sis) {
        await client.query(
          `INSERT INTO batch_enrollment (batch_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [batchIds[bi], studentIds[si]]
        );
        await client.query(
          `UPDATE batch SET current_students=current_students+1 WHERE batch_id=$1`, [batchIds[bi]]
        );
      }
    }
    console.log('✅ Batch Enrollments');

    // ── 11. SUBJECTS (30) ────────────────────────────────────────────────────
    const subjectData = [
      // ci=0 Excellence, course 0 (HSC Science)
      { name:'Mathematics',           code:'MATH101', co:0,  ti:0,  ci:0 },
      { name:'Physics',               code:'PHY101',  co:0,  ti:1,  ci:0 },
      { name:'Chemistry',             code:'CHEM101', co:0,  ti:1,  ci:0 },
      { name:'Biology',               code:'BIO101',  co:0,  ti:1,  ci:0 },
      { name:'English',               code:'ENG101',  co:0,  ti:2,  ci:0 },
      { name:'Bengali',               code:'BEN101',  co:1,  ti:2,  ci:0 },  // 5 - course 1 SSC
      { name:'General Mathematics',   code:'GMAT101', co:1,  ti:0,  ci:0 },  // 6
      { name:'Accounting',            code:'ACC101',  co:2,  ti:2,  ci:0 },  // 7 - course 2 Business
      { name:'Business English',      code:'BENG101', co:2,  ti:2,  ci:0 },  // 8
      // ci=1 Alo, course 3 JSC
      { name:'Higher Mathematics',    code:'HMAT101', co:3,  ti:3,  ci:1 },  // 9
      { name:'Physics Advanced',      code:'PHYA101', co:4,  ti:4,  ci:1 },  // 10 - course 4 Humanities
      { name:'History',               code:'HIST101', co:4,  ti:5,  ci:1 },  // 11
      { name:'SSC Physics',           code:'SPHY101', co:5,  ti:4,  ci:1 },  // 12 - course 5 SSC Science
      { name:'SSC Chemistry',         code:'SCHE101', co:5,  ti:5,  ci:1 },  // 13
      // ci=2 Medhabi, course 6 English
      { name:'Communication English', code:'CENG101', co:6,  ti:6,  ci:2 },  // 14
      { name:'IELTS Reading',         code:'IREAD101',co:7,  ti:7,  ci:2 },  // 15 - course 7 IELTS
      { name:'IELTS Writing',         code:'IWRIT101',co:7,  ti:7,  ci:2 },  // 16
      { name:'IELTS Listening',       code:'ILIST101',co:7,  ti:6,  ci:2 },  // 17
      { name:'Medical Biology',       code:'MBIO101', co:8,  ti:8,  ci:2 },  // 18 - course 8 Medical
      { name:'Medical Chemistry',     code:'MCHE101', co:8,  ti:8,  ci:2 },  // 19
      // ci=3 Proshno, course 9 Engineering
      { name:'Engineering Math',      code:'EMAT101', co:9,  ti:9,  ci:3 },  // 20
      { name:'Engineering Physics',   code:'EPHY101', co:9,  ti:10, ci:3 },  // 21
      { name:'BCS General Knowledge', code:'BCSGK101',co:10, ti:11, ci:3 },  // 22 - course 10 BCS
      { name:'BCS Mathematics',       code:'BCSM101', co:10, ti:9,  ci:3 },  // 23
      { name:'Primary Mathematics',   code:'PMAT101', co:11, ti:12, ci:3 },  // 24 - course 11 Primary
      // ci=4 Gyaan, course 12 O Level
      { name:'O Level Math Pure',     code:'OLMP101', co:12, ti:12, ci:4 },  // 25
      { name:'O Level Math Stats',    code:'OLMS101', co:12, ti:12, ci:4 },  // 26
      { name:'A Level Mechanics',     code:'ALPM101', co:13, ti:13, ci:4 },  // 27 - course 13 A Level
      { name:'A Level Waves',         code:'ALPW101', co:13, ti:13, ci:4 },  // 28
      { name:'GRE Quantitative',      code:'GREQ101', co:14, ti:14, ci:4 },  // 29 - course 14 GRE
    ];
    const subjectIds = [];
    for (const s of subjectData) {
      const { rows:[{subject_id}] } = await client.query(
        `INSERT INTO subjects
           (course_id,coaching_center_id,teacher_user_id,subject_name,subject_code,assigned_date,is_active)
         VALUES ($1,$2,$3,$4,$5,NOW(),true) RETURNING subject_id`,
        [courseIds[s.co], centerIds[s.ci], teacherIds[s.ti], s.name, s.code]
      );
      subjectIds.push(subject_id);
    }
    console.log(`✅ ${subjectIds.length} Subjects`);

    // ── 12. QUESTIONS ─────────────────────────────────────────────────────────
    // Format: { ci, si, co, class_name, paper, chapter, chapter_name, topic,
    //           text, type, diff, a, b, c, d, correct, answer, marks, ti }
    // type: 'mcq' | 'true_false' | 'descriptive'

    const questions = [

      // ═══════════════════════════════════════════════════════════════════
      // MATHEMATICS (subject index 0) — HSC Science — ci:0
      // ═══════════════════════════════════════════════════════════════════
      // Chapter 1: Real Numbers
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Real Numbers', topic:'Number System',
        text:'Which of the following is an irrational number?', type:'mcq', diff:'easy', a:'√4', b:'√9', c:'√2', d:'√16', correct:'C', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Real Numbers', topic:'Number System',
        text:'The decimal expansion of 22/7 is:', type:'mcq', diff:'easy', a:'Terminating', b:'Non-terminating repeating', c:'Non-terminating non-repeating', d:'Rational', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Real Numbers', topic:'HCF and LCM',
        text:'HCF of 36 and 48 is:', type:'mcq', diff:'easy', a:'6', b:'12', c:'18', d:'24', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Real Numbers', topic:'HCF and LCM',
        text:'LCM of 12 and 18 is:', type:'mcq', diff:'easy', a:'24', b:'36', c:'48', d:'60', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Real Numbers', topic:'Surds',
        text:'√144 equals:', type:'mcq', diff:'easy', a:'10', b:'12', c:'14', d:'16', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Real Numbers', topic:'Number System',
        text:'Is √2 a rational number?', type:'true_false', diff:'easy', a:'True', b:'False', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Real Numbers', topic:'Number System',
        text:'Zero is a positive number.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Real Numbers', topic:'Irrational Numbers',
        text:'Prove that √2 is irrational using contradiction.', type:'descriptive', diff:'hard', answer:'Assume √2=p/q in lowest terms. Then p²=2q², so p is even, write p=2k. Then 4k²=2q², q²=2k², so q is also even. This contradicts p/q being in lowest terms. Therefore √2 is irrational.', marks:5, ti:0 },

      // Chapter 2: Algebra
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Algebra', topic:'Quadratic Equations',
        text:'If x²−5x+6=0, the roots are:', type:'mcq', diff:'medium', a:'1 and 6', b:'2 and 3', c:'1 and 5', d:'3 and 4', correct:'B', marks:2, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Algebra', topic:'Quadratic Equations',
        text:'The discriminant of ax²+bx+c=0 is:', type:'mcq', diff:'medium', a:'b²+4ac', b:'b²−4ac', c:'4ac−b²', d:'√(b²−4ac)', correct:'B', marks:2, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Algebra', topic:'Linear Equations',
        text:'Solve: 3x + 7 = 22. x = ?', type:'mcq', diff:'easy', a:'3', b:'5', c:'7', d:'9', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Algebra', topic:'Polynomials',
        text:'Degree of polynomial 3x³+2x²−x+5 is:', type:'mcq', diff:'easy', a:'1', b:'2', c:'3', d:'4', correct:'C', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Algebra', topic:'Quadratic Equations',
        text:'Every quadratic equation has exactly two distinct real roots.', type:'true_false', diff:'medium', a:'True', b:'False', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Algebra', topic:'Quadratic Equations',
        text:'Solve x²−5x+6=0 showing all steps using the factorization method.', type:'descriptive', diff:'medium', answer:'x²−5x+6=0 → (x−2)(x−3)=0 → x=2 or x=3. Verification: 4−10+6=0 ✓ and 9−15+6=0 ✓', marks:4, ti:0 },

      // Chapter 3: Trigonometry
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'3', chapter_name:'Trigonometry', topic:'Trigonometric Identities',
        text:'sin²θ + cos²θ = ?', type:'mcq', diff:'easy', a:'0', b:'1', c:'2', d:'-1', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'3', chapter_name:'Trigonometry', topic:'Trigonometric Ratios',
        text:'sin(90°) = ?', type:'mcq', diff:'easy', a:'0', b:'1', c:'-1', d:'√2', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'3', chapter_name:'Trigonometry', topic:'Trigonometric Ratios',
        text:'cos(60°) = ?', type:'mcq', diff:'easy', a:'√3/2', b:'1/2', c:'1', d:'0', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'3', chapter_name:'Trigonometry', topic:'Trigonometric Identities',
        text:'1 + tan²θ = ?', type:'mcq', diff:'medium', a:'sin²θ', b:'cos²θ', c:'sec²θ', d:'cosec²θ', correct:'C', marks:2, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'3', chapter_name:'Trigonometry', topic:'Trigonometric Identities',
        text:'sin²θ + cos²θ = 1 is a fundamental identity.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:0 },

      // Chapter 4: Calculus
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Calculus', topic:'Differentiation',
        text:'Derivative of x³ with respect to x is:', type:'mcq', diff:'medium', a:'2x', b:'3x²', c:'x²', d:'3x', correct:'B', marks:2, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Calculus', topic:'Differentiation',
        text:'Derivative of a constant is:', type:'mcq', diff:'easy', a:'1', b:'Infinity', c:'0', d:'The constant itself', correct:'C', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Calculus', topic:'Integration',
        text:'∫sin(x)dx = ?', type:'mcq', diff:'medium', a:'cos(x)+C', b:'-cos(x)+C', c:'sin(x)+C', d:'-sin(x)+C', correct:'B', marks:2, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Calculus', topic:'Integration',
        text:'∫x² dx = ?', type:'mcq', diff:'medium', a:'x³+C', b:'x³/3+C', c:'2x', d:'x²/2+C', correct:'B', marks:2, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Calculus', topic:'Differentiation',
        text:'The derivative of a constant is always zero.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Calculus', topic:'Differentiation',
        text:'Find dy/dx if y = 3x⁴ − 2x² + 5x − 7, showing all steps.', type:'descriptive', diff:'hard', answer:'dy/dx = 12x³ − 4x + 5. Using power rule: d/dx(3x⁴)=12x³, d/dx(2x²)=4x, d/dx(5x)=5, d/dx(7)=0.', marks:5, ti:0 },

      // Chapter 5: Coordinate Geometry
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'5', chapter_name:'Coordinate Geometry', topic:'Straight Lines',
        text:'Slope of line y = 2x + 5 is:', type:'mcq', diff:'easy', a:'5', b:'2', c:'1', d:'3', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'5', chapter_name:'Coordinate Geometry', topic:'Circle',
        text:'Area of circle with radius 7 is:', type:'mcq', diff:'easy', a:'22π', b:'49π', c:'14π', d:'77π', correct:'B', marks:1, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'5', chapter_name:'Coordinate Geometry', topic:'Straight Lines',
        text:'Distance between points (0,0) and (3,4) is:', type:'mcq', diff:'medium', a:'4', b:'5', c:'7', d:'6', correct:'B', marks:2, ti:0 },
      { ci:0, si:0, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'5', chapter_name:'Coordinate Geometry', topic:'Straight Lines',
        text:'Two parallel lines have equal slopes.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:0 },

      // ═══════════════════════════════════════════════════════════════════
      // PHYSICS (subject index 1) — HSC Science — ci:0
      // ═══════════════════════════════════════════════════════════════════
      // Chapter 1: Mechanics
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Newton\'s Laws',
        text:'Newton\'s second law states F = ?', type:'mcq', diff:'easy', a:'mv', b:'ma', c:'m/a', d:'a/m', correct:'B', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Newton\'s Laws',
        text:'A body of mass 5 kg acted on by 20 N. Acceleration = ?', type:'mcq', diff:'medium', a:'2 m/s²', b:'4 m/s²', c:'10 m/s²', d:'100 m/s²', correct:'B', marks:2, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Newton\'s Laws',
        text:'SI unit of force is:', type:'mcq', diff:'easy', a:'Watt', b:'Newton', c:'Joule', d:'Pascal', correct:'B', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Gravity',
        text:'Value of g on Earth surface is approximately:', type:'mcq', diff:'easy', a:'8.9 m/s²', b:'9.8 m/s²', c:'10.8 m/s²', d:'11.8 m/s²', correct:'B', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Work and Energy',
        text:'Work done = Force × ?', type:'mcq', diff:'easy', a:'Time', b:'Distance', c:'Mass', d:'Velocity', correct:'B', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Work and Energy',
        text:'Unit of power is:', type:'mcq', diff:'easy', a:'Newton', b:'Watt', c:'Joule', d:'Pascal', correct:'B', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Newton\'s Laws',
        text:'Every action has an equal and opposite reaction — Newton\'s 3rd Law.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Newton\'s Laws',
        text:'Describe Newton\'s three laws of motion with one real-life example for each.', type:'descriptive', diff:'hard', answer:'1st: Inertia — passenger pushed back in accelerating car. 2nd: F=ma — heavier object needs more force. 3rd: Rocket propulsion — exhaust pushes backward, rocket moves forward.', marks:6, ti:1 },

      // Chapter 2: Waves and Sound
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Waves and Sound', topic:'Sound',
        text:'Speed of sound in air at room temperature is approximately:', type:'mcq', diff:'easy', a:'100 m/s', b:'343 m/s', c:'1500 m/s', d:'3×10⁸ m/s', correct:'B', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Waves and Sound', topic:'Frequency',
        text:'Unit of frequency is:', type:'mcq', diff:'easy', a:'Meter', b:'Hertz', c:'Newton', d:'Pascal', correct:'B', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Waves and Sound', topic:'Sound',
        text:'Sound travels faster than light.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'B', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Waves and Sound', topic:'Waves',
        text:'Explain the difference between transverse and longitudinal waves with examples.', type:'descriptive', diff:'medium', answer:'Transverse waves: particles oscillate perpendicular to wave direction. Example: light waves. Longitudinal waves: particles oscillate parallel to wave direction. Example: sound waves.', marks:4, ti:1 },

      // Chapter 3: Optics
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'3', chapter_name:'Optics', topic:'Reflection',
        text:'When light passes from air into glass, its speed:', type:'mcq', diff:'medium', a:'Increases', b:'Stays same', c:'Decreases', d:'Becomes zero', correct:'C', marks:2, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'3', chapter_name:'Optics', topic:'Light',
        text:'Speed of light in vacuum is:', type:'mcq', diff:'easy', a:'2×10⁸ m/s', b:'3×10⁸ m/s', c:'4×10⁸ m/s', d:'1×10⁸ m/s', correct:'B', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'3', chapter_name:'Optics', topic:'Reflection',
        text:'Light travels in a straight line in a uniform medium.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:1 },

      // Chapter 4: Electricity
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Electricity', topic:'Ohm\'s Law',
        text:'Ohm\'s law: V = ?', type:'mcq', diff:'easy', a:'I/R', b:'IR', c:'I+R', d:'I-R', correct:'B', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Electricity', topic:'Units',
        text:'SI unit of electric current is:', type:'mcq', diff:'easy', a:'Volt', b:'Ampere', c:'Ohm', d:'Watt', correct:'B', marks:1, ti:1 },
      { ci:0, si:1, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Electricity', topic:'Current',
        text:'Electric current flows from negative to positive terminal inside a battery.', type:'true_false', diff:'medium', a:'True', b:'False', correct:'A', marks:1, ti:1 },

      // ═══════════════════════════════════════════════════════════════════
      // CHEMISTRY (subject index 2) — HSC Science — ci:0
      // ═══════════════════════════════════════════════════════════════════
      { ci:0, si:2, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Atomic Structure', topic:'Periodic Table',
        text:'Atomic number of Carbon is:', type:'mcq', diff:'easy', a:'4', b:'6', c:'8', d:'12', correct:'B', marks:1, ti:1 },
      { ci:0, si:2, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Atomic Structure', topic:'Electron Configuration',
        text:'Valence electrons of Sodium (Na) is:', type:'mcq', diff:'easy', a:'1', b:'2', c:'3', d:'4', correct:'A', marks:1, ti:1 },
      { ci:0, si:2, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Atomic Structure', topic:'Periodic Table',
        text:'Symbol for Gold is:', type:'mcq', diff:'medium', a:'Go', b:'Au', c:'Ag', d:'Gd', correct:'B', marks:2, ti:1 },
      { ci:0, si:2, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Chemical Bonding', topic:'Covalent Bond',
        text:'Type of bond in H₂O molecule is:', type:'mcq', diff:'medium', a:'Ionic', b:'Covalent', c:'Metallic', d:'Hydrogen bond', correct:'B', marks:2, ti:1 },
      { ci:0, si:2, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'3', chapter_name:'Acids Bases and Salts', topic:'pH Scale',
        text:'pH of pure water at 25°C is:', type:'mcq', diff:'easy', a:'5', b:'7', c:'9', d:'11', correct:'B', marks:1, ti:1 },
      { ci:0, si:2, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'3', chapter_name:'Acids Bases and Salts', topic:'pH Scale',
        text:'An acidic solution has pH less than 7.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:1 },
      { ci:0, si:2, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'4', chapter_name:'Gases', topic:'Gas Laws',
        text:'Most abundant gas in the atmosphere is:', type:'mcq', diff:'easy', a:'Oxygen', b:'Nitrogen', c:'CO₂', d:'Hydrogen', correct:'B', marks:1, ti:1 },
      { ci:0, si:2, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'4', chapter_name:'Gases', topic:'Gas Laws',
        text:'Molecular weight of CO₂ is:', type:'mcq', diff:'medium', a:'40', b:'44', c:'48', d:'52', correct:'B', marks:2, ti:1 },
      { ci:0, si:2, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'5', chapter_name:'Chemical Kinetics', topic:'Reaction Rates',
        text:'A catalyst works by lowering the activation energy of a reaction.', type:'true_false', diff:'medium', a:'True', b:'False', correct:'A', marks:1, ti:1 },
      { ci:0, si:2, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'5', chapter_name:'Chemical Kinetics', topic:'Catalysts',
        text:'Explain the role of a catalyst in a chemical reaction with one example.', type:'descriptive', diff:'medium', answer:'A catalyst lowers activation energy without being consumed. Example: MnO₂ in decomposition of H₂O₂: 2H₂O₂ → 2H₂O + O₂. MnO₂ speeds this up without being used up.', marks:4, ti:1 },
      { ci:0, si:2, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'6', chapter_name:'Electrochemistry', topic:'Electrolysis',
        text:'NaCl is an example of:', type:'mcq', diff:'easy', a:'Acid', b:'Base', c:'Salt', d:'Oxide', correct:'C', marks:1, ti:1 },

      // ═══════════════════════════════════════════════════════════════════
      // BIOLOGY (subject index 3) — HSC Science — ci:0
      // ═══════════════════════════════════════════════════════════════════
      { ci:0, si:3, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Cell Biology', topic:'Cell Organelles',
        text:'Powerhouse of the cell is:', type:'mcq', diff:'easy', a:'Nucleus', b:'Mitochondria', c:'Ribosome', d:'Chloroplast', correct:'B', marks:1, ti:1 },
      { ci:0, si:3, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Cell Biology', topic:'Cell Organelles',
        text:'Photosynthesis takes place in:', type:'mcq', diff:'easy', a:'Mitochondria', b:'Chloroplast', c:'Nucleus', d:'Ribosome', correct:'B', marks:1, ti:1 },
      { ci:0, si:3, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Genetics', topic:'DNA',
        text:'DNA stands for:', type:'mcq', diff:'easy', a:'Deoxyribose Nucleic', b:'Deoxyribonucleic Acid', c:'Diribonucleic Acid', d:'Dinucleic Acid', correct:'B', marks:1, ti:1 },
      { ci:0, si:3, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Genetics', topic:'Chromosomes',
        text:'Normal human body cells contain how many chromosomes?', type:'mcq', diff:'medium', a:'44', b:'46', c:'48', d:'50', correct:'B', marks:2, ti:1 },
      { ci:0, si:3, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'3', chapter_name:'Plant Biology', topic:'Photosynthesis',
        text:'Equation: 6CO₂+6H₂O+light → C₆H₁₂O₆+6O₂ represents photosynthesis.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:1 },
      { ci:0, si:3, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'3', chapter_name:'Plant Biology', topic:'Photosynthesis',
        text:'Viruses are considered living organisms.', type:'true_false', diff:'medium', a:'True', b:'False', correct:'B', marks:1, ti:1 },
      { ci:0, si:3, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Cell Division', topic:'Mitosis',
        text:'Mitosis produces:', type:'mcq', diff:'medium', a:'4 haploid cells', b:'2 identical diploid cells', c:'2 haploid cells', d:'4 diploid cells', correct:'B', marks:2, ti:1 },
      { ci:0, si:3, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Cell Division', topic:'Photosynthesis',
        text:'Describe the process of photosynthesis including the light and dark reactions.', type:'descriptive', diff:'hard', answer:'Photosynthesis: 6CO₂+6H₂O+light→C₆H₁₂O₆+6O₂. Light reactions in thylakoid: ATP and NADPH produced. Dark reactions (Calvin cycle) in stroma: CO₂ fixed into glucose using ATP and NADPH.', marks:6, ti:1 },

      // ═══════════════════════════════════════════════════════════════════
      // ENGLISH (subject index 4) — HSC Science — ci:0
      // ═══════════════════════════════════════════════════════════════════
      { ci:0, si:4, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Grammar', topic:'Subject-Verb Agreement',
        text:'Which sentence is grammatically correct?', type:'mcq', diff:'easy', a:'She go to school', b:'She goes to school', c:'She going to school', d:'She gone to school', correct:'B', marks:1, ti:2 },
      { ci:0, si:4, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Grammar', topic:'Tenses',
        text:'"I have eaten" is in which tense?', type:'mcq', diff:'medium', a:'Simple Past', b:'Present Perfect', c:'Past Perfect', d:'Future Perfect', correct:'B', marks:2, ti:2 },
      { ci:0, si:4, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Vocabulary', topic:'Synonyms and Antonyms',
        text:'Antonym of happy is:', type:'mcq', diff:'easy', a:'Joyful', b:'Sad', c:'Glad', d:'Pleased', correct:'B', marks:1, ti:2 },
      { ci:0, si:4, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Vocabulary', topic:'Synonyms and Antonyms',
        text:'Synonym of beautiful is:', type:'mcq', diff:'easy', a:'Ugly', b:'Lovely', c:'Plain', d:'Dull', correct:'B', marks:1, ti:2 },
      { ci:0, si:4, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Grammar', topic:'Plurals',
        text:'Plural of "child" is:', type:'mcq', diff:'easy', a:'childs', b:'children', c:'childes', d:'child', correct:'B', marks:1, ti:2 },
      { ci:0, si:4, co:0, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Grammar', topic:'Subject-Verb Agreement',
        text:'"She don\'t know" is grammatically correct.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'B', marks:1, ti:2 },
      { ci:0, si:4, co:0, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'3', chapter_name:'Writing', topic:'Paragraph Writing',
        text:'Write a paragraph (100 words) on the importance of education.', type:'descriptive', diff:'medium', answer:'Education is the cornerstone of development. It equips individuals with knowledge, critical thinking skills, and the ability to contribute meaningfully to society. Education opens doors to career opportunities, improves quality of life, and fosters social equality. In Bangladesh, education has been central to national progress since independence. Every child deserves access to quality education.', marks:10, ti:2 },

      // ═══════════════════════════════════════════════════════════════════
      // BENGALI (subject index 5) — SSC General — ci:0
      // ═══════════════════════════════════════════════════════════════════
      { ci:0, si:5, co:1, class_name:'9-10 (Secondary)', paper:'1st', chapter:'1', chapter_name:'Literature', topic:'Bengali Literature',
        text:'রবীন্দ্রনাথ ঠাকুর নোবেল পুরস্কার পান কত সালে?', type:'mcq', diff:'medium', a:'1910', b:'1913', c:'1915', d:'1920', correct:'B', marks:2, ti:2 },
      { ci:0, si:5, co:1, class_name:'9-10 (Secondary)', paper:'1st', chapter:'1', chapter_name:'Language', topic:'Bengali Alphabet',
        text:'বাংলা বর্ণমালায় স্বরবর্ণ কতটি?', type:'mcq', diff:'easy', a:'10', b:'11', c:'12', d:'13', correct:'B', marks:1, ti:2 },
      { ci:0, si:5, co:1, class_name:'9-10 (Secondary)', paper:'1st', chapter:'2', chapter_name:'Language', topic:'Etymology',
        text:'বাংলা ভাষা ইন্দো-ইউরোপীয় ভাষা পরিবারের অন্তর্গত।', type:'true_false', diff:'medium', a:'True', b:'False', correct:'A', marks:1, ti:2 },
      { ci:0, si:5, co:1, class_name:'9-10 (Secondary)', paper:'2nd', chapter:'3', chapter_name:'Writing', topic:'Essay',
        text:'বাংলাদেশের স্বাধীনতা দিবস সম্পর্কে একটি অনুচ্ছেদ লেখো।', type:'descriptive', diff:'medium', answer:'বাংলাদেশ ১৯৭১ সালের ২৬ মার্চ স্বাধীনতা ঘোষণা করে। নয় মাসের মুক্তিযুদ্ধের পর ১৬ ডিসেম্বর চূড়ান্ত বিজয় অর্জিত হয়। লক্ষ শহীদের আত্মত্যাগের বিনিময়ে অর্জিত এই স্বাধীনতা আমাদের জাতীয় গর্ব।', marks:5, ti:2 },

      // ═══════════════════════════════════════════════════════════════════
      // HIGHER MATHEMATICS (subject index 9) — JSC — ci:1
      // ═══════════════════════════════════════════════════════════════════
      { ci:1, si:9, co:3, class_name:'9-10 (Secondary)', paper:'1st', chapter:'1', chapter_name:'Arithmetic', topic:'LCM and HCF',
        text:'LCM of 12 and 18 is:', type:'mcq', diff:'easy', a:'24', b:'36', c:'48', d:'60', correct:'B', marks:1, ti:3 },
      { ci:1, si:9, co:3, class_name:'9-10 (Secondary)', paper:'1st', chapter:'1', chapter_name:'Arithmetic', topic:'LCM and HCF',
        text:'HCF of 24 and 36 is:', type:'mcq', diff:'easy', a:'6', b:'12', c:'18', d:'24', correct:'B', marks:1, ti:3 },
      { ci:1, si:9, co:3, class_name:'9-10 (Secondary)', paper:'1st', chapter:'2', chapter_name:'Algebra', topic:'Linear Equations',
        text:'3x + 7 = 22, then x = ?', type:'mcq', diff:'easy', a:'3', b:'5', c:'7', d:'9', correct:'B', marks:1, ti:3 },
      { ci:1, si:9, co:3, class_name:'9-10 (Secondary)', paper:'1st', chapter:'2', chapter_name:'Algebra', topic:'Indices',
        text:'Value of 2³ is:', type:'mcq', diff:'easy', a:'4', b:'8', c:'16', d:'32', correct:'B', marks:1, ti:3 },
      { ci:1, si:9, co:3, class_name:'9-10 (Secondary)', paper:'1st', chapter:'3', chapter_name:'Geometry', topic:'Area and Perimeter',
        text:'Area of a rectangle 5×8 is:', type:'mcq', diff:'easy', a:'13', b:'40', c:'30', d:'20', correct:'B', marks:1, ti:3 },
      { ci:1, si:9, co:3, class_name:'9-10 (Secondary)', paper:'1st', chapter:'3', chapter_name:'Geometry', topic:'Triangles',
        text:'Sum of angles in a triangle is 180°.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:3 },
      { ci:1, si:9, co:3, class_name:'9-10 (Secondary)', paper:'2nd', chapter:'4', chapter_name:'Statistics', topic:'Mean',
        text:'Mean of 2, 4, 6, 8, 10 is:', type:'mcq', diff:'easy', a:'4', b:'5', c:'6', d:'7', correct:'C', marks:1, ti:3 },
      { ci:1, si:9, co:3, class_name:'9-10 (Secondary)', paper:'2nd', chapter:'4', chapter_name:'Statistics', topic:'Mean',
        text:'Find the mean and median of: 5, 3, 8, 1, 9, 4, 7.', type:'descriptive', diff:'medium', answer:'Sorted: 1,3,4,5,7,8,9. Mean=(1+3+4+5+7+8+9)/7=37/7≈5.29. Median=5 (middle value).', marks:4, ti:3 },

      // ═══════════════════════════════════════════════════════════════════
      // PHYSICS ADVANCED (subject index 10) — HSC Humanities — ci:1
      // ═══════════════════════════════════════════════════════════════════
      { ci:1, si:10, co:4, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Energy',
        text:'Kinetic energy formula is:', type:'mcq', diff:'medium', a:'mgh', b:'½mv²', c:'mv', d:'F×d', correct:'B', marks:2, ti:4 },
      { ci:1, si:10, co:4, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Conservation Laws',
        text:'Conservation of energy means energy is neither created nor destroyed.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:4 },
      { ci:1, si:10, co:4, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Electromagnetism', topic:'Induction',
        text:'Electromagnetic induction was discovered by:', type:'mcq', diff:'hard', a:'Newton', b:'Faraday', c:'Ohm', d:'Ampere', correct:'B', marks:3, ti:4 },

      // ═══════════════════════════════════════════════════════════════════
      // HISTORY (subject index 11) — HSC Humanities — ci:1
      // ═══════════════════════════════════════════════════════════════════
      { ci:1, si:11, co:4, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'World History', topic:'Revolutions',
        text:'The French Revolution began in:', type:'mcq', diff:'medium', a:'1776', b:'1789', c:'1800', d:'1815', correct:'B', marks:2, ti:5 },
      { ci:1, si:11, co:4, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'World Literature', topic:'Famous Works',
        text:'"War and Peace" was written by:', type:'mcq', diff:'medium', a:'Dostoyevsky', b:'Tolstoy', c:'Chekhov', d:'Pushkin', correct:'B', marks:2, ti:5 },
      { ci:1, si:11, co:4, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Bangladesh History', topic:'Independence',
        text:'Bangladesh declared independence on 26 March 1971.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:5 },
      { ci:1, si:11, co:4, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'2', chapter_name:'Bangladesh History', topic:'Independence',
        text:'Describe the significance of 26 March 1971 in the history of Bangladesh.', type:'descriptive', diff:'medium', answer:'26 March 1971 is Bangladesh\'s Independence Day. After years of political oppression, Bangabandhu Sheikh Mujibur Rahman declared independence. The liberation war lasted 9 months resulting in the birth of Bangladesh on 16 December 1971.', marks:6, ti:5 },

      // ═══════════════════════════════════════════════════════════════════
      // SSC PHYSICS (subject index 12) — ci:1
      // ═══════════════════════════════════════════════════════════════════
      { ci:1, si:12, co:5, class_name:'9-10 (Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Motion',
        text:'Velocity = Displacement / ?', type:'mcq', diff:'easy', a:'Distance', b:'Time', c:'Force', d:'Mass', correct:'B', marks:1, ti:4 },
      { ci:1, si:12, co:5, class_name:'9-10 (Secondary)', paper:'1st', chapter:'2', chapter_name:'Mechanics', topic:'Pressure',
        text:'Unit of pressure is:', type:'mcq', diff:'easy', a:'Newton', b:'Pascal', c:'Joule', d:'Watt', correct:'B', marks:1, ti:4 },
      { ci:1, si:12, co:5, class_name:'9-10 (Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'Motion',
        text:'An object at rest has zero velocity.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:4 },
      { ci:1, si:12, co:5, class_name:'9-10 (Secondary)', paper:'2nd', chapter:'3', chapter_name:'Light', topic:'Reflection',
        text:'Angle of incidence equals angle of reflection in a plane mirror.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:4 },

      // ═══════════════════════════════════════════════════════════════════
      // SSC CHEMISTRY (subject index 13) — ci:1
      // ═══════════════════════════════════════════════════════════════════
      { ci:1, si:13, co:5, class_name:'9-10 (Secondary)', paper:'1st', chapter:'1', chapter_name:'Acids Bases and Salts', topic:'pH',
        text:'pH of an acid is:', type:'mcq', diff:'easy', a:'Greater than 7', b:'Less than 7', c:'Equal to 7', d:'Greater than 14', correct:'B', marks:1, ti:5 },
      { ci:1, si:13, co:5, class_name:'9-10 (Secondary)', paper:'1st', chapter:'2', chapter_name:'Compounds', topic:'Salts',
        text:'Formula for common salt (NaCl) is:', type:'mcq', diff:'easy', a:'HCl', b:'NaCl', c:'NaOH', d:'H₂SO₄', correct:'B', marks:1, ti:5 },
      { ci:1, si:13, co:5, class_name:'9-10 (Secondary)', paper:'1st', chapter:'1', chapter_name:'Atomic Structure', topic:'Oxygen',
        text:'Oxygen has atomic number 8.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:5 },
      { ci:1, si:13, co:5, class_name:'9-10 (Secondary)', paper:'1st', chapter:'2', chapter_name:'Compounds', topic:'Water',
        text:'Water (H₂O) is a compound.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:5 },

      // ═══════════════════════════════════════════════════════════════════
      // COMMUNICATION ENGLISH (subject index 14) — ci:2
      // ═══════════════════════════════════════════════════════════════════
      { ci:2, si:14, co:6, class_name:'Bachelor(pass)', paper:'1st', chapter:'1', chapter_name:'Advanced Grammar', topic:'Passive Voice',
        text:'Passive voice of "He wrote a letter" is:', type:'mcq', diff:'medium', a:'A letter wrote', b:'A letter was written by him', c:'A letter is written', d:'A letter writes', correct:'B', marks:2, ti:6 },
      { ci:2, si:14, co:6, class_name:'Bachelor(pass)', paper:'1st', chapter:'2', chapter_name:'Vocabulary', topic:'Advanced Words',
        text:'"Eloquent" means:', type:'mcq', diff:'medium', a:'Quiet', b:'Well-spoken', c:'Angry', d:'Confused', correct:'B', marks:2, ti:6 },
      { ci:2, si:14, co:6, class_name:'Bachelor(pass)', paper:'1st', chapter:'1', chapter_name:'Grammar', topic:'Articles',
        text:'"The" is a definite article.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:6 },
      { ci:2, si:14, co:6, class_name:'Bachelor(pass)', paper:'2nd', chapter:'3', chapter_name:'Speaking', topic:'Self Introduction',
        text:'Write a 100-word self introduction for a job interview.', type:'descriptive', diff:'medium', answer:'Good morning. My name is [Name]. I completed my graduation from [University] in [Subject]. I have [X] years of experience in [field]. I am passionate about [interest] and have strong skills in [skills]. I am a team player, quick learner, and detail-oriented professional. I am excited about this opportunity to contribute to your organization.', marks:5, ti:6 },

      // ═══════════════════════════════════════════════════════════════════
      // IELTS READING (subject index 15) — ci:2
      // ═══════════════════════════════════════════════════════════════════
      { ci:2, si:15, co:7, class_name:'Bachelor(hons)', paper:'1st', chapter:'1', chapter_name:'IELTS Structure', topic:'Reading',
        text:'IELTS Academic Reading has how many sections?', type:'mcq', diff:'easy', a:'2', b:'3', c:'4', d:'5', correct:'B', marks:1, ti:7 },
      { ci:2, si:15, co:7, class_name:'Bachelor(hons)', paper:'1st', chapter:'1', chapter_name:'IELTS Scoring', topic:'Band Scores',
        text:'IELTS Band 9 means:', type:'mcq', diff:'easy', a:'Excellent User', b:'Good User', c:'Very Good User', d:'Non-user', correct:'A', marks:1, ti:7 },
      { ci:2, si:15, co:7, class_name:'Bachelor(hons)', paper:'1st', chapter:'2', chapter_name:'Reading Skills', topic:'Skimming',
        text:'Skimming means reading for specific information only.', type:'true_false', diff:'medium', a:'True', b:'False', correct:'B', marks:1, ti:7 },
      { ci:2, si:15, co:7, class_name:'Bachelor(hons)', paper:'2nd', chapter:'3', chapter_name:'Reading Skills', topic:'Reading Strategies',
        text:'Describe three strategies for improving IELTS Reading performance.', type:'descriptive', diff:'medium', answer:'1. Skimming: Read quickly for general idea. 2. Scanning: Search for specific information. 3. Prediction: Use headings to predict content before reading. Practice with timed passages to improve speed and accuracy.', marks:5, ti:7 },

      // ═══════════════════════════════════════════════════════════════════
      // IELTS WRITING (subject index 16) — ci:2
      // ═══════════════════════════════════════════════════════════════════
      { ci:2, si:16, co:7, class_name:'Bachelor(hons)', paper:'1st', chapter:'1', chapter_name:'Task 1', topic:'Task 1 Requirements',
        text:'IELTS Task 1 minimum word count is:', type:'mcq', diff:'easy', a:'100', b:'150', c:'200', d:'250', correct:'B', marks:1, ti:7 },
      { ci:2, si:16, co:7, class_name:'Bachelor(hons)', paper:'1st', chapter:'2', chapter_name:'Task 2', topic:'Task 2 Requirements',
        text:'IELTS Task 2 minimum word count is:', type:'mcq', diff:'easy', a:'200', b:'250', c:'300', d:'350', correct:'B', marks:1, ti:7 },
      { ci:2, si:16, co:7, class_name:'Bachelor(hons)', paper:'2nd', chapter:'2', chapter_name:'Task 2', topic:'Essay Writing',
        text:'Write an IELTS Task 2 introduction for: "Technology is replacing human workers. Is this a positive or negative development?"', type:'descriptive', diff:'hard', answer:'In recent decades, technological advancement has increasingly displaced human labor across various industries. While some argue this represents progress and efficiency, others contend it creates unemployment and social inequality. This essay will examine both perspectives before reaching a reasoned conclusion.', marks:8, ti:7 },

      // ═══════════════════════════════════════════════════════════════════
      // MEDICAL BIOLOGY (subject index 18) — ci:2
      // ═══════════════════════════════════════════════════════════════════
      { ci:2, si:18, co:8, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Cell Division', topic:'Mitosis',
        text:'Mitosis produces:', type:'mcq', diff:'medium', a:'4 haploid cells', b:'2 identical diploid cells', c:'2 haploid cells', d:'4 diploid cells', correct:'B', marks:2, ti:8 },
      { ci:2, si:18, co:8, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Human Biology', topic:'Blood',
        text:'Red blood cells are produced in:', type:'mcq', diff:'medium', a:'Liver', b:'Bone marrow', c:'Kidney', d:'Heart', correct:'B', marks:2, ti:8 },
      { ci:2, si:18, co:8, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Human Biology', topic:'Blood',
        text:'Normal adult human heart beats about 72 times per minute.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:8 },
      { ci:2, si:18, co:8, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'3', chapter_name:'Genetics', topic:'DNA Replication',
        text:'Photosynthesis releases CO₂.', type:'true_false', diff:'medium', a:'True', b:'False', correct:'B', marks:1, ti:8 },
      { ci:2, si:18, co:8, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'3', chapter_name:'Genetics', topic:'Heredity',
        text:'Describe the structure of DNA and its role in heredity.', type:'descriptive', diff:'hard', answer:'DNA is a double helix made of nucleotides (phosphate, deoxyribose, nitrogenous base). Base pairs: A-T, G-C. During reproduction, DNA replicates to pass genetic information to offspring. Genes encoded in DNA sequence determine traits.', marks:6, ti:8 },

      // ═══════════════════════════════════════════════════════════════════
      // MEDICAL CHEMISTRY (subject index 19) — ci:2
      // ═══════════════════════════════════════════════════════════════════
      { ci:2, si:19, co:8, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Chemical Bonding', topic:'Bond Strength',
        text:'Which is the strongest chemical bond?', type:'mcq', diff:'hard', a:'Ionic', b:'Covalent', c:'Hydrogen', d:'Van der Waals', correct:'B', marks:3, ti:8 },
      { ci:2, si:19, co:8, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Organic Chemistry', topic:'Organic Compounds',
        text:'All organic compounds contain Carbon.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:8 },
      { ci:2, si:19, co:8, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'3', chapter_name:'Biochemistry', topic:'Enzymes',
        text:'Explain the role of enzymes in biological reactions.', type:'descriptive', diff:'hard', answer:'Enzymes are biological catalysts (proteins) that lower activation energy. They are substrate-specific (lock-and-key model). Example: Amylase breaks down starch into sugars in saliva. Factors affecting enzyme activity: temperature, pH, substrate concentration.', marks:6, ti:8 },

      // ═══════════════════════════════════════════════════════════════════
      // ENGINEERING MATH (subject index 20) — ci:3
      // ═══════════════════════════════════════════════════════════════════
      { ci:3, si:20, co:9, class_name:'Bachelor(hons)', paper:'1st', chapter:'1', chapter_name:'Calculus', topic:'Integration',
        text:'∫x² dx = ?', type:'mcq', diff:'medium', a:'x³+C', b:'x³/3+C', c:'2x', d:'x²/2+C', correct:'B', marks:2, ti:9 },
      { ci:3, si:20, co:9, class_name:'Bachelor(hons)', paper:'1st', chapter:'2', chapter_name:'Linear Algebra', topic:'Determinants',
        text:'det of [[1,2],[3,4]] = ?', type:'mcq', diff:'hard', a:'10', b:'-2', c:'2', d:'-10', correct:'B', marks:3, ti:9 },
      { ci:3, si:20, co:9, class_name:'Bachelor(hons)', paper:'1st', chapter:'2', chapter_name:'Linear Algebra', topic:'Matrices',
        text:'A square matrix has equal number of rows and columns.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:9 },
      { ci:3, si:20, co:9, class_name:'Bachelor(hons)', paper:'2nd', chapter:'3', chapter_name:'Differential Equations', topic:'ODE',
        text:'Solve dy/dx = 2x and find y with initial condition y(0)=3.', type:'descriptive', diff:'hard', answer:'Integrating: y = ∫2x dx = x²+C. Applying y(0)=3: 3=0+C, so C=3. Therefore y = x²+3.', marks:5, ti:9 },

      // ═══════════════════════════════════════════════════════════════════
      // ENGINEERING PHYSICS (subject index 21) — ci:3
      // ═══════════════════════════════════════════════════════════════════
      { ci:3, si:21, co:9, class_name:'Bachelor(hons)', paper:'1st', chapter:'1', chapter_name:'Electrostatics', topic:'Coulomb\'s Law',
        text:'Coulomb\'s law deals with:', type:'mcq', diff:'medium', a:'Gravity', b:'Electric force between charges', c:'Magnetic force', d:'Nuclear force', correct:'B', marks:2, ti:10 },
      { ci:3, si:21, co:9, class_name:'Bachelor(hons)', paper:'1st', chapter:'2', chapter_name:'Electromagnetism', topic:'Units',
        text:'SI unit of magnetic field (B) is:', type:'mcq', diff:'easy', a:'Tesla', b:'Newton', c:'Ampere', d:'Volt', correct:'A', marks:1, ti:10 },
      { ci:3, si:21, co:9, class_name:'Bachelor(hons)', paper:'2nd', chapter:'3', chapter_name:'Thermodynamics', topic:'Laws',
        text:'Energy cannot be created or destroyed — First Law of Thermodynamics.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:10 },

      // ═══════════════════════════════════════════════════════════════════
      // BCS GENERAL KNOWLEDGE (subject index 22) — ci:3
      // ═══════════════════════════════════════════════════════════════════
      { ci:3, si:22, co:10, class_name:'Masters', paper:'1st', chapter:'1', chapter_name:'Bangladesh History', topic:'Independence',
        text:'Bangladesh declared independence in which year?', type:'mcq', diff:'easy', a:'1969', b:'1971', c:'1973', d:'1975', correct:'B', marks:1, ti:11 },
      { ci:3, si:22, co:10, class_name:'Masters', paper:'1st', chapter:'1', chapter_name:'World Geography', topic:'Capitals',
        text:'Capital of France is:', type:'mcq', diff:'easy', a:'London', b:'Paris', c:'Berlin', d:'Rome', correct:'B', marks:1, ti:11 },
      { ci:3, si:22, co:10, class_name:'Masters', paper:'1st', chapter:'2', chapter_name:'Geography', topic:'Oceans',
        text:'Largest ocean in the world is:', type:'mcq', diff:'easy', a:'Atlantic', b:'Pacific', c:'Indian', d:'Arctic', correct:'B', marks:1, ti:11 },
      { ci:3, si:22, co:10, class_name:'Masters', paper:'1st', chapter:'2', chapter_name:'International Organizations', topic:'UN',
        text:'United Nations was founded in:', type:'mcq', diff:'easy', a:'1944', b:'1945', c:'1946', d:'1947', correct:'B', marks:1, ti:11 },
      { ci:3, si:22, co:10, class_name:'Masters', paper:'1st', chapter:'1', chapter_name:'Bangladesh History', topic:'Geography',
        text:'Dhaka is the capital of Bangladesh.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:11 },
      { ci:3, si:22, co:10, class_name:'Masters', paper:'1st', chapter:'1', chapter_name:'Geography', topic:'General Knowledge',
        text:'The sun rises in the west.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'B', marks:1, ti:11 },
      { ci:3, si:22, co:10, class_name:'Masters', paper:'2nd', chapter:'3', chapter_name:'Bangladesh History', topic:'Liberation War',
        text:'Write a short note on the Liberation War of Bangladesh 1971.', type:'descriptive', diff:'medium', answer:'Bangladesh Liberation War began on 26 March 1971 when Bangabandhu declared independence. Pakistani forces launched Operation Searchlight on Dhaka. Mukti Bahini fought for 9 months. India intervened on 3 December. Pakistan surrendered on 16 December 1971 — Victory Day. Approximately 3 million martyred.', marks:8, ti:11 },

      // ═══════════════════════════════════════════════════════════════════
      // BCS MATHEMATICS (subject index 23) — ci:3
      // ═══════════════════════════════════════════════════════════════════
      { ci:3, si:23, co:10, class_name:'Masters', paper:'1st', chapter:'1', chapter_name:'Percentage', topic:'Percentage Calculation',
        text:'40% of 500 is:', type:'mcq', diff:'easy', a:'150', b:'200', c:'250', d:'300', correct:'B', marks:1, ti:9 },
      { ci:3, si:23, co:10, class_name:'Masters', paper:'1st', chapter:'2', chapter_name:'Finance Math', topic:'Simple Interest',
        text:'Simple interest formula is:', type:'mcq', diff:'medium', a:'PRT', b:'PRT/100', c:'P+RT', d:'PR/T', correct:'B', marks:2, ti:9 },
      { ci:3, si:23, co:10, class_name:'Masters', paper:'1st', chapter:'1', chapter_name:'Arithmetic', topic:'Percentage',
        text:'15% of 200 is:', type:'mcq', diff:'easy', a:'25', b:'30', c:'35', d:'40', correct:'B', marks:1, ti:9 },
      { ci:3, si:23, co:10, class_name:'Masters', paper:'2nd', chapter:'3', chapter_name:'Probability', topic:'Basic Probability',
        text:'A fair coin is tossed. What is the probability of getting heads?', type:'mcq', diff:'easy', a:'1/4', b:'1/2', c:'1', d:'0', correct:'B', marks:1, ti:9 },

      // ═══════════════════════════════════════════════════════════════════
      // PRIMARY MATHEMATICS (subject index 24) — ci:3
      // ═══════════════════════════════════════════════════════════════════
      { ci:3, si:24, co:11, class_name:'5', paper:'1st', chapter:'1', chapter_name:'Basic Arithmetic', topic:'Addition',
        text:'5 + 3 = ?', type:'mcq', diff:'easy', a:'6', b:'7', c:'8', d:'9', correct:'C', marks:1, ti:12 },
      { ci:3, si:24, co:11, class_name:'5', paper:'1st', chapter:'1', chapter_name:'Basic Arithmetic', topic:'Multiplication',
        text:'7 × 8 = ?', type:'mcq', diff:'easy', a:'54', b:'56', c:'58', d:'60', correct:'B', marks:1, ti:12 },
      { ci:3, si:24, co:11, class_name:'5', paper:'1st', chapter:'2', chapter_name:'General Knowledge', topic:'Calendar',
        text:'Days in a week:', type:'mcq', diff:'easy', a:'5', b:'6', c:'7', d:'8', correct:'C', marks:1, ti:12 },
      { ci:3, si:24, co:11, class_name:'5', paper:'1st', chapter:'2', chapter_name:'General Knowledge', topic:'Alphabet',
        text:'Letters in English alphabet:', type:'mcq', diff:'easy', a:'24', b:'26', c:'28', d:'30', correct:'B', marks:1, ti:12 },
      { ci:3, si:24, co:11, class_name:'5', paper:'1st', chapter:'1', chapter_name:'Basic Arithmetic', topic:'Basic Facts',
        text:'2 + 2 = 5', type:'true_false', diff:'easy', a:'True', b:'False', correct:'B', marks:1, ti:12 },

      // ═══════════════════════════════════════════════════════════════════
      // O LEVEL MATH PURE (subject index 25) — ci:4
      // ═══════════════════════════════════════════════════════════════════
      { ci:4, si:25, co:12, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Linear Algebra', topic:'Matrices',
        text:'A matrix is a rectangular array of numbers.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:12 },
      { ci:4, si:25, co:12, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Algebra', topic:'Quadratic Formula',
        text:'Quadratic formula is:', type:'mcq', diff:'hard', a:'x=b/2a', b:'x=(-b±√(b²-4ac))/2a', c:'x=a/b', d:'x=2a/b', correct:'B', marks:3, ti:12 },
      { ci:4, si:25, co:12, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'3', chapter_name:'Geometry', topic:'Pythagoras',
        text:'In a right triangle with legs 3 and 4, hypotenuse = ?', type:'mcq', diff:'medium', a:'4', b:'5', c:'7', d:'6', correct:'B', marks:2, ti:12 },
      { ci:4, si:25, co:12, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'4', chapter_name:'Functions', topic:'Functions',
        text:'Explain the concept of a function and give two examples.', type:'descriptive', diff:'medium', answer:'A function f: A→B assigns exactly one output in B to each input in A. Example 1: f(x)=x² maps real numbers to non-negative reals. Example 2: f(x)=2x+1 is a linear function. Key property: each input has exactly one output.', marks:5, ti:12 },

      // ═══════════════════════════════════════════════════════════════════
      // O LEVEL MATH STATS (subject index 26) — ci:4
      // ═══════════════════════════════════════════════════════════════════
      { ci:4, si:26, co:12, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Statistics', topic:'Measures of Spread',
        text:'Standard deviation measures the spread of data.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:12 },
      { ci:4, si:26, co:12, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Statistics', topic:'Mean',
        text:'Mean of 2, 4, 6, 8, 10 = ?', type:'mcq', diff:'easy', a:'4', b:'5', c:'6', d:'7', correct:'C', marks:1, ti:12 },
      { ci:4, si:26, co:12, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'2', chapter_name:'Probability', topic:'Probability',
        text:'Probability of an impossible event is:', type:'mcq', diff:'easy', a:'1', b:'0.5', c:'0', d:'-1', correct:'C', marks:1, ti:12 },
      { ci:4, si:26, co:12, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'2', chapter_name:'Probability', topic:'Statistics',
        text:'Calculate mean, median, mode for: 3, 5, 7, 5, 9, 3, 5, 8.', type:'descriptive', diff:'medium', answer:'Sorted: 3,3,5,5,5,7,8,9. Mean=(3+3+5+5+5+7+8+9)/8=45/8=5.625. Median=(5+5)/2=5. Mode=5 (appears 3 times).', marks:4, ti:12 },

      // ═══════════════════════════════════════════════════════════════════
      // A LEVEL MECHANICS (subject index 27) — ci:4
      // ═══════════════════════════════════════════════════════════════════
      { ci:4, si:27, co:13, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Mechanics', topic:'SHM',
        text:'Simple harmonic motion is a type of periodic motion.', type:'true_false', diff:'medium', a:'True', b:'False', correct:'A', marks:1, ti:13 },
      { ci:4, si:27, co:13, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Rotational Motion', topic:'Moment of Inertia',
        text:'Moment of inertia depends on:', type:'mcq', diff:'hard', a:'Mass only', b:'Mass and its distribution', c:'Volume', d:'Velocity', correct:'B', marks:3, ti:13 },
      { ci:4, si:27, co:13, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'3', chapter_name:'Mechanics', topic:'Circular Motion',
        text:'Derive the expression for centripetal acceleration.', type:'descriptive', diff:'hard', answer:'For circular motion of radius r and speed v: a=v²/r directed towards center. Proof: velocity vector changes direction, rate of change = v×(v/r) = v²/r. In terms of angular velocity ω: a=ω²r.', marks:6, ti:13 },

      // ═══════════════════════════════════════════════════════════════════
      // A LEVEL WAVES (subject index 28) — ci:4
      // ═══════════════════════════════════════════════════════════════════
      { ci:4, si:28, co:13, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Wave Properties', topic:'Doppler Effect',
        text:'Doppler effect is the change in frequency due to relative motion between source and observer.', type:'true_false', diff:'hard', a:'True', b:'False', correct:'A', marks:1, ti:13 },
      { ci:4, si:28, co:13, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Waves', topic:'Diffraction',
        text:'Diffraction occurs when a wave:', type:'mcq', diff:'hard', a:'Passes through an opening or around an obstacle', b:'Reflects off a surface', c:'Refracts through a medium', d:'Gets absorbed', correct:'A', marks:3, ti:13 },
      { ci:4, si:28, co:13, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'3', chapter_name:'Waves', topic:'Interference',
        text:'Explain constructive and destructive interference with diagrams description.', type:'descriptive', diff:'hard', answer:'Constructive: two waves in phase, amplitudes add → larger amplitude. Condition: path difference = nλ. Destructive: waves out of phase, amplitudes cancel → zero. Condition: path difference = (n+½)λ. Example: Young\'s double slit experiment.', marks:6, ti:13 },

      // ═══════════════════════════════════════════════════════════════════
      // GRE QUANTITATIVE (subject index 29) — ci:4
      // ═══════════════════════════════════════════════════════════════════
      { ci:4, si:29, co:14, class_name:'Masters', paper:'1st', chapter:'1', chapter_name:'GRE Structure', topic:'Test Format',
        text:'GRE Quantitative Reasoning has how many sections?', type:'mcq', diff:'easy', a:'1', b:'2', c:'3', d:'4', correct:'B', marks:1, ti:14 },
      { ci:4, si:29, co:14, class_name:'Masters', paper:'1st', chapter:'1', chapter_name:'GRE Scoring', topic:'Score Range',
        text:'GRE Quantitative score range is:', type:'mcq', diff:'easy', a:'0-300', b:'130-170', c:'200-800', d:'0-100', correct:'B', marks:1, ti:14 },
      { ci:4, si:29, co:14, class_name:'Masters', paper:'1st', chapter:'2', chapter_name:'Data Analysis', topic:'Statistics',
        text:'GRE tests include Data Interpretation questions.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:14 },
      { ci:4, si:29, co:14, class_name:'Masters', paper:'1st', chapter:'2', chapter_name:'Algebra', topic:'Word Problems',
        text:'A store sells 120 items at $5 each. If 15% discount is given, total revenue = ?', type:'mcq', diff:'medium', a:'$510', b:'$500', c:'$480', d:'$520', correct:'A', marks:2, ti:14 },
      { ci:4, si:29, co:14, class_name:'Masters', paper:'2nd', chapter:'3', chapter_name:'Problem Solving', topic:'GRE Strategy',
        text:'Describe your approach to solving a GRE Data Interpretation question.', type:'descriptive', diff:'hard', answer:'1. Read graph/table title carefully. 2. Note units and scale. 3. Identify what each question asks. 4. Extract only relevant data. 5. Estimate before calculating. 6. Check answer choices for reasonableness. Always manage time: ~2 minutes per question.', marks:5, ti:14 },

      // ═══════════════════════════════════════════════════════════════════
      // ADDITIONAL SSC QUESTIONS — General Mathematics (subject 6) — ci:0
      // ═══════════════════════════════════════════════════════════════════
      { ci:0, si:6, co:1, class_name:'9-10 (Secondary)', paper:'1st', chapter:'1', chapter_name:'Arithmetic', topic:'Basic Operations',
        text:'What is 15% of 200?', type:'mcq', diff:'easy', a:'25', b:'30', c:'35', d:'40', correct:'B', marks:1, ti:0 },
      { ci:0, si:6, co:1, class_name:'9-10 (Secondary)', paper:'1st', chapter:'2', chapter_name:'Algebra', topic:'Simple Equations',
        text:'If 2x = 10, then x = ?', type:'mcq', diff:'easy', a:'4', b:'5', c:'6', d:'7', correct:'B', marks:1, ti:0 },
      { ci:0, si:6, co:1, class_name:'9-10 (Secondary)', paper:'1st', chapter:'3', chapter_name:'Geometry', topic:'Triangles',
        text:'A right angle is equal to 90°.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:0 },
      { ci:0, si:6, co:1, class_name:'9-10 (Secondary)', paper:'2nd', chapter:'4', chapter_name:'Percentage', topic:'Profit and Loss',
        text:'A shopkeeper buys at ৳100 and sells at ৳120. Profit percentage is:', type:'mcq', diff:'medium', a:'10%', b:'20%', c:'25%', d:'15%', correct:'B', marks:2, ti:0 },

      // ═══════════════════════════════════════════════════════════════════
      // ACCOUNTING (subject 7) — HSC Business — ci:0
      // ═══════════════════════════════════════════════════════════════════
      { ci:0, si:7, co:2, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Introduction to Accounting', topic:'Basic Concepts',
        text:'Accounting is the language of business.', type:'true_false', diff:'easy', a:'True', b:'False', correct:'A', marks:1, ti:2 },
      { ci:0, si:7, co:2, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'2', chapter_name:'Double Entry System', topic:'Debit and Credit',
        text:'In double-entry bookkeeping, every transaction affects at least:', type:'mcq', diff:'medium', a:'One account', b:'Two accounts', c:'Three accounts', d:'Four accounts', correct:'B', marks:2, ti:2 },
      { ci:0, si:7, co:2, class_name:'11-12(Higher Secondary)', paper:'1st', chapter:'1', chapter_name:'Introduction to Accounting', topic:'Assets',
        text:'Land and building are examples of:', type:'mcq', diff:'easy', a:'Current assets', b:'Fixed assets', c:'Liabilities', d:'Revenue', correct:'B', marks:1, ti:2 },
      { ci:0, si:7, co:2, class_name:'11-12(Higher Secondary)', paper:'2nd', chapter:'3', chapter_name:'Financial Statements', topic:'Balance Sheet',
        text:'Explain the difference between assets and liabilities with examples.', type:'descriptive', diff:'medium', answer:'Assets: Resources owned by the business. Current assets (cash, stock) and fixed assets (land, machinery). Liabilities: Obligations to others. Current (creditors, bank overdraft) and long-term (loans). Assets = Liabilities + Capital.', marks:5, ti:2 },

    ]; // end questions array

// ── Get subject names mapping ─────────────────────────────────────────────
    const subjectNames = subjectData.map(s => s.name);

    // ── Insert all questions ───────────────────────────────────────────────
    const questionIds = [];
    for (const q of questions) {
      const subjectName = subjectNames[q.si] || null;
      let qid;
if (q.type === 'mcq') {
        const { rows:[{question_id}] } = await client.query(
          `INSERT INTO question_bank
             (coaching_center_id,subject_id,course_id,class_name,subject_name,paper,chapter,chapter_name,topic,
              question_text,question_type,difficulty,option_text_a,option_text_b,option_text_c,option_text_d,
              correct_option,max_marks,created_by,source,is_multiple_correct)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'mcq',$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
           RETURNING question_id`,
          [centerIds[q.ci],subjectIds[q.si],courseIds[q.co],
           q.class_name,subjectName,q.paper,q.chapter,q.chapter_name,q.topic,
           q.text,q.diff,q.a,q.b,q.c,q.d,q.correct,q.marks,teacherIds[q.ti], 'manual', false]

        );
        qid = question_id;
      } else if (q.type === 'true_false') {
        const { rows:[{question_id}] } = await client.query(
          `INSERT INTO question_bank
             (coaching_center_id,subject_id,course_id,class_name,subject_name,paper,chapter,chapter_name,topic,
              question_text,question_type,difficulty,option_text_a,option_text_b,
              correct_option,max_marks,created_by,source,is_multiple_correct)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'true_false',$11,'True','False',$12,$13,$14,$15,false)
           RETURNING question_id`,
          [centerIds[q.ci],subjectIds[q.si],courseIds[q.co],
           q.class_name,subjectName,q.paper,q.chapter,q.chapter_name,q.topic,
           q.text,q.diff,q.correct,q.marks,teacherIds[q.ti], 'manual']

        );
        qid = question_id;
      } else {
        const { rows:[{question_id}] } = await client.query(
          `INSERT INTO question_bank
             (coaching_center_id,subject_id,course_id,class_name,subject_name,paper,chapter,chapter_name,topic,
              question_text,question_type,difficulty,expected_answer,max_marks,created_by,source)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'descriptive',$11,$12,$13,$14,'manual')

           RETURNING question_id`,
          [centerIds[q.ci],subjectIds[q.si],courseIds[q.co],
           q.class_name,subjectName,q.paper,q.chapter,q.chapter_name,q.topic,
           q.text,q.diff,q.answer,q.marks,teacherIds[q.ti]]
        );
        qid = question_id;
      }
      questionIds.push(qid);
    }
    console.log(`✅ ${questionIds.length} Questions`);

    // ── 13. EXAMS (15) ────────────────────────────────────────────────────
    const examData = [
      { ci:0, si:0,  bi:0,  type:'regular',   ti:0,  title:'Mathematics Mid Term 2024',    dur:90,  status:'completed' },
      { ci:0, si:1,  bi:0,  type:'regular',   ti:1,  title:'Physics Unit Test 1',           dur:60,  status:'completed' },
      { ci:0, si:2,  bi:1,  type:'regular',   ti:1,  title:'Chemistry Final 2024',          dur:120, status:'scheduled' },
      { ci:0, si:4,  bi:2,  type:'live_quiz', ti:2,  title:'English Grammar Live Quiz',     dur:30,  status:'completed' },
      { ci:0, si:0,  bi:0,  type:'regular',   ti:0,  title:'Mathematics Final Exam 2024',   dur:180, status:'scheduled' },
      { ci:1, si:9,  bi:4,  type:'regular',   ti:3,  title:'JSC Mathematics Test',          dur:60,  status:'completed' },
      { ci:1, si:10, bi:5,  type:'regular',   ti:4,  title:'Physics Chapter Test',          dur:45,  status:'scheduled' },
      { ci:1, si:12, bi:6,  type:'live_quiz', ti:4,  title:'SSC Physics Live Quiz',         dur:20,  status:'completed' },
      { ci:2, si:14, bi:7,  type:'regular',   ti:6,  title:'English Speaking Test',         dur:60,  status:'ongoing'   },
      { ci:2, si:15, bi:8,  type:'regular',   ti:7,  title:'IELTS Mock Reading Test',       dur:180, status:'completed' },
      { ci:3, si:20, bi:10, type:'regular',   ti:9,  title:'Engineering Mathematics Test',  dur:90,  status:'scheduled' },
      { ci:3, si:22, bi:10, type:'live_quiz', ti:11, title:'BCS GK Live Quiz',              dur:30,  status:'completed' },
      { ci:4, si:25, bi:13, type:'regular',   ti:12, title:'O Level Math Paper 1',          dur:120, status:'scheduled' },
      { ci:4, si:27, bi:14, type:'regular',   ti:13, title:'A Level Physics Test',          dur:90,  status:'completed' },
      { ci:0, si:0,  bi:0,  type:'live_quiz', ti:0,  title:'Mathematics Live Quiz Session', dur:20,  status:'ongoing'   },
    ];
    const examIds = [];
    for (const e of examData) {
      const code = e.type === 'live_quiz' ? `LQ${rnd(1000,9999)}` : null;
      const { rows:[{exam_id}] } = await client.query(
        `INSERT INTO quiz_exam
           (coaching_center_id,subject_id,batch_id,exam_type,host_teacher_id,
            title,duration_minutes,start_time,end_time,status,access_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()-INTERVAL '2 days',NOW()+INTERVAL '1 day',$8,$9)
         RETURNING exam_id`,
        [centerIds[e.ci],subjectIds[e.si],batchIds[e.bi],e.type,
         teacherIds[e.ti],e.title,e.dur,e.status,code]
      );
      examIds.push(exam_id);
    }
    console.log(`✅ ${examIds.length} Exams`);

    // ── 14. EXAM QUESTIONS ────────────────────────────────────────────────
    // Map exam index → question indices (from questions array)
    const eqMap = [
      [0,  [0,1,2,3,4,8,9,15,20,21,22,23]],         // Math Mid Term
      [1,  [29,30,31,32,33,34,37,38,40,41]],         // Physics Unit Test
      [2,  [47,48,49,50,51,52,53,54,55,56]],         // Chemistry Final
      [3,  [57,58,59,60,61,62]],                     // English Live Quiz
      [4,  [0,1,2,3,4,5,6,8,9,10,11,12,13]],        // Math Final
      [5,  [80,81,82,83,84,85,86]],                  // JSC Math
      [6,  [87,88,89]],                              // Physics Chapter
      [7,  [90,91,92,93]],                           // SSC Physics Quiz
      [8,  [94,95,96]],                              // English Speaking
      [9,  [97,98,99,100]],                          // IELTS Reading
      [10, [115,116,117]],                           // Engineering Math
      [11, [121,122,123,124,125,126]],               // BCS GK Quiz
      [12, [135,136,137]],                           // O Level Math
      [13, [143,144]],                               // A Level Physics
      [14, [0,1,2,3,4,5,6]],                        // Math Live Quiz
    ];
    for (const [ei, qis] of eqMap) {
      for (const qi of qis) {
        if (questionIds[qi] && examIds[ei]) {
          await client.query(
            `INSERT INTO exam_questions (exam_id,question_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [examIds[ei], questionIds[qi]]
          );
        }
      }
    }
    console.log('✅ Exam Questions linked');

    // ── 15. RESULTS ───────────────────────────────────────────────────────
    const resultData = [
      // [examIdx, studentIdx, questionIdx, marks, totalMarks]
      [0,0,0,8,10],[0,1,0,7,10],[0,2,0,9,10],[0,3,0,5,10],[0,4,0,6,10],[0,5,0,3,10],
      [0,0,1,7,9], [0,1,1,5,9], [0,2,1,8,9], [0,3,1,4,9], [0,4,1,6,9],
      [1,0,29,7,9],[1,1,29,5,9],[1,2,29,8,9],[1,3,29,4,9],[1,4,29,6,9],
      [1,0,30,1,1],[1,1,30,1,1],[1,2,30,0,1],[1,3,30,1,1],[1,4,30,1,1],
      [3,0,57,3,4],[3,1,57,4,4],[3,2,57,2,4],[3,3,57,1,4],[3,4,57,3,4],
      [5,6,80,2,3],[5,7,80,3,3],[5,8,80,1,3],[5,9,80,2,3],[5,10,80,3,3],
      [7,9,90,2,2],[7,10,90,1,2],[7,11,90,2,2],
      [9,12,97,6,8],[9,13,97,7,8],
      [11,18,121,1,2],[11,19,121,2,2],[11,20,121,1,2],[11,21,121,0,2],
      [13,24,143,6,9],[13,25,143,8,9],[13,26,143,5,9],
      [0,0,2,7,8], [0,1,2,6,8], [0,2,2,8,8], [0,3,2,4,8],
      [1,0,31,2,2],[1,1,31,1,2],[1,2,31,2,2],[1,3,31,0,2],
    ];
    for (const [ei,si,qi,marks,total] of resultData) {
      if (!examIds[ei] || !studentIds[si] || !questionIds[qi]) continue;
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
    console.log(`✅ ${resultData.length} Results`);

    // ── 16. SUBSCRIPTIONS ─────────────────────────────────────────────────
    for (let i = 0; i < 5; i++) {
      const amounts = [999, 2999, 0, 999, 0];
      await client.query(
        `INSERT INTO subscription
           (coaching_center_id,user_id,amount,payment_for,payment_method,transaction_id,status,paid_at)
         VALUES ($1,$2,$3,$4,$5,$6,'success',NOW())`,
        [centerIds[i],adminIds[i],amounts[i],
         amounts[i]>0?'monthly_subscription':'center_creation',
         amounts[i]>0?'bkash':'cash', txn(i)]
      );
    }
    console.log('✅ Subscriptions');

    // ── 17. NOTIFICATIONS ─────────────────────────────────────────────────
    const notifData = [
      [saId,   'Platform setup complete. Welcome to Smart Coaching!', 'system'],
      [saId,   'New coaching center application received.', 'system'],
      [saId,   '5 coaching centers now active on the platform.', 'system'],
      [adminIds[0], 'Excellence Coaching Center approved!', 'system'],
      [adminIds[0], 'Monthly subscription payment confirmed. ৳999 received.', 'fee'],
      [adminIds[0], 'New batch HSC Science Batch A created successfully.', 'system'],
      [adminIds[0], 'Student enrollment: 6/30 in HSC Science Batch A.', 'system'],
      [adminIds[1], 'Alo Coaching Center is now active.', 'system'],
      [adminIds[1], 'Pro subscription activated. All features unlocked.', 'system'],
      [adminIds[2], 'Medhabi Pathshala application approved.', 'system'],
      [adminIds[3], 'Proshno Coaching center approved.', 'system'],
      [adminIds[4], 'Welcome to Smart Coaching admin panel.', 'system'],
      [teacherIds[0], 'Welcome! Your teacher account is ready.', 'system'],
      [teacherIds[0], 'Mathematics Mid Term 2024 results published.', 'exam'],
      [teacherIds[0], 'Mathematics Live Quiz Session started.', 'quiz'],
      [teacherIds[0], '5 students submitted Mathematics Final answers.', 'exam'],
      [teacherIds[1], 'Welcome to Excellence Coaching Center!', 'system'],
      [teacherIds[1], 'Physics Unit Test 1 completed. 5 submissions received.', 'exam'],
      [teacherIds[2], 'English Grammar Live Quiz completed successfully.', 'quiz'],
      [teacherIds[3], 'JSC Mathematics Test results ready to publish.', 'exam'],
      [teacherIds[4], 'SSC Physics Live Quiz completed. 3 students participated.', 'quiz'],
      [teacherIds[7], 'IELTS Mock Reading Test results published.', 'exam'],
      [teacherIds[9], 'Engineering Mathematics Test scheduled.', 'exam'],
      [teacherIds[11],'BCS GK Live Quiz completed.', 'quiz'],
      [teacherIds[13],'A Level Physics Test results published.', 'exam'],
      [studentIds[0], 'Welcome to Smart Coaching! Your account is ready.', 'system'],
      [studentIds[0], 'Mathematics Mid Term 2024 exam is starting.', 'exam'],
      [studentIds[0], 'Your result for Math Mid Term: Grade A+ (80%).', 'exam'],
      [studentIds[0], 'Monthly fee payment reminder: ৳5000 due.', 'fee'],
      [studentIds[1], 'Welcome to Excellence Coaching Center!', 'system'],
      [studentIds[1], 'Physics Unit Test 1 result: Grade B (70%).', 'exam'],
      [studentIds[1], 'English Grammar Live Quiz starts in 30 minutes!', 'quiz'],
      [studentIds[2], 'New study material uploaded for Mathematics.', 'system'],
      [studentIds[2], 'Chemistry Final 2024 exam scheduled.', 'exam'],
      [studentIds[3], 'Fee payment reminder: Course fee ৳5000 overdue.', 'fee'],
      [studentIds[4], 'HSC Science Batch A enrollment confirmed.', 'system'],
      [studentIds[5], 'Your Math score: 3/10. Please review the material.', 'exam'],
      [studentIds[6], 'Welcome to Alo Coaching Center!', 'system'],
      [studentIds[7], 'JSC Math Test result: Grade A+ (80%).', 'exam'],
      [studentIds[12],'English Speaking Test is now ongoing.', 'exam'],
      [studentIds[12],'New IELTS study material available.', 'system'],
      [studentIds[24],'A Level Physics Test result published.', 'exam'],
      [parentIds[0],  'Alice Ahmed scored 80% in Mathematics Mid Term 2024.', 'exam'],
      [parentIds[0],  'Fee payment reminder for Alice Ahmed: ৳5000 due.', 'fee'],
      [parentIds[1],  'Bob Hossain Physics result: Grade B (70%).', 'exam'],
      [parentIds[2],  'Monthly fee receipt generated for Riya Begum.', 'fee'],
      [parentIds[3],  'Sakib Khan exam result available.', 'exam'],
      [parentIds[4],  'Nadia Islam enrolled in HSC Science Batch A.', 'system'],
    ];
    for (const [uid, msg, type] of notifData) {
      await client.query(
        `INSERT INTO notification (user_id,message,type,status) VALUES ($1,$2,$3,'unread')`,
        [uid, msg, type]
      );
    }
    console.log(`✅ ${notifData.length} Notifications`);

    await client.query('COMMIT');

    // ── Summary ───────────────────────────────────────────────────────────
    console.log('\n🎉 Seed Complete!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('ALL PASSWORDS: pass@1234');
    console.log('───────────────────────────────────────────────────────');
    console.log('ACCOUNTS:');
    console.log('  super@gmail.com          → Super Admin');
    console.log('  admin@gmail.com          → Coaching Admin  (Excellence)');
    console.log('  admin2@gmail.com         → Coaching Admin  (Alo)');
    console.log('  admin3@gmail.com         → Coaching Admin  (Medhabi)');
    console.log('  admin4@gmail.com         → Coaching Admin  (Proshno)');
    console.log('  admin5@gmail.com         → Coaching Admin  (Gyaan)');
    console.log('  teacher@gmail.com        → Teacher         (Math/Physics, Excellence)');
    console.log('  teacher2-15@gmail.com    → Teachers        (various subjects)');
    console.log('  staff@gmail.com          → Staff           (Excellence)');
    console.log('  staff2-5@gmail.com       → Staff           (various centers)');
    console.log('  student1@gmail.com       → Student         (Excellence)');
    console.log('  student2-30@gmail.com    → Students        (various centers)');
    console.log('  parent1@gmail.com        → Parent');
    console.log('  parent2-10@gmail.com     → Parents');
    console.log('───────────────────────────────────────────────────────');
    console.log('DATA SEEDED:');
    console.log(`  5   Coaching Centers`);
    console.log(`  15  Courses`);
    console.log(`  20  Batches`);
    console.log(`  30  Subjects`);
    console.log(`  ${questionIds.length}  Questions  (MCQ + T/F + Descriptive)`);
    console.log(`       → All with class_name, paper, chapter, chapter_name, topic`);
    console.log(`  15  Exams`);
    console.log(`  ${resultData.length}  Results`);
    console.log(`  ${notifData.length}  Notifications`);
    console.log('═══════════════════════════════════════════════════════');

    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();
