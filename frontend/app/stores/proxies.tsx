import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '~/lib/axios-clients'; // adjust the path to your axios instance
import type { Proxy } from '~/types';

// Context type
interface ProxyContextType {
    proxies: Proxy[];
    fetchProxies: () => Promise<void>;
    addProxy: (newProxy: Omit<Proxy, 'id'>) => Promise<void>;
    loading: boolean;
    error: string | null;
}

const ProxyContext = createContext<ProxyContextType | undefined>(undefined);

// Provider component
export const ProxyProvider = ({ children }: { children: ReactNode }) => {
    const [proxies, setProxies] = useState<Proxy[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProxies = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<Proxy[]>('/proxies');
            setProxies(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch proxies');
        } finally {
            setLoading(false);
        }
    };

    const addProxy = async (newProxy: Omit<Proxy, 'id'>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post<Proxy>('/proxies', newProxy);
            setProxies(prev => [...prev, response.data]);
        } catch (err: any) {
            setError(err.message || 'Failed to add proxy');
        } finally {
            setLoading(false);
        }
    };

    // Optionally fetch on mount
    useEffect(() => {
        fetchProxies();
    }, []);

    return (
        <ProxyContext.Provider value={{ proxies, fetchProxies, addProxy, loading, error }}>
            {children}
        </ProxyContext.Provider>
    );
};

// Hook to access context
export const useProxy = () => {
    const context = useContext(ProxyContext);
    if (!context) {
        throw new Error('useProxyContext must be used within a ProxyProvider');
    }
    return context;
};