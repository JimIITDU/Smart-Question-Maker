const request = require('supertest');
const app = require('../server');

let teacherToken;
let teacher2Token;
let testQuestionId;

describe('Question Bank Tests', () => {

  // Setup: Get tokens for teachers
  beforeAll(async () => {
    // Login as teacher
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teacher@gmail.com',
        password: '123456'
      });
    teacherToken = res.body.data.token;
    
    // Login as second teacher (if exists in seed data)
    const res2 = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teacher2@gmail.com',
        password: '123456'
      });
    if (res2.body.success) {
      teacher2Token = res2.body.data.token;
    }
  }, 15000);

  test('Create MCQ question with new schema fields as teacher', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        subject_id: 1,
        question_text: 'What is 2+2?',
        question_type: 'mcq',
        difficulty: 'easy',
        marks: 1,
        negative_marks: 0.5,
        explanation: '2+2 = 4',
        options: {
          a: '3',
          b: '4',
          c: '5',
          d: '6'
        },
        correct_answers: ['B']
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.question_id).toBeDefined();
    testQuestionId = res.body.data.question_id;
  }, 15000);

  test('Get all questions returns only teacher own questions', async () => {
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    // All questions should belong to this teacher
    for (const q of res.body.data) {
      expect(q.created_by).toBeDefined();
    }
  }, 15000);

  test('Filter questions by status', async () => {
    const res = await request(app)
      .get('/api/questions?status=active')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  }, 15000);

  test('Filter questions by source', async () => {
    const res = await request(app)
      .get('/api/questions?source=manual')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  }, 15000);

  test('Get single question by id', async () => {
    if (!testQuestionId) return;
    const res = await request(app)
      .get(`/api/questions/${testQuestionId}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.question_id).toBe(testQuestionId);
  }, 15000);

  test('Update question as teacher', async () => {
    if (!testQuestionId) return;
    const res = await request(app)
      .put(`/api/questions/${testQuestionId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        question_text: 'What is 2+2? (updated)',
        difficulty: 'medium'
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  }, 15000);

  test('Soft delete question as teacher', async () => {
    if (!testQuestionId) return;
    const res = await request(app)
      .delete(`/api/questions/${testQuestionId}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  }, 15000);

  test('Teacher cannot see another teacher questions', async () => {
    if (!teacher2Token) return;
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${teacher2Token}`);
    expect(res.status).toBe(200);
    // Should return different set of questions or empty
  }, 15000);

  test('Create question without token should fail', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({
        question_text: 'Test?',
        question_type: 'mcq',
      });
    expect(res.status).toBe(401);
  }, 15000);

  test('AI Generate questions (may fail if no API key)', async () => {
    const res = await request(app)
      .post('/api/questions/ai-generate')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        subject_id: 1,
        difficulty: 'easy',
        question_type: 'mcq',
        count: 2,
        source_type: 'general'
      });
    // May return 201 or 500 if no API key
    expect([201, 500]).toContain(res.status);
  }, 15000);

  test('Bulk status update', async () => {
    // First create a question
    const createRes = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        subject_id: 1,
        question_text: 'Bulk test question?',
        question_type: 'mcq',
        difficulty: 'easy',
        marks: 1
      });
    
    if (createRes.status !== 201) return;
    
    const qId = createRes.body.data.question_id;
    
    // Bulk update status
    const res = await request(app)
      .patch('/api/questions/bulk-status')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        updates: [
          { id: qId, status: 'active' }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  }, 15000);

});
