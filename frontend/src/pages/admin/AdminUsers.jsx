import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  FaExclamationCircle,
  FaTimes,
  FaCopy,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toastUtils";
import Pagination from "../../components/Pagination";
import ConfirmationModal from "../../components/ConfirmationModal";

import {
  useGetAdminUsersQuery,
  useInviteUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../features/admin/adminApiSlice";
import { debounce } from "lodash"; // Make sure to import lodash

const AdminUsers = () => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" });
  const [invitationLink, setInvitationLink] = useState("");
  const [filters, setFilters] = useState({ search: "", role: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const USERS_PER_PAGE = 10;

  // Create a query params object for the API
  const queryParams = {
    page: currentPage,
    limit: USERS_PER_PAGE,
    search: filters.search,
    role: filters.role,
  };

  const {
    data = {
      users: [],
      pagination: { totalUsers: 0, currentPage: 1, totalPages: 1 },
    },
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAdminUsersQuery(queryParams);

  const [inviteUser] = useInviteUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // Create a debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setFilters((prev) => ({ ...prev, search: searchValue }));
      setCurrentPage(1); // Reset to first page when searching
    }, 500), // 500ms delay
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Update the UI immediately
    setFilters((prev) => ({ ...prev, search: value }));
    // Debounce the actual API call
    debouncedSearch(value);
  };

  // Handle role filter change
  const handleRoleChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, role: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ search: "", role: "" });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteConfirmation = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      console.log("Deleting user with ID:", userToDelete);
      const result = await deleteUser(userToDelete).unwrap();
      console.log("Delete user response:", result);

      // Always show success toast on successful deletion
      showSuccessToast(result?.message || "User deleted successfully");
      refetch();
    } catch (err) {
      console.error("Error deleting user:", err);

      // Special case: If it's a parsing error but status is 200, it was actually successful
      if (err?.status === "PARSING_ERROR" && err?.originalStatus === 200) {
        showSuccessToast("User deleted successfully");
        refetch();
      } else {
        showErrorToast(err?.data?.message || "Failed to delete user");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser({ userId: editingUser._id, ...newUser }).unwrap();
        showSuccessToast("User updated successfully");
        setShowCreateUser(false);
      } else {
        const response = await inviteUser(newUser).unwrap();

        // Handle already invited case
        if (response?.alreadyInvited) {
          showWarningToast(response.message || "User has already been invited");
        } else {
          setInvitationLink(response.link);
          showSuccessToast("Invitation sent successfully");
        }
      }
      setEditingUser(null);
      setNewUser({ name: "", email: "", role: "user" });
      refetch();
    } catch (err) {
      showErrorToast(err.data?.message || "Failed to process user");
    }
  };

  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    showSuccessToast("Invitation link copied to clipboard!");
  };

  // Handle creating/inviting a new user
  const handleCreateUser = () => {
    setEditingUser(null);
    setNewUser({ name: "", email: "", role: "user" });
    setInvitationLink("");
    setShowCreateUser(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Error handling */}
      {isError && (
        <div
          className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 px-4 py-3 rounded-lg shadow-sm mb-4"
          role="alert"
        >
          <div className="flex items-center">
            <FaExclamationCircle className="mr-2" />
            <strong className="font-bold">Error!</strong>
            <span className="ml-2">
              {error.message || "Failed to fetch users"}
            </span>
          </div>
        </div>
      )}

      {/* Controls and Table Container - styled like AdminTasks */}
      <div className="bg-gradient-to-br from-white to-primary-50/30 dark:from-secondary-800 dark:to-secondary-900 rounded-lg shadow-sm p-6 mb-6">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
              User Management
            </h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
              Manage users and invitations
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-secondary-400 dark:text-secondary-500" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center px-4 py-2 bg-white dark:bg-secondary-800 text-primary-600 dark:text-primary-400 rounded-lg border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-all duration-200"
              >
                <FaFilter className="mr-2" />
                Filters
                {showFilterDropdown ? (
                  <FaChevronUp className="ml-2" />
                ) : (
                  <FaChevronDown className="ml-2" />
                )}
              </button>
              {showFilterDropdown && (
                <div className="absolute mt-2 right-0 w-72 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 z-10 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Role
                      </label>
                      <select
                        value={filters.role}
                        onChange={handleRoleChange}
                        className="w-full rounded-lg border border-secondary-200 dark:border-secondary-700 py-2 px-3 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                      >
                        <option value="">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {filters.role !== "" || filters.search !== "" ? (
                      <button
                        onClick={clearFilters}
                        className="w-full mt-2 px-4 py-2 text-sm text-danger-600 bg-danger-50 dark:bg-danger-900/20 hover:bg-danger-100 dark:hover:bg-danger-800/30 rounded-lg"
                      >
                        Clear all filters
                      </button>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* Invite User Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleCreateUser}
                className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium shadow-sm transition-all duration-200"
              >
                <FaPlus className="mr-2" /> Invite User
              </button>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-hidden rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-secondary-600 dark:text-secondary-400">
                Loading users...
              </p>
            </div>
          ) : data.users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                <thead className="bg-secondary-50 dark:bg-secondary-700/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
                  {data.users.map((user) => (
                    <tr
                      key={user._id}
                      className="group hover:bg-secondary-50 dark:hover:bg-secondary-700/30 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-600 dark:text-secondary-400">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setNewUser({
                                name: user.name,
                                email: user.email,
                                role: user.role,
                              });
                              setShowCreateUser(true);
                            }}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirmation(user._id)}
                            className="text-danger-500 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary-500 dark:text-secondary-400">
                No users match the selected filters.
              </p>
              <button
                onClick={clearFilters}
                className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination - now using server-side pagination data */}
      {data.pagination.totalPages > 1 && (
        <Pagination
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create / Edit User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-[40px] border shadow-xl rounded-xl bg-white dark:bg-secondary-800 animate-scale-in w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                  {editingUser ? "Edit User" : "Invite New User"}
                </span>
              </h3>
              <button
                onClick={() => {
                  setShowCreateUser(false);
                  setInvitationLink("");
                }}
                className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-500 dark:text-secondary-400 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateUser}>
              <div className="space-y-4">
                {/* Show form fields for editing user or when no invitation link exists yet */}
                {editingUser || !invitationLink ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, name: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newUser.email}
                        onChange={(e) =>
                          setNewUser({ ...newUser, email: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                        Role
                      </label>
                      <select
                        name="role"
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser({ ...newUser, role: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </>
                ) : null}

                {/* Show invitation link box only when there's a link or we're not editing */}
                {!editingUser && invitationLink && (
                  <div className="p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        Invitation Link
                      </label>
                      <button
                        type="button"
                        onClick={copyInvitationLink}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center"
                      >
                        <FaCopy className="mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 break-all bg-white dark:bg-secondary-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                      {invitationLink}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      The user has already been emailed with an invitation. You can also share this link manually if needed. This system is purely for development.
                    </p>
                  </div>
                )}

                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateUser(false);
                      setInvitationLink("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {invitationLink ? "Close" : "Cancel"}
                  </button>
                  {/* Only show submit button when not showing the invitation link */}
                  {(editingUser || !invitationLink) && (
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                    >
                      {editingUser ? "Update" : "Invite"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action is permanent and cannot be undone."
        confirmText={
          isDeleting ? (
            <FaSpinner className="animate-spin mx-auto" />
          ) : (
            "Delete User"
          )
        }
        variant="danger"
      />
    </div>
  );
};

export default AdminUsers;
