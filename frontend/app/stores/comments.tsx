import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
  } from "react";
  import { type Comment, type PaginationState } from "~/types";
  import api from "~/lib/axios-clients";
  
  interface CommentsContextType extends PaginationState<Comment> {
    fetchPage: (page: number, limit?: number) => void;
    setLimit: (limit: number) => void;
  }
  
  const CommentsContext = createContext<CommentsContextType | undefined>(undefined);
  
  export const CommentsProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<PaginationState<Comment>>({
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
          const countRes = await api.get<{ count: number }>("/comments/count");
          totalCount = countRes.data.count;
        }
  
        const res = await api.get<Comment[]>("/comments", {
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
        console.error("Failed to fetch comments", err);
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
      <CommentsContext.Provider value={{ ...state, fetchPage, setLimit }}>
        {children}
      </CommentsContext.Provider>
    );
  };
  
  export const useComments = () => {
    const context = useContext(CommentsContext);
    if (!context) {
      throw new Error("useComments must be used within a CommentsProvider");
    }
    return context;
  };