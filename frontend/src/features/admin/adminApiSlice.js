import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3200/admin",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Custom error handling wrapper for baseQuery
const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  console.log("Making request:", args);
  const result = await baseQuery(args, api, extraOptions);
  console.log("Response received:", result);
  
  // If successful, return the result
  if (!result.error) {
    return result;
  }
  
  // Handle server errors
  console.error("API Error:", result.error);
  return result;
};

export const adminApiSlice = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["AdminTasks", "AdminUsers", "Metrics"],
  endpoints: (builder) => ({
    getAdminTasks: builder.query({
      query: (params = {}) => ({
        url: "/tasks",
        method: "GET",
        params: {
          page: params.page || 1,
          limit: params.limit || 8,
          search: params.search || "",
          status: params.status || "",
          priority: params.priority || "",
          dueDate: params.dueDate || "",
        },
        credentials: "include",
      }),
      providesTags: ["AdminTasks"],
      transformResponse: (response) => {
        console.log("Tasks Response:", response);
        if (!response)
          return {
            tasks: [],
            pagination: { totalTasks: 0, currentPage: 1, totalPages: 1 },
          };

        // If response contains tasks and pagination metadata (from backend)
        if (response.tasks) {
          return {
            tasks: response.tasks,
            pagination: {
              totalTasks: response.totalTasks || 0,
              currentPage: response.currentPage || 1,
              totalPages: response.totalPages || 1,
            },
          };
        }

        // For backward compatibility if the response is an array
        if (Array.isArray(response)) {
          return {
            tasks: response,
            pagination: {
              totalTasks: response.length,
              currentPage: 1,
              totalPages: 1,
            },
          };
        }

        // For other response formats
        if (response.data) {
          return {
            tasks: response.data,
            pagination: {
              totalTasks: response.data.length,
              currentPage: 1,
              totalPages: 1,
            },
          };
        }

        return {
          tasks: [],
          pagination: { totalTasks: 0, currentPage: 1, totalPages: 1 },
        };
      },
      transformErrorResponse: (response) => {
        console.error("Tasks Error:", response);
        return {
          status: response.status,
          message: response.data?.message || "Failed to fetch tasks",
        };
      },
    }),
    getAdminUsers: builder.query({
      query: (params = {}) => ({
        url: "/users",
        method: "GET",
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search || "",
          role: params.role || "",
        },
        credentials: "include",
      }),
      providesTags: ["AdminUsers"],
      transformResponse: (response) => {
        console.log("Users Response:", response);
        if (!response)
          return {
            users: [],
            pagination: { totalUsers: 0, currentPage: 1, totalPages: 1 },
          };

        if (response.users) {
          return {
            users: response.users,
            pagination: {
              totalUsers: response.totalUsers || 0,
              currentPage: response.currentPage || 1,
              totalPages: response.totalPages || 1,
            },
          };
        }

        if (Array.isArray(response))
          return {
            users: response,
            pagination: {
              totalUsers: response.length,
              currentPage: 1,
              totalPages: 1,
            },
          };

        if (response.data)
          return {
            users: response.data,
            pagination: {
              totalUsers: response.data.length,
              currentPage: 1,
              totalPages: 1,
            },
          };

        return {
          users: [],
          pagination: { totalUsers: 0, currentPage: 1, totalPages: 1 },
        };
      },
      transformErrorResponse: (response) => {
        console.error("Users Error:", response);
        return {
          status: response.status,
          message: response.data?.message || "Failed to fetch users",
        };
      },
    }),
    searchUsers: builder.query({
      query: (text) => ({
        url: `/users?search=${encodeURIComponent(text)}`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => {
        console.log("Search Users Response:", response);
        // Handle the response based on the structure
        if (!response) return { users: [] };
        if (response.users) return response;

        // If the response is an array, wrap it in a users property
        if (Array.isArray(response)) {
          return { users: response };
        }

        return { users: [] };
      },
    }),
    deleteAdminTask: builder.mutation({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: "DELETE",
        credentials: "include",
        responseHandler: (response) => {
          // For this specific endpoint, handle plain text "OK" response
          if (response.status === 200) {
            // Check if the response is text or already JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              return response.json();
            } else {
              // For non-JSON responses (like plain "OK"), return a success object
              return { success: true, message: "Task deleted successfully" };
            }
          }
          // For other status codes, attempt to parse as JSON
          return response.json();
        },
      }),
      invalidatesTags: ["AdminTasks", "Metrics"],
    }),
    updateAdminTask: builder.mutation({
      query: ({ taskId, ...update }) => ({
        url: `/tasks/${taskId}`,
        method: "PATCH",
        body: update,
        credentials: "include",
      }),
      invalidatesTags: ["AdminTasks", "Metrics"],
    }),
    updateUser: builder.mutation({
      query: ({ userId, ...update }) => ({
        url: `/users/${userId}`,
        method: "PATCH",
        body: update,
        credentials: "include",
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
        credentials: "include",
        responseHandler: (response) => {
          // For this specific endpoint, handle plain text "OK" response
          if (response.status === 200) {
            // Check if the response is text or already JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              return response.json();
            } else {
              // For non-JSON responses (like plain "OK"), return a success object
              return { success: true, message: "User deleted successfully" };
            }
          }
          // For other status codes, attempt to parse as JSON
          return response.json();
        },
      }),
      invalidatesTags: ["AdminUsers", "Metrics"],
    }),
    inviteUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
        credentials: "include",
      }),
      transformResponse: (response, meta) => {
        // For 204 status (No Content) which means user already invited
        if (meta?.response?.status === 204) {
          return { 
            alreadyInvited: true, 
            message: "User has already been invited" 
          };
        }
        return response;
      },
      transformErrorResponse: (response) => {
        // Handle specific error cases
        if (response.status === 400) {
          // User already exists or other validation error
          return { message: response.data?.message || "Invalid user data" };
        }
        return response;
      },
      invalidatesTags: ["AdminUsers"],
    }),
    createAdminTask: builder.mutation({
      query: (task) => ({
        url: "/tasks",
        method: "POST",
        body: task,
        credentials: "include",
        responseHandler: (response) => {
          // For this specific endpoint, don't try to parse as JSON if it's just "OK"
          if (response.status === 200) {
            return { success: true, message: "Task created successfully" };
          }
          return response.json().catch(() => {
            return { success: true, message: "Task created successfully" };
          });
        },
      }),
      transformErrorResponse: (response) => {
        console.error("Create Task Error:", response);
        if (response.status === 400) {
          console.error("Validation error details:", response.data);
        }
        return response;
      },
      invalidatesTags: ["AdminTasks", "Metrics"],
    }),
    lockAdminTask: builder.mutation({
      query: ({ taskId, locked }) => ({
        url: locked ? `/tasks/${taskId}/unlock` : `/tasks/${taskId}/lock`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: ["AdminTasks", "Metrics"],
    }),
    getMetrics: builder.query({
      query: (text) => ({
        url: `/metrics`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Metrics"],
    }),
  }),
});

export const {
  useGetAdminTasksQuery,
  useGetAdminUsersQuery,
  useSearchUsersQuery,
  useDeleteAdminTaskMutation,
  useUpdateAdminTaskMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useInviteUserMutation,
  useLockAdminTaskMutation,
  useCreateAdminTaskMutation,
  useGetMetricsQuery,
} = adminApiSlice;
