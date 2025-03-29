import React from "react";
import { FaTimes, FaCheck, FaUser } from "react-icons/fa";

const UserSearch = ({
  searchUser,
  setSearchUser,
  searchResults,
  isLoadingSearching,
  selectedUsers,
  toggleUserSelection,
  groupName,
  setGroupName,
  handleCreateConversation,
}) => {
  return (
    <dialog
      id="new-conversation-modal"
      className="p-0 rounded-lg shadow-xl fixed top-[35%] left-1/2 
      transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-secondary-800
      w-11/12 max-w-md max-h-[80vh] overflow-hidden border border-secondary-200 dark:border-secondary-700"
    >
      <div className="bg-primary-600 text-white p-4">
        <h3 className="text-xl font-semibold text-center">
          New Conversation
        </h3>
      </div>

      <form onSubmit={handleCreateConversation} className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Participants
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search by name or email"
              className="w-full p-3 border rounded-lg 
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white
            border-secondary-300 dark:border-secondary-600"
            />
            {searchUser && (
              <button
                type="button"
                onClick={() => setSearchUser("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              >
                <FaTimes size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {!searchUser.trim() ? null : isLoadingSearching ? (
          <div className="mb-4 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="mb-4 max-h-48 overflow-y-auto border rounded-lg bg-white dark:bg-secondary-700 border-secondary-200 dark:border-secondary-600 divide-y divide-secondary-200 dark:divide-secondary-600">
            {searchResults.map((user) => (
              <div
                key={user._id}
                onClick={() => toggleUserSelection(user)}
                className={`flex items-center justify-between p-3 cursor-pointer transition-colors duration-150
              ${
                selectedUsers.some((u) => u._id === user._id)
                  ? "bg-primary-50 dark:bg-primary-900/30"
                  : "hover:bg-secondary-50 dark:hover:bg-secondary-700/70"
              }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center mr-3 text-primary-600 dark:text-primary-300">
                    <FaUser size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                {selectedUsers.some((u) => u._id === user._id) && (
                  <div className="bg-primary-500 text-white p-1 rounded-full">
                    <FaCheck size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-4 text-secondary-500 dark:text-secondary-400 text-center py-2">
            No users found.
          </p>
        )}

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Selected ({selectedUsers.length})
            </label>
            <div className="flex flex-wrap gap-2 bg-secondary-50 dark:bg-secondary-700/50 p-3 rounded-lg">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-primary-100 dark:bg-primary-800/60 text-primary-800 dark:text-primary-300 px-3 py-1.5 rounded-full text-sm flex items-center"
                >
                  {user.name}
                  <button
                    type="button"
                    onClick={() => toggleUserSelection(user)}
                    className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 focus:outline-none"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group Name */}
        {selectedUsers.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-3 border rounded-lg 
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white
            border-secondary-300 dark:border-secondary-600"
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => {
              document.getElementById("new-conversation-modal").close();
              setSearchUser("");
              // Reset other state as needed
            }}
            className="px-4 py-2 border rounded-lg text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-800
            hover:bg-secondary-50 dark:hover:bg-secondary-700 border-secondary-300 dark:border-secondary-600
            transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={selectedUsers.length === 0}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
            disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Start Chat
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default UserSearch; 