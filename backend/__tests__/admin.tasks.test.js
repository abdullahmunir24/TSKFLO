process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app"); // your Express app
const Task = require("../models/Task");
const User = require("../models/User");
const adminController = require("../controllers/adminController");
jest.mock("../models/Task");
jest.mock("../models/User");
jest.mock("../utils/emailTransporter"); // if you have the same mock
const logger = require("../logs/logger");

// Example mocks
const mockTask = {
  _id: "67b68a813a0980f15e455efd",
  title: "Test Task",
  description: "Some description",
  priority: "high",
  dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  owner: "67b68a813a0980f15e455efd",
  assignees: ["67b68a813a0980f15e455efd"],
};

const mockTask2 = {
  _id: "xyzTask456xyzTask456xyz222",
  title: "Another Task",
  description: "Another description",
  priority: "low",
  dueDate: "2024-01-15T00:00:00.000Z",
  owner: "someUserId789",
  assignees: [],
};

describe("Admin Task Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   GET /admin/tasks -> getAllTasks
  // ─────────────────────────────────────────────────────────────────
  //
  describe("GET /admin/tasks", () => {
    it("should return a list of tasks with pagination info", async () => {
      // Create a mock that returns a chainable object where ANY method returns the same chain
      const findMock = Task.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTask]),
      });

      // Update this line to use the chainable pattern
      Task.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const res = await request(app).get("/admin/tasks?page=1&limit=5");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalTasks: 1,
        currentPage: 1,
        totalPages: 1,
        tasks: [
          {
            ...mockTask,
            dueDate: expect.any(String),
          },
        ],
      });
    });

    it("should default page=1 and limit=10 if not provided", async () => {
      // Similar approach for this test
      const findMock = Task.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTask, mockTask2]),
      });

      // Update this line to use the chainable pattern
      Task.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const res = await request(app).get("/admin/tasks");
      expect(res.status).toBe(200);
      expect(res.body.currentPage).toBe(1);
      expect(res.body.totalPages).toBe(1);
      expect(res.body.tasks.length).toBe(2);
    });

    it("should return 400 if page < 1", async () => {
      const res = await request(app).get("/admin/tasks?page=-1&limit=5");
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Page and limit must be positive numbers/);
    });

    it("should return 400 if limit < 1", async () => {
      const res = await request(app).get("/admin/tasks?page=1&limit=0");
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Page and limit must be positive numbers/);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   POST /admin/tasks -> createTask
  // ─────────────────────────────────────────────────────────────────
  //
  describe("POST /admin/tasks", () => {
    it("should create a task and return 200", async () => {
      Task.prototype.save = jest.fn().mockResolvedValue(mockTask);

      const res = await request(app)
        .post("/admin/tasks")
        .send({
          title: "Test Task",
          description: "Some description",
          priority: "high",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignees: ["67b68a813a0980f15e455efd"],
        });

      expect(res.status).toBe(200);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   GET /admin/tasks/:taskId -> getTask
  // ─────────────────────────────────────────────────────────────────
  //
  describe("GET /admin/tasks/:taskId", () => {
    it("should return 404 if task not found", async () => {
      Task.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get(
        "/admin/tasks/642f9bb96d3c5a4779229999"
      );
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/No such task exists/);
    });

    it("should return the task if found", async () => {
      Task.findOne.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      const res = await request(app).get(`/admin/tasks/${mockTask._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...mockTask,
        dueDate: expect.any(String),
      });
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   PATCH /admin/tasks/:taskId -> updateTask
  // ─────────────────────────────────────────────────────────────────
  //
  describe("PATCH /admin/tasks/:taskId", () => {
    it("should return 404 if no task exists", async () => {
      // Setup mock to return null (no task found)
      Task.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .patch("/admin/tasks/642f9bb96d3c5a4779220000")
        .send({
          title: "Updated Title",
        });
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No such task exists");
    });

    it("should update the task and return it", async () => {
      const updatedTask = { ...mockTask, title: "Updated Title" };

      // Create a mock task object with a save method
      const taskWithSave = {
        ...mockTask,
        save: jest.fn().mockResolvedValue(updatedTask),
      };

      // Mock findOne to return our task with save method
      Task.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(taskWithSave),
      });

      const res = await request(app)
        .patch(`/admin/tasks/${mockTask._id}`)
        .send({
          title: "Updated Title",
        });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Title");
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   DELETE /admin/tasks/:taskId -> deleteTask
  // ─────────────────────────────────────────────────────────────────
  //
  describe("DELETE /admin/tasks/:taskId", () => {
    it("should return 404 if task is not found", async () => {
      Task.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      const res = await request(app).delete(
        "/admin/tasks/642f9bb96d3c5a4770000000"
      );
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/No Task found/);
    });

    it("should delete task successfully (200)", async () => {
      Task.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      const res = await request(app).delete(`/admin/tasks/${mockTask._id}`);
      expect(res.status).toBe(200);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   PATCH /admin/tasks/:taskId/lock -> lockTask
  // ─────────────────────────────────────────────────────────────────
  //
  describe("PATCH /admin/tasks/:taskId/lock", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: { id: "admin123", role: "admin" },
        params: { taskId: "task123" },
        body: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        sendStatus: jest.fn(),
      };
      next = jest.fn();
    });

    it("should lock a task successfully", async () => {
      // Arrange - Mock the findOneAndUpdate method used in the controller
      const mockUpdatedTask = {
        _id: "task123",
        title: "Test Task",
        locked: true,
      };

      // Setup mock correctly for the implementation in the controller
      Task.findOneAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue(mockUpdatedTask),
      });

      // Act
      await adminController.lockTask(req, res, next);

      // Assert
      expect(Task.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "task123",
          locked: true,
        })
      );
    });

    it("should return 404 when task not found for locking", async () => {
      // Arrange - Task not found
      Task.findOneAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue(null),
      });

      // Act
      await adminController.lockTask(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No such task exists",
        })
      );
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   PATCH /admin/tasks/:taskId/unlock -> unlockTask
  // ─────────────────────────────────────────────────────────────────
  //
  describe("PATCH /admin/tasks/:taskId/unlock", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: { id: "admin123", role: "admin" },
        params: { taskId: "task123" },
        body: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        sendStatus: jest.fn(),
      };
      next = jest.fn();
    });

    it("should unlock a task successfully", async () => {
      // Arrange - Mock the findOneAndUpdate method
      const mockUpdatedTask = {
        _id: "task123",
        title: "Test Task",
        locked: false,
      };

      Task.findOneAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue(mockUpdatedTask),
      });

      // Act
      await adminController.unlockTask(req, res, next);

      // Assert
      expect(Task.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "task123",
          locked: false,
        })
      );
    });

    it("should return 404 when task not found for unlocking", async () => {
      // Arrange - Task not found
      Task.findOneAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue(null),
      });

      // Act
      await adminController.unlockTask(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No such task exists",
        })
      );
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   PATCH /admin/tasks/:taskId/assignees -> addAssignee
  // ─────────────────────────────────────────────────────────────────
  //
  describe("PATCH /admin/tasks/:taskId/assignees", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: { id: "admin123", role: "admin" },
        params: { taskId: "task123" },
        body: { assigneeId: "user123" },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        sendStatus: jest.fn(),
      };
      next = jest.fn();
    });

    it("should add an assignee successfully", async () => {
      // Arrange
      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@example.com",
      };

      const mockTask = {
        _id: "task123",
        title: "Test Task",
        assignees: ["existingUser"],
        save: jest.fn().mockResolvedValue({
          _id: "task123",
          title: "Test Task",
          assignees: ["existingUser", "user123"],
        }),
      };

      // Set up the mocks to match the controller's expectations
      User.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue(mockUser),
      });

      Task.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      // Act
      await adminController.addAssignee(req, res, next);

      // Assert
      expect(mockTask.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Assignee added successfully",
          task: expect.any(Object),
        })
      );
    });

    it("should return 204 if user is already an assignee", async () => {
      // Arrange - User is already assigned
      const mockUser = {
        _id: "user123",
        name: "John Doe",
      };

      const mockTask = {
        _id: "task123",
        title: "Test Task",
        assignees: ["user123"],
      };

      User.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue(mockUser),
      });

      Task.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      // Act
      await adminController.addAssignee(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   DELETE /admin/tasks/:taskId/assignees -> removeAssignee
  // ─────────────────────────────────────────────────────────────────
  //
  describe("DELETE /admin/tasks/:taskId/assignees", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: { id: "admin123", role: "admin" },
        params: { taskId: "task123" },
        body: { assigneeId: "user123" },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        sendStatus: jest.fn(),
      };
      next = jest.fn();
    });

    it("should remove an assignee successfully", async () => {
      // Arrange
      const mockTask = {
        _id: "task123",
        title: "Test Task",
        assignees: ["user123", "user456"],
        save: jest.fn().mockResolvedValue({
          _id: "task123",
          title: "Test Task",
          assignees: ["user456"],
        }),
      };

      Task.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      });

      // Act
      await adminController.removeAssignee(req, res, next);

      // Assert
      expect(mockTask.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Assignee removed successfully",
          task: expect.any(Object),
        })
      );
    });

    it("should return 404 if task not found", async () => {
      // Arrange - Task not found
      Task.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Act
      await adminController.removeAssignee(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Task not found or you do not have permission",
        })
      );
    });
  });
});
