const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const User = require("../models/User");

describe("Auth API", () => {
  // Database connection setup
  beforeAll(async () => {
    const url = process.env.MONGO_URI || "mongodb://localhost:27017/test-db";
    await mongoose.connect(url);
  });

  // Connection close after tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Clear DB before each test to avoid conflicts
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should login user", async () => {
    // 1. Manually create a user first
    const testUser = new User({
      name: "Login User",
      email: "login@example.com",
      password: "password123"
    });
    await testUser.save();

    // 2. Try to login
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
}); // <--- Yeh line 51 hai, ensure karein ke yahan koi extra characters na hon