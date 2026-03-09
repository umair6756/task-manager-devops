const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const User = require("../models/User");
const Task = require("../models/Task");

describe("Task API", () => {
  beforeAll(async () => {
    const url = process.env.MONGO_URI || "mongodb://localhost:27017/test-db";
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Task.deleteMany({})]);
  });

  const registerAndGetToken = async (name, email) => {
    const res = await request(app).post("/api/auth/register").send({
      name,
      email,
      password: "password123"
    });

    return { token: res.body.token, userId: res.body._id };
  };

  it("creates a task for authenticated user", async () => {
    const { token } = await registerAndGetToken("Task User", "task1@example.com");

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "First Task",
        description: "Task details"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe("First Task");
    expect(res.body.description).toBe("Task details");
    expect(res.body.completed).toBe(false);
  });

  it("lists only tasks owned by logged in user", async () => {
    const userA = await registerAndGetToken("User A", "usera@example.com");
    const userB = await registerAndGetToken("User B", "userb@example.com");

    await Task.create({
      title: "A task",
      description: "Belongs to A",
      user: userA.userId
    });
    await Task.create({
      title: "B task",
      description: "Belongs to B",
      user: userB.userId
    });

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${userA.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("A task");
  });

  it("does not allow user to update another user's task", async () => {
    const userA = await registerAndGetToken("User A", "usera2@example.com");
    const userB = await registerAndGetToken("User B", "userb2@example.com");

    const task = await Task.create({
      title: "Private task",
      user: userA.userId
    });

    const res = await request(app)
      .put(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${userB.token}`)
      .send({ title: "Hacked" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Task not found");
  });

  it("returns user with tasks on /api/auth/me?includeTasks=true", async () => {
    const { token, userId } = await registerAndGetToken("Task Owner", "owner@example.com");

    await Task.create({
      title: "Owner Task",
      description: "Owned",
      user: userId
    });

    const res = await request(app)
      .get("/api/auth/me?includeTasks=true")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("email", "owner@example.com");
    expect(res.body.user).toHaveProperty("tasks");
    expect(res.body.user.tasks).toHaveLength(1);
    expect(res.body.user.tasks[0].title).toBe("Owner Task");
  });
});
