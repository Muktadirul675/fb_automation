import React, { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import api from "~/lib/axios-clients";
import { type PostProcess, type CommentProcess, type ReactionProcess } from "~/types";

// Define the shape of the processes for different types
export interface Process {
  id: string;
  name: string;
}

interface ProcessesContextType {
  postProcesses: PostProcess[];
  commentProcesses: CommentProcess[];
  reactionProcesses: ReactionProcess[];
  total: number,
}

const ProcessesContext = createContext<ProcessesContextType | undefined>(undefined);

export const ProcessesProvider = ({ children }: { children: ReactNode }) => {
  const [postProcesses, setPostProcesses] = useState<PostProcess[]>([]);
  const [commentProcesses, setCommentProcesses] = useState<CommentProcess[]>([]);
  const [reactionProcesses, setReactionProcesses] = useState<ReactionProcess[]>([]);

  const total = postProcesses.length + commentProcesses.length + reactionProcesses.length

  useEffect(() => {
    // Function to fetch processes from all three endpoints
    const fetchProcesses = async () => {
      try {
        const [postRes, commentRes, reactionRes] = await Promise.all([
          api.get<PostProcess[]>("/posts/process"),
          api.get<CommentProcess[]>("/comments/process"),
          api.get<ReactionProcess[]>("/reactions/process"),
        ]);
        
        setPostProcesses(postRes.data);
        setCommentProcesses(commentRes.data);
        setReactionProcesses(reactionRes.data);
      } catch (error) {
        console.error("Failed to fetch processes", error);
      }
    };

    fetchProcesses();
  }, []);

  return (
    <ProcessesContext.Provider value={{ postProcesses, commentProcesses, reactionProcesses, total }}>
      {children}
    </ProcessesContext.Provider>
  );
};

export const useProcesses = () => {
  const context = useContext(ProcessesContext);
  if (!context) {
    throw new Error("useProcesses must be used within a ProcessesProvider");
  }
  return context;
};