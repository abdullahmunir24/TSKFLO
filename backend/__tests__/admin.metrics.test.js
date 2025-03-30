const adminController = require("../controllers/adminController");
const User = require("../models/User");
const Task = require("../models/Task");

// Mock models and dependencies
jest.mock("../models/User");
jest.mock("../models/Task");
jest.mock("../logs/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe("GET /admin/metrics", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: "admin123", role: "admin" },
      params: {},
      body: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  it("should return metrics data successfully", async () => {
    // Arrange - Mock all countDocuments calls
    User.countDocuments = jest
      .fn()
      .mockResolvedValueOnce(10) // totalUsers
      .mockResolvedValueOnce(3); // totalAdmins

    Task.countDocuments = jest
      .fn()
      .mockResolvedValueOnce(25) // totalTasks_30d
      .mockResolvedValueOnce(15) // completedTasks_30d
      .mockResolvedValueOnce(10) // incompleteTasks_30d
      .mockResolvedValueOnce(5) // highPriorityTasks_30d
      .mockResolvedValueOnce(5) // mediumPriorityTasks_30d
      .mockResolvedValueOnce(5) // lowPriorityTasks_30d
      .mockResolvedValueOnce(5) // lockedTasks
      .mockResolvedValueOnce(5) // overdueTasks
      .mockResolvedValueOnce(25) // totalTasks
      .mockResolvedValueOnce(15) // completedTasks
      .mockResolvedValueOnce(10) // incompleteTasks
      .mockResolvedValueOnce(5) // highPriorityTasks
      .mockResolvedValueOnce(5) // mediumPriorityTasks
      .mockResolvedValueOnce(5); // lowPriorityTasks

    Task.aggregate = jest.fn().mockResolvedValue([]);

    // Act
    await adminController.getMetrics(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        userMetrics: expect.any(Object),
        taskMetrics: expect.any(Object),
        topUsersByCompletedTasks_30d: expect.any(Array),
      })
    );
  });

  it("should handle errors in metrics retrieval", async () => {
    // Arrange - Force an error
    User.countDocuments = jest
      .fn()
      .mockRejectedValue(new Error("Database error"));

    // Act
    await adminController.getMetrics(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
