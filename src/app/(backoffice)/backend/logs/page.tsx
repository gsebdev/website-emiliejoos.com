'use client'

import Loader from "@/app/_components/ui/loader";
import { useEffect, useState } from "react";
import { fetchBackendApi } from "../../_lib/api";

type LogItem = {
    timestamp: number,
    id: number,
    username: string,
    error: string | null,
    action: string,
    payload: string | object | null
}
export default function Logs() {
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        fetchBackendApi('logs', {})
            .then(data => {
                if (data.success && Array.isArray(data.data)) {

                    setLogs(data.data);

                } else {

                    throw new Error();

                }
                setIsLoading(false)
            })
            .catch(() => {

                setError(`Erreur de récupération des logs...`);
                setIsLoading(false);
            })
    }, [])

    return (
        <>
            <h1>Logs</h1>
            <div>
                {
                    isLoading &&
                    <Loader className="w-fit" />
                }
                {
                    !!error &&
                    <div className="text-xs text-red-600">{error}</div>
                }
                {
                    !isLoading &&
                    !error &&
                    logs.map((log, index) => (
                        <div key={index} className="text-xs mb-2 grid grid-cols-[1fr_auto] gap-x-4 items-center">
                            <div>{new Date(log.timestamp).toLocaleString()}</div>
                            <div className="flex flex-col gap-x-2">
                                    
                                {log.action && (
                                    <div><span className="font-bold">action: </span>{log.action}</div>
                                )}
                                {log.payload && (
                                    <div><span className="font-bold">data: </span>{JSON.stringify(log.payload)}</div>
                                )}
                                {log.username && (
                                    <div><span className="font-bold">user: </span>{log.username}</div>
                                )}
                                {log.error && (
                                    <div className="text-red-600"><span className="font-bold">error: </span>{log.error}</div>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </>

    )
}