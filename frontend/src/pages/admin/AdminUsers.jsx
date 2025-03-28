import React, { useState, useMemo } from "react";
import { FaExclamationCircle, FaTimes, FaCopy, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetAdminUsersQuery,
  useInviteUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../features/admin/adminApiSlice";

const AdminUsers = () => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" });
  const [invitationLink, setInvitationLink] = useState("");
  const [filters, setFilters] = useState({ search: "", role: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAdminUsersQuery();
  const [inviteUser] = useInviteUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        (filters.role === "" || user.role === filters.role) &&
        (filters.search === "" ||
          user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.email.toLowerCase().includes(filters.search.toLowerCase()))
    );
  }, [users, filters]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    const end = start + USERS_PER_PAGE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId).unwrap();
      toast.success("User deleted successfully");
      refetch();
    } catch (err) {
      toast.error(err.data?.message || "Failed to delete user");
    }
  };

  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser({ userId: editingUser._id, ...newUser }).unwrap();
        toast.success("User updated successfully");
        setShowCreateUser(false);
      } else {
        const response = await inviteUser(newUser).unwrap();
        setInvitationLink(response.link);
        toast.success("Invitation sent successfully");
      }
      setEditingUser(null);
      setNewUser({ name: "", email: "", role: "user" });
      refetch();
    } catch (err) {
      toast.error(err.data?.message || "Failed to process user");
    }
  };

  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    toast.success("Invitation link copied to clipboard!");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Title */}
      <div className="glass-morphism rounded-xl shadow-sm p-6 mb-6 mt-6 border border-secondary-200 dark:border-secondary-700">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center">
          <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Admin Users
          </span>
        </h1>
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          Manage users and invitations
        </p>
      </div>

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

      {/* Filters and Search */}
      <div className="flex justify-between mb-4">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search by name or email"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-secondary-700 dark:text-white"
          />
          <select
            value={filters.role}
            onChange={(e) =>
              setFilters({ ...filters, role: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-secondary-700 dark:text-white"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          onClick={() => setFilters({ search: "", role: "" })}
          className="px-4 py-2 bg-gray-200 dark:bg-secondary-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-secondary-600"
        >
          Clear Filters
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-secondary-600 dark:text-secondary-400">
              Loading users...
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-secondary-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-secondary-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 dark:hover:bg-secondary-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
              handlePageChange(
                Math.min(
                  Math.ceil(filteredUsers.length / USERS_PER_PAGE),
                  currentPage + 1
                )
              )
            }
            disabled={
              currentPage ===
              Math.ceil(filteredUsers.length / USERS_PER_PAGE)
            }
            className={`relative ml-3 inline-flex items-center rounded-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-4 py-2 text-sm font-medium ${
              currentPage ===
              Math.ceil(filteredUsers.length / USERS_PER_PAGE)
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
                {paginatedUsers.length
                  ? (currentPage - 1) * USERS_PER_PAGE + 1
                  : 0}
              </span>{" "}
              to {" "}
              <span className="font-medium">
                {Math.min(
                  currentPage * USERS_PER_PAGE,
                  filteredUsers.length
                )}
              </span>{" "}
              of {" "}
              <span className="font-medium">{filteredUsers.length}</span> users
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() =>
                  handlePageChange(Math.max(1, currentPage - 1))
                }
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                  currentPage === 1
                    ? "text-secondary-400 dark:text-secondary-500 cursor-not-allowed"
                    : "text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700/30"
                }`}
              >
                <FaChevronLeft className="h-4 w-4" />
              </button>
              {[...Array(Math.ceil(filteredUsers.length / USERS_PER_PAGE)).keys()].map((page) => (
                <button
                  key={page + 1}
                  onClick={() => handlePageChange(page + 1)}
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
                onClick={() =>
                  handlePageChange(
                    Math.min(
                      Math.ceil(filteredUsers.length / USERS_PER_PAGE),
                      currentPage + 1
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredUsers.length / USERS_PER_PAGE)
                }
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                  currentPage ===
                  Math.ceil(filteredUsers.length / USERS_PER_PAGE)
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

      {/* Create / Edit User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
                {editingUser ? "Edit User" : "Invite New User"}
              </h2>
              <button
                onClick={() => {
                  setShowCreateUser(false);
                  setInvitationLink("");
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateUser}>
              <div className="space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-secondary-700 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-secondary-700 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-secondary-700 dark:text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Invitation Link Display */}
                {invitationLink && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg">
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
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateUser(false);
                      setInvitationLink("");
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-secondary-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingUser ? "Update" : "Invite"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
