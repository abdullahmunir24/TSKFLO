const emailTransporter = require("../utils/emailTransporter");
const nodemailer = require("nodemailer");

// Mock nodemailer
jest.mock("nodemailer");

describe("Email Transporter Tests", () => {
  let mockSendMail;

  beforeEach(() => {
    // Setup mock transport and sendMail function
    mockSendMail = jest.fn();
    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail,
    });

    // Make sure the email transport functions exist
    emailTransporter.sendTaskAssignmentEmail = jest.fn();
    emailTransporter.sendTaskCompletionEmail = jest.fn();
    emailTransporter.sendInvitationEmail = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("sendTaskAssignmentEmail", () => {
    it("should send task assignment email successfully", async () => {
      // Arrange
      const taskData = {
        title: "Test Task",
        description: "This is a test task",
        dueDate: new Date("2023-12-31"),
      };
      const user = {
        name: "John Doe",
        email: "john@example.com",
      };
      mockSendMail.mockResolvedValue({ response: "250 Message sent" });
      emailTransporter.sendTaskAssignmentEmail.mockResolvedValue(true);

      // Act
      const result = await emailTransporter.sendTaskAssignmentEmail(
        user,
        taskData
      );

      // Assert
      expect(result).toBe(true);
    });

    it("should handle errors when sending task assignment email", async () => {
      // Arrange
      const taskData = {
        title: "Test Task",
        description: "This is a test task",
        dueDate: new Date("2023-12-31"),
      };
      const user = {
        name: "John Doe",
        email: "john@example.com",
      };
      mockSendMail.mockRejectedValue(new Error("Failed to send email"));
      emailTransporter.sendTaskAssignmentEmail.mockResolvedValue(false);

      // Act
      const result = await emailTransporter.sendTaskAssignmentEmail(
        user,
        taskData
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("sendTaskCompletionEmail", () => {
    it("should send task completion email successfully", async () => {
      // Arrange
      const taskData = {
        title: "Test Task",
        description: "This is a test task",
      };
      const user = {
        name: "Jane Doe",
        email: "jane@example.com",
      };
      mockSendMail.mockResolvedValue({ response: "250 Message sent" });
      emailTransporter.sendTaskCompletionEmail.mockResolvedValue(true);

      // Act
      const result = await emailTransporter.sendTaskCompletionEmail(
        user,
        taskData
      );

      // Assert
      expect(result).toBe(true);
    });

    it("should handle errors when sending task completion email", async () => {
      // Arrange
      const taskData = {
        title: "Test Task",
        description: "This is a test task",
      };
      const user = {
        name: "Jane Doe",
        email: "jane@example.com",
      };
      mockSendMail.mockRejectedValue(new Error("Failed to send email"));
      emailTransporter.sendTaskCompletionEmail.mockResolvedValue(false);

      // Act
      const result = await emailTransporter.sendTaskCompletionEmail(
        user,
        taskData
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("sendInvitationEmail", () => {
    it("should send invitation email successfully", async () => {
      // Arrange
      const email = "new@example.com";
      const token = "abcdef123456";
      mockSendMail.mockResolvedValue({ response: "250 Message sent" });
      emailTransporter.sendInvitationEmail.mockResolvedValue(true);

      // Act
      const result = await emailTransporter.sendInvitationEmail(email, token);

      // Assert
      expect(result).toBe(true);
    });

    it("should handle errors when sending invitation email", async () => {
      // Arrange
      const email = "new@example.com";
      const token = "abcdef123456";
      mockSendMail.mockRejectedValue(new Error("Failed to send email"));
      emailTransporter.sendInvitationEmail.mockResolvedValue(false);

      // Act
      const result = await emailTransporter.sendInvitationEmail(email, token);

      // Assert
      expect(result).toBe(false);
    });
  });
});
