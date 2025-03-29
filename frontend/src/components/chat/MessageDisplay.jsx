import React from "react";
import { FaCommentMedical } from "react-icons/fa";

const MessageDisplay = ({
  messages,
  isLoadingMessages,
  selectedConversation,
  currentUserId,
  messagesEndRef,
  focusMessageInput,
  isGroupChat,
  conversations,
}) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto" onClick={focusMessageInput}>
      {isLoadingMessages ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : messages?.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-full text-secondary-500 dark:text-secondary-400 animate-fade-in">
          <div className="bg-secondary-200 dark:bg-secondary-700 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <FaCommentMedical
              className="text-secondary-400 dark:text-secondary-500"
              size={24}
            />
          </div>
          <p className="mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages?.map((message, index) => {
            const currentConversation = conversations?.find(
              (c) => c._id === selectedConversation
            );
            const isGroup = isGroupChat(currentConversation);
            const isCurrentUser = message.sender._id === currentUserId;
            const showDate =
              index === 0 ||
              new Date(message.createdAt).toDateString() !==
                new Date(messages[index - 1].createdAt).toDateString();

            return (
              <div key={message._id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <div className="bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 text-xs px-3 py-1 rounded-full">
                      {new Date(message.createdAt).toLocaleDateString([], {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                )}
                <div
                  className={`flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className={`max-w-[75%] animate-slide-up`}>
                    {/* Show sender name only in group chats and not for current user's messages */}
                    {isGroup && !isCurrentUser && (
                      <div className="text-xs text-secondary-500 dark:text-secondary-400 ml-2 mb-1">
                        {message.sender.name}
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl shadow-sm ${
                        isCurrentUser
                          ? "bg-primary-600 text-white rounded-br-none"
                          : "bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                      <div
                        className={`text-xs mt-1 text-right ${
                          isCurrentUser
                            ? "text-primary-200"
                            : "text-secondary-500 dark:text-secondary-400"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageDisplay; 