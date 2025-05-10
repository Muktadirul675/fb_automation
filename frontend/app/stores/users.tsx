import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type User } from "~/types";
import api from "~/lib/axios-clients";
import toast from "react-hot-toast";

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => void;
  makeAdmin: (userId: number) => Promise<void>; // <-- added
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<User[]>("/users");
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const makeAdmin = async (userId: number) => {
    try {
      await api.post(`/users/admins?user_id=${userId}`);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_admin: true } : user
        )
      );
      // toast.success("User promoted to admin");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to make user admin");
    }
  };

  return (
    <UserContext.Provider value={{ users, loading, error, fetchUsers, makeAdmin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return context;
};