'use client'
import Loader from "@/components/ui/loader";
import { useEffect, useState } from "react";

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
        fetch('/api/backend/logs')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setLogs(data.data)
                } else {
                    throw new Error(data.error)
                }
                setIsLoading(false)
            })
            .catch(err => {
                setError(`Erreur de récupération des logs...`)
                setIsLoading(false)
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
                        <div key={index} className="text-xs mb-2">
                            <div className="flex flex-wrap gap-x-2">
                                    <div>{new Date(log.timestamp).toLocaleString()}</div>
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
                                    <div><span className="font-bold">error: </span>{log.error}</div>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </>

    )
}