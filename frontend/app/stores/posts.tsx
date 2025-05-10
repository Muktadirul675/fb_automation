import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { type PaginationState, type Post } from "~/types";
import api from "~/lib/axios-clients";
import { Action, useWS } from "~/ws";

interface PostsContextType extends PaginationState<Post> {
  fetchPage: (page: number, limit?: number) => void;
  setLimit: (limit: number) => void;
  fetching: boolean
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PaginationState<Post>>({
    currentPage: 1,
    totalCount: 0,
    limit: 10,
    totalPages: 1,
    data: [],
    cache: {},
  });

  const [fetching, setFetching] = useState<boolean>(false)

  useWS((event) => {
    const payload: { action: Action, [key: string]: any } = JSON.parse(event.data)
    console.log("Ws recieved", payload)
    if (payload.action === Action.PostCreate) {
      fetchPost(parseInt(`${ payload.data.id }`), true)
    } else if (payload.action === Action.PostUpdate) {
      fetchPost(parseInt(`${ payload.data.id }`))
    }
  })

  const fetchPost = async (post_id: number, add: boolean = false) => {
    try {
      const res = await api.get(`/posts/${ post_id }?details=true`)
      if (res.status === 200) {
        if (add) {
          console.log("adding", res.data)
          setState((prev) => {
            return {
              ...prev,
              data: [res.data, ...prev.data]
            }
          })
          console.log("added", res.data)
        } else {
          setState((prev) => {
            return {
              ...prev,
              data: prev.data.map((post) => {
                if (post.id === res.data.id) {
                  return res.data
                }
                return post
              })
            }
          })
        }
      }
    } catch (e) {
      console.log("Error while fetch post")
    }
  }

  const fetchPage = async (page: number, limit = state.limit, cache: boolean = true) => {
    if (cache && state.cache[page] && limit === state.limit) {
      setState((prev) => ({
        ...prev,
        currentPage: page,
        data: prev.cache[page],
      }));
      setFetching(false)
      return;
    }

    setFetching(true)

    try {
      let totalCount = state.totalCount;
      if (!totalCount) {
        const countRes = await api.get<{ count: number }>("/posts/count");
        totalCount = countRes.data.count;
      }

      const res = await api.get<Post[]>("/posts", {
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
      console.error("Failed to fetch posts", err);
    }
    setFetching(false)

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
    <PostsContext.Provider value={{ ...state, fetchPage, setLimit, fetching }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};

