import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '~/lib/axios-clients';
import { type Group, type User } from '~/types'; // Adjust path as needed
import { type PostProcess } from '~/types'; // Adjust path as needed

interface GroupContextType {
    groups: Group[];
    loading: boolean;
    error: string | null;
    refreshGroups: () => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/groups"); 
            setGroups(response.data);
        } catch (err: any) {
            setError(err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <GroupContext.Provider value={{ groups, loading, error, refreshGroups: fetchGroups }}>
            {children}
        </GroupContext.Provider>
    );
};

export const useGroups = (): GroupContextType => {
    const context = useContext(GroupContext);
    if (!context) throw new Error('useGroups must be used within a GroupProvider');
    return context;
};
