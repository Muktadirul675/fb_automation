import React, { useEffect, useState } from "react";
import { useCommentProcesses } from "~/stores/commentProcesses";
import { usePostProcesses } from "~/stores/postProcesses";
import { useReactionProcesses } from "~/stores/reactionProcesses";
import { useSearchParams } from 'react-router';
import { getBadgeClass } from "~/lib/utils";
import { StatusBadge } from "./StatusBadge";

const tabs = [
    { label: "Post", key: "post" },
    { label: "Comment", key: "comment" },
    { label: "Reaction", key: "reaction" },
] as const;

type ProcessStatus = "Pending" | "Success" | "Complete" | "Stopped" | "Queued" | "Running";

const statusClasses: Record<ProcessStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Success: "bg-green-100 text-green-800",
    Complete: "bg-blue-100 text-blue-800",
    Stopped: "bg-red-100 text-red-800",
    Queued: "bg-purple-100 text-purple-800",
    Running: "bg-teal-100 text-teal-800",
};

export default function ProcessTabs() {
    const [activeTab, setActiveTab] = useState<"post" | "comment" | "reaction">("post");

    const postCtx = usePostProcesses();
    const commentCtx = useCommentProcesses();
    const reactionCtx = useReactionProcesses();

    const ctx =
        activeTab === "post"
            ? postCtx
            : activeTab === "comment"
                ? commentCtx
                : reactionCtx;

    const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val > 0) {
            ctx.setLimit(val);
        }
    };

    const [searchParams] = useSearchParams();
    const queryLimit = searchParams.get('limit');
    const queryPage = searchParams.get('page');
    const queryTab = searchParams.get('tab');

    useEffect(() => {
        if (queryTab === "comment" || queryTab === "reaction" || queryTab === "post") {
            setActiveTab(queryTab)
        }

        if (queryLimit) {
            try {
                const lim = parseInt(queryLimit)
                if (lim > 0) {
                    ctx.setLimit(lim)
                }
            } catch (e) { }
        }

        if (queryPage) {
            try {
                const pg = parseInt(queryPage)
                if (pg > 0) {
                    ctx.fetchPage(pg)
                }
            } catch (e) { }
        }
    }, [])

    return (
        <div className="w-full mx-auto p-4 space-y-6">
            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-300">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === tab.key
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-blue-500 hover:border-blue-300"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <input
                    type="text"
                    placeholder={`Search ${activeTab} processes...`}
                    className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />

                <div className="flex items-center gap-2 text-sm">
                    <label htmlFor="limit" className="text-gray-600">Limit:</label>
                    <input
                        id="limit"
                        type="number"
                        min={1}
                        value={ctx.limit}
                        onChange={handleLimitChange}
                        className="border border-gray-300 rounded px-2 py-1 w-20 text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
            </div>

            {/* List */}
            {/* Enhanced List */}
            <ul className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-100">
                {ctx.data.map((process: any) => (
                    <li
                        key={process.id}
                        className="px-4 py-3 hover:bg-gray-50 transition-all flex items-center justify-between"
                    >
                        <div>
                            <div className="font-semibold text-gray-800">{process.name}</div>
                            <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2 mt-0.5">
                                {activeTab === "post" && (
                                    <>
                                        <span>{process.groups.length ?? 0} groups</span>
                                        <span className="text-gray-300 period"></span>
                                        <span>{process.pages.length ?? 0} pages</span>
                                        {/* {JSON.stringify(process, null, 2)} */}
                                        {process.use_ai && <>
                                            <span className="text-gray-300 period"></span>
                                            <span>{process.ai_model}</span>
                                        </>}
                                    </>
                                )}
                                {activeTab === "comment" && (
                                    <>
                                        <span>{process.users.length ?? 0} users</span>
                                        {process.use_ai && <>
                                            <span className="text-gray-300 period"></span>
                                            <span>{process.ai_model}</span>
                                        </>}
                                    </>
                                )}
                                {activeTab === "reaction" && (
                                    <>
                                        <span>{process.users.length ?? 0} users</span>
                                        <span className="text-gray-300 period"></span>
                                        <span>{process.type_of}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <span>
                            <StatusBadge status={process.status}/>
                        </span>
                    </li>
                ))}
            </ul>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 flex-wrap text-sm">
                <button
                    onClick={() => ctx.fetchPage(ctx.currentPage - 1)}
                    disabled={ctx.currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                {Array.from({ length: ctx.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => ctx.fetchPage(page)}
                        className={`px-3 py-1 rounded border text-sm ${page === ctx.currentPage
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-300 text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => ctx.fetchPage(ctx.currentPage + 1)}
                    disabled={ctx.currentPage === ctx.totalPages}
                    className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}