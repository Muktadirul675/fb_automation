import React, { useState } from "react";
import { useUsers } from "~/stores/users";
import toast from "react-hot-toast";
import Spinner from "./Spinner";

const UserTable = () => {
  const { users, loading, error, makeAdmin } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [makingAdmin, setMakingAdmin] = useState<number | null>(null);

  const filteredUsers = users.filter((user) =>
    (user.name + user.email)
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim())
  );

  const handleMakeAdmin = async (id: number) => {
    setMakingAdmin(id);
    const toastId = toast.loading("Making user admin...");
    try {
      await makeAdmin(id);
      toast.success("User promoted to admin", { id: toastId });
    } catch (e) {
      toast.error("Failed to make user admin", { id: toastId });
    } finally {
      setMakingAdmin(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Users</h2>
        <input
          type="text"
          placeholder="Search by name or email..."
          className="border border-gray-300 rounded px-3 py-1 w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr className="border-b border-gray-200">
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">FB ID</th>
              <th className="p-3 text-center">Groups</th>
              <th className="p-3 text-center">Pages</th>
              <th className="p-3 text-center">Comments</th>
              <th className="p-3 text-center">Reactions</th>
              <th className="p-3 text-center">Admin</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${user.is_admin ? "bg-green-50" : ""
                  }`}
              >
                <td className="p-3 flex items-center gap-2">
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name}
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  )}
                  <span>{user.name}</span>
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.fb_id}</td>
                <td className="p-3 text-center">{user.group_count}</td>
                <td className="p-3 text-center">{user.page_count}</td>
                <td className="p-3 text-center">{user.total_comments}</td>
                <td className="p-3 text-center">{user.total_reactions}</td>
                <td className="p-3">
                  {!user.is_admin ? (
                    makingAdmin === user.id ? (
                      <Spinner size="sm" />
                    ) : (
                      <button
                        onClick={() => handleMakeAdmin(user.id ?? 0)}
                        className="text-blue-600 hover:underline"
                      >
                        Make Admin
                      </button>
                    )
                  ) : (
                    <span className="text-green-600 font-medium">Admin</span>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;