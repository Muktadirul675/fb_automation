import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type PostProcess } from "~/types";
import { type PaginationState } from "~/types";
import api from "~/lib/axios-clients";
import { Action, useWS } from "~/ws";

interface PostProcessesContextType extends PaginationState<PostProcess> {
  fetchPage: (page: number, limit?: number) => void;
  setLimit: (limit: number) => void;
}

const PostProcessesContext = createContext<PostProcessesContextType | undefined>(undefined);

export const PostProcessesProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PaginationState<PostProcess>>({
    currentPage: 1,
    totalCount: 0,
    limit: 10,
    totalPages: 1,
    data: [],
    cache: {},
  });

  useWS((event) => {
    const payload: { action: Action, [key: string]: any } = JSON.parse(event.data)
    if (payload.action === Action.PostProcessCreate) {
      // console.log("Fetching new process")
      fetchPage(1, state.limit, false)
    }
  })

  const fetchPage = async (page: number, limit = state.limit, cache: boolean = true) => {
    if (cache && state.cache[page] && limit === state.limit) {
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
        const countRes = await api.get<{ count: number }>("/posts/process/count");
        totalCount = countRes.data.count;
      }

      const res = await api.get<PostProcess[]>("/posts/process", {
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
      console.error("Failed to fetch post processes", err);
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
    <PostProcessesContext.Provider value={{ ...state, fetchPage, setLimit }}>
      {children}
    </PostProcessesContext.Provider>
  );
};

export const usePostProcesses = () => {
  const context = useContext(PostProcessesContext);
  if (!context) {
    throw new Error("usePostProcesses must be used within a PostProcessesProvider");
  }
  return context;
};