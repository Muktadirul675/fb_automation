import React, { useEffect, useState } from "react";
import { useTimeSpan } from "~/hooks/useTimeSpan";
import { getBadgeClass, getPaginationPages, getTimeLeftString, truncate } from "~/lib/utils";
import { usePosts } from "~/stores/posts";
import { PostTarget, Status } from "~/types";
import { StatusBadge } from "./StatusBadge";
import { Link } from "react-router";
import Spinner from "./Spinner";

function TimeSpan({ dt }: { dt: Date }) {
  const span = useTimeSpan(dt)

  return span
}

const PostProcessesTable = () => {
  const {
    data,
    currentPage,
    totalPages,
    limit,
    fetching,
    setLimit,
    fetchPage
    // setSearch
  } = usePosts();

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) setLimit(value);
  };

  // Time updater for countdown
  const [, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* Top Controls */}
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search..."
          className="border border-gray-300 rounded px-3 py-1 w-64"
          onChange={(e)=>(e.target.value)}
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
      {fetching ?
        <div className="flex w-full min-h-[200px] justify-center items-center">
          <Spinner size="lg" />
        </div>
        :
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-700">
              <tr className="border-b border-gray-200">
                <th className="p-3">ID</th>
                <th className="p-3">Text</th>
                <th className="p-3">Process</th>
                <th className="p-3">Target</th>
                <th className="p-3">Status</th>
                <th className="p-3">AI Model</th>
                <th className="p-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {data.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3">{post.id}</td>
                  <td className="p-3">
                    {truncate(post.text)}
                  </td>
                  <td className="p-3">
                    <div className="">
                      {post.process?.name}
                      {post.process !== undefined && post.process !== null && post.process.use_ai && <>
                        {/* <div className="period"></div> */} <br />
                        [{post.process.ai_model}]
                      </>}
                    </div>
                  </td>
                  <td className="p-3">
                    {post.target === PostTarget.page
                      ? `Page: ${post.page?.name ?? post.target_id}`
                      : `Group: ${post.group?.name ?? post.target_id}`}
                  </td>
                  {/* <td className="p-3 truncate max-w-xs">{post.message}</td> */}
                  <td className="p-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="p-3">
                    {post.process?.use_ai ? post.process.ai_model : 'N/A'}
                  </td>
                  <td className="p-3 text-gray-700 flex items-center gap-1 flex-wrap">
                    <span>{new Date(post.created_at).toLocaleString()}</span>
                    {(post.status === Status.pending || post.status === Status.queued) &&
                      post.scheduled_for && (
                        <>
                          <span className="period text-gray-400 mx-1"></span>
                          <span className="text-xs text-gray-500">
                            [<TimeSpan dt={new Date(post.scheduled_for)} />]
                          </span>
                        </>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}

      {/* Pagination */}

      <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
        {/* {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Link
            to={`/posts?page=${pageNum}&limit=${limit}`}
            key={pageNum}
            // onClick={() => fetchPage(pageNum)}
            className={`px-3 py-1 rounded border text-sm ${pageNum === currentPage
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
          >
            {pageNum}
          </Link>
        ))} */}
        {getPaginationPages(currentPage, totalPages).map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-3 py-1 rounded-md border border-gray-300 bg-gray-100 text-gray-400 text-sm"
              >
                ...
              </span>
            );
          }

          return (
            <button
              // to={`/posts?page=${page}&limit=${limit}`}
              onClick={()=>fetchPage(page as number, limit)}
              key={page}
              className={`px-3 py-1 rounded border text-sm ${page === currentPage
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
            >
              {page}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PostProcessesTable