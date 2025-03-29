import React from "react";
import { FaPaperPlane } from "react-icons/fa";

const MessageInput = ({
  messageText,
  setMessageText,
  handleSendMessage,
  messageInputRef,
}) => {
  return (
    <div className="border-t border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 flex-shrink-0 sticky bottom-0">
      <form
        onSubmit={handleSendMessage}
        className="flex items-center space-x-2 p-3"
      >
        <div className="flex-1 bg-secondary-100 dark:bg-secondary-700 rounded-lg shadow-inner-glow px-3 py-2">
          <textarea
            ref={messageInputRef}
            className="w-full bg-transparent border-0 focus:ring-0 outline-none resize-none max-h-20 text-secondary-900 dark:text-white overflow-auto"
            placeholder="Type your message..."
            rows="1"
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              // Auto-resize textarea
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (messageText.trim()) {
                  handleSendMessage(e);
                }
              }
            }}
          />
          <div className="flex justify-end items-center mt-1">
            <p className="text-xs text-secondary-400 dark:text-secondary-500">
              {messageText.length > 0 ? messageText.length : ""}
              {messageText.length > 500 ? "/1000" : ""}
            </p>
          </div>
        </div>
        <button
          type="submit"
          className={`p-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            messageText.trim()
              ? "bg-primary-600 text-white hover:bg-primary-700"
              : "bg-secondary-300 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400 cursor-not-allowed"
          } transition-colors`}
          disabled={!messageText.trim()}
        >
          <FaPaperPlane size={16} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput; 