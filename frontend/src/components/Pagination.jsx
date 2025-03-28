import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between border-t border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-4 py-2 text-sm font-medium ${
            currentPage === 1
              ? "text-secondary-400 dark:text-secondary-500 cursor-not-allowed"
              : "text-primary-700 dark:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/30"
          }`}
        >
          Previous
        </button>
        <button
          onClick={() =>
            onPageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-4 py-2 text-sm font-medium ${
            currentPage === totalPages
              ? "text-secondary-400 dark:text-secondary-500 cursor-not-allowed"
              : "text-primary-700 dark:text-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/30"
          }`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-secondary-700 dark:text-secondary-400">
            Showing {" "}
            <span className="font-medium">
              {(currentPage - 1) * 10 + 1}
            </span>{" "}
            to {" "}
            <span className="font-medium">
              {Math.min(currentPage * 10, totalPages * 10)}
            </span>{" "}
            of {" "}
            <span className="font-medium">{totalPages * 10}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                currentPage === 1
                  ? "text-secondary-400 dark:text-secondary-500 cursor-not-allowed"
                  : "text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/30"
              }`}
            >
              <FaChevronLeft className="h-4 w-4" />
            </button>
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => onPageChange(page + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                  currentPage === page + 1
                    ? "z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-600 dark:text-primary-400"
                    : "bg-white dark:bg-secondary-800 border-secondary-300 dark:border-secondary-700 text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/30"
                }`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                currentPage === totalPages
                  ? "text-secondary-400 dark:text-secondary-500 cursor-not-allowed"
                  : "text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/30"
              }`}
            >
              <FaChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
