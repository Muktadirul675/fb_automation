import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type CommentProcess } from "~/types";
import { type PaginationState } from "~/types";
import api from "~/lib/axios-clients";

interface CommentProcessesContextType extends PaginationState<CommentProcess> {
  fetchPage: (page: number, limit?: number) => void;
  setLimit: (limit: number) => void;
}

const CommentProcessesContext = createContext<CommentProcessesContextType | undefined>(undefined);

export const CommentProcessesProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PaginationState<CommentProcess>>({
    currentPage: 1,
    totalCount: 0,
    limit: 10,
    totalPages: 1,
    data: [],
    cache: {},
  });

  const fetchPage = async (page: number, limit = state.limit) => {
    if (state.cache[page] && limit === state.limit) {
      setState((prev) => ({
        ...prev,
        currentPage: page,
        data: prev.cache[page],
      }));
      return;
    }

    try {
      let totalCount = state.totalCount;
      if (!totalCount) {
        const countRes = await api.get<{ count: number }>("/comments/process/count");
        totalCount = countRes.data.count;
      }

      const res = await api.get<CommentProcess[]>("/comments/process", {
        params: { page, limit },
      });

      setState((prev) => ({
        currentPage: page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        data: res.data,
        cache: { ...prev.cache, [page]: res.data },
      }));
    } catch (err) {
      console.error("Failed to fetch comment processes", err);
    }
  };

  const setLimit = (limit: number) => {
    setState((prev) => ({
      ...prev,
      currentPage: 1,
      limit,
      cache: {},
      data: [],
    }));
    fetchPage(1, limit);
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  return (
    <CommentProcessesContext.Provider value={{ ...state, fetchPage, setLimit }}>
      {children}
    </CommentProcessesContext.Provider>
  );
};

export const useCommentProcesses = () => {
  const context = useContext(CommentProcessesContext);
  if (!context) {
    throw new Error("useCommentProcesses must be used within a CommentProcessesProvider");
  }
  return context;
};