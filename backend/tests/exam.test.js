const request = require("supertest");
const app = require("../server");

let teacherToken;
let studentToken;

beforeAll(async () => {
  const teacherRes = await request(app).post("/api/auth/login").send({
    email: "teacher@gmail.com",
    password: "123456",
  });
  teacherToken = teacherRes.body.data.token;

  const studentRes = await request(app).post("/api/auth/login").send({
    email: "student@gmail.com",
    password: "123456",
  });
  studentToken = studentRes.body.data.token;
}, 15000);

describe("Exam Tests", () => {
  test("Get all exams as teacher", async () => {
    const res = await request(app)
      .get("/api/exams")
      .set("Authorization", `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  }, 15000);

  test("Get all exams as student", async () => {
    const res = await request(app)
      .get("/api/exams")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  }, 15000);

  test("Student cannot create exam", async () => {
    const res = await request(app)
      .post("/api/exams")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        subject_id: 1,
        batch_id: 1,
        exam_type: "regular",
        start_time: "2026-04-01 10:00:00",
        end_time: "2026-04-01 11:00:00",
      });
    expect(res.status).toBe(403);
  }, 15000);

  test("Get exam questions", async () => {
    const res = await request(app)
      .get("/api/exams/1/questions")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
  }, 15000);
});
