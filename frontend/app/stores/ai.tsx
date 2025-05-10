import React, { createContext, useContext, useEffect, useState } from 'react';
import { ai } from '~/lib/axios-clients';

interface AIModel {
    id: string, object: string, created: Date, owned_by: string
}

export interface AIContextType {
    models: AIModel[]
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export function AIProvider({ children }: { children: React.ReactNode }) {
    const [models, setModels] = useState<AIModel[]>([])

    const fetchAIModels = async () => {
        const res = await ai.get<{
            data: AIModel[],
            object: string
        }>("/models")
        setModels(res.data.data)
    }

    useEffect(() => {
        fetchAIModels()
    }, [])

    return <AIContext.Provider value={{ models }}>
        {children}
    </AIContext.Provider>
}

export const useAI = (): AIContextType => {
    const context = useContext(AIContext);
    if (!context) throw new Error('useAIs must be used within a AIProvider');
    return context;
};

