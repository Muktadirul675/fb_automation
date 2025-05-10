import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type ReactionProcess } from "~/types";
import { type PaginationState } from "~/types";
import api from "~/lib/axios-clients";

interface ReactionProcessesContextType extends PaginationState<ReactionProcess> {
  fetchPage: (page: number, limit?: number) => void;
  setLimit: (limit: number) => void;
}

const ReactionProcessesContext = createContext<ReactionProcessesContextType | undefined>(undefined);

export const ReactionProcessesProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PaginationState<ReactionProcess>>({
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
        const countRes = await api.get<{ count: number }>("/reactions/process/count");
        totalCount = countRes.data.count;
      }

      const res = await api.get<ReactionProcess[]>("/reactions/process", {
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
      console.error("Failed to fetch reaction processes", err);
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
    <ReactionProcessesContext.Provider value={{ ...state, fetchPage, setLimit }}>
      {children}
    </ReactionProcessesContext.Provider>
  );
};

export const useReactionProcesses = () => {
  const context = useContext(ReactionProcessesContext);
  if (!context) {
    throw new Error("useReactionProcesses must be used within a ReactionProcessesProvider");
  }
  return context;
};