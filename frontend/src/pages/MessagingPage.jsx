import React, { useState, useRef, useEffect } from "react";
import {
  FaCommentMedical,
  FaSearch,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import {
  useGetAllConversationsQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useCreateMessageMutation,
  useDeleteConversationMutation,
} from "../features/messages/messageApiSlice";
import { useSearchUsersQuery } from "../features/user/userApiSlice";
import { selectCurrentUserId } from "../features/auth/authSlice";
import { getSocket } from "../services/socketService";
import { useNotification } from "../context/NotificationContext";
import { showErrorToast } from "../utils/toastUtils";

// Import the new components
import ConversationList from "../components/chat/ConversationList";
import ConversationDetail from "../components/chat/ConversationDetail";
import MessageDisplay from "../components/chat/MessageDisplay";
import MessageInput from "../components/chat/MessageInput";
import UserSearch from "../components/chat/UserSearch";

const MessagingPage = () => {
  // State for user search input and results
  const [searchUser, setSearchUser] = useState("");
  const [groupName, setGroupName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const currentUserId = useSelector(selectCurrentUserId);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const socket = getSocket();
  const [showParticipants, setShowParticipants] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: searchResult, isLoading: isLoadingSearching } =
    useSearchUsersQuery(debouncedSearchTerm, {
      skip: !debouncedSearchTerm,
    });

  // Every time `searchUser` changes, wait 500ms before updating `debouncedSearchTerm`
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchUser.trim());
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchUser]);

  useEffect(() => {
    if (searchResult && searchResult.users) {
      // Filter out the current user
      setSearchResults(
        searchResult.users.filter((user) => user._id !== currentUserId)
      );
    } else {
      setSearchResults([]);
    }
  }, [searchResult, currentUserId]);

  // Existing state variables
  const [selectedConversation, setSelectedConversation] = useState(null);
  // Add a ref to track the previously marked conversation
  const previousMarkedConversationRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [messageText, setMessageText] = useState("");
  const searchRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  // Replace conversationsRef with a dedicated Map for unread counts
  const unreadCountsRef = useRef(new Map());

  const toggleUserSelection = (user) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const { hasUnreadMessages, markConversationAsRead, unreadConversations } =
    useNotification();

  const { data: conversations, isLoading: isLoadingConversations } =
    useGetAllConversationsQuery();

  // Get other participant name for conversation display
  const getConversationName = (conversation) => {
    // First check if conversation and participants exist
    if (!conversation || !conversation.participants) return "Unknown";

    // If it has a group name, use that
    if (conversation.groupName) {
      return conversation.groupName;
    }

    // Safety check for participants array length
    if (conversation.participants.length === 0) {
      return "Empty conversation";
    }

    // If there's only one participant, return their name
    if (conversation.participants.length === 1) {
      return conversation.participants[0]?.name || "Unknown User";
    }

    // Find the other participant (not the current user)
    const otherParticipant = conversation.participants.find(
      (participant) => participant._id !== currentUserId
    );

    // If found, return their name, otherwise use the first participant's name
    return (
      otherParticipant?.name ||
      conversation.participants[0]?.name ||
      "Unknown User"
    );
  };

  // Helper to identify if a conversation is a group chat
  const isGroupChat = (conversation) => {
    if (!conversation) return false;
    // Consider it a group chat if it has a group name or more than 2 participants
    return (
      conversation.groupName ||
      (conversation.participants && conversation.participants.length > 2)
    );
  };

  // Socket listener just for tracking unread messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // Only track unread messages that aren't from current user
      // and aren't in the currently selected conversation
      if (
        message.sender._id !== currentUserId &&
        selectedConversation !== message.conversation
      ) {
        // Update unread count in our separate Map - this is mutable and safe to modify
        const currentCount =
          unreadCountsRef.current.get(message.conversation) || 0;
        unreadCountsRef.current.set(message.conversation, currentCount + 1);
      }
    };

    socket.on("messageCreated", handleNewMessage);

    return () => {
      socket.off("messageCreated", handleNewMessage);
    };
  }, [socket, currentUserId, selectedConversation]);

  // Effect to mark conversation as read when selected
  useEffect(() => {
    if (
      selectedConversation &&
      selectedConversation !== previousMarkedConversationRef.current
    ) {
      // Update the ref to current conversation
      previousMarkedConversationRef.current = selectedConversation;

      // Mark as read in the notification context
      markConversationAsRead(selectedConversation);

      // Clear the unread count in our map
      if (unreadCountsRef.current.has(selectedConversation)) {
        unreadCountsRef.current.delete(selectedConversation);
      }
    }
  }, [selectedConversation, markConversationAsRead]);

  const {
    data: messages,
    isLoading: isLoadingMessages,
  } = useGetMessagesQuery(selectedConversation, {
    skip: !selectedConversation,
  });
  const [createConversation] = useCreateConversationMutation();
  const [createMessage] = useCreateMessageMutation();
  const [deleteConversation] = useDeleteConversationMutation();

  const handleDeleteChat = async () => {
    try {
      setDeleting(true);
      await deleteConversation(selectedConversation).unwrap();
      setShowDeleteConfirm(false);
      setShowMenu(false);
      // The UI update will happen automatically through the socket event
    } catch (error) {
      console.error("Error deleting conversation:", error);
      showErrorToast("Failed to delete conversation");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;

    try {
      // Send as an array of participant IDs with current user included
      await createConversation({
        participants: [currentUserId, ...selectedUsers.map((user) => user._id)],
        groupName: groupName,
      }).unwrap();

      setSelectedUsers([]);
      setGroupName("");
      document.getElementById("new-conversation-modal").close();
    } catch (error) {
      console.error("Failed to create conversation:", error);
      showErrorToast("Failed to create conversation");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await createMessage({
        conversationId: selectedConversation,
        messageData: { text: messageText.trim() },
      }).unwrap();
      setMessageText("");
      messageInputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
      showErrorToast("Failed to send message");
    }
  };

  const focusMessageInput = () => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  // Scroll to bottom of messages on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Hide search bar when clicking outside or hitting Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchBar(false);
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setShowSearchBar(false);
      }
    }

    if (showSearchBar) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showSearchBar]);

  // Handle mobile view switching
  useEffect(() => {
    // When a conversation is selected on mobile, hide the sidebar
    if (selectedConversation && window.innerWidth < 768) {
      setShowMobileMenu(false);
    }

    // Reset mobile view on window resize
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedConversation]);

  // Effect to auto-focus the message input when selecting a conversation
  useEffect(() => {
    if (selectedConversation && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [selectedConversation]);

  // Effect to handle conversation deletion when user is viewing the deleted conversation
  useEffect(() => {
    if (!socket) return;

    const handleConversationDeleted = ({ conversationId }) => {
      // If this is the conversation we're currently viewing, reset the view
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
        setShowMobileMenu(true);
      }
    };

    socket.on("conversationDeleted", handleConversationDeleted);

    return () => {
      socket.off("conversationDeleted", handleConversationDeleted);
    };
  }, [socket, selectedConversation]);

  return (
    <div className="h-screen flex flex-col bg-secondary-50 dark:bg-secondary-900">
      <div className="pt-16 flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar - Conversation List */}
          <div
            className={`${
              showMobileMenu ? "block" : "hidden"
            } md:block w-full md:w-96 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex-shrink-0 overflow-y-auto transition-all duration-300 relative`}
          >
            {/* Header */}
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between bg-white dark:bg-secondary-800 sticky top-0 z-10 shadow-sm">
              <h2 className="text-xl font-semibold text-secondary-800 dark:text-white">
                Messages
              </h2>

              <div className="flex space-x-3">
                {/* Search Icon */}
                <button
                  onClick={() => setShowSearchBar(!showSearchBar)}
                  className="bg-secondary-100 dark:bg-secondary-700 text-primary-600 dark:text-primary-400 p-2 rounded-full hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  title="Search"
                >
                  <FaSearch size={16} />
                </button>

                {/* New Conversation Icon */}
                <button
                  onClick={() =>
                    document
                      .getElementById("new-conversation-modal")
                      .showModal()
                  }
                  className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  title="Create new conversation"
                >
                  <FaCommentMedical size={16} />
                </button>
              </div>
            </div>

            {/* Conversation List Component */}
            <ConversationList 
              conversations={conversations}
              isLoadingConversations={isLoadingConversations}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
              setShowMobileMenu={setShowMobileMenu}
              unreadCountsRef={unreadCountsRef}
              unreadConversations={unreadConversations}
              hasUnreadMessages={hasUnreadMessages}
              getConversationName={getConversationName}
              isGroupChat={isGroupChat}
              showSearchBar={showSearchBar}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setShowSearchBar={setShowSearchBar}
              searchRef={searchRef}
            />
          </div>

          {/* Main Chat Area */}
          <div
            className={`${
              !showMobileMenu ? "block" : "hidden"
            } md:block flex-1 flex flex-col bg-secondary-100 dark:bg-secondary-900 overflow-hidden`}
          >
            {selectedConversation ? (
              <div className="flex flex-col h-full">
                {/* Conversation Detail Component */}
                <ConversationDetail 
                  selectedConversation={selectedConversation}
                  conversations={conversations}
                  setShowMobileMenu={setShowMobileMenu}
                  currentUserId={currentUserId}
                  getConversationName={getConversationName}
                  isGroupChat={isGroupChat}
                  showMenu={showMenu}
                  setShowMenu={setShowMenu}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                  deleting={deleting}
                  showParticipants={showParticipants}
                  setShowParticipants={setShowParticipants}
                />

                {/* Message Display Component */}
                <MessageDisplay 
                  messages={messages}
                  isLoadingMessages={isLoadingMessages}
                  selectedConversation={selectedConversation}
                  currentUserId={currentUserId}
                  messagesEndRef={messagesEndRef}
                  focusMessageInput={focusMessageInput}
                  isGroupChat={isGroupChat}
                  conversations={conversations}
                />

                {/* Message Input Component */}
                <MessageInput 
                  messageText={messageText}
                  setMessageText={setMessageText}
                  handleSendMessage={handleSendMessage}
                  messageInputRef={messageInputRef}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-secondary-100 dark:bg-secondary-900 bg-opacity-75 animate-fade-in">
                <div className="text-center p-6 max-w-md">
                  <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                    <FaCommentMedical size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
                    No Conversation Selected
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                    Choose a conversation from the list or start a new one.
                  </p>
                  <button
                    onClick={() => {
                      setShowMobileMenu(true);
                      document
                        .getElementById("new-conversation-modal")
                        .showModal();
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                    transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UserSearch Component */}
      <UserSearch 
        searchUser={searchUser}
        setSearchUser={setSearchUser}
        searchResults={searchResults}
        isLoadingSearching={isLoadingSearching}
        selectedUsers={selectedUsers}
        toggleUserSelection={toggleUserSelection}
        groupName={groupName}
        setGroupName={setGroupName}
        handleCreateConversation={handleCreateConversation}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-2">
              Delete Conversation
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700 dark:text-red-400 mb-2">
                <strong>Warning:</strong> This action is permanent!
              </p>
              <p className="text-secondary-700 dark:text-secondary-300">
                This will delete the entire conversation and all messages for
                all participants.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-secondary-700 dark:text-secondary-300 border border-secondary-300 dark:border-secondary-600 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChat}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPage;
