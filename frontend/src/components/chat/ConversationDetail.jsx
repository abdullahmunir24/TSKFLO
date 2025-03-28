import React from "react";
import { FaArrowLeft, FaUser, FaUsers, FaEllipsisH } from "react-icons/fa";

const ConversationDetail = ({
  selectedConversation,
  conversations,
  setShowMobileMenu,
  currentUserId,
  getConversationName,
  isGroupChat,
  showMenu,
  setShowMenu,
  setShowDeleteConfirm,
  deleting,
  showParticipants,
  setShowParticipants,
}) => {
  if (!selectedConversation) return null;
  
  const currentConversation = conversations?.find(
    (c) => c._id === selectedConversation
  );
  
  if (!currentConversation) return null;

  const isGroup = isGroupChat(currentConversation);

  return (
    <div className="p-4 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between sticky top-0 z-10 shadow-sm flex-shrink-0">
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden mr-3 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200"
            >
              <FaArrowLeft size={18} />
            </button>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-300 mr-3">
                {isGroup ? <FaUsers size={16} /> : <FaUser size={16} />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  {getConversationName(currentConversation)}
                </h3>
                {isGroup && (
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    {currentConversation?.participants?.length || 0} members
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isGroup && (
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 
                hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-full transition-colors"
                title="View Participants"
              >
                <FaUser size={16} />
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200 
                hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-full transition-colors"
                title="More options"
              >
                <FaEllipsisH size={16} />
              </button>

              {/* Dropdown Menu - only Clear Chat button */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-lg py-1 z-50 border border-secondary-200 dark:border-secondary-700 animate-fade-in">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                    disabled={deleting}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-secondary-100 dark:hover:bg-secondary-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? "Deleting..." : "Delete Chat"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isGroup && showParticipants && currentConversation?.participants && (
          <div className="mt-3 p-3 bg-secondary-50 dark:bg-secondary-700/50 rounded-lg animate-slide-up">
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-2">
              Participants:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentConversation.participants.map((participant) => (
                <span
                  key={participant._id}
                  className="px-2.5 py-1 bg-primary-100 dark:bg-primary-800/60 text-primary-800 dark:text-primary-300 text-xs rounded-full"
                >
                  {participant.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationDetail; 