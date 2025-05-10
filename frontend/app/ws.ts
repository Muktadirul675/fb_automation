import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = "ws://localhost:8000/ws"; // replace with your fixed WebSocket URL

export enum Action {
    PostProcessCreate = "postprocess.create",
    PostCreate = "post.create",
    PostUpdate = "post.update"
}

export function useWS(onMessage: (event: MessageEvent) => void) {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        try{
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;
    
            ws.addEventListener("message", onMessage);
            return () => {
                ws.removeEventListener("message", onMessage);
                ws.close();
            };
        }catch(e){
            console.log(e)
        }

    }, [onMessage]);
}