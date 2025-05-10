import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '~/lib/axios-clients';
import { type Page } from '~/types';

interface PageContextType {
    pages: Page[];
    loading: boolean;
    error: string | null;
    refreshPages: () => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPages = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/pages");
            setPages(response.data);
        } catch (err: any) {
            setError(err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    return (
        <PageContext.Provider value={{ pages, loading, error, refreshPages: fetchPages }}>
            {children}
        </PageContext.Provider>
    );
};

export const usePages = (): PageContextType => {
    const context = useContext(PageContext);
    if (!context) throw new Error('usePages must be used within a PageProvider');
    return context;
};
