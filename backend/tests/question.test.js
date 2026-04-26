const request = require('supertest');
const app = require('../server');

let teacherToken;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'teacher@gmail.com',
      password: '123456'
    });
  teacherToken = res.body.data.token;
}, 15000);

describe('Question Bank Tests', () => {

  test('Create MCQ question as teacher', async () => {
    const res = await request(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        subject_id: 1,
        course_id: 1,
        question_text: 'Test question?',
        question_type: 'mcq',
        difficulty: 'easy',
        max_marks: 1,
        option_text_a: 'Option A',
        option_text_b: 'Option B',
        option_text_c: 'Option C',
        option_text_d: 'Option D',
        correct_option: 'A'
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  }, 15000);

  test('Get all questions as teacher', async () => {
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
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

});