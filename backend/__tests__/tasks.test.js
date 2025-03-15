process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const Task = require("../models/Task");
const User = require("../models/User");
const logger = require("../logs/logger");

beforeAll(() => {
  process.env.NODE_ENV = "test";
  jest.resetModules();
  jest.clearAllMocks();
});

describe("Task API Endpoints", () => {
  const mockUser = {
    _id: "67acb6c00a79cee04957d04b",
    email: "user@example.com",
  };
  const mockTask = {
    _id: "67bc2cb47654cf035032732b",
    title: "Test Task",
    description: "A test task",
    priority: "High",
    dueDate: new Date().toISOString(),
    status: "Incomplete",
    owner: "67acb6c00a79cee04957d04b",
    assignees: [],
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks
  });

  describe("GET /tasks", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "test";
      jest.clearAllMocks(); // Reset mocks
    });

    it("should return a list of tasks for the user", async () => {
      // Create a chainable mock that correctly returns when exec() is called
      const userChainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      };
      User.findOne.mockReturnValue(userChainMock);

      const taskChainMock = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTask]),
      };
      Task.find.mockReturnValue(taskChainMock);

      const response = await request(app).get("/tasks");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockTask]);
    });

    it("should return 404 if user is not found", async () => {
      const userChainMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      User.findOne.mockReturnValue(userChainMock);

      const response = await request(app).get("/tasks");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No user found for provided email");
    });
  });

  // POST /tasks - Create a new task
  describe("POST /tasks", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "test";
      jest.clearAllMocks(); // Reset mocks
    });

    it("should create a task successfully", async () => {
      User.findOne.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      }));
      Task.prototype.save = jest.fn().mockResolvedValue(mockTask);

      const response = await request(app)
        .post("/tasks")
        .send({
          title: "New Task",
          description: "Test",
          priority: "low",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task created successfully");
    });

    it("should return 404 if user not found", async () => {
      User.findOne.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }));

      const response = await request(app)
        .post("/tasks")
        .send({
          title: "New Task",
          description: "Test",
          priority: "low",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No user found in DB");
    });
  });

  // GET /tasks/:taskId - Get a specific task
  describe("GET /tasks/:taskId", () => {
    it("should return the requested task", async () => {
      Task.findOne.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockTask),
      }));

      const response = await request(app).get(
        "/tasks/67bc2cb47654cf035032732b"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTask);
    });

    it("should return 404 if task not found", async () => {
      Task.findOne.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }));

      const response = await request(app).get(
        "/tasks/67bc2cb47654cf035032732b"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("No Task with provided ID found");
    });
  });

  // PATCH /tasks/:taskId - Update a task
  describe("PATCH /tasks/:taskId", () => {
    it("should update the task and return the updated task", async () => {
      Task.findOne.mockImplementation(() => ({
        exec: () =>
          Promise.resolve({
            ...mockTask,
            save: jest.fn().mockResolvedValue({ title: "Updated" }),
          }),
      }));

      const response = await request(app)
        .patch("/tasks/67bc2cb47654cf035032732b")
        .send({ title: "Updated" });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Updated");
    });

    it("should return 400 if illegal fields are included", async () => {
      Task.findOne.mockImplementation(() => ({
        exec: () =>
          Promise.resolve({
            ...mockTask,
            save: jest.fn().mockResolvedValue({ title: "Updated" }),
          }),
      }));

      const response = await request(app)
        .patch("/tasks/67bc2cb47654cf035032732b")
        .send({ owner: "67acb6c00a79cee04957d04b" });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("cannot be edited");
    });
  });

  // DELETE /tasks/:taskId - Delete a task
  describe("DELETE /tasks/:taskId", () => {
    it("should delete the task successfully", async () => {
      Task.findOneAndDelete.mockImplementation(() => ({
        exec: () => Promise.resolve(mockTask),
      }));

      const response = await request(app).delete(
        "/tasks/67bc2cb47654cf035032732b"
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task deleted successfully");
    });

    it("should return 404 if task does not exist", async () => {
      Task.findOneAndDelete.mockImplementation(() => ({
        exec: () => Promise.resolve(null),
      }));

      const response = await request(app).delete(
        "/tasks/67bc2cb47654cf035032732b"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toContain(
        "User does not own this task or task does not exist"
      );
    });
  });

  // PATCH /tasks/:taskId/assignees - Add an assignee
  describe("PATCH /tasks/:taskId/assignees", () => {
    it("should add an assignee successfully", async () => {
      User.findById.mockImplementation(() => ({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      }));
      Task.findOne.mockImplementation(() => ({
        exec: () =>
          Promise.resolve({
            ...mockTask,
            save: () => Promise.resolve(mockTask),
          }),
      }));

      const response = await request(app)
        .patch("/tasks/67bc2cb47654cf035032732b/assignees")
        .send({ assigneeId: "67acb6c00a79cee04957d04b" });
      logger.debug(response.body);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Assignee added successfully");
    });
  });

  // DELETE /tasks/:taskId/assignees - Remove an assignee
  describe("DELETE /tasks/:taskId/assignees", () => {
    it("should remove an assignee successfully", async () => {
      Task.findOne.mockImplementation(() => ({
        exec: () =>
          Promise.resolve({
            ...mockTask,
            save: () => Promise.resolve(mockTask),
          }),
      }));

      const response = await request(app)
        .delete("/tasks/67bc2cb47654cf035032732b/assignees")
        .send({ assigneeId: "67acb6c00a79cee04957d04b" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Assignee removed successfully");
    });
  });
});

afterAll(async () => {
  jest.clearAllMocks();
  await new Promise((resolve) => setImmediate(resolve));
  if (logger.close) {
    await logger.close();
  }
});
