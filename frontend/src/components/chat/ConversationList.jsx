import React, { useState, useMemo } from "react";
import { FaCommentMedical, FaSearch, FaTimes, FaUsers, FaUser } from "react-icons/fa";

const ConversationList = ({
  conversations,
  isLoadingConversations,
  selectedConversation,
  setSelectedConversation,
  setShowMobileMenu,
  unreadCountsRef,
  unreadConversations,
  hasUnreadMessages,
  getConversationName,
  isGroupChat,
  showSearchBar,
  searchTerm,
  setSearchTerm,
  setShowSearchBar,
  searchRef,
}) => {
  // Filter conversations by search term
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    return conversations.filter((conv) => {
      const name = getConversationName(conv).toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm, getConversationName]);

  return (
    <>
      {/* Search Bar - Only Visible When Active */}
      {showSearchBar && (
        <div
          ref={searchRef}
          className="relative p-4 border-b border-secondary-200 dark:border-secondary-700 animate-fade-in"
        >
          <div className="relative">
            <input
              type="text"
              className="w-full py-2 pl-10 pr-4 border border-secondary-300 dark:border-secondary-600 rounded-full 
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500">
              <FaSearch size={16} />
            </div>
            <button
              onClick={() => setShowSearchBar(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 
              hover:text-secondary-600 dark:hover:text-secondary-400 focus:outline-none"
              title="Close search"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
        {isLoadingConversations ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="text-secondary-400 dark:text-secondary-500 mb-4">
              <FaCommentMedical size={36} className="mx-auto" />
            </div>
            <p className="text-secondary-500 dark:text-secondary-400 mb-2">
              No conversations found
            </p>
            <button
              onClick={() =>
                document.getElementById("new-conversation-modal").showModal()
              }
              className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
            >
              Start a new conversation
            </button>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const isActive = selectedConversation === conversation._id;
            const isGroup = isGroupChat(conversation);
            // Check for unread status from our map and other sources
            const hasUnread =
              unreadCountsRef.current.get(conversation._id) > 0 ||
              unreadConversations.has(conversation._id) ||
              (hasUnreadMessages && hasUnreadMessages(conversation._id));

            return (
              <div
                key={conversation._id}
                className={`p-4 cursor-pointer transition-colors duration-150 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 flex items-center
                ${
                  isActive ? "bg-primary-50 dark:bg-primary-900/30" : ""
                }`}
                onClick={() => {
                  setSelectedConversation(conversation._id);
                  setShowMobileMenu(false);
                }}
              >
                <div className="relative mr-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-300">
                    {isGroup ? (
                      <FaUsers className="text-lg" />
                    ) : (
                      <FaUser className="text-lg" />
                    )}
                  </div>
                  {hasUnread && (
                    <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-primary-600 border-2 border-white dark:border-secondary-800"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3
                      className={`text-base font-medium truncate ${
                        hasUnread
                          ? "text-primary-700 dark:text-primary-300 font-semibold"
                          : isActive
                          ? "text-primary-700 dark:text-primary-300"
                          : "text-secondary-900 dark:text-white"
                      }`}
                    >
                      {getConversationName(conversation)}
                    </h3>
                    <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-2 whitespace-nowrap">
                      {conversation.lastMessage
                        ? new Date(
                            conversation.lastMessage.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      hasUnread
                        ? "text-secondary-800 dark:text-secondary-200 font-medium"
                        : "text-secondary-500 dark:text-secondary-400"
                    }`}
                  >
                    {conversation.lastMessage
                      ? conversation.lastMessage.text
                      : "No messages yet..."}
                  </p>
                </div>
                {hasUnread && (
                  <div className="ml-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs">
                    {unreadCountsRef.current.get(conversation._id) > 9
                      ? "9+"
                      : unreadCountsRef.current.get(conversation._id) || 1}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default ConversationList; 