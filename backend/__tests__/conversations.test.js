const request = require("supertest");
const app = require("../app");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const logger = require("../logs/logger");
const conversationsController = require("../controllers/conversationsController");

process.env.NODE_ENV = "test";

// Mock the models and middleware
jest.mock("../models/Conversation");
jest.mock("../models/Message");
jest.mock("../middleware/verifyJWT", () => ({
  verifyJWT: (req, res, next) => {
    // Set user directly on the request object
    req.user = { id: "67acb6c00a79cee04957d04b" };
    next();
  },
  verifyAdmin: jest.fn((req, res, next) => next()),
}));

// Mock data
const mockUserId = "67acb6c00a79cee04957d04b";
const mockOtherUserId = "67b68a813a0980f15e455efe";

// Create mockConversation without save function for comparison with API responses
const mockConversationBase = {
  _id: "67b68a813a0980f15e455e00",
  participants: [mockUserId, mockOtherUserId],
  groupName: "Test Conversation",
  lastMessage: "67b68a813a0980f15e455e01",
};

const mockGroupConversationBase = {
  _id: "67b68a813a0980f15e455e02",
  participants: [mockUserId, mockOtherUserId, "67b68a813a0980f15e455eff"],
  groupName: "Test Group",
  lastMessage: "67b68a813a0980f15e455e03",
};

// Add save function for the mock objects used in the test
const mockConversation = {
  ...mockConversationBase,
  save: jest.fn().mockResolvedValue(true),
};

const mockGroupConversation = {
  ...mockGroupConversationBase,
  save: jest.fn().mockResolvedValue(true),
};

// Rest of the mock data
const mockMessage = {
  _id: "67b68a813a0980f15e455e01",
  conversation: "67b68a813a0980f15e455e00",
  sender: mockUserId,
  text: "Hello world",
  createdAt: new Date().toISOString(),
};

const mockPopulatedMessage = {
  _id: "67b68a813a0980f15e455e01",
  conversation: "67b68a813a0980f15e455e00",
  sender: {
    _id: mockUserId,
    name: "Test User",
    email: "test@example.com",
  },
  text: "Hello world",
  createdAt: new Date().toISOString(),
};

// Mock socket.io
const mockSocketIo = {
  to: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

describe("Conversation Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock app.get('socketIo')
    app.get = jest.fn((key) => {
      if (key === "socketIo") return mockSocketIo;
      return null;
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   GET /conversation -> getAllConversations
  // ─────────────────────────────────────────────────────────────────
  //
  describe("GET /conversations", () => {
    it("should return all conversations for the user", async () => {
      const mockConversationsResponse = [
        mockConversationBase,
        mockGroupConversationBase,
      ];
      Conversation.find.mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockConversationsResponse),
      }));

      const res = await request(app).get("/conversations");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockConversationsResponse);
      expect(Conversation.find).toHaveBeenCalledWith({
        participants: mockUserId,
      });
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   POST /conversation -> createConversation
  // ─────────────────────────────────────────────────────────────────
  //
  describe("POST /conversations", () => {
    it("should create a new conversation and return 200", async () => {
      Conversation.create.mockResolvedValue(mockConversationBase);

      const res = await request(app)
        .post("/conversations")
        .send({
          participants: [mockUserId, mockOtherUserId],
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockConversationBase);
      expect(mockSocketIo.to).toHaveBeenCalled();
      expect(mockSocketIo.emit).toHaveBeenCalledWith(
        "conversationCreated",
        mockConversationBase
      );
    });

    // This test was already passing, keeping it unchanged
    it("should return 400 if participants array is invalid", async () => {
      const res = await request(app).post("/conversations").send({
        groupName: "Test Conversation",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Participants should be an array of at least 2 users/
      );
    });

    it("should return 400 if group name is missing for group conversation", async () => {
      const res = await request(app)
        .post("/conversations")
        .send({
          participants: [
            mockOtherUserId,
            "67b68a813a0980f15e455eff",
            "67b68a813a0980f15e455eacd",
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(
        /Conversations with more than two people must have a group name/
      );
    });

    it("should automatically add current user to participants if missing", async () => {
      // The API appears to be adding a different user ID than what the test expects
      const userIdUsedInAPI = "67acb6c00a79cee04957d04b";

      const mockResponse = {
        ...mockGroupConversationBase,
        participants: [
          mockOtherUserId,
          "67b68a813a0980f15e455eff",
          userIdUsedInAPI,
        ],
      };

      Conversation.create.mockResolvedValue(mockResponse);

      const res = await request(app)
        .post("/conversations")
        .send({
          participants: [mockOtherUserId, "67b68a813a0980f15e455eff"],
          groupName: "Test Group",
        });

      expect(res.status).toBe(201);
      expect(Conversation.create).toHaveBeenCalledWith({
        participants: [
          mockOtherUserId,
          "67b68a813a0980f15e455eff",
          userIdUsedInAPI,
        ],
        groupName: "Test Group",
      });
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   GET /:conversationId/messages -> getMessages
  // ─────────────────────────────────────────────────────────────────
  //
  describe("GET /:conversationId/messages", () => {
    it("should return all messages for a conversation", async () => {
      Conversation.findById.mockResolvedValue(mockConversation);
      Message.find.mockImplementation(() => ({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([mockPopulatedMessage]),
      }));

      // Keep using the original path that the test expects
      const res = await request(app).get(
        `/conversations/${mockConversation._id}/messages` // Changed from /conversation to /conversations
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockPopulatedMessage]);
    });

    // This test was already passing, keeping it unchanged
    it("should return 404 if conversation doesn't exist", async () => {
      Conversation.findById.mockResolvedValue(null);

      const res = await request(app).get(
        "/conversations/nonexistentid/messages"
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Conversation not found/);
    });

    it("should return 403 if user is not a participant", async () => {
      const nonMemberConversation = {
        ...mockConversation,
        participants: [mockOtherUserId, "someOtherId"],
      };
      Conversation.findById.mockResolvedValue(nonMemberConversation);

      const res = await request(app).get(
        `/conversations/${mockConversation._id}/messages` // Changed from /conversation to /conversations
      );

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Not authorized to view messages/);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   POST /:conversationId/messages -> createMessage
  // ─────────────────────────────────────────────────────────────────
  //
  describe("POST /:conversationId/messages", () => {
    it("should create a new message successfully", async () => {
      Conversation.findById.mockResolvedValue(mockConversation);
      Message.create.mockResolvedValue(mockMessage);
      Message.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockPopulatedMessage),
      }));

      const res = await request(app)
        .post(`/conversations/${mockConversation._id}/messages`) // Changed from /conversation to /conversations
        .send({ text: "Hello world" });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockMessage);
      expect(Message.create).toHaveBeenCalledWith({
        conversation: mockConversation._id,
        sender: mockUserId,
        text: "Hello world",
      });
      expect(mockConversation.save).toHaveBeenCalled();
      expect(mockSocketIo.in).toHaveBeenCalledWith(
        mockConversation._id.toString()
      );
      expect(mockSocketIo.emit).toHaveBeenCalledWith(
        "messageCreated",
        mockPopulatedMessage
      );
    });

    // This test was already passing, keeping it unchanged
    it("should return 400 if conversation doesn't exist", async () => {
      Conversation.findById.mockResolvedValue(null);

      const res = await request(app)
        .post("/conversations/nonexistentid/messages")
        .send({ text: "Hello world" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Conversation not found/);
    });

    it("should return 403 if user is not a participant", async () => {
      const nonMemberConversation = {
        ...mockConversation,
        participants: [mockOtherUserId, "someOtherId"],
      };
      Conversation.findById.mockResolvedValue(nonMemberConversation);

      const res = await request(app)
        .post(`/conversations/${mockConversation._id}/messages`) // Changed from /conversation to /conversations
        .send({ text: "Hello world" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Not authorized to post messages/);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   DELETE /:conversationId/delete -> deleteConversation
  // ─────────────────────────────────────────────────────────────────
  //
  describe("DELETE /:conversationId/delete", () => {
    it("should delete a conversation successfully", async () => {
      // Mock findById to return a conversation with populated participants
      const populatedMockConversation = {
        ...mockConversation,
        participants: [{ _id: mockUserId }, { _id: mockOtherUserId }],
      };

      // Use the proper method chain pattern from your codebase
      Conversation.findById.mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          lean: jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue(populatedMockConversation),
          })),
        })),
      }));

      // Mock the correct deleteOne method with proper response
      Conversation.deleteOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      }));

      Message.deleteMany = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({ deletedCount: 2 }),
      }));

      const res = await request(app).delete(
        `/conversations/${mockConversation._id}/delete`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(Conversation.deleteOne).toHaveBeenCalled();
      expect(Message.deleteMany).toHaveBeenCalled();
    });

    it("should return 404 if conversation doesn't exist", async () => {
      // Mock finding no conversation
      Conversation.findById.mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          lean: jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue(null),
          })),
        })),
      }));

      const res = await request(app).delete(
        "/conversations/nonexistentid/delete"
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Conversation not found/);
    });

    it("should return 403 if user is not a participant", async () => {
      // Mock finding a conversation where the user isn't a participant
      const nonMemberConversation = {
        ...mockConversation,
        participants: [{ _id: "someOtherId" }, { _id: "anotherUserId" }],
      };

      Conversation.findById.mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          lean: jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue(nonMemberConversation),
          })),
        })),
      }));

      const res = await request(app).delete(
        `/conversations/${mockConversation._id}/delete`
      );

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Not authorized/i);
    });
  });

  //
  // ─────────────────────────────────────────────────────────────────
  //   Direct Controller Tests
  // ─────────────────────────────────────────────────────────────────
  //
  describe("Conversation Controller Tests", () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: { id: mockUserId },
        params: { conversationId: "conv123" },
        body: {},
        app: {
          get: jest.fn().mockReturnValue(mockSocketIo),
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    describe("DELETE /conversations/:conversationId/delete", () => {
      it("should delete conversation and its messages successfully", async () => {
        // Arrange a conversation where the user is a participant
        const mockConversation = {
          _id: "conv123",
          participants: [
            { _id: mockUserId, name: "Test User" },
            { _id: "otherUser", name: "Other User" },
          ],
          groupName: "Test Group",
        };

        // Setup the proper findById chain
        Conversation.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockConversation),
        });

        // Fix: Mock with chainable methods that match controller usage
        Conversation.deleteOne = jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        }));
        Message.deleteMany = jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue({ deletedCount: 5 }),
        }));

        // Act
        await conversationsController.deleteConversation(req, res, next);

        // Assert
        expect(Conversation.findById).toHaveBeenCalledWith("conv123");
        expect(Conversation.deleteOne).toHaveBeenCalled();
        expect(Message.deleteMany).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
      });

      it("should return 404 if conversation not found", async () => {
        // Arrange
        Conversation.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(null),
        });

        // Act
        await conversationsController.deleteConversation(req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalled();
      });

      it("should return 403 if user is not a participant", async () => {
        // Arrange
        const mockConversation = {
          _id: "conv123",
          participants: [
            { _id: "user1", name: "User 1" },
            { _id: "user2", name: "User 2" },
          ],
          groupName: "Test Group",
        };

        Conversation.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockConversation),
        });

        // Act
        await conversationsController.deleteConversation(req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalled();
      });

      it("should handle errors during conversation deletion", async () => {
        // Arrange
        const mockConversation = {
          _id: "conv123",
          participants: [{ _id: mockUserId }, { _id: "otherUser" }],
          groupName: "Test Group",
        };

        Conversation.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockConversation),
        });

        Conversation.deleteOne = jest.fn().mockImplementation(() => {
          throw new Error("Database error");
        });

        // Act
        await conversationsController.deleteConversation(req, res, next);

        // Assert
        expect(next).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });
});
