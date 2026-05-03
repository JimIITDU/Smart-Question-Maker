const request = require("supertest");
const app = require("../server");

describe("Authentication Tests", () => {
  // Test 1: Login with wrong password
  test("Login with wrong password should fail", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "akidul@gmail.com",
      password: "wrongpassword",
    });
    expect(res.body.success).toBe(false);
  }, 15000);

  // Test 2: Login with correct password
  test("Login with correct credentials should succeed", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "akidul@gmail.com",
      password: "newpassword123",
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("token");
  }, 15000);

  // Test 3: Access protected route without token
  test("Protected route without token should return 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  }, 15000);

  // Test 4: Access protected route with invalid token
  test("Protected route with invalid token should return 401", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.status).toBe(401);
  }, 15000);

  // Test 5: Forgot password with valid email
  test("Forgot password with valid email should succeed", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "akidul@gmail.com" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  }, 15000);

  // Test 6: Forgot password with invalid email
  test("Forgot password with invalid email should fail", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "notexist@gmail.com" });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  }, 15000);
});
