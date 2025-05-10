import React from "react";
import { getBadgeClass } from "~/lib/utils";
import { useComments } from "~/stores/comments";
import { StatusBadge } from "./StatusBadge";

const CommentTable = () => {
  const {
    data,
    currentPage,
    totalPages,
    limit,
    fetchPage,
    setLimit,
  } = useComments();

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) setLimit(value);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Controls */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 rounded px-3 py-1 w-64"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm">Limit:</label>
          <input
            type="number"
            min={1}
            value={limit}
            onChange={handleLimitChange}
            className="border border-gray-300 rounded px-2 py-1 w-20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-700">
            <tr className="border-b border-gray-200">
              <th className="p-3">ID</th>
              <th className="p-3">User</th>
              <th className="p-3">Post ID</th>
              <th className="p-3">Content</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created At</th>
            </tr>
          </thead>
          <tbody>
            {data.map((comment) => (
              <tr
                key={comment.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">{comment.id}</td>
                <td className="p-3">{comment.user?.name}</td>
                <td className="p-3">{comment.post_id}</td>
                <td className="p-3 truncate max-w-xs">{comment.message}</td>
                <td className={`p-3`}>
                  <StatusBadge status={comment.status}/>
                </td>
                <td className="p-3">{new Date(comment.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => fetchPage(pageNum)}
            className={`px-3 py-1 rounded border text-sm ${
              pageNum === currentPage
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommentTable;